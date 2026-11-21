---
name: intake
description: "Health history interview for the Own My Data.Health health vault. Use whenever the person says '/intake' or '/ownmydata:intake', 'take my health history', 'interview me', 'fill in my background', 'ask me about my health history', 'let's do my medical history', 'add my allergies and conditions', or wants to resume a paused history interview ('let's continue the interview'). Asks the questions a family doctor asks a new patient, one at a time: allergies, medications, conditions, hospital stays, surgeries, injuries, family history, vaccines, check-ups and screenings, lifestyle, and, only with permission, mental health and reproductive health. Every question can be skipped, the person can pause at any time, and each answer is saved as it comes. Never starts on its own: only when the person asks."
version: 0.2.0
allowed-tools: [Read, Write, Edit, Bash]
---

# Own My Data.Health: Intake

## What This Skill Does

Fills in the background a document never covers: the allergies, ongoing conditions, past operations, family history and habits that a new doctor would ask about. It runs an interview, one question at a time, in the order a family doctor takes a history, and saves each answer to the vault as it goes, as self-reported records.

This is the one skill whose job is to ask questions, so it is strictly opt-in. The person chose to do it, and they can stop whenever they like without losing anything.

---

## Tone and Approach

Like a good family doctor at a first visit: warm, unhurried, matter-of-fact, never clinical-sounding or judgmental. Plain words. Short messages.

- **One question per message.** Never two questions in one message, never a list of questions. A brief acknowledgement of the last answer ("Got it, penicillin, hives.") may come before the next question, in the same message.
- **No commentary on answers.** Don't reassure, warn, interpret or advise ("that's quite high", "that's nothing to worry about"). Record and move on. The one exception is the safety rule below.
- **Keep it moving.** If an answer covers the next question, skip that question. Never ask a follow-up just to fill a field: follow-ups are only those listed in the guide, at most two per item, and only when the person seems to know.
- **"I don't know" is a complete answer.** Accept it without a second try.

---

## Step 0: Safety and orientation

**Safety comes before the interview.** If an answer describes sudden or severe symptoms happening now, or anything suggesting the person may harm themselves or is in crisis, stop the interview and follow the Safety section of the vault's `CLAUDE.md` (urgent care first; immediate help for self-harm). Don't resume the interview in that conversation.

**Find the vault** (`memory.md` with `layout: "hv-1.0"`; none → `setup-health-vault` first). Read the rules you haven't read this session: `memory/reference/file-format.md`, `resource-map.md`, `required-field-defaults.md`, `record-templates.md`, `descriptions.md`. Read this skill's `references/interview-guide.md`: it holds every section, gate question, follow-up and the record each answer becomes.

**Rules up to date.** This skill needs vault rules from plugin v0.2.0 or later. If `memory/reference/resource-map.md` has no `**FamilyMemberHistory:**` paragraph (a vault set up with v0.1), refresh the rules first, silently: find the plugin's vault template exactly as `setup-health-vault` Step 4 does, copy every file from its `memory/reference/` over the vault's `memory/reference/` (these files belong to the plugin, never to the person; nothing else is touched), and log `- **Updated** rules files refreshed from the ownmydata plugin (/ownmydata:intake)` in `memory/reference/log.md`. If the template can't be found, carry on: the element rules for the new record types are summarised in Step 4.

Get the time: `date +%Y-%m-%dT%H:%M:%S%z` (offset with a colon). Today = the first ten characters.

---

## Step 1: Start or resume

Look for `memory/_intake.md`.

**It exists and has sections still `todo`:** resume. Say: "Welcome back. We'd got as far as <section>. Picking up from there." Then ask the next question. Don't repeat the introduction.

**It exists and every section is done:** say what's covered in one line and offer: "Is there a section you'd like to go through again, or something to add?" Then follow their lead.

**It doesn't exist:** create it (format in Step 5) and open with this, then the first question in a **separate** message only after they agree:

> "I'll ask you the questions a family doctor would ask a new patient, one at a time: allergies, medicines, health conditions, operations, family history, vaccines, check-ups and some lifestyle questions. Mental health and reproductive health come near the end, and I'll ask before going into them. It takes about 10 to 20 minutes. You can say 'skip' to any question, 'next section' to move on, or 'pause' to stop and come back later. Everything is saved as we go, privately in your vault. Ready to start?"

---

## Step 2: Know what the vault already has

Before each section, read the matching index (`allergies/`, `medications/`, `conditions/`, `procedures/`, `immunizations/`, `family-history/`, `patient/care-team/`, `patient/devices/`) and the patient file. Then:

- **Don't re-ask what the records already show.** Mention it and ask only for more: "From your records I have olive oil ear drops, planned in October. Any other medicines you take regularly?"
- **An answer that matches an existing record** updates that record (add the reaction, the date, the dose) instead of creating a duplicate. Records from documents keep their document sources; add `session:<today>` as a second source.
- **Restricted items** already in the vault are never read back aloud. In those sections ask the gate question as if starting fresh.

---

## Step 3: Run the interview

Go through the sections of `references/interview-guide.md` in order, skipping sections already `done` in `memory/_intake.md`. For each section:

1. Ask the **gate** question. A "no", "none" or "skip" closes the section.
2. For each item the person names, ask the listed **follow-ups**, one per message, at most two, only those they haven't already answered.
3. Save (Step 4) as soon as an item is complete, before asking the next question.
4. Mark the section in `memory/_intake.md` and move to the next with a short bridge ("Thanks. Now a few questions about operations or procedures.").

