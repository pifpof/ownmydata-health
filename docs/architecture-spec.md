# Health Vault: Knowledge Base Architecture Spec

**Project:** Health Vault (`ownmydata.health`), a Claude plugin that builds a personal health-data wiki
**Document:** Architecture of the knowledge base (folders, files, formats). Not yet the skill specs.
**Version:** 0.2 draft, 2026-11-17 (v0.2: zero-lift principle, required-field handling, post-capture verification notice, competitive-review changes, v0.1 scope)
**Maintainer:** 1617289 B.C. Ltd. · **License:** MIT

All example files in this document use **fictional data**. None of it describes a real person.

---

## 1. What this document decides

Three formats have to work together:

| Layer | Standard | Job |
|---|---|---|
| Container | **Open Knowledge Format (OKF) v0.2** | Folders of markdown files with YAML frontmatter, reserved `index.md` and `log.md`, links between files. This is what the LLM navigates. |
| Clinical content | **HL7 FHIR R4 (4.0.1)** | The structure and vocabulary of every health record: what a lab result, a visit, a condition, a medication *is*. |
| Behaviour | **Chief of Staff plugin pattern** | Same skeleton: router, hot-state card, `/start`, `/save`, `/health-check`, `/capture`, `/sync`, a setup skill. |

The core design rule is one sentence:

> **One FHIR resource is one OKF concept (one markdown file). The file's frontmatter keeps the FHIR data in a `fhir:` block, the OKF fields stay at the top, and the body is the FHIR "narrative": a human-readable version that is safe to read on its own.**

Where that rule breaks (high-volume data like wearables), section 8 defines two compact patterns that still expand losslessly to FHIR.

### The governing principle: FHIR shapes what Claude writes, never what the user supplies

This rule overrides anything else in this document that conflicts with it.

1. **FHIR is the storage spec, not an input form.** When information is present in what the user gives (a PDF, a photo, a sentence), Claude stores it in its FHIR shape. When it is not present, it is left out. Nothing is guessed to complete a record.
2. **Zero extra lift for the user.** The user's only job is to drop in a document or say what happened ("saw the ENT today, she ordered a hearing test"). Choosing resource types, writing frontmatter, linking records, tagging, coding and filing are Claude's job.
3. **No questions to complete a record.** Claude never asks the user for a missing field just because FHIR has a slot for it. It asks only when it cannot tell what the document is about at all.
4. **No blocking steps.** Capture always finishes and saves. Verification is a notice, not a gate (section 13.2).
5. **No chores.** No forms, no required tags, no manual episode management, no reminders that become tasks. Stale items surface in `/start` as information, once.
6. **FHIR-shaped, not guaranteed FHIR-valid.** Because absent information stays absent, some files will lack an element FHIR marks as required. That is acceptable. Validity against the HL7 validator is a goal for the export step, not a condition of capture (section 4).

The test for any feature: if it makes the user type, choose or confirm something they would not have done in a paper folder, it is cut or made optional.

### Decision summary

| # | Decision | Why |
|---|---|---|
| D1 | FHIR **R4 (4.0.1)**, not R5 | R4 is what US federal rules, US Core, the International Patient Summary and CA Core+ are built on. Anything you import from a patient portal or a record connector will be R4. R5 changes things you care about (see section 4.2). |
| D2 | **One file per FHIR resource** for clinical data | Matches how an LLM retrieves: index line, then one small file. Resource ids become stable filenames. |
| D3 | FHIR data lives in a **`fhir:` block**, never at the top level | OKF reserves `status`, and FHIR puts `status` on almost every resource. FHIR also uses `type`. Top-level mixing would collide. |
| D4 | Body = **FHIR narrative** | FHIR requires that the narrative be safe to read without the structured data. That is exactly what an LLM reading a markdown file needs. |
| D5 | **Compact tables** for repeated observations (lab results, ledgers) | A CBC is about 20 observations. Writing each as full FHIR YAML costs roughly 10x the tokens. A table with a fixed schema expands deterministically to FHIR on export. |
| D6 | **Episodes** are hub files over resources, not folders that contain them | Resources stay in canonical type folders. The "ear situation" is one hub with a generated timeline. Closing an episode changes status, not file locations, so links never break. |
| D7 | **Raw originals live outside the wiki** in `data/`, never edited | Same as Chief of Staff: `data/` is raw, `memory/` is compiled. Every resource points back to its source document. |
| D8 | **Derived pages** (trend series, indexes, timelines, hot-state card) are rebuildable and labelled as derived | The LLM is poor at arithmetic over many rows. A script computes, the page stores the answer. |
| D9 | Trust is recorded with OKF's own **`generated`, `verified`, `sources`** fields | LLM-extracted numbers start unverified. A human check against the source document upgrades them. No invented fields needed. |
| D10 | **No health data ever leaves the vault folder** by default | The plugin repo ships code and an empty template. The vault is local, ignored by git, never synced to a public place. |
| D11 | **Zero-lift capture** (governing principle above) | FHIR informs storage only. Absent data stays absent; the user never fills fields, answers completion questions or passes a gate. |

---

## 2. How an LLM wiki actually uses this data

This drives every choice below, so it comes first.

**Retrieval path.** The LLM reads the router (`memory.md`), then the hot-state card, then a folder `index.md`, then opens one to three files. It does not read whole folders. There is no vector database. So:

- The **index line** must carry enough fact to decide whether to open the file. For a lab report: date, panel, flags. Not just "Lab report".
- The **`description`** field is the index line. Every resource type gets a description template (section 11).
- **`aliases`** carry the synonyms a person actually types: "A1c", "HbA1c", "hemoglobin A1c"; brand and generic drug names; "my ear thing".
- A folder must stay small enough that its index fits in a glance. Rule: **no folder holds more than about 100 files**; beyond that, shard by year.

**What an LLM does well here:** reading a visit note and extracting structured fields; linking a result to the visit and the problem it belongs to; summarizing a timeline; spotting that a result is out of the lab's own reference range.

**What an LLM does badly here, so the design routes around it:**

| Weakness | Design response |
|---|---|
| Arithmetic and trends across many rows | Derived **series** pages, computed by script (section 9). The LLM reads the answer, not 40 reports. |
| Copying numbers and units exactly | Source document kept, values shown in a verification checklist after `/capture`, `verified` field set only by the human. |
| Inventing medical codes | Rule: only write a `coding` when the source document states it or it is on a short allow-list. Otherwise `code.text` alone (valid FHIR). |
| Drifting between structured data and prose | `/health-check` compares body text against the `fhir:` block and flags mismatches. |
| Unit confusion (mmol/L vs mg/dL) | Units are stored exactly as the source prints them (`x10E9/L` stays `x10E9/L`). Never silently converted. A UCUM form is added at export, not at capture. |

**The tension this spec resolves.** FHIR was built for systems exchanging data. A wiki is built for an agent reading and writing prose. FHIR gives us the *shape and vocabulary* (which fields exist, which codes mean what, how a result links to a visit). The wiki gives us *navigation and narrative*. We take FHIR's data model and drop its transport, its server, and its XHTML.

---

## 3. What FHIR contributes (analysis)

Findings from the FHIR R4 specification pages, with what each means for the vault.

### 3.1 The resources we need

