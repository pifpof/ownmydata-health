---
name: capture
description: "Add health information to the Own My Data.Health health vault. Use whenever the person says '/capture' or '/ownmydata:capture', attaches or drops in a lab report, blood test results, visit summary, consultation note, referral or specialist letter, imaging or audiology report, discharge summary, prescription label, vaccine record or a photo of one, puts files in data/inbox, says 'add this', 'save this report', 'file this', or simply describes something that happened to their health ('saw the ENT today', 'had a hearing test', 'started a new medication', 'my ear is ringing again', 'got my flu shot'). Also use for follow-ups to a capture: a correction ('the creatinine is 87 not 78') or a confirmation ('numbers look right'). Files the original, writes the records in FHIR shape, links them to the right problem, and then lists the numbers it read so the person can check them. Never asks the person to fill anything in."
version: 0.1.0
allowed-tools: [Read, Write, Edit, Bash]
---

# Own My Data.Health: Capture

## What This Skill Does

Turns one source (a PDF, a photo of a document, pasted text, or a sentence) into vault records: the original filed untouched in `data/documents/`, a record for each thing the source describes (visit, problem, lab report, medication, people and places), all linked to each other and to the problem they belong to. Then it tells the person what it saved and lists the numbers it read so they can check them.

The person's only job was to hand it over. Everything else is yours.

---

## Tone and Approach

Save first, then inform, briefly. One line per main record saved, then the notice. No YAML, no FHIR words ("visit", "lab result", "problem", never "Encounter", "Observation", "Condition"), no list of the files you wrote.

Never ask a question to complete a record. The **only** question this skill may ask is one either/or question when you truly cannot tell what a document is ("Is this a lab report or a visit summary?"). Missing dates, codes, units, ranges, clinicians: leave them out and move on.

---

## Step 0: Safety first, then orient

**Red flags.** If the person describes sudden or severe symptoms (sudden hearing loss, sudden vertigo with hearing loss, chest pain, trouble breathing, signs of stroke such as face drooping, arm weakness or slurred speech, severe bleeding, high fever with confusion or a stiff neck, a severe allergic reaction), the **first line** of your reply tells them to get urgent care now: call emergency services or go to the nearest emergency department. No vault work, no analysis before that line. Then you may add one line: "When you're able, tell me and I'll note this in your vault." Do **not** capture it in this turn. If anything suggests they may harm themselves, stop all vault work and point them to immediate help (emergency services or a crisis line).

**Find the vault.** The vault is the folder holding `memory.md` with `layout: "hv-1.0"` (the current folder, or the folder named in this session). If there is none, run the `setup-health-vault` skill first, then continue with this capture.

