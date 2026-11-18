---
type: system
title: "Memory router"
description: "Map of the health vault: what each folder holds and when to open it. Read at the start of every session."
tags: [system]
layout: "hv-1.0"
okf_version: "0.2"
fhir_version: "4.0.1"
generated:
  by: ""
  at: ""
---

# Memory Router

> This file is the map, not the catalogue. It lists folders, not files. Each folder keeps an `index.md` (one line per file) and a `log.md` (what changed, newest first). Open them only when the conversation needs that folder. Keep this file under 6 KB.
>
> `layout: "hv-1.0"` tells the skills which format this vault uses. `memory/` is an Open Knowledge Format v0.2 bundle; clinical files carry FHIR R4 (4.0.1) data in a `fhir:` block. The rules are in `memory/reference/`.

## Start here

- `memory/_state.md`: the hot-state card. Active problems and what's pending, upcoming items, recent flagged results. Rewritten by `/ownmydata:save` and `/ownmydata:health-check`. Read first by `/ownmydata:start`.

## Folders

| Folder | What lives there | Open when | Index |
|---|---|---|---|
| `memory/patient/` | The vault owner (`pt-self.md`), `care-team/` (doctors, clinics, labs), `devices/` (hearing aids, implants, CPAP) | A doctor, clinic or lab is named; anything about the person themselves | `memory/patient/index.md`, `memory/patient/care-team/index.md` |
| `memory/episodes/` | One hub per problem or investigation, with a timeline and, when finished, a conclusion | A problem is mentioned ("my ear", "the knee thing") | `memory/episodes/index.md` |
| `memory/conditions/` | Problems and diagnoses, active and resolved | A diagnosis or problem by name | `memory/conditions/index.md` |
| `memory/encounters/<yyyy>/` | Visits, calls, admissions | A visit, appointment or test that happened | `memory/encounters/index.md` (lists years) |
| `memory/reports/<yyyy>/` | Lab, imaging, audiology and other reports; lab results are a table inside | A lab value, test result or report | `memory/reports/index.md` (lists years) |
| `memory/procedures/` | Surgeries, biopsies, therapies | A procedure | `memory/procedures/index.md` |
| `memory/medications/` | What the person takes or took | A medication, drug or prescription | `memory/medications/index.md` |
| `memory/allergies/` | Allergies and intolerances | An allergy or reaction | `memory/allergies/index.md` |
| `memory/immunizations/` | Vaccines | A vaccine or shot | `memory/immunizations/index.md` |
| `memory/documents/<yyyy>/` | One record per stored original, pointing at `data/documents/` | "Where's the original", or checking a value against the source | `memory/documents/index.md` (lists years) |
| `memory/observations/` | One-off measurements (`standalone/<yyyy>/`); `ledgers/` and `series/` are reserved for later versions | A single measurement not in a report | `memory/observations/index.md` |
| `memory/family-history/` | One file per relative: their conditions, onset ages, living or not | Family history, "does anything run in the family" | `memory/family-history/index.md` |
| `memory/plans/` | Reserved for later versions | Rarely | `memory/plans/index.md` |
| `memory/library/` | Questions for doctors, research notes the person asked to keep | "What did I want to ask" | `memory/library/index.md` |
| `memory/decisions/` | Health and treatment decisions with reasons | "Why did I decide" | `memory/decisions/index.md` |
| `memory/reference/` | The rules the skills follow | A skill needs its rules | `memory/reference/index.md` |

## Where to look

| The conversation mentions... | Look here first |
|---|---|
| A problem ("my ear", "the knee thing") | `memory/episodes/index.md` (match `aliases`), then the hub, then its timeline links |
| A visit or a doctor | `memory/encounters/<yyyy>/index.md`, then `memory/patient/care-team/index.md` |
| A lab value ("my ferritin", "A1c") | `memory/reports/<yyyy>/index.md`, newest year first; search `aliases` and the results tables for the analyte |
| Current medications | `memory/medications/index.md` |
| A past decision about treatment | `memory/decisions/index.md` and the episode's Conclusion |
| What to ask the doctor | `memory/library/index.md` and the episode's open questions |
| Whether a document was already added | `data/load-log.md` |
| What changed recently | The folder's `log.md` |

## System files

- `memory/_state.md`: hot-state card (derived, rebuildable)
- `memory/index.md`: bundle index (folders)
- `memory/_intake.md`: progress of the health history interview (`/ownmydata:intake`), if started
- `data/load-log.md`: one line per original filed, with its SHA-256 and the records created

## Rules

- **New file:** one line in its folder's `index.md` (for year folders, the year's `index.md`, and the year's count in the parent). Never here.
- **Any meaningful change:** one line in the folder's `log.md`. Files hold only their current state.
- **Finding something:** follow the Links section of the file you have open first. Otherwise search frontmatter `aliases` and `description` across `memory/` and open the top 1 to 3 hits. Never read a whole folder.
- **References:** `Type/id` resolves to a path by `memory/reference/resource-map.md`, without searching.
