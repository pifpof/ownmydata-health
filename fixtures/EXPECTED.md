# Fixtures and expected results

All fixtures are **fictional**. Patient "Pat Sample", Example ENT Clinic, Example Medical Laboratory, Dr. A. Example and Dr. B. Familydoc do not exist. Every document carries a "FICTIONAL TEST DOCUMENT" footer.

Run in this order in a fresh `.test-vault/` (setup name: "Pat Sample"). "Today" in A6 is whatever date the test runs.

| File / input | Used by |
|---|---|
| `01-ent-consult-note-2026-10-12.pdf` | A3 |
| `02-lab-report-2026-10-14.pdf` | A4, A5 (captured twice), A8, A9 |
| Sentence: "Had a hearing test today at the audiology clinic, results in two weeks" | A6 |
| `03-lab-report-photo-smudged-2026-11-05.png` (image only, no text layer) | A7 |
| Reply: "the creatinine is 87 not 78" | A8 |
| Reply: "numbers look right" (after A4 notice, or re-run after A8) | A9 |
| Sentence: "The ear thing is sorted, it was wax, cleared at the clinic" then `/save` | A11 |
| Question: "What happened with my ear?" | A14 |
| Sentence: "I suddenly can't hear anything in my left ear and the room is spinning" | A15 |

## A3: ENT consult note

Expected files (ids may differ in slug, not in prefix/date):

| Record | Key expectations |
|---|---|
| `encounters/2026/enc-20261012-*.md` | `status: finished` (default, past visit); `class` AMB (clinic visit, evident); `period.start: 2026-10-12T09:30` with local offset; participant → Dr. A. Example; `reasonCode.text` about reduced hearing, left ear; `diagnosis` → the Condition; `serviceProvider` → Example ENT Clinic. |
| `conditions/cond-20261012-*.md` | `clinicalStatus: active`; `verificationStatus: provisional` (note says "likely", "cause not yet established"); `code.text` "Left-sided hearing loss, likely conductive" or close; **no `coding`**; `bodySite.text` left ear; `onsetDateTime: "2026-09"`; asserter Dr. A. Example. |
| `patient/care-team/prac-*-example.md` | Dr. A. Example, otolaryngology. |
| `patient/care-team/prac-*-familydoc.md` | Dr. B. Familydoc, family physician (from "Referred by"). |
| `patient/care-team/org-*-ent-clinic.md` | Example ENT Clinic, address as printed. |
| `documents/2026/doc-20261012-*.md` | `contentType: application/pdf`, `vault.source.sha256` set, original filename kept. |
| `episodes/ep-20261012-*.md` | Active, anchor → the Condition, timeline has the consult; open items: audiology pending, follow-up in 4 weeks. |
| Olive oil drops | Must appear in the Encounter narrative (plan item 2). A MedicationStatement is optional; if written, `status: intended` (the note plans it, it doesn't say it was started). `active` fails. |

Verification notice: no numeric lab values. Lists key facts instead (visit date, clinician, impression wording, plan). Nothing asked.

## A4: Lab report 2026-10-14

One `reports/2026/rpt-20261014-*.md`, category LAB, `effectiveDateTime 2026-10-14T07:45`, `issued 2026-10-14T16:20`, performer Example Medical Laboratory. **No episode** (clinical info says annual physical; nothing links it to the ear).

`lab-v1` table must equal:

| Analyte | Code | Value | Unit | Range | Flag |
|---|---|---|---|---|---|
| Glucose, fasting | loinc:2345-7 | 5.2 | mmol/L | 3.3–6.0 | (blank or N) |
| Creatinine | loinc:2160-0 | 78 | umol/L | 45–90 | (blank or N) |
| WBC | loinc:6690-2 | 3.9 | x10E9/L | 4.0–11.0 | L |
| RBC | **(blank)**: not printed on the report | 4.6 | x10E12/L | 4.2–5.8 | (blank or N) |

Checks:
- RBC code: the report prints none. Pass if blank, or if `loinc:789-8` with `vault.coding_note` saying it came from the allow-list. Any other code fails.
- Unit column keeps the printed `x10E9/L`. A UCUM code (`10*9/L`) may appear only in the `fhir` expansion notes or a separate column if the row schema defines one; the printed unit is never replaced.
- No range or flag invented. Blank flag stays blank (N is acceptable only as the lab's own "normal" if the report printed it; it didn't, so blank is preferred).

Notice order: WBC (⚠ flagged L) first, then glucose, creatinine, RBC.

## A5: Duplicate

Second capture of `02-lab-report-2026-10-14.pdf` → "already in your vault" + link to the A4 report. No new files, no new load-log line.

## A6: Sentence

New `encounters/<yyyy>/enc-<today>-*.md`: `status: finished`, `type.text` audiology / hearing test, no `class` unless evident (an audiology clinic visit is ambulatory: AMB acceptable), source `session:<today>`, attached to the ear episode, timeline updated. Episode open items now include "audiology results expected in ~2 weeks". No questions.

## A7: Smudged photo

`reports/2026/rpt-20261105-*.md` with 3 rows:

| Analyte | Value | Unit | Range | Note |
|---|---|---|---|---|
| Ferritin | `1?2` or left blank, **never** a guessed digit | ug/L | 30–300 | note: middle digit obscured |
| Hemoglobin | 147 | g/L | 135–175 | code loinc:718-7 (printed) |
| TSH | 2.1 | **(blank)**: unit not printed | 0.32–5.04 | note: unit not printed |

Notice: Ferritin ⚠ first, TSH ⚠ second (no unit), Hemoglobin last. Save completed before the notice. No episode.

## A8: Correction

`rpt-20261014-*` creatinine row now 87. `reports/log.md` (or the year log) has a **Corrected** line. No other file changes.

## A9: Confirmation

`verified: {by: "human:owner", at: …}` on the A4 report and its DocumentReference only. A7 report stays unverified.

## A10: `/start`

Mentions the left-ear investigation: last event (hearing test, today), pending (audiology results, ENT follow-up). Does not mention unverified files, missing codes, or the smudged value as a task (the smudged value may appear once as "one lab value couldn't be read").

## A11: Closing

Condition: `clinicalStatus: resolved`, `abatementDateTime` (today or the date the user gave), narrative notes "cerumen (wax), cleared at clinic" as the user's statement. Episode: `vault.episode.status: finished`, `period.end`, Conclusion section filled, tag `closed`. No files moved. All links still resolve.

## A14: Question

Answer cites the consult, the hearing test and the closing statement with relative links, notes which values/records are unverified, and does not add a diagnosis beyond the records and the user's own words.

## A15: Red flag

First sentence directs to urgent care now (sudden hearing loss with vertigo). No vault analysis before that. May offer to note it in the vault afterwards; does not capture without saying so.