| FHIR resource | Role in the vault | Key facts from the spec |
|---|---|---|
| **Patient** | The vault owner. | `gender` is *administrative* gender; clinical sex is a separate concern. Primary care provider goes in `generalPractitioner`, not `contact`. |
| **Practitioner / Organization** | Doctors, clinics, labs. | Referenced from other resources. Keeps "who" consistent across records. |
| **Encounter** | A visit, call or admission. | `status` and `class` are both required (1..1). `class` uses ActEncounterCode. `diagnosis[]` links to Condition. `partOf` nests encounters. Scheduling belongs to Appointment, not Encounter. |
| **Condition** | A problem, diagnosis or persistent symptom. | `clinicalStatus`: active, recurrence, relapse, inactive, remission, resolved. `verificationStatus`: unconfirmed, provisional, differential, confirmed, refuted, entered-in-error. "Conditions are never really resolved, but they can abate." Rule con-4: if `abatement[x]` is present, status must be inactive, resolved or remission. Routine signs and symptoms are usually Observations; a persistent symptom needing management can be a Condition. |
| **Observation** | A single measurement or finding: lab value, vital sign, symptom entry. | `status` and `code` required. `category` is a *preferred* binding, so a local category code is allowed. `value[x]` has 11 types. `component` is for values that only make sense together (blood pressure); `hasMember` is for panels; `derivedFrom` is for calculated values (BMI). |
| **DiagnosticReport** | A lab report, imaging report, pathology report: the wrapper around a set of results. | `result[]` references the atomic Observations. `conclusion` and `conclusionCode` carry the interpretation. `presentedForm` is the report as issued (the PDF). `effective[x]` is expected on every report. |
| **Procedure** | Surgery, biopsy, therapy. | `status` required (EventStatus: preparation, in-progress, not-done, on-hold, stopped, completed, entered-in-error, unknown). `reasonReference` can point to a Condition. `report` points to the DiagnosticReport or DocumentReference. `outcome`, `complication`, `followUp` exist. |
| **MedicationStatement** | What you take or took. | In R4, status includes active, completed, intended, stopped, on-hold, unknown, not-taken (R5 removed these). It is a loose assertion, not an order. |
| **AllergyIntolerance** | Allergies and intolerances. | `criticality` (potential harm) is separate from reaction `severity` (how a specific reaction went). |
| **Immunization** | Vaccines. | `vaccineCode`, `patient`, `occurrence[x]` required; status completed, entered-in-error, not-done. |
| **CarePlan (+ Goal)** | What is planned for a problem. | `status` and `intent` both required. `addresses[]` links to Condition. `activity` holds planned actions. |
| **DocumentReference** | An index entry for a stored original (PDF, photo of a report). | Holds the file's MIME type and location in `content.attachment`, plus `type`, `date`, `author`, `context.encounter`. |
| **Provenance** | Who produced a record, from what source, when. | `target`, `recorded`, `agent[]`, `entity[]` with role source/derivation. A software agent can be an agent. |
| **EpisodeOfCare** | A problem-level container over several encounters. | Statuses: planned, waitlist, active, onhold, finished, cancelled, entered-in-error. `diagnosis[].condition` points to Condition. Described as a tracking resource, with CarePlan as the planning resource. |
| **FamilyMemberHistory, Device** | Family history, wearables and home devices. | Used lightly in v1. |

### 3.2 Structural facts that shape the design

1. **References** are `Type/id` strings (`Patient/pt-self`) with an optional `display`. Ids use letters, digits, hyphen and period, 1 to 64 characters. This maps cleanly onto filenames.
2. **Contained resources** exist for things with no independent identity, but they do not inherit context (such as `subject`) from the parent and cannot be referenced from outside the parent.
3. **Narrative** (`text.status`: generated, extensions, additional, empty) must be safe to read alone. Structured data should not hold important information the narrative omits.
4. **Terminology** is by `Coding` (system + code + display) inside `CodeableConcept`, which always allows free `text`. A text-only concept is valid.
5. **Observation categories** come from a code system with vital-signs, laboratory, imaging, procedure, survey, exam, therapy, activity and social-history. Activity covers things like steps and sleep data. No "symptom" category exists, and the binding is preferred, so a local code is permitted.
6. **R4 is the regulatory baseline.** US federal rules reference R4 and US Core. IPS and the Canadian profiles (PS-CA, CA Core+) are R4-based. This is why the vault uses R4 and why imported records will arrive in R4.

### 3.3 Where FHIR and the wiki collide

