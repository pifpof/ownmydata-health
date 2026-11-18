---
type: reference
title: "Resource map"
description: "Which record type to write for what, its id prefix, folder, OKF type and path rules for Type/id references."
tags: [reference, system]
aliases: [record types, id grammar, path rules]
generated:
  by: "ownmydata plugin"
  at: "2026-11-18"
sources:
  - resource: "ownmydata plugin v0.1.0"
---

# Resource map

## 1. What to write for what the source contains

| The source contains... | Write | Never |
|---|---|---|
| A visit, call, admission, test appointment that happened | **Encounter** | Don't write an Encounter for a visit that is only planned ("follow-up in 4 weeks"): that's an open item on the episode hub and a line in the visit's body. |
| A diagnosis, impression, or problem being investigated or treated | **Condition** | Don't create one for a passing symptom with no follow-up. Don't create one for a differential ("possible X vs. Y"): quote it in the body. |
| A lab, imaging, audiology, pathology or other test report | **DiagnosticReport** (lab values as a `lab-v1` table) | Don't write separate Observation files for lab rows. |
| A single measurement outside a report (a BP reading at the pharmacy) | **Observation** (standalone) | |
| A surgery, biopsy, injection, ear syringing or other procedure | **Procedure** | |
| A medication the person takes, took, or was told to take | **MedicationStatement** | Not for a drug merely mentioned. |
| An allergy or intolerance | **AllergyIntolerance** | |
| A vaccine given | **Immunization** | |
| A doctor, nurse, audiologist or other person providing care | **Practitioner** | Reuse an existing file when the name matches (see §4). |
| A clinic, hospital, lab or pharmacy | **Organization** | Reuse when the name matches. |
| Any original file (PDF, photo, scan) | **DocumentReference** | Never for a sentence (no file). |
| A problem worth following over time | **Episode hub** (vault-native) | See the episode rules in the capture skill. |

## 2. Ids, folders and types

Id grammar: `<prefix>-<yyyymmdd>-<slug>` for dated records, `<prefix>-<slug>` for undated. Lowercase letters, digits, hyphens. 64 characters at most. Slug: two to five words from the source ("ent-consult", "fasting-labs", "hearing-loss-left"). Filename = `<id>.md`. If the id is taken by a different record, add `-2`.

