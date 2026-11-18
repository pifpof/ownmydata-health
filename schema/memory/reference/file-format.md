---
type: reference
title: "File format"
description: "How every vault file is built: OKF header, fhir: block, vault: block, body narrative, Links section."
tags: [reference, system]
aliases: [file anatomy, frontmatter rules]
generated:
  by: "ownmydata plugin"
  at: "2026-11-18"
sources:
  - resource: "ownmydata plugin v0.1.0"
---

# File format

Every file under `memory/` except `index.md` and `log.md` has four parts, in this order: **OKF header**, **`fhir:` block**, **`vault:` block** (all three in the YAML frontmatter), then the **body**. Ready-made skeletons for each record type are in [record-templates.md](./record-templates.md).

The governing rule: **write what the source says, in FHIR R4 shape. Leave out what it doesn't say. Never guess to complete a record, never ask the person to fill a field.**

## 1. OKF header (top of the frontmatter)

| Field | Rule |
|---|---|
| `type` | Required. Kebab-case record type: `patient`, `practitioner`, `organization`, `condition`, `encounter`, `diagnostic-report`, `observation`, `procedure`, `medication-statement`, `allergy-intolerance`, `immunization`, `document-reference`, `episode`. System files use `system`, rule files `reference`. |
| `title` | Plain name for people: "ENT consult, 2026-10-12". |
| `description` | The index line, 150 characters or fewer. Use the template in [descriptions.md](./descriptions.md). |
| `tags` | Lowercase list. Always the type group (`encounter`, `report`, `condition`...) and a state tag (`active`, `resolved`, `closed`) where one applies. Episode membership as `episode/<episode id>`. |
| `aliases` | Words a person would actually type: "ear doctor", "bloodwork", brand and generic drug names, "my ear thing". Required on conditions, episodes, medications and lab reports (include the analyte names and their common short forms). |
| `generated` | `{by: "/ownmydata:<skill>", at: "<ISO 8601 with offset>"}`. Set on every meaningful change. |
| `verified` | **Absent by default** (unverified). Only set to `{by: "human:owner", at: "<now>"}` when the person says the values are right. Never set it yourself on your own judgment. |
| `sources` | List of `- resource: "<path>"`. A file in the vault: path from the vault root (`data/documents/2026/2026-10-14-lab-report.pdf`). Something the person said: `session:YYYY-MM-DD`. Every clinical file has at least one. |
| `stale_after` | Optional absolute date (`2027-05-01`). Only on "current" claims that go stale: medications the person says they take now. |
| `status` | **Never write a top-level `status`.** OKF reserves it. FHIR status goes inside `fhir:`. |

## 2. The `fhir:` block

- FHIR **R4 (4.0.1)** element names, nesting and value sets, written as YAML (same shape as FHIR JSON). No R5 shapes.
- Always: `resourceType`, `id` (equal to the filename stem), the patient link (`subject`, or `patient` on AllergyIntolerance and Immunization: `{reference: "Patient/pt-self"}`), and a plain description in `code.text` (or the resource's equivalent: `type.text` on Encounter and DocumentReference, `medicationCodeableConcept.text`, `vaccineCode.text`, `name` on Practitioner and Organization).
- Then only what the source states, plus the defaults in [required-field-defaults.md](./required-field-defaults.md). Nothing else.
- No `text` element (the body is the narrative). No `meta`.
- `code.text` copies the source's own wording. `coding` only under the rule in [code-allowlist.md](./code-allowlist.md).
- **Dates:** ISO 8601. Partial dates are fine and preferred over guessing: `"2026"`, `"2026-09"`, `"2026-10-12"`. A date with a time gets the local offset for that date. Get it from the machine, don't assume it: `date -j -f "%Y-%m-%d %H:%M" "2026-10-12 09:30" +%z` (macOS) or `date -d "2026-10-12 09:30" +%z` (Linux), then write `-0700` as `-07:00`. Quote all dates in YAML.
- **References:** `{reference: "Type/id", display: "Plain name"}`. They resolve to files by the rules in [resource-map.md](./resource-map.md).
- **Quantities:** `{value: 5.2, unit: "mmol/L"}` with the unit exactly as printed. Never convert.

## 3. The `vault:` block

All optional. Keys:

| Key | Meaning |
|---|---|
| `episode` | Id of the episode hub this record belongs to (`ep-20261012-left-ear`). |
| `sensitivity` | Leave out for normal. `restricted` for mental health, sexual and reproductive health, substance use, genetic results. Set silently; don't mention it unless asked. |
| `narrative` | `generated` (body only restates the structured data) or `additional` (body carries more: quotes, plan items, the person's words). |
| `rowSchema` | `lab-v1` on a report whose body holds a results table. See [row-schemas.md](./row-schemas.md). |
| `inherit` | Defaults every table row shares (status, subject, category, effective time, performer). |
| `documents` | `["DocumentReference/doc-…"]`: the stored originals behind this record. |
| `coding_note` | Why a `coding` was left out, or where an added code came from. |
| `source` | On DocumentReference only: `{sha256: "<hex>", original_filename: "<name as received>"}`. |
| `episode` (on an episode hub) | An object instead of a string: `{status, period: {start, end}, anchor, export_as: EpisodeOfCare}`. |

## 4. The body (narrative)

Someone who reads only the body must not be misled.

1. Open with a `# Title` heading, then what, when, who, and the source's own interpretation, in plain English.
2. Never contradict the `fhir:` block. If the body adds anything (a quote, a plan item, the person's own words), set `vault.narrative: additional`.
3. Quote clinical statements exactly and attribute them: `The note says: "Cause not yet established."`
4. Anything uncertain gets said plainly: "The middle digit of the ferritin value is obscured on the photo."
5. End with a `## Links` section: episode hub, related condition, visit, report, care team, source document. One link per line.

## 5. Relative links

Body links are relative to the file. Use this table:

| File lives in | Prefix to reach `memory/` |
|---|---|
| `conditions/`, `episodes/`, `procedures/`, `medications/`, `allergies/`, `immunizations/`, `patient/` | `../` |
| `encounters/<yyyy>/`, `reports/<yyyy>/`, `documents/<yyyy>/`, `patient/care-team/` | `../../` |
| `observations/standalone/<yyyy>/` | `../../../` |

Examples from a report in `reports/2026/`: `[Left ear investigation](../../episodes/ep-20261012-left-ear.md)`, `[Example Lab](../../patient/care-team/org-example-medical-laboratory.md)`. Links into `data/` go one more level up (the vault root): from `documents/2026/` that's `../../../data/documents/2026/…`.

## 6. Folder index and log lines

- **Index line** (`index.md`, no frontmatter): `- [Title](./file.md): description`. In a year folder (`encounters/2026/index.md`) the link is `./file.md`; the parent (`encounters/index.md`) lists years: `- [2026](./2026/index.md): 3 files`.
- **Index order:** lines under `## Files` are sorted by filename, ascending (ids carry dates, so this is chronological within a type). Years are sorted ascending. Anything that isn't a file line lives under `## Notes` at the bottom. This makes an index rebuilt from the files identical to one kept up by hand.
- **Log line** (`log.md`, no frontmatter, newest first, one `## YYYY-MM-DD` heading per day): `- **Created** [Title](./file.md): what it is (/ownmydata:capture)`. Verbs: Created, Updated, Corrected, Verified, Linked, Closed, Reopened.
- A new year folder gets its own `index.md` (`# Visits 2026` + `## Files`) and `log.md` (`# Log: encounters/2026`), and a line in the parent index.

## 7. Size

A record file stays under 12 KB. An `index.md` stays under 8 KB.