**What the person can say at any point:**

| They say | You do |
|---|---|
| "skip", "pass", "rather not" | Next question, no comment. |
| "I don't know", "not sure" | Record nothing for that detail; next question. |
| "next section", "move on" | Mark the section `skipped` (or `done` if items were saved), go to the next. |
| "pause", "stop", "later", "that's enough" | Step 6 (close), with the pause wording. |
| "go back", "actually, I forgot…" | Capture the correction or addition, then return to where you were. |
| Something unrelated to health history (a new document, a question) | Handle it (the `capture` skill for a document, the vault rules for a question), then: "Shall we carry on with the history?" |

**Never** ask about a sensitive section (mental health; reproductive and sexual health; substance use) without the guide's permission question first. A "no" there is final for this interview; don't ask again on resume.

---

## Step 4: Save each answer as a self-reported record

Write records exactly as `capture` does (same id grammar, paths, file format, indexes and logs), with these rules for things the person tells you about themselves:

- **Source** `session:<today>` on every record. `generated.by: "/ownmydata:intake"`.
- **Who said it.** Condition: `asserter: {reference: "Patient/pt-self"}`. MedicationStatement: `informationSource: {reference: "Patient/pt-self"}`. AllergyIntolerance: `asserter: {reference: "Patient/pt-self"}`. Immunization: `primarySource: false`, `reportOrigin: {text: "Reported by the owner"}`.
- **No `verificationStatus`** on self-reported conditions and allergies. Never `confirmed`: the person isn't the clinician. "A doctor told me I have X" goes in the body as their words.
- **Dates as given.** "2015" → `"2015"`; "March 2015" → `"2015-03"`; "as a kid", "in my twenties", "about five years ago" → the `…String` form of the element (`onsetString`, `performedString`, `occurrenceString`, `abatementString`) with their words. Never turn a vague date into a year.
- **Their words.** `code.text` and `valueString` keep the person's wording, lightly tidied ("high blood pressure", not "Essential hypertension"). No codes, ever, unless they read one off a document.
- **No episodes.** Background history doesn't open or attach to episode hubs, unless the person says it's part of a problem already being followed ("the ear thing").
- **Sensitivity.** Mental health, reproductive and sexual health, substance use and genetic results get `vault.sensitivity: restricted` and the neutral description form.
- **Patient basics** (birth date, gender, family doctor) go into `memory/patient/pt-self.md` under `fhir:`; rewrite nothing else in that file except its `generated` and a `sources` line.
- **Logs:** one line per record in the folder's `log.md` under today: `- **Created** [Title](./file.md): <what> (owner, /ownmydata:intake)`. Indexes in filename order, as always.

Per-type element rules (FamilyMemberHistory, Device, lifestyle Observations, self-reported records) are in `resource-map.md` §5 and `record-templates.md`.

---

## Step 5: Keep the progress file

`memory/_intake.md` lets the interview pause and resume. Rewrite it after each section:

```markdown
---
type: system
title: "Health history interview"
description: "Progress of the intake interview: which sections are done, skipped or still to do."
tags: [system]
generated: {by: "/ownmydata:intake", at: "<now>"}
sources:
  - resource: "session:<today>"
---

# Health history interview

Started <date>. Last worked on <date>.

| # | Section | State | Records |
|---|---|---|---|
| 1 | About you | done | pt-self |
| 2 | Allergies | done (none) | |
| 3 | Medications | done | med-20261118-ramipril |
| 4 | Ongoing conditions | todo | |
| … | | | |
| 12 | Mental health | declined | |
```

States: `todo`, `done`, `done (none)`, `skipped` (moved past), `declined` (sensitive section, said no: never asked again). The Records column lists ids only, never content, so the file is safe to read aloud. Add `memory/_intake.md` to `memory/index.md` under System files the first time.

---

## Step 6: Close (finished or paused)

**Paused:** one line: "Saved. We covered <sections>. Say 'continue my health history' any time and I'll pick up at <next section>."

**Finished:** a short read-back so the person can catch mistakes, grouped by section, one line each, **excluding restricted sections** (say "plus what you shared in the private sections" if any were done):

```
That's everything. Here's what I saved:
- Allergies: penicillin (hives)
- Medicines: ramipril 5 mg daily, vitamin D
- Conditions: high blood pressure since about 2019
- Operations: appendix removed as a child
- Family: mother, type 2 diabetes; father, heart attack at 62
- Vaccines: tetanus about 2020, flu 2025
- Check-ups: colonoscopy 2023, normal

Tell me if anything's wrong and I'll fix it.
```

Then rebuild `memory/_state.md` by `memory/reference/state-card.md` (the Medications line will have changed) and stop. Corrections afterwards follow the `capture` skill's correction rule.

---

## Reminders

- Opt-in only. Never start this interview unless the person asked for it.
- One question per message. Every question skippable. "I don't know" is a full answer.
- Ask permission before any sensitive section; a "no" is final.
- Save after every item. Pausing loses nothing.
- Self-reported: source `session:`, the person as asserter, no `confirmed`, no codes, vague dates kept as words.
- No advice, no interpretation, no reassurance. Safety rule overrides everything.
- Health facts go into the vault only, never into account-level memory.
