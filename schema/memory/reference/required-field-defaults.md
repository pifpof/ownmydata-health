---
type: reference
title: "Required-field defaults"
description: "The only values Claude may fill in when a source is silent (past-event status, encounter class), and what stays out."
tags: [reference, system]
aliases: [defaults, missing fields]
generated:
  by: "ownmydata plugin"
  at: "2026-11-18"
sources:
  - resource: "ownmydata plugin v0.1.0"
---

# Required-field defaults

FHIR marks some elements as required. Sources often don't state them. This table is the **complete** list of values you may supply without the source saying so. Everything else that the source doesn't state stays out. You never ask the person for a missing field.

## Always supply (no source needed)

| Element | Value |
|---|---|
| `resourceType`, `id` | From the resource map and the id grammar. |
| `subject` / `patient` | `{reference: "Patient/pt-self"}` |
| `code.text` (or equivalent) | The source's own wording; for a sentence, the person's own words, lightly tidied. |

## Supply only when the rule applies

| Element | Rule |
|---|---|
| `status` on something that already happened (Encounter, Procedure, DiagnosticReport, Observation, Immunization) | `finished` (Encounter), `completed` (Procedure, Immunization), `final` (DiagnosticReport, Observation). A record of a past event is that by definition. A report marked "preliminary" or "partial" in print gets that value instead. |
| `status` on MedicationStatement | `active` if the person says they take it now; `completed` or `stopped` if they say they finished or stopped; `intended` if a document plans or prescribes it and nothing says it was started; otherwise `unknown`. |
| `status` on DocumentReference | `current`. |
| `Encounter.class` | Only if the setting is evident: clinic or office visit, clinic test appointment → `AMB`; phone or video → `VR`; hospital stay → `IMP`; emergency department → `EMER`; home visit → `HH`. Not evident → leave it out. |
| `Condition.clinicalStatus` | From the document's wording. Otherwise `active` for a problem being investigated or treated now. |
| `Condition.verificationStatus` | From the document's wording: "likely", "probable", "query", "cause not established" → `provisional`; "possible X vs. Y" → `differential` (and usually no Condition for each alternative); a stated diagnosis → `confirmed`. Nothing to go on (e.g. the person's own sentence) → leave it out. Never `confirmed` unless the document states the diagnosis. |
| `Condition.category` | `problem-list-item` for a problem tracked over time; `encounter-diagnosis` for a diagnosis made at one visit and not followed. |
| `Condition.recordedDate` | The date of the document that recorded it, or the session date for a sentence. |
| `DiagnosticReport.category` | `LAB` when it is clearly a lab report; `AU` audiology; `RAD` imaging; `PAT` pathology. Unclear → leave out. |

## Never supply

- Reference ranges, flags or interpretations the source doesn't print.
- Codes the source doesn't print, except exact allow-list matches ([code-allowlist.md](./code-allowlist.md)).
- Birth date, gender, identifiers, addresses, phone numbers the person didn't give.
- `abatementDateTime`, `onsetDateTime`, `period.end` you would have to estimate. Partial dates ("2026-09") are fine when the source gives month precision ("since approximately September 2026").
- Severity, criticality, dose, route, frequency not written in the source.
- A diagnosis, cause or outcome the clinician didn't write.

`/ownmydata:health-check` reports FHIR-required elements that are missing because the source was silent as **information only** (V4). They are never a task for the person.