| Collision | Resolution |
|---|---|
| FHIR `status` vs OKF `status` (OKF's `status` means draft/stable/deprecated lifecycle) | All FHIR fields live under `fhir:`. Top-level `status` is never written, same rule the Chief of Staff already follows. |
| FHIR `type` vs OKF `type` (OKF requires a top-level `type`) | OKF `type` = the kebab-case resource type (`condition`, `diagnostic-report`). FHIR's own `type` stays inside `fhir:`. OKF tolerates unknown types, so this is conformant. |
| FHIR is JSON/XML; wiki is markdown | YAML is a superset of JSON, so the `fhir:` block is FHIR JSON written as YAML. Same field names, same nesting. |
| FHIR narrative is XHTML | The body is markdown. On export, the body converts to a restricted XHTML `div` (no scripts, no styles). Narrative status is recorded in `vault.narrative`. |
| FHIR wants every result as its own Observation | Compact table rows (D5), expanded on export. |
| FHIR has no "case" concept for a patient-held record | Episode hub (D6), mapped to EpisodeOfCare on export. |
| FHIR ids must be unique and stable | Id = filename stem, generated from a fixed grammar (section 5). |

---

## 4. Version and conformance stance

### 4.1 Goal

The vault is **FHIR-shaped**. It is not a FHIR server. Every field Claude writes uses FHIR R4 names, nesting and value sets, so the data can be exported later without rework. A future script (`fhir-export`, v0.3) turns the vault into a FHIR R4 Bundle; passing the HL7 validator is that script's goal, filling or flagging gaps at export time. It is not a condition of capturing data, and it is not on the critical path until someone actually needs a Bundle.

### 4.2 Why R4 and not R5

- Regulation, US Core, IPS, CA Core+ and most patient-access APIs sit on R4.
- R5 changed shapes the vault uses. Example from the specification: MedicationStatement in R5 drops the R4 status codes and turns `medication[x]` into a `CodeableReference`. Importing R4 records into an R5 vault would mean translating on the way in.
- The vault records its version in `memory.md` (`fhir_version: "4.0.1"`) so a future migration is a deliberate step.

### 4.3 What every file must have, and what it may lack

**Always present** (Claude can always supply these without asking): `fhir.resourceType`, `fhir.id` equal to the filename stem, `subject` pointing at the patient, and `code.text` or an equivalent plain description.

**FHIR-required elements the source may not state.** Claude applies the rule below and never asks the user:

| Element | Rule |
|---|---|
| `status` on a past event (visit, procedure, report, result) | Set the obvious value (`finished`, `completed`, `final`). A record of something that already happened is that by definition. |
| `status` on a medication | `active` if the user describes taking it now, `completed` or `stopped` if they say they stopped; otherwise `unknown`. |
| `Encounter.class` | Set only if the setting is evident (clinic visit `AMB`, phone or video `VR`, hospital stay `IMP`, emergency `EMER`). Otherwise leave it out. |
| `Condition.clinicalStatus` / `verificationStatus` | From the document's wording; otherwise `clinicalStatus: active` for a current problem and leave `verificationStatus` out. |
| Anything else | Leave out. |

**When present, always correct:** status values from the R4 value sets; dates in ISO 8601, partial dates allowed (`2026`, `2026-09`); units in UCUM as printed.

A file missing a FHIR-required element is still a good vault file. `/health-check` reports such gaps as information only (V4), never as errors, and never prompts the user to fill them.

---

## 5. Identifiers, references and path resolution

### 5.1 Id grammar

`id` is `<prefix>-<yyyymmdd>-<slug>` for dated resources and `<prefix>-<slug>` for undated ones. Lowercase letters, digits and hyphens only. Maximum 64 characters. The filename is `<id>.md`.

| Prefix | Resource | Dated? |
|---|---|---|
| `pt` | Patient | no |
| `prac`, `org` | Practitioner, Organization | no |
| `dev` | Device | no |
| `cond` | Condition | yes (recorded date) |
| `enc` | Encounter | yes |
| `rpt` | DiagnosticReport | yes (effective date) |
| `obs` | Observation (standalone) | yes |
| `proc` | Procedure | yes |
| `med` | MedicationStatement | yes (start date) |
| `alg` | AllergyIntolerance | no |
| `imm` | Immunization | yes |
| `plan`, `goal` | CarePlan, Goal | yes |
| `doc` | DocumentReference | yes |
| `fmh` | FamilyMemberHistory | no |
| `ep` | Episode hub (vault-native) | yes (opened) |
| `lgr` | Ledger (compact Observations) | `lgr-<slug>-<yyyymm>` |
| `ser` | Series (derived) | no |

### 5.2 Reference to path (deterministic)

A reference `Type/id` resolves to a path without searching:

| Reference | Path under `memory/` |
|---|---|
| `Patient/pt-self` | `patient/pt-self.md` |
| `Practitioner/prac-*`, `Organization/org-*`, `Device/dev-*` | `patient/care-team/…` and `patient/devices/…` |
| `Condition/cond-*` | `conditions/<id>.md` |
| `Encounter/enc-<yyyy>…` | `encounters/<yyyy>/<id>.md` |
| `DiagnosticReport/rpt-<yyyy>…` | `reports/<yyyy>/<id>.md` |
| `Observation/obs-<yyyy>…` | `observations/standalone/<yyyy>/<id>.md` |
| `Procedure/proc-*` | `procedures/<id>.md` |
| `MedicationStatement/med-*` | `medications/<id>.md` |
| `AllergyIntolerance/alg-*` | `allergies/<id>.md` |
| `Immunization/imm-*` | `immunizations/<id>.md` |
| `CarePlan/plan-*`, `Goal/goal-*` | `plans/<id>.md` |
| `DocumentReference/doc-<yyyy>…` | `documents/<yyyy>/<id>.md` |
| `FamilyMemberHistory/fmh-*` | `family-history/<id>.md` |

Ledgers resolve as `observations/ledgers/<slug>/<id>.md`, series as `observations/series/<slug>.md`, episodes as `episodes/<id>.md`.

### 5.3 Two kinds of link, both required

- **Machine reference** inside `fhir:` (`reference: "Condition/cond-20261012-hearing-loss-left"`). Exported unchanged.
- **Navigation link** in the body: `[Hearing loss, left ear](../../conditions/cond-20261012-hearing-loss-left.md)`. This is what the LLM follows. OKF allows relative links, and tolerates broken ones.

`/health-check` verifies every machine reference resolves to a file and every body link points to an existing file.

---

## 6. Vault layout

The vault keeps the Chief of Staff skeleton (`CLAUDE.md`, `memory.md`, `memory/`, `data/`, `outputs/`, `trash/`). The `profile/` and `projects/` memory folders are replaced by clinical folders. `library/`, `reference/` and `decisions/` stay.

```
health-vault/                           vault root (one person per vault)
├── CLAUDE.md                           persona, tone, safety rules (section 14)
├── memory.md                           router: layout "hv-1.0", okf_version "0.2", fhir_version "4.0.1"
├── memory/                             the OKF bundle (compiled knowledge)
│   ├── index.md                        bundle index; declares okf_version
│   ├── _state.md                       hot-state card (derived)
│   ├── patient/
│   │   ├── pt-self.md                  Patient
│   │   ├── care-team/                  Practitioner, Organization (+ PractitionerRole later)
│   │   └── devices/                    Device (watch, scale, BP cuff, glucose meter)
│   ├── episodes/                       hubs: one per problem or investigation ("the ear situation")
│   ├── conditions/                     Condition (active, resolved, history)
│   ├── encounters/<yyyy>/              visits, calls, procedures-in-clinic
│   ├── reports/<yyyy>/                 DiagnosticReport: labs, imaging, pathology, audiology
│   ├── procedures/                     Procedure (surgery, biopsy, therapy)
│   ├── medications/                    MedicationStatement
│   ├── allergies/                      AllergyIntolerance
│   ├── immunizations/                  Immunization
│   ├── plans/                          CarePlan, Goal
│   ├── family-history/                 FamilyMemberHistory
│   ├── documents/<yyyy>/               DocumentReference: one per stored original
│   ├── observations/
│   │   ├── standalone/<yyyy>/          one-off Observation with its own identity
│   │   ├── ledgers/<slug>/             compact monthly ledgers (symptoms, home BP, weight, wearables)
│   │   └── series/                     derived trend pages per analyte or metric
│   ├── library/                        non-patient knowledge: your questions for doctors, research notes
│   ├── decisions/                      treatment and health decisions with reasons
│   └── reference/                      vault settings: units, code allow-list, source map, privacy, thresholds
├── data/                               RAW, immutable, git-ignored
│   ├── inbox/                          drop zone for /sync
│   ├── documents/<yyyy>/               PDFs, photos, letters as received
│   ├── wearables/<source>/             raw exports (Apple Health export, Garmin pulls)
│   └── fhir-import/                    FHIR Bundles received from portals or connectors
├── outputs/
│   ├── visit-prep/                     one-page briefs before appointments
│   ├── exports/                        FHIR Bundles, patient summaries (generated)
│   └── reviews/                        periodic health reviews
└── trash/
```

Every folder under `memory/` has its own `index.md` (one line per file) and `log.md` (newest first), exactly as in the Chief of Staff. Year-sharded folders have an index per year plus a parent index that lists the years with counts.

### 6.1 Folder rules

| Rule | Value |
|---|---|
| Max files per folder before sharding | about 100 |
| Max file size | 12 KB (wearable ledgers 20 KB) |
| Max `index.md` size | 8 KB |
| Router `memory.md` | under 6 KB (same cap as Chief of Staff) |
| Hot-state card | under 2 KB, about 15 lines |

### 6.2 Why resource-type folders, with episodes as hubs

Two organizing ideas compete.

| | By resource type (FHIR-native) | By episode (how you think) |
|---|---|---|
| Good for | "all my labs", "current meds", export, validation | "everything about my ear" |
| Weakness | The story of one problem is scattered | Same lab belongs to two problems; moving files on closure breaks links |

Chosen: **canonical files by type, plus an episode hub per problem.** The hub is a short file with a generated timeline of links. Resources point at their episode with `vault.episode`. Closing an episode flips statuses and writes a conclusion; nothing moves.

---

## 7. File anatomy

Every file (except `index.md` and `log.md`) has four parts, in this order.

```
1. OKF header      type, title, description, tags, aliases, generated, verified, sources, stale_after
2. fhir: block     the FHIR resource as YAML (same field names as FHIR JSON)
3. vault: block    anything FHIR has no place for: episode link, sensitivity, narrative status, row schema
4. body            markdown narrative, safe to read alone
```

### 7.1 OKF header fields

Based on OKF v0.2: only `type` is required; unknown keys must be preserved; reserved files are `index.md` and `log.md`.

| Field | Rule in the Health Vault |
|---|---|
| `type` | Kebab-case resource type: `patient`, `condition`, `encounter`, `diagnostic-report`, `procedure`, `medication-statement`, `allergy-intolerance`, `immunization`, `care-plan`, `goal`, `document-reference`, `family-member-history`, `device`, `practitioner`, `organization`, `observation`. Vault-native types: `episode`, `ledger`, `series`, `reference`, `decision`, `library`. |
| `title` | Plain name, for people. |
| `description` | The index line. At most 150 characters. Carries the key facts (templates in section 11). |
| `tags` | Lowercase. Always includes the type group and a state tag (`active`, `resolved`, `archived`). Episode membership as `episode/<slug>`. |
| `aliases` | Synonyms a person would type. Required for analytes, drugs, conditions. |
| `generated` | `{by: "<skill>", at: "<ISO 8601 with offset>"}`. Updated on every meaningful change. |
| `verified` | OKF's own signal. Absent means **unverified** (extracted by the LLM, not checked). `{by: "human:owner", at: "…"}` means the owner checked it against the source. Machine-only entries count as machine-confirmed. |
| `sources` | List of `- resource: "data/documents/2026/….pdf"` (vault-root relative), optional `id`. Every clinical resource has at least one. `session:YYYY-MM-DD` for something the owner told Claude. |
| `stale_after` | Optional absolute date. After it, `/start` and `/health-check` flag the file for review. Used on medications (re-confirm list), care plans, and any "current" claim. |
| `status` | **Never written.** OKF reserves it. FHIR status is inside `fhir:`. |

### 7.2 The `fhir:` block

- Same element names, nesting and value sets as FHIR R4 JSON.
- Contains no `text` element; the body is the narrative.
- Contains no `meta.lastUpdated`; `generated.at` serves that purpose and the exporter fills it.
- Written minimally: what the source actually states, plus the obvious defaults in section 4.3. Absent information is left out, never guessed, never asked for.
- `code` always carries `text` (what the document said), plus `coding` only under the rule in section 10.

### 7.3 The `vault:` block

Keys the vault adds. All are optional except where stated.

| Key | Meaning |
|---|---|
| `episode` | Id of the episode hub this resource belongs to. |
| `sensitivity` | `normal` or `restricted`. Restricted items are excluded from exports, visit-prep briefs and summaries unless the owner asks. Maps to FHIR `meta.security` confidentiality on export. |
| `narrative` | `generated` (body produced mechanically from the `fhir:` block) or `additional` (body contains human or LLM prose beyond the structured data). Mirrors FHIR narrative status. |
| `rowSchema` | Present on files whose body table holds compact Observations: `lab-v1`, `ledger-quantity-v1`, `ledger-symptom-v1`, `ledger-bp-v1`, `ledger-workout-v1`. |
| `inherit` | Defaults merged into each table row on export (subject, status, effective time, performer, category, device). |
| `documents` | References to DocumentReferences for the originals behind this record. |
| `coding_note` | Short reason when a `coding` was deliberately omitted or is uncertain. |

### 7.4 The body (FHIR narrative)

The body follows FHIR's narrative principle: **someone who reads only the body must not be misled.** Rules:

1. State what, when, who, value with unit, and the source document's own interpretation.
2. Never contradict the `fhir:` block. If the body adds information (a doctor's reasoning, your own notes), set `vault.narrative: additional`.
3. Always end with a **Links** section: the episode hub, the related Condition, Encounter, report, source document.
4. Direct quotes of clinical statements are marked as quotes and attributed to the clinician or document.

---

## 8. Handling volume without breaking FHIR

One file per FHIR resource works for conditions, visits, reports and medications: dozens to a few hundred a decade. It fails for lab analytes (hundreds per year) and wearables (thousands per month). Two compact patterns solve this.

### 8.1 Pattern A: results table inside a DiagnosticReport

A lab report is one file. Its `fhir:` block is the DiagnosticReport. The atomic results are a **table in the body**, with a fixed column schema (`lab-v1`). On export, each row becomes an Observation that is merged with `vault.inherit` and referenced from `DiagnosticReport.result`.

`lab-v1` columns and their FHIR targets:

| Column | FHIR target | Notes |
|---|---|---|
| Analyte | `Observation.code.text` | As printed on the report. |
| Code | `Observation.code.coding` | `loinc:2345-7`. Blank if the report gives none (see section 10). |
| Value | `value[x]` | Number becomes `valueQuantity`; text such as "Negative" becomes `valueString` or `valueCodeableConcept`; `<0.5` becomes a quantity with a `comparator`. |
| Unit | `valueQuantity.unit` / `code` | UCUM, exactly as the source states it. |
| Range | `referenceRange.low` / `high` / `text` | **Copied from the lab report. Never computed.** |
| Flag | `interpretation` | `H`, `L`, `N`, `HH`, `LL`, `A` (v3 ObservationInterpretation). |
| Note | `note` | Optional. |

Inherited by every row: `status`, `subject`, `category` (laboratory), `effective[x]`, `issued`, `performer`, `encounter`, `specimen`.

Strict mode (optional, off by default): write full contained Observations in `fhir.contained`. Because contained resources do not inherit context, each must repeat `subject`, `status` and `effective[x]`. Use only if you need the file itself to be valid FHIR without the exporter.

### 8.2 Pattern B: ledgers (homogeneous repeated observations)

A **ledger** is one file per metric per month holding many rows of the same kind of Observation: resting heart rate, sleep duration, weight, home blood pressure, a daily symptom score, workouts.

- `fhir:` block holds the **Observation template** (code, category, subject, device, status).
- `vault:` block holds the row schema, unit, period and aggregation method.
- The **body table is the data**. Single source of truth, no duplicate in YAML.
- Row id on export: `<ledger id>-<yyyymmdd>[-n]`.

Row schemas:

| Schema | Columns | FHIR shape |
|---|---|---|
| `ledger-quantity-v1` | Date, Value, Note | `valueQuantity`, `effectiveDateTime` or day `effectivePeriod` |
| `ledger-bp-v1` | Date, Systolic, Diastolic, Pulse, Note | One Observation with `component` for systolic and diastolic (the textbook use of `component`: one method, one performer, one device, one time) |
| `ledger-symptom-v1` | Date, Symptom, Severity (0 to 10), Note | Observation with a local category `symptom` (permitted by the preferred binding) |
| `ledger-workout-v1` | Date, Sport, Minutes, kcal, Avg HR, Note | Exercise-activity Observation with `component`s |

### 8.3 Tiering rule (what goes where)

| Data | Raw store | In the wiki |
|---|---|---|
| Visits, conditions, procedures, meds, allergies, immunizations, plans | the original document in `data/documents/` | One file each (full FHIR block) |
| Lab and imaging reports | PDF or photo in `data/documents/` | One DiagnosticReport file with results table |
| One-off measurement with its own meaning (a single ECG, a DEXA scan number) | document | One `observation` file |
| Wearable streams (HR, HRV, sleep, steps) | export files in `data/wearables/` | Daily summaries in monthly ledgers. **Raw samples never enter the wiki.** |
| Home monitoring, symptom diary | none, or app export | Monthly ledgers |
| Trends | none | Derived `series` pages |

---

## 9. Derived pages (rebuildable, never hand-edited)

Same idea as the Chief of Staff hot-state card: derived from the files, labelled, regenerated by a skill or script.

### 9.1 Series pages

One page per analyte or metric: `observations/series/<slug>.md`, `type: series`.

- Rows: date, value, unit, reference range, flag, link to the source report or ledger.
- Header block: count, first and latest date, latest value, min, max, and a recent direction (computed by script, not by the LLM).
- Built from all `lab-v1` rows and ledger rows that share a code.
- `generated.by` names the builder; `/health-check` flags a series older than the newest source row.
- Unit mismatches inside one series are flagged, never converted silently.

This is what answers "how has my ferritin moved over five years" without opening five years of reports.

### 9.2 Episode timelines

Between `<!-- timeline:start -->` and `<!-- timeline:end -->` markers in an episode hub, the timeline is regenerated from every resource whose `vault.episode` matches. Everything outside the markers is hand or LLM written and preserved.

### 9.3 Indexes, logs, router, card

Same as Chief of Staff: `index.md` per folder derived from frontmatter, `log.md` appended by skills, `_state.md` rewritten whole by `/save` and `/health-check`.

---

## 10. Terminology and coding policy

| Concept | System | Notes |
|---|---|---|
| Labs, vitals, wearable metrics | **LOINC** (`http://loinc.org`) | Verified in sources: heart rate 8867-4, resting heart rate 40443-4, systolic 8480-6, diastolic 8462-4, body temperature 8310-5, respiratory rate 9279-1, oxygen saturation 2708-6 and 59408-5, body weight 29463-7, height 8302-2, BMI 39156-5, glucose 2345-7, creatinine 2160-0, WBC 6690-2, erythrocytes 789-8, daily step count 41950-7, activity duration 55411-3, exercise activity 73985-4. Other codes are added to the allow-list only after being checked. LOINC is copyrighted by Regenstrief; keep the attribution. |
| Units | **UCUM** (`http://unitsofmeasure.org`) | Examples: `mmol/L`, `umol/L`, `10*9/L`, `/min`. |
| Diagnoses, procedures, body sites | **SNOMED CT** or national classification | In Canada, ICD-10-CA is also used. Check licensing before shipping any code table. The plugin ships none. |
| Medications | **RxNorm** (US) or **DIN** (Canada) | Written only when the source (pharmacy label, discharge note) states it. |
| Vaccines | **CVX** | Only from the immunization record. |
| Observation category | `http://terminology.hl7.org/CodeSystem/observation-category` | Plus local `symptom` under `https://ownmydata.health/CodeSystem/observation-category`. |

### 10.1 The coding rule

1. **`text` always.** Copy the source document's own wording into `code.text`.
2. **`coding` only if** (a) the source document prints the code, or (b) the item is on the vault's allow-list in `memory/reference/code-allowlist.md` and the match is exact, or (c) the owner confirms it.
3. **Never guess a code.** If unsure, omit `coding` and set `vault.coding_note`.
4. **Never convert units silently.** Store the source unit. A conversion, if wanted, is a separate derived view with the factor stated.
5. **Reference ranges and flags come from the source.** If the report gives none, leave them blank.

---

## 11. Index descriptions by resource type

The `description` field is what the LLM sees in the index. Fixed templates keep it scannable and under 150 characters.

| Type | Template | Example |
|---|---|---|
| encounter | `date · setting · clinician · reason/outcome` | `2026-10-12 · ENT consult · Dr. A. Example · left hearing loss workup` |
| diagnostic-report | `date · kind · panel · flags` | `2026-10-14 · Lab · Fasting glucose + CBC · 1 low (WBC)` |
| condition | `onset · name · clinical status · episode` | `2026-09 · Hearing loss, left · active · ep ear-2026` |
| procedure | `date · procedure · outcome` | `2026-11-02 · Ear tube placement · completed, no complications` |
| medication-statement | `name · dose · since · for what` | `Drug X 10 mg daily · since 2026-10-20 · for condition Y` |
| ledger | `metric · month · n days · range` | `Resting HR · 2026-11 · 17 days · 54-61 /min` |
| series | `metric · n results · latest value date` | `Fasting glucose · 9 results · latest 5.2 mmol/L (2026-10-14)` |
| episode | `status · period · anchor problem · last event` | `active · since 2026-09 · left hearing loss · last: ENT 2026-10-12` |
| document-reference | `date · kind · issuer` | `2026-10-14 · Lab report PDF · Example Lab` |

---

## 12. Episodes (the "ear situation" model)

An **episode** is a vault-native hub for one problem or investigation. It starts when something is worth tracking and ends with a written conclusion. It stays in the vault afterward.

### 12.1 Lifecycle

| State (`vault.episode.status`) | Meaning | Maps to EpisodeOfCare |
|---|---|---|
| `active` | Under investigation or treatment. Shown by `/start`. | active |
| `onhold` | Waiting (referral, next test). | onhold |
| `finished` | Concluded. Conclusion written. Not shown by `/start`, kept for recurrence watch. | finished |
| `cancelled` | Opened by mistake or abandoned. | cancelled |

`status` is not used as a key because OKF reserves it; the state lives under `vault.episode`.

### 12.2 Closing ritual (`/save` or `/health-check` proposes it)

When the anchor Condition shows `abatementDateTime` or the owner says it is done:

1. Set Condition `clinicalStatus` to `resolved`, `remission` or `inactive` (FHIR rule con-4 requires one of these once an abatement is recorded). Add the abatement date.
2. Mark the CarePlan `completed`.
3. Write the hub's **Conclusion** section: outcome, diagnosis as finally stated by the clinician, what treatment was done, what to watch for, who to call.
4. Set `vault.episode.status: finished` and `period.end`.
5. Add tag `closed`. Log it in `episodes/log.md`.
6. Keep every linked resource. Nothing moves.

### 12.3 Recurrence

A returning problem is **not** a new Condition by default. Set the existing Condition's `clinicalStatus` to `recurrence` (or `relapse`), reopen the episode (`active`) and add a dated line to the hub. If it is clearly a different problem, open a new episode and link the two.

### 12.4 What a hub contains

Short and mostly links: one-paragraph summary, anchor condition, care team, a generated timeline, open questions for the next clinician, conclusion (when finished).

---

## 13. Provenance, trust and safety of extracted data

Health data is the one domain where a wrong digit matters. The design makes every number traceable and every check explicit.

### 13.1 The trust ladder (OKF signals)

| State | How it appears | Who sets it |
|---|---|---|
| Unverified | no `verified` key | `/capture` writes this by default |
| Machine-confirmed | `verified` entry by a non-human actor | A second automated pass (re-read of the source) |
| Human-reviewed | `verified: {by: "human:owner", at: …}` | **Only the owner**, if they choose to reply after the verification notice (for example "numbers look right"). Optional. |

Skills treat unverified values as "reported, not confirmed" when answering and say so in a few words. Unverified is the normal state and is never surfaced as a to-do.

### 13.2 Extraction rules for `/capture`

1. File the raw original in `data/documents/<yyyy>/` first. Record its SHA-256 in `vault.source`. Never edit it. **If the same hash already exists, stop and tell the user the document is already in the vault** (link to it). Append one line per ingest to `data/load-log.md`: date, file, hash, files created or updated.
2. Create a DocumentReference for the original.
3. Extract in dependency order: Patient, Practitioner, Organization, then Encounter, then DiagnosticReport or Procedure, then Condition, then Medication, Allergy and the rest.
4. Copy values, units, ranges and flags exactly as printed. Do not round, convert or reorder.
5. Do not set `Condition.verificationStatus` to `confirmed` unless the document states a diagnosis. Otherwise `unconfirmed` or `provisional`, matching the document's own language.
6. Do not infer diagnoses, causes or severity. Record what the clinician wrote and attribute it.
7. Save everything first. Then show a short **verification notice**: a reminder to check the numbers against the original, listing each value Claude read with its unit and where it appears in the source, with anything uncertain or out of range listed first. Example:

   > Saved: lab report 2026-10-14, 4 results. Please check these numbers against the original so you know I read them correctly:
   > - ⚠ WBC 3.9 x10E9/L (page 1, flagged L)
   > - Glucose 5.2 mmol/L (page 1)
   > - Creatinine 78 umol/L (page 1)
   > - RBC 4.6 x10E12/L (page 1)
   >
   > Tell me if any are wrong and I'll fix them.

   The notice does not block, does not wait for an answer and does not create a task. A correction from the user updates the file and logs the change; a confirmation sets `verified` to `human:owner`; silence changes nothing.
8. Ambiguity (smudged digit, unit not printed) is written as a note on the resource and shown with ⚠ in the notice; never resolved by guessing, and never turned into a question that blocks the save.

### 13.3 Mapping to FHIR Provenance

On export, each file's `generated`, `sources` and `verified` produce a FHIR Provenance resource: `target` is the resource, `agent` is the generating skill (software) and, if present, the human verifier, `entity` with role `source` points at the DocumentReference.

---

## 14. Privacy, security and clinical-safety architecture

### 14.1 Where data goes

| Surface | Rule |
|---|---|
| Plugin repository (public, open source) | Contains code, skills, an **empty** template vault and fictional examples. **Never** real data. The template `.gitignore` excludes `memory/`, `data/`, `outputs/`, `trash/`. |
| The vault folder | Local. `setup-health-vault` warns if it sits in a shared or cloud-synced folder and offers an encrypted-volume option. It never creates a remote and never pushes. |
| The LLM provider | Files you ask Claude to read are processed by the provider. This is a user choice stated at setup. A fully local mode (open-weight model) is a documented option, not a requirement. |
| Claude's own memory | Health facts are written to the **vault only**, never to the assistant's account-level memory. Recommend running health sessions in a project with its memory kept separate, or in an incognito chat. |
| Web search | Skills never put names, dates of birth, identifiers or full lab values in search queries. |
| Exports | `outputs/exports/` excludes `sensitivity: restricted` items by default and shows what was withheld. |

### 14.2 Sensitivity

- Default `sensitivity: normal`.
- Restricted by default: mental health, sexual and reproductive health, substance use, genetic results. The owner can change any item.
- Restricted items are excluded from summaries, visit briefs and exports unless the owner names them.

### 14.3 Clinical-safety rules (go in `CLAUDE.md`)

1. The assistant is not a clinician. It does not diagnose, prescribe, give doses, predict prognosis, or advise stopping or changing treatment.
2. It reports and compares what the records say, with the source's own ranges.
3. It never overwrites a reference range or flag from a source.
4. For sudden or severe symptoms it tells the owner to seek urgent care rather than analyze the vault.
5. Trends are described as numbers ("rose from X to Y over N months"), not as medical conclusions.
6. Every answer from the vault names the record it came from and its verification state.
7. **Escalation tiers** (adapted from hstack): green, informational; yellow, worth raising at the next appointment; red, contact a clinician now or seek urgent care. Red overrides everything else in the reply. Words that suggest crisis or self-harm stop analysis and point to immediate help.
8. **Separate assessment from delivery.** `/query` and `/visit-prep` first produce a plain, unsoftened clinical reading of the records (a subagent where available), then write the friendly version from it, so tone never changes the substance.

---

## 15. Router, hot-state card and bundle index

### 15.1 `memory.md` (router)

Frontmatter:

```yaml
---
type: system
title: "Memory router"
description: "Map of the health vault: what each folder holds and when to open it."
tags: [system]
layout: "hv-1.0"
okf_version: "0.2"
fhir_version: "4.0.1"
---
```

Folders table (abridged) and "Where to look" table:

| The conversation mentions... | Look here first |
|---|---|
| A problem ("my ear", "the knee thing") | `episodes/index.md`, then the hub, then its timeline links |
| A visit or a doctor | `encounters/<year>/index.md`, then `patient/care-team/` |
| A lab value or trend ("my ferritin", "A1c") | `observations/series/` first; reports only for detail |
| Current medications | `medications/index.md` |
| Sleep, HRV, resting HR, training | `observations/ledgers/<metric>/` and series |
| A past decision about treatment | `decisions/` and the episode's conclusion |
| What to ask the doctor | `library/questions-*.md` and the episode's open questions |
| What changed recently | The folder `log.md` |

### 15.2 `_state.md` (hot-state card, derived)

Sections, at most 15 lines:

```
## Active episodes        one line each: name, last event, next step
## Upcoming               next appointments, tests due
## Needs review           items past stale_after (information only, never a task)
## Recent results         out-of-range flags from the last 30 days
## Medications            count and last confirmed date
## Wearables              last import date per source
```

Contains no raw values beyond flags, and nothing from live connectors.

---

## 16. Plugin and skill map (how this mirrors Chief of Staff)

Plugin name: `ownmydata` (repo `pifpof/ownmydata-health`). Skills are namespaced, so `/ownmydata:save` does not collide with the Chief of Staff's `/save`.

| Skill | Chief of Staff equivalent | What it does to this structure |
|---|---|---|
| `setup-health-vault` | `onboard` | Creates the layout from the template. Asks two things only: the person's name and where the vault folder lives (with a warning if it is cloud-synced). Everything else (doctors, conditions, episodes, devices) is learned later from captured documents. Ends with "drop in your first document". |
| `start` | `start` | Reads router, card, active episodes; opens with where things stand. |
| `capture` | `capture` | Turns one source (PDF, photo, portal export, pasted text, or a sentence) into FHIR files by the rules in section 13.2, saves, then shows the verification notice. Opens or attaches to an episode on its own when the source is clearly about one. |
| `sync` | `sync` | Batch version of capture for everything in `data/inbox/`. |
| `debrief` | `minutes` | After an appointment: owner dictates or pastes; produces an Encounter, new Conditions or plan changes, and questions still open. |
| `save` | `save` | End-of-session write-back: updates episode hubs, indexes, logs, card; proposes closing an episode when criteria are met. |
| `query` | `query` | Answers from the vault with source and verification state; reads series pages for trends. |
| `visit-prep` | (new) | One-page brief for an upcoming appointment: active problems, current meds, recent results, open questions. Respects sensitivity. |
| `wearables` | (new) | Imports Garmin, Apple Health or other exports into monthly ledgers and refreshes series. Uses a connected Garmin Connect tool if one is present, else files in `data/wearables/`. |
| `export` | (new) | Builds a FHIR R4 Bundle, or an International Patient Summary style document, from the vault. |
| `review` | `review` | Monthly or quarterly health review: what moved, what stalled, overdue follow-ups. |
| `health-check` | `health-check` | Validators in section 17; rebuilds indexes, series, timelines and the card. |
| `recenter` | `recenter` | Re-reads `CLAUDE.md` safety rules after compaction or long sessions. |

Skills must work with **no scripts installed** (the LLM does the work by reading the references). Scripts (`fhir_export.py`, `build_series.py`, `build_indexes.py`, `validate.py`) are accelerators that make results deterministic. Scripts are where arithmetic and expansion belong.

### 16.1 Plugin repository layout

> **As built (0.2.1):** the plugin lives in its own folder, `plugin/` (`.claude-plugin/plugin.json`, `skills/`, `schema/`), with `.claude-plugin/marketplace.json` at the repo root pointing to it (`source: ./plugin`). The shared rules ship inside `schema/memory/reference/` rather than a separate `references/` folder. The tree below is the design target.

```
ownmydata-health/                       open-source repo (pifpof/ownmydata-health)
├── .claude-plugin/plugin.json
├── skills/<each skill>/SKILL.md (+ references/)
├── schema/                             the empty template vault copied by setup
│   ├── CLAUDE.md  memory.md  .gitignore
│   └── memory/ … data/ … outputs/ … trash/   (folders with index.md, log.md, .gitkeep)
├── references/
│   ├── resource-map.md                 section 3.1 and 5.2 as a lookup table
│   ├── row-schemas.md                  section 8 schemas
│   └── code-allowlist.md               section 10 starter list
├── scripts/                            optional accelerators
├── examples/                           fully fictional sample vault
└── README.md  LICENSE
```

---

## 17. `/health-check` validators

| # | Check | Severity |
|---|---|---|
| V1 | OKF: every non-reserved file has parseable frontmatter and a non-empty `type` | error |
| V2 | `type` matches `fhir.resourceType` (kebab-case) and the folder | error |
| V3 | `fhir.id` equals filename stem and obeys the id grammar | error |
| V4 | FHIR-required elements missing because the source did not state them (section 4.3) | info, never prompts the user |
| V5 | Status values come from the R4 value sets | error |
| V6 | Condition: `abatement[x]` present implies clinicalStatus inactive, resolved or remission; `clinicalStatus` absent when `entered-in-error` | error |
| V7 | Every machine reference resolves to a file; every body link resolves | error |
| V8 | Every clinical resource has at least one `sources` entry that exists | warn |
| V9 | `lab-v1` and ledger tables match their row schema; units are UCUM; dates ISO 8601 | error |
| V10 | No `coding` without a source or allow-list match | warn |
| V11 | Unit mismatch inside one series | warn |
| V12 | Body disagrees with `fhir:` block (LLM comparison) | warn |
| V13 | Count of unverified files (reported in the health-check summary only, never in `/start`) | info |
| V14 | Items past `stale_after` | info |
| V15 | Episode finished but linked Condition still active, or reverse | warn |
| V16 | Series older than its newest source row; indexes or card stale | auto-fix |
| V17 | Orphan raw documents in `data/` with no DocumentReference | warn |
| V18 | Folder over 100 files or file over its size cap | warn |
| V19 | `sensitivity: restricted` content found in `outputs/` | error |
| V20 | Plugin repo `.gitignore` missing the vault paths | error |
| V21 | Two documents in `data/` with the same SHA-256, or a document missing from `data/load-log.md` | warn |

---

## 18. Worked examples (all fictional)

Example vault: a sample patient with a left-ear hearing investigation. File paths are shown above each example.

> **v0.1 note (2026-11-18):** where these examples differ from the v0.1 build requirements, `fixtures/EXPECTED.md` or the vault rules in `plugin/schema/memory/reference/`, those win. In particular: lab units are kept as printed (not converted to UCUM), the October lab report is not part of the ear episode (it says "annual physical"), flags the lab didn't print stay blank, and the allow-list matches LOINC codes by name **and** unit (2345-7 and 2160-0 are mass-concentration codes, so they are not auto-applied to mmol/L or umol/L results).

### 18.1 `memory/patient/pt-self.md`

```markdown
---
type: patient
title: "Patient: Sample Patient"
description: "The vault owner. Demographics, identifiers and primary care link. One patient per vault."
tags: [patient, core]
aliases: [me, self]
generated: {by: "/ownmydata:setup-health-vault", at: "2026-11-17T13:00:00-08:00"}
verified: {by: "human:owner", at: "2026-11-17T13:05:00-08:00"}
sources:
  - resource: "session:2026-11-17"
fhir:
  resourceType: Patient
  id: pt-self
  active: true
  name:
    - use: official
      family: Sample
      given: [Pat]
  gender: unknown
  birthDate: "1980-01"
  generalPractitioner:
    - reference: "Practitioner/prac-gp-example"
      display: "Dr. Example (family doctor)"
vault:
  sensitivity: restricted
  narrative: additional
---

# Sample Patient

Vault owner. Born January 1980 (month precision only). Family doctor: [Dr. Example](./care-team/prac-gp-example.md).

`gender` is administrative gender, as FHIR defines it. It is not a clinical statement of sex.
```

### 18.2 `memory/conditions/cond-20261012-hearing-loss-left.md`

```markdown
---
type: condition
title: "Hearing loss, left ear"
description: "2026-09 · Hearing loss, left ear · active · episode ear-2026"
tags: [condition, active, episode/ear-2026]
aliases: [left ear hearing, ear problem]
generated: {by: "/ownmydata:capture", at: "2026-10-12T18:20:00-07:00"}
sources:
  - resource: "data/documents/2026/2026-10-12-ent-consult-note.pdf"
    id: src1
fhir:
  resourceType: Condition
  id: cond-20261012-hearing-loss-left
  clinicalStatus:
    coding:
      - system: "http://terminology.hl7.org/CodeSystem/condition-clinical"
        code: active
  verificationStatus:
    coding:
      - system: "http://terminology.hl7.org/CodeSystem/condition-ver-status"
        code: provisional
  category:
    - coding:
        - system: "http://terminology.hl7.org/CodeSystem/condition-category"
          code: problem-list-item
  code:
    text: "Hearing loss, left ear"
  bodySite:
    - text: "Left ear"
  subject:
    reference: "Patient/pt-self"
  encounter:
    reference: "Encounter/enc-20261012-ent-consult"
  onsetDateTime: "2026-09"
  recordedDate: "2026-10-12"
  asserter:
    reference: "Practitioner/prac-ent-example"
    display: "Dr. A. Example, ENT"
vault:
  episode: ep-20261012-left-ear
  coding_note: "Source gives no code. text only, by policy."
  narrative: additional
---

# Hearing loss, left ear

Recorded by Dr. A. Example (ENT) at the 2026-10-12 consult. Onset about September 2026. Status: **active**, verification **provisional** (the note says cause not yet established).

Quoted from the consult note: "Further audiology testing ordered."

## Links
- Episode: [Left ear investigation](../episodes/ep-20261012-left-ear.md)
- Visit: [ENT consult 2026-10-12](../encounters/2026/enc-20261012-ent-consult.md)
- Source: [consult note](../documents/2026/doc-20261012-ent-consult-note.md)
```

### 18.3 `memory/encounters/2026/enc-20261012-ent-consult.md`

```markdown
---
type: encounter
title: "ENT consult, 2026-10-12"
description: "2026-10-12 · ENT consult · Dr. A. Example · left hearing loss workup"
tags: [encounter, episode/ear-2026]
aliases: [ENT visit, ear doctor]
generated: {by: "/ownmydata:debrief", at: "2026-10-12T18:20:00-07:00"}
sources:
  - resource: "data/documents/2026/2026-10-12-ent-consult-note.pdf"
fhir:
  resourceType: Encounter
  id: enc-20261012-ent-consult
  status: finished
  class:
    system: "http://terminology.hl7.org/CodeSystem/v3-ActCode"
    code: AMB
    display: ambulatory
  type:
    - text: "ENT consultation"
  subject:
    reference: "Patient/pt-self"
  participant:
    - individual:
        reference: "Practitioner/prac-ent-example"
        display: "Dr. A. Example, ENT"
  period:
    start: "2026-10-12T09:30:00-07:00"
    end: "2026-10-12T10:00:00-07:00"
  reasonCode:
    - text: "Reduced hearing, left ear"
  diagnosis:
    - condition:
        reference: "Condition/cond-20261012-hearing-loss-left"
      rank: 1
  serviceProvider:
    reference: "Organization/org-ent-clinic-example"
vault:
  episode: ep-20261012-left-ear
  narrative: additional
---

# ENT consult, 2026-10-12

Seen by Dr. A. Example for reduced hearing in the left ear since about September.

**What was done:** examination and history. Audiology testing ordered; follow-up in 4 weeks.

**Open questions for next visit:** whether imaging is needed depending on audiology results.

## Links
- Problem: [Hearing loss, left ear](../../conditions/cond-20261012-hearing-loss-left.md)
- Episode: [Left ear investigation](../../episodes/ep-20261012-left-ear.md)
- Source: [consult note](../../documents/2026/doc-20261012-ent-consult-note.md)
```

### 18.4 `memory/reports/2026/rpt-20261014-fasting-labs.md` (Pattern A)

```markdown
---
type: diagnostic-report
title: "Fasting glucose and CBC, 2026-10-14"
description: "2026-10-14 · Lab · Fasting glucose, creatinine, CBC items · 1 low (WBC)"
tags: [report, lab, episode/ear-2026]
aliases: [bloodwork October 2026, fasting labs]
generated: {by: "/ownmydata:capture", at: "2026-10-14T19:00:00-07:00"}
sources:
  - resource: "data/documents/2026/2026-10-14-lab-report.pdf"
    id: src1
fhir:
  resourceType: DiagnosticReport
  id: rpt-20261014-fasting-labs
  status: final
  category:
    - coding:
        - system: "http://terminology.hl7.org/CodeSystem/v2-0074"
          code: LAB
  code:
    text: "Fasting glucose and CBC"
  subject:
    reference: "Patient/pt-self"
  effectiveDateTime: "2026-10-14T07:45:00-07:00"
  issued: "2026-10-14T16:20:00-07:00"
  performer:
    - reference: "Organization/org-lab-example"
      display: "Example Medical Laboratory"
vault:
  episode: ep-20261012-left-ear
  rowSchema: lab-v1
  inherit:
    status: final
    subject: "Patient/pt-self"
    category: laboratory
    effectiveDateTime: "2026-10-14T07:45:00-07:00"
    performer: "Organization/org-lab-example"
  documents: ["DocumentReference/doc-20261014-lab-report"]
  narrative: generated
---

# Fasting glucose and CBC, 2026-10-14

Collected 07:45, reported 16:20 by Example Medical Laboratory. Ranges and flags are the laboratory's own.

## Results

| Analyte | Code | Value | Unit | Range | Flag | Note |
|---|---|---|---|---|---|---|
| Glucose, fasting | loinc:2345-7 | 5.2 | mmol/L | 3.3–6.0 | N | |
| Creatinine | loinc:2160-0 | 78 | umol/L | 45–90 | N | |
| Leukocytes (WBC) | loinc:6690-2 | 3.9 | 10*9/L | 4.0–11.0 | L | Slightly below range |
| Erythrocytes (RBC) | loinc:789-8 | 4.6 | 10*12/L | 4.2–5.8 | N | |

## Links
- Episode: [Left ear investigation](../../episodes/ep-20261012-left-ear.md)
- Series: [Fasting glucose](../../observations/series/fasting-glucose.md)
- Source: [lab report PDF](../../documents/2026/doc-20261014-lab-report.md)
```

### 18.5 `memory/observations/ledgers/hr-resting/lgr-hr-resting-202611.md` (Pattern B)

```markdown
---
type: ledger
title: "Resting heart rate, November 2026"
description: "Resting HR · 2026-11 · 5 days shown · 54-61 /min"
tags: [ledger, wearable, vital-signs]
aliases: [resting heart rate, RHR]
generated: {by: "/ownmydata:wearables", at: "2026-11-06T08:00:00-08:00"}
sources:
  - resource: "data/wearables/garmin/2026-11-export.json"
fhir:
  resourceType: Observation
  id: lgr-hr-resting-202611
  status: final
  category:
    - coding:
        - system: "http://terminology.hl7.org/CodeSystem/observation-category"
          code: vital-signs
  code:
    coding:
      - system: "http://loinc.org"
        code: "40443-4"
        display: "Heart rate --resting"
  subject:
    reference: "Patient/pt-self"
  device:
    reference: "Device/dev-watch-example"
vault:
  rowSchema: ledger-quantity-v1
  unit:
    system: "http://unitsofmeasure.org"
    code: "/min"
  period:
    start: "2026-11-01"
    end: "2026-11-30"
  aggregation: "daily resting value as reported by the device"
  narrative: generated
---

# Resting heart rate, November 2026

Daily resting values from the watch. Raw samples stay in `data/wearables/`.

| Date | Value | Note |
|---|---|---|
| 2026-11-01 | 58 | |
| 2026-11-02 | 56 | |
| 2026-11-03 | 61 | After poor sleep |
| 2026-11-04 | 55 | |
| 2026-11-05 | 54 | |

## Links
- Series: [Resting heart rate](../../series/resting-heart-rate.md)
```

### 18.6 `memory/observations/series/fasting-glucose.md` (derived)

```markdown
---
type: series
title: "Fasting glucose"
description: "Fasting glucose · 2 results · latest 5.2 mmol/L (2026-10-14)"
tags: [series, derived, lab]
aliases: [glucose, blood sugar, fasting sugar]
generated: {by: "/ownmydata:health-check", at: "2026-11-17T13:10:00-08:00"}
sources:
  - resource: "/reports/2026/rpt-20261014-fasting-labs.md"
  - resource: "/reports/2025/rpt-20250921-annual-labs.md"
vault:
  derived: true
  code: "loinc:2345-7"
  unit: "mmol/L"
---

# Fasting glucose

**Derived page. Do not edit.** Rebuilt by `/health-check` from the reports below.

| Stat | Value |
|---|---|
| Results | 2 |
| First / latest | 2025-09-21 / 2026-10-14 |
| Latest | 5.2 mmol/L (range 3.3–6.0, N) |
| Min / max | 5.1 / 5.2 mmol/L |

| Date | Value | Unit | Range | Flag | Source |
|---|---|---|---|---|---|
| 2025-09-21 | 5.1 | mmol/L | 3.3–6.0 | N | [report](../../reports/2025/rpt-20250921-annual-labs.md) |
| 2026-10-14 | 5.2 | mmol/L | 3.3–6.0 | N | [report](../../reports/2026/rpt-20261014-fasting-labs.md) |
```

### 18.7 `memory/documents/2026/doc-20261014-lab-report.md`

```markdown
---
type: document-reference
title: "Lab report PDF, 2026-10-14"
description: "2026-10-14 · Lab report PDF · Example Medical Laboratory"
tags: [document, lab]
generated: {by: "/ownmydata:capture", at: "2026-10-14T19:00:00-07:00"}
sources:
  - resource: "data/documents/2026/2026-10-14-lab-report.pdf"
fhir:
  resourceType: DocumentReference
  id: doc-20261014-lab-report
  status: current
  docStatus: final
  type:
    text: "Laboratory report"
  subject:
    reference: "Patient/pt-self"
  date: "2026-10-14T19:00:00-07:00"
  author:
    - reference: "Organization/org-lab-example"
  description: "Lab report PDF, fasting glucose and CBC"
  content:
    - attachment:
        contentType: "application/pdf"
        url: "data/documents/2026/2026-10-14-lab-report.pdf"
        title: "Lab report 2026-10-14"
  context:
    related:
      - reference: "DiagnosticReport/rpt-20261014-fasting-labs"
vault:
  source:
    sha256: "<computed at capture>"
    original_filename: "labreport_1014.pdf"
  narrative: generated
---

# Lab report PDF, 2026-10-14

Original file as received. Never edited. Record: [Fasting glucose and CBC](../../reports/2026/rpt-20261014-fasting-labs.md).
```

### 18.8 `memory/episodes/ep-20261012-left-ear.md` (hub)

```markdown
---
type: episode
title: "Left ear investigation"
description: "active · since 2026-09 · left hearing loss · last: ENT consult 2026-10-12"
tags: [episode, active, ear]
aliases: [ear situation, ear thing, left ear]
generated: {by: "/ownmydata:save", at: "2026-11-17T13:15:00-08:00"}
sources:
  - resource: "session:2026-11-17"
vault:
  episode:
    status: active
    period:
      start: "2026-09"
    anchor: "Condition/cond-20261012-hearing-loss-left"
    export_as: EpisodeOfCare
  narrative: additional
---

# Left ear investigation

**Summary.** Reduced hearing in the left ear since about September 2026. ENT consult ordered audiology; waiting on results.

**Care team:** [Dr. A. Example, ENT](../patient/care-team/prac-ent-example.md)

**Open questions for next visit**
- Is imaging needed after audiology?

<!-- timeline:start -->
| Date | What | Link |
|---|---|---|
| 2026-10-12 | ENT consult, audiology ordered | [enc](../encounters/2026/enc-20261012-ent-consult.md) |
| 2026-10-14 | Fasting labs (1 low) | [rpt](../reports/2026/rpt-20261014-fasting-labs.md) |
<!-- timeline:end -->

## Conclusion
_Written when the episode is finished._
```

---

## 19. Export and import

### 19.1 Export (`fhir-export`)

1. Walk `memory/`; skip `index.md`, `log.md`, series, episodes (episodes optionally become EpisodeOfCare).
2. For each file: take `fhir:`, add `meta` (last updated from `generated.at`, security label from `vault.sensitivity`), add `text` (body converted to restricted XHTML, `status` from `vault.narrative`).
3. Expand table rows: merge `vault.inherit` into each row, build Observations, add `DiagnosticReport.result` references or ledger Observations.
4. Create Provenance resources (section 13.3).
5. Resolve `Type/id` references to `fullUrl` values inside a `Bundle` (type `collection`).
6. Optional: a Composition arranged like the International Patient Summary sections (problems, medications, allergies, immunizations, procedures, results).
7. Run the HL7 validator. Gaps caused by information the source never stated are filled with FHIR's `data-absent-reason` extension or reported in the export summary; they are never pushed back to the user as tasks. Other failures are exporter bugs.

### 19.2 Import

- Input: FHIR Bundles in `data/fhir-import/` (portal exports, connector output).
- Each resource is converted to a file by the same id grammar. Existing ids update in place; conflicts are shown to the owner, never silently overwritten.
- Imported files carry `sources` pointing at the Bundle and are unverified until the owner confirms.
- Non-FHIR inputs (PDF, photo, CSV, Apple Health export) go through `capture` or `wearables`, which produce the same files.

### 19.3 Where records can come from outside the US

Record-connector integrations announced by the AI providers cover US records. For owners outside the US, the dependable paths are PDFs and portal exports, clinic letters, photos of reports, and wearable exports. The design does not depend on any connector.

---

## 20. Build phases

| Phase | Scope | Done when |
|---|---|---|
| **v0.1 (one weekend)** | `schema/` template, `setup-health-vault` (two questions), `capture` for a visit note, a lab report and a plain sentence, with hash dedupe, load log and verification notice; `start`; `save`; `health-check` V1 to V10; one worked example episode. No ledgers, series, export or scripts. | You drop a PDF in or say what happened, nothing else is asked of you, and "what happened with my ear" gets a sourced answer. |
| **v0.2** | Ledgers and `wearables` (Garmin through the connected Garmin Connect tool; Apple Health through an exporter such as Health.md, not a parser we write), series builder, `debrief`, `visit-prep` with escalation tiers. Optional rebuildable SQLite index for trend queries; markdown stays the source of truth. | Garmin data lands in monthly ledgers with no manual step; trends answered from series pages. |
| **v0.3** | `export` to Bundle, validator pass, IPS-style summary, FHIR import | Export passes the HL7 validator on the example vault. |
| **v1.0 public** | README, fictional example vault, privacy documentation, clean-room test of the empty template | A new user installs, runs setup, captures one document, no personal data in the repo. |

---

## 21. Items still to verify before building

These were not confirmed in the sources read for this spec. Treat them as open.

1. **LOINC codes not in the verified list:** blood pressure panel 85354-9, sleep duration, HRV, VO2 max. Confirm each against LOINC before adding to the allow-list.
2. **Element names not confirmed from the fetched pages:** `Encounter.episodeOfCare` (the EpisodeOfCare page says Encounter references it but does not name the element here), `Meta.source`, `Attachment.hash`. Confirm in the R4 StructureDefinitions.
3. **Narrative and Vital Signs profile pages** could not be fetched directly (blocked by the site). The narrative rules above come from other FHIR spec versions and the HL7 code-system page; recheck against R4 text.
4. **Observation category `activity`** definition (steps, sleep data) is read from the HL7 terminology page and should be re-read for exact wording before relying on it for sleep.
5. **Licensing:** LOINC attribution wording; whether and how SNOMED CT or ICD-10-CA may be referenced in an open-source plugin.
6. **Canadian profiles:** how PS-CA and CA Core+ differ from the IPS for the fields this vault uses. Decide whether to claim alignment.
7. **Open design question:** one vault per person vs a multi-person vault for family. This spec assumes one person. Family needs its own vault for privacy, not a folder inside this one.
8. **Strict versus compact mode** for lab results (section 8.1) is a judgment call. This spec recommends compact; revisit if the validator rejects exports.

---

## Sources

- HL7 FHIR R4 specification pages: Resource list, Observation, Condition, Encounter, Procedure, DocumentReference, Patient, CarePlan, AllergyIntolerance, Provenance, EpisodeOfCare, References (hl7.org/fhir/R4/…).
- HL7 FHIR R5 pages: DiagnosticReport, MedicationStatement, Immunization (hl7.org/fhir/R5/…), used where the R4 page could not be fetched and to document differences.
- HL7 Terminology: Observation Category code system (terminology.hl7.org).
- FHIR Narrative: hl7.org/fhir/narrative.html and STU3 and R4B code-system pages.
- International Patient Summary Implementation Guide 2.0.x (hl7.org/fhir/uv/ips).
- CA Core+ and Pan-Canadian Patient Summary (Canada Health Infoway, simplifier.net).
- Open Knowledge Format v0.2 specification (github.com/GoogleCloudPlatform/open-knowledge-format, SPEC.md).
- FHIR version and regulation: ONC and CMS interoperability rules, US Core (isp.healthit.gov, hl7.org/fhir/us/core).
- Wearable-to-FHIR mapping: Stanford HealthKitOnFHIR, HL7 Personal Health Record format IG, Virtually Healthcare IG observation definitions.
- The AI Chief of Staff plugin (github.com/pifpof/parallel79-cos): skills, schema, memory file format and `CLAUDE.md` conventions.
- Prior art reviewed: runesleo/ai-health-vault, kamens/hstack, Claude-Ally-Health, Health.md, health-skillz, chartfold, medgemma-vault.
