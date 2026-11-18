---
type: reference
title: "Description templates"
description: "Index-line templates per record type, 150 characters or fewer, plus title and alias conventions."
tags: [reference, system]
aliases: [index lines, description field]
generated:
  by: "ownmydata plugin"
  at: "2026-11-18"
sources:
  - resource: "ownmydata plugin v0.2.0"
---

# Description templates

The `description` field is the line that appears in the folder index. It is what gets read to decide whether to open the file, so it carries the key facts. Fields are separated by ` · `. 150 characters or fewer. Leave a field out rather than guess it, and never write placeholders like "date not stated": a description with no date just starts with the next field.

| Type | Template | Example |
|---|---|---|
| encounter | `date · setting · clinician · reason/outcome` | `2026-10-12 · ENT consult · Dr. A. Example · reduced hearing left ear, audiology ordered` |
| diagnostic-report | `date · kind · panel · flags` | `2026-10-14 · Lab · Glucose, creatinine, WBC, RBC · 1 low (WBC)` |
| condition | `onset · name · clinical status · episode` | `2026-09 · Left-sided hearing loss, likely conductive · active · ep left ear` |
| procedure | `date · procedure · outcome` | `2026-11-20 · Ear wax removal, left · completed` |
| medication-statement | `name · dose · since · for what` | `Olive oil ear drops · twice daily 7 days · planned 2026-10-12 · before audiology` |
| allergy-intolerance | `substance · reaction · criticality` | `Penicillin · hives · criticality not stated` |
| immunization | `date · vaccine · dose` | `2026-10-01 · Influenza vaccine · dose not stated` |
| observation | `date · what · value unit · flag` | `2026-11-02 · Blood pressure (pharmacy) · 128/82 mmHg` |
| document-reference | `date · kind · issuer` | `2026-10-14 · Lab report PDF · Example Medical Laboratory` |
| family-member-history | `relative · conditions with onset ages · living/deceased` | `Mother · type 2 diabetes (dx ~55) · living` |
| device | `device · since · status` | `Hearing aid, left ear · since ~2021 · in use` |
| observation (lifestyle) | `topic · summary in their words · date said` | `Alcohol use · 2-3 drinks a week · said 2026-11-18` |
| practitioner | `name · role or specialty · where` | `Dr. A. Example · ENT (otolaryngology) · Example ENT Clinic` |
| organization | `name · kind · town` | `Example ENT Clinic · ENT clinic · Exampletown` |
| episode | `status · period · anchor problem · last event` | `active · since 2026-09 · left hearing loss · last: hearing test 2026-11-18` |
| patient | fixed | `The vault owner. One patient per vault.` |

Rules:

- Flags in a report description count only the lab's own printed flags: `1 low (WBC)`, `2 high (LDL, TG)`, `no flags`. If any value couldn't be read, add `1 value unclear`.
- Restricted items (`vault.sensitivity: restricted`) get a neutral description with no diagnosis or result in it: `2026-03-02 · Visit · Dr. Example · restricted`.
- Rewrite the description whenever the facts in it change (a status changes, a new last event).

## Titles

Plain and dated: `ENT consult, 2026-10-12`, `Blood tests, 2026-10-14`, `Left-sided hearing loss`, `Left ear investigation`, `Dr. A. Example`, `Example ENT Clinic`, `Consultation note PDF, 2026-10-12`.

## Aliases

The words the person would actually type. For a lab report: each analyte's printed name and its common short forms ("WBC", "white count", "white blood cells"), plus "bloodwork", "blood test", the month ("October bloodwork"). For a condition or episode: body part and plain phrasing ("left ear", "ear thing", "hearing"). For a clinician: surname, "my ENT", "family doctor". For a medication: brand and generic names as written.