**No date in the source?** A dated id still needs eight digits: use the date the vault learned about it (the document's date, or today for something the person said). That date is only for the filename. It is **not** written into the record's own date elements (`performedDateTime`, `period`, `onsetDateTime`...), which stay out when the source doesn't state them.

| Record | `type` | Prefix | Date in id | Folder under `memory/` |
|---|---|---|---|---|
| Patient | `patient` | `pt` | none (always `pt-self`) | `patient/` |
| Practitioner | `practitioner` | `prac` | none | `patient/care-team/` |
| Organization | `organization` | `org` | none | `patient/care-team/` |
| Condition | `condition` | `cond` | recorded date | `conditions/` |
| Encounter | `encounter` | `enc` | visit date | `encounters/<yyyy>/` |
| DiagnosticReport | `diagnostic-report` | `rpt` | effective (collection) date | `reports/<yyyy>/` |
| Observation | `observation` | `obs` | effective date | `observations/standalone/<yyyy>/` |
| Procedure | `procedure` | `proc` | performed date | `procedures/` |
| MedicationStatement | `medication-statement` | `med` | start date, else date recorded | `medications/` |
| AllergyIntolerance | `allergy-intolerance` | `alg` | none | `allergies/` |
| Immunization | `immunization` | `imm` | occurrence date | `immunizations/` |
| DocumentReference | `document-reference` | `doc` | document date | `documents/<yyyy>/` |
| Episode hub | `episode` | `ep` | opened date | `episodes/` |

`<yyyy>` is the year in the id. Practitioner slug: surname plus a distinguishing word (`prac-example-ent`). Organization slug: its name (`org-example-ent-clinic`).

## 3. Reference → path (no searching)

| Reference | File |
|---|---|
| `Patient/pt-self` | `memory/patient/pt-self.md` |
| `Practitioner/<id>`, `Organization/<id>` | `memory/patient/care-team/<id>.md` |
| `Condition/<id>` | `memory/conditions/<id>.md` |
| `Encounter/<id>` | `memory/encounters/<yyyy>/<id>.md` (yyyy from the id) |
| `DiagnosticReport/<id>` | `memory/reports/<yyyy>/<id>.md` |
| `Observation/<id>` | `memory/observations/standalone/<yyyy>/<id>.md` |
| `Procedure/<id>` | `memory/procedures/<id>.md` |
| `MedicationStatement/<id>` | `memory/medications/<id>.md` |
| `AllergyIntolerance/<id>` | `memory/allergies/<id>.md` |
| `Immunization/<id>` | `memory/immunizations/<id>.md` |
| `DocumentReference/<id>` | `memory/documents/<yyyy>/<id>.md` |
| episode id in `vault.episode` | `memory/episodes/<id>.md` |

## 4. Resolving people and places

Before creating a Practitioner or Organization, read `memory/patient/care-team/index.md` and match by name, ignoring titles and punctuation ("Dr. A. Example" = "A. Example, MD"). Same name → reuse the file, and add any new fact the source states (a qualification, an address) to it. Different initials or a different specialty in the same surname → a new file.

## 5. R4 elements and value sets used in v0.1

Only write elements the source supports. Codes below are the only values allowed for these elements.

**Patient:** `name[].text` (as the person gave it), `birthDate`, `gender` (`male | female | other | unknown`, administrative gender, only if stated), `generalPractitioner[]`.

**Practitioner:** `name[].text` (as printed, e.g. "Dr. A. Example"), `qualification[].code.text` (degrees and credentials as printed: "MD", "FRCSC (Otolaryngology)"), `telecom[]`, `address[].text`. R4 Practitioner has no specialty element: a printed specialty goes in `qualification` if it is printed as a credential, otherwise in the body and description.

**Organization:** `name`, `type[].text` ("ENT clinic", "Laboratory"), `address[].text` (as printed), `telecom[]`.

**Encounter:** `status` (`planned | arrived | triaged | in-progress | onleave | finished | cancelled | entered-in-error | unknown`); `class` is a single **Coding** (not a list): `{system: "http://terminology.hl7.org/CodeSystem/v3-ActCode", code: AMB|VR|IMP|EMER|HH, display: ambulatory|virtual|inpatient encounter|emergency|home health}`; `type[].text`; `subject`; `participant[].individual` (Practitioner); `period.start`/`end`; `reasonCode[].text`; `diagnosis[].condition` + `rank`; `serviceProvider` (Organization); `basedOn[]`.

**Condition:** `clinicalStatus` (`active | recurrence | relapse | inactive | remission | resolved`, system `http://terminology.hl7.org/CodeSystem/condition-clinical`); `verificationStatus` (`unconfirmed | provisional | differential | confirmed | refuted | entered-in-error`, system `http://terminology.hl7.org/CodeSystem/condition-ver-status`); `category[]` (`problem-list-item | encounter-diagnosis`, system `http://terminology.hl7.org/CodeSystem/condition-category`); `code.text`; `bodySite[].text`; `subject`; `encounter`; `onsetDateTime`; `abatementDateTime`; `recordedDate`; `asserter`; `note[].text`. Rule: once `abatementDateTime` is set, `clinicalStatus` must be `resolved`, `remission` or `inactive`.

**DiagnosticReport:** `status` (`registered | partial | preliminary | final | amended | corrected | appended | cancelled | entered-in-error | unknown`); `category[]` with `{system: "http://terminology.hl7.org/CodeSystem/v2-0074", code: LAB}` for labs (`RAD` imaging, `AU` audiology, `PAT` pathology); `code.text` (the panel or test name as printed, else a plain summary like "Blood tests"); `subject`; `encounter`; `effectiveDateTime` (collection time); `issued` (reported time); `performer[]` (the lab Organization); `resultsInterpreter[]`; `basedOn[]`; `conclusion` (only if the report prints one, quoted).

**Observation (standalone):** `status` (`registered | preliminary | final | amended | corrected | cancelled | entered-in-error | unknown`); `category[]` (system `http://terminology.hl7.org/CodeSystem/observation-category`: `vital-signs | laboratory | imaging | procedure | survey | exam | therapy | activity | social-history`); `code.text`; `subject`; `effectiveDateTime`; `valueQuantity {value, unit}` or `valueString`; `interpretation[]` (only if printed); `referenceRange[] {low, high, text}` (only if printed); `note[].text`.

**Procedure:** `status` (`preparation | in-progress | not-done | on-hold | stopped | completed | entered-in-error | unknown`); `code.text`; `subject`; `encounter`; `performedDateTime`; `performer[].actor`; `reasonReference[]` (Condition); `bodySite[].text`; `outcome.text`; `note[].text`.

**MedicationStatement (R4 shape):** `status` (`active | completed | entered-in-error | intended | stopped | on-hold | unknown | not-taken`); `medicationCodeableConcept.text` (name as written); `subject`; `context` (the Encounter where it was prescribed); `effectiveDateTime` or `effectivePeriod`; `dateAsserted`; `informationSource`; `reasonReference[]`; `dosage[].text` (exactly as written, e.g. "twice daily for 7 days"); `note[].text`.

**AllergyIntolerance:** uses `patient`, not `subject`. `clinicalStatus` (`active | inactive | resolved`, system `http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical`); `verificationStatus` (`unconfirmed | confirmed | refuted | entered-in-error`, system `http://terminology.hl7.org/CodeSystem/allergyintolerance-verification`); `type` (`allergy | intolerance`); `category[]` (`food | medication | environment | biologic`); `criticality` (`low | high | unable-to-assess`, only if stated); `code.text`; `reaction[] {manifestation[].text, severity: mild|moderate|severe, description}`.

**Immunization:** uses `patient`, not `subject`. `status` (`completed | entered-in-error | not-done`); `vaccineCode.text`; `occurrenceDateTime` (or `occurrenceString` when only text is given); `lotNumber`; `site.text`; `performer[].actor`; `protocolApplied[].doseNumberString`.

**DocumentReference:** `status: current`; `docStatus` (`preliminary | final | amended | entered-in-error`, only `final` if the document is clearly a signed or issued document); `type.text` ("Consultation note", "Laboratory report"); `subject`; `date` (when filed, full date-time with offset: it's an `instant`); `author[]`; `description`; `content[].attachment {contentType, url, title}` where `url` is the vault-root path of the original; `context.encounter[]`; `context.related[]` (the records made from it). Do not use `attachment.hash` (R4 requires base64 SHA-1 there); the SHA-256 goes in `vault.source.sha256`.

**Episode hub:** no `fhir:` block. `vault.episode {status: active|onhold|finished|cancelled, period {start, end}, anchor: "Condition/<id>", export_as: EpisodeOfCare}`.