**Load the rules** once per session (skip files you've already read this session): `memory/reference/file-format.md`, `resource-map.md`, `required-field-defaults.md`, `row-schemas.md`, `code-allowlist.md`, `descriptions.md`, `record-templates.md`. They are the source of truth for every file you write.

**Get the time:** `date +%Y-%m-%dT%H:%M:%S%z` (write the offset with a colon, `-07:00`). Today = its first ten characters.

---

## Step 1: Take in the source and check for duplicates

| Source | What to do |
|---|---|
| A file path, an attached file, or a file in `data/inbox/` | Compute its hash: `shasum -a 256 "<file>" \| cut -d' ' -f1` (or `sha256sum`). Search `data/load-log.md` for `sha256:<hash>`. |
| Pasted document text | Write it verbatim to a temporary file in `data/inbox/` (`<today>-pasted.txt`), then treat it as a file. |
| An image shown in the conversation with no file on disk | You can read it but can't keep the original. Capture from what you see, use `session:<today>` as the source, write no DocumentReference, and add one line at the end: "I couldn't keep a copy of the image itself; drop the file into `data/inbox/` any time and I'll attach it." |
| A sentence about something that happened | No original. Source is `session:<today>`. Skip to Step 2. |

**Duplicate** (the hash is already in the load log): stop. Reply "That one's already in your vault: [<record title>](<path>)." using the record named on that load-log line. Write nothing, add no load-log line. If the duplicate came from `data/inbox/`, move it to `trash/`.

**Several files at once:** do Steps 1 to 7 for each file in turn, then show one combined notice at the end.

---

## Step 2: Read and classify

Read the whole source (every PDF page; look closely at photos). Decide what it is:

visit note or letter · lab report · imaging, audiology or other diagnostic report · procedure note · medication list, label or prescription · immunization record · a sentence about an event · other.

Only if you truly cannot tell, ask one either/or question and wait. Anything you *can* tell, you decide.

**Whose record is it?** If the document names a patient clearly different from the vault owner (`memory/patient/pt-self.md`), don't file it. Say: "This document is for <name>, not <owner>, so I haven't filed it. Say 'file it anyway' if it belongs here." Initials, a nickname or a missing name are not a mismatch.

---

## Step 3: Plan the records (in your head, before writing anything)

Build the extraction list: every record to create or update, its id (grammar in `resource-map.md`), its path, and for every value **where in the source it came from** (page, row, line). Use the table in `resource-map.md` §1 to decide what to write. Typical sets:

- **Visit note:** Encounter; a Condition for the problem the clinician records (impression or diagnosis); Practitioner(s) and Organization; a MedicationStatement with `status: intended` for any medication the note plans or prescribes (plus it stays in the visit's Plan); DocumentReference.
- **Lab report:** one DiagnosticReport with a `lab-v1` results table (no separate result files); the lab Organization; the ordering clinician as a Practitioner if printed; DocumentReference. A lab report never creates a Condition.
- **Sentence:** usually one Encounter ("had a hearing test today at the audiology clinic"), MedicationStatement ("started X"), Immunization ("got my flu shot"), or a standalone Observation for a symptom ("my ear is ringing again": `code.text` the symptom, `valueString` their words, category `{system: "https://ownmydata.health/CodeSystem/observation-category", code: symptom}`).

**Resolve people and places** against `memory/patient/care-team/index.md` before creating new ones (`resource-map.md` §4). A place named only generically ("the audiology clinic") gets no Organization file; mention it in the body.

**Copy, never compute or convert.** Values, units, ranges and flags exactly as printed (`row-schemas.md`). No unit conversion. No range or flag the source doesn't print. A code only if printed or an exact allow-list match by name **and** unit (`code-allowlist.md`). Never `verificationStatus: confirmed` unless the document states the diagnosis. Never a diagnosis, cause or severity the clinician didn't write. Defaults only from `required-field-defaults.md`.

**Ambiguity never blocks.** A smudged digit, a missing unit, two possible dates: write what is legible (`1?2`, unit blank, the date the document labels as the visit or collection date), say what's uncertain in the row Note or the element's `note`, and mark it ⚠ in the notice.

**Sensitivity.** Mental health, sexual or reproductive health, substance use or genetic results: add `vault.sensitivity: restricted` silently and use the neutral description form. Don't mention it.

---

## Step 4: Decide the episode (never ask)

Read `memory/episodes/index.md`.

- **Attach** to an existing active or on-hold episode only on a clear signal: the source is about the episode's problem or body site ("hearing test" while a left-ear hearing episode is open), it's a result or visit the episode's open items are waiting for, it's part of the same referral chain, or the person says so ("that's part of the ear thing").
- **Create** a new episode when a visit note, letter or procedure note records a problem that is being investigated or treated (tests ordered, referral made, treatment planned, follow-up booked). Its anchor is the Condition you're writing. Id `ep-<recorded yyyymmdd>-<slug>`, `period.start` = the condition's onset if stated, else the document date.
- **None** for routine one-offs (annual physical bloodwork, a flu shot, a repeat prescription) and for any lab or other report whose own text doesn't tie it to an open problem. A lab report never opens an episode by itself.
- **Unsure → none.** Say "not linked to any problem" in the saved line. The person can say "that's part of the ear thing" later, and you attach it then.
- **A resolved problem coming back** ("the ear is blocked again"): set the existing Condition's `clinicalStatus` to `recurrence`, set the episode back to `active`, add the new record to it. Don't create a new Condition.

Attaching means: `vault.episode: <ep id>` and tag `episode/<ep id>` on the record.

---

## Step 5: Write the files

**5a. File the original first** (files only). Name it `data/documents/<yyyy>/<yyyy-mm-dd>-<slug>.<ext>`, where the date is the document's own date (visit, collection or letter date) if visible, else today; slug two to four words (`ent-consult-note`, `lab-report`). Create the year folder if needed. `cp` it there (from `data/inbox/`: `mv`). Never edit it afterwards. If the name is taken by a different file, add `-2`.

**5b. Write records in dependency order:** Practitioner and Organization → Encounter → DiagnosticReport or Procedure → Condition → MedicationStatement, AllergyIntolerance, Immunization, Observation → DocumentReference → episode hub (create or update). Use `record-templates.md`. Every file:

- OKF header: `generated: {by: "/ownmydata:capture", at: "<now>"}`, `sources` pointing at the original's vault path (or `session:<today>`), `description` from `descriptions.md`, useful `aliases`. **No `verified` key.** No top-level `status`.
- `fhir:` block: only what the source states plus the allowed defaults.
- `vault:` block: `episode`, `documents`, `rowSchema`/`inherit`, `coding_note`, `narrative` as they apply.
- Body: plain-English narrative, quotes attributed, uncertain things stated, ending in `## Links` with working relative links (`file-format.md` §5).

**Links go both ways.** Encounter → Condition (`diagnosis`) and Condition → Encounter (`encounter`); every record → its DocumentReference (`vault.documents` and a Links line) and the DocumentReference → every record (`context.related` and its body). Existing files you link to (a Practitioner seen again, an episode) get a Links line pointing back where useful.

**5c. Episode hub.** New: from the template, with a Summary from the records, Care team, Open items copied from the plan as written ("Audiology: pure-tone audiogram and tympanometry", "Follow-up in clinic in 4 weeks with audiology results"), and Open questions only if the records or the person raised them. Existing: update the Summary line if the picture changed, update Open items (mark what this source completes, add what it introduces, e.g. "Audiology done <date>; results expected in about two weeks (said <today>)"). Either way, **regenerate the timeline**: one row per record with `vault.episode` equal to this hub's id, oldest first, between the markers. Rewrite the hub's `description` with the new last event and set its `generated`.

---

## Step 6: Indexes, logs, load log

For **each folder you wrote a file in** (for year-sharded folders, the year folder):

- `index.md`: add the line `- [Title](./file.md): description` under `## Files` **in filename order**, or rewrite it if the description changed. A new year folder gets its own `index.md` (heading, one-line description, `## Files`) and `log.md`, and the parent `index.md` gets or updates `- [<yyyy>](./<yyyy>/index.md): <n> files`.
- `log.md`: under today's `## <today>` heading (add it at the top if missing), one line per file: `- **Created** [Title](./file.md): <what> (/ownmydata:capture)`, or `**Updated**` / `**Linked**` for existing files.

Then, for a file source, append one line to `data/load-log.md`:

`- <today> · data/documents/<yyyy>/<file> · sha256:<hash> · created: <ids> · updated: <ids> (/ownmydata:capture)`

If the original came from a pasted-text temp file in `data/inbox/`, it has now been moved; nothing is left in the inbox.

---

## Step 7: Tell the person

Always in this form, for every source, sentences included. One line per **main** record (visit, report, problem, medication; not people, places or document records), starting with "Saved:", and nothing before the first one:

> Saved: ENT consult (2026-10-12), linked to Left ear investigation.
> Saved: Left-sided hearing loss, likely conductive, as a new problem to follow (Left ear investigation).

Then the **verification notice**, always when you read any numbers, in exactly this shape:

```
Saved: <what> (<date>), <n> results<, linked to <episode title> | , not linked to any problem>.

Please check these numbers against the original so you know I read them correctly:
- ⚠ <Analyte> <value> <unit> (<where>; <printed flag, e.g. "flagged L"> | <"couldn't read clearly: middle digit obscured"> | <"unit not printed">)
- <Analyte> <value> <unit> (<where>)

Tell me if any are wrong and I'll fix them.
```

**Order:** values you couldn't read clearly or that lack a unit first (⚠), then values the source flags (⚠), then the rest in document order. Write values and units exactly as stored. `<where>` is the page and row, or "photo" for an image.

**No numbers** (a visit note, a letter): list the key facts you captured instead, same closing line:

```
Please check these against the original so you know I read them correctly:
- Visit: 2026-10-12, 09:30, Dr. A. Example (Example ENT Clinic)
- Impression: "Left-sided hearing loss, likely conductive"
- Plan: audiology (audiogram and tympanometry); olive oil drops twice daily for 7 days before it; follow-up in 4 weeks

Tell me if any are wrong and I'll fix them.
```

**A sentence** with no numbers: just the saved line(s). No notice, no explanation of why it was linked.

Never tell the person what you left out ("the clinic wasn't named", "date left blank"). Absent information is not news.

The notice is a reminder, not a gate. Don't wait for an answer, don't ask anything else, don't mention verification state, codes or missing fields.

---

## Step 8: Follow-ups in the same session

**Correction** ("the creatinine is 87 not 78", "the visit was on the 13th"): change only that value in the file (the table cell, or the `fhir:` element and the body sentence that states it). If the row's Note described the uncertainty that the correction resolves, replace it with "value given by owner". Update the description and index line only if a fact in them changed (a flag count, a date). Set the file's `generated`. Add one line to that folder's `log.md` (the year folder for reports): `- **Corrected** [Title](./file.md): creatinine 78 → 87 umol/L (owner)`. Reply with the corrected notice line, nothing else ("Fixed: Creatinine 87 umol/L."). Never change anything the person didn't correct.

**Confirmation** ("numbers look right", "all correct"): applies to the capture the person was just discussing: the most recent notice or correction in the conversation. Set `verified: {by: "human:owner", at: "<now>"}` on the records whose values were listed in that notice and on their DocumentReference. Not on people, places or episode hubs, and not on any other capture. Log `- **Verified** [Title](./file.md): checked against the original by the owner` in each folder. Reply in a few words ("Thanks, marked as checked.") and stop. Never mention other captures that haven't been checked, and never invite the person to check more.

**Silence** changes nothing. Never bring verification up again.

**"That's part of the ear thing"**: attach the record to that episode (Step 4 attach), regenerate the hub's timeline, log `**Linked**`.

---

## Reminders

- Original first, untouched. Duplicate → stop with a link.
- Copy exactly: values, units, ranges, flags, wording. Never convert, compute, or code from memory.
- Absent stays absent. Defaults only from `required-field-defaults.md`.
- Never ask to complete a record. One either/or question only when the document type is unknowable.
- Save first, then the notice. The notice never blocks.
- Red flags: urgent care first, no capture that turn.
- Health facts go into the vault only, never into account-level memory or a web search.
