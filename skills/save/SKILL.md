---
name: save
description: "End-of-session write-back for the ownmydata health vault. Use whenever the person says '/save' or '/ownmydata:save', 'save this', 'wrap up', 'that's all for now', or signals a health session is ending, and when they say a problem is over ('the ear thing is sorted', 'all cleared up', 'the doctor says it's resolved'). Files anything health-related said in the session that hasn't been captured yet, brings problem hubs, indexes and logs up to date, closes a problem when the person has said it's done (writing its conclusion), and rewrites the hot-state card that the next session opens from. Asks only 'Anything I missed?'."
version: 0.1.0
allowed-tools: [Read, Write, Edit, Bash]
---

# ownmydata: Save

## What This Skill Does

Makes the session stick. Anything the person said about their health that isn't in the vault yet gets filed. Problem hubs, folder indexes and logs are brought up to date. A problem the person has said is over gets closed, with a written conclusion. The hot-state card is rewritten so the next `/ownmydata:start` opens from the right place.

---

## Tone and Approach

Quiet and quick. The person shouldn't have to recap anything: you were there. Report what you did in two to four plain lines, then ask one question: "Anything I missed?" Nothing else.

---

## Step 1: Orient

Find the vault (`memory.md` with `layout: "hv-1.0"`; none → `setup-health-vault`). Read the rules in `memory/reference/` you haven't read this session (at least `file-format.md`, `resource-map.md`, `required-field-defaults.md`, `record-templates.md`, `descriptions.md`, `state-card.md`). Get the time: `date +%Y-%m-%dT%H:%M:%S%z` (offset with a colon).

---

## Step 2: Go back over the session

List, for yourself, every health-relevant thing the person said or showed this session and whether it is already in the vault:

- Events ("saw the GP yesterday"), medications started or stopped, symptoms, results they read out, plans ("follow-up booked for the 3rd"), problems they said are over.
- Anything already captured by `/ownmydata:capture` this session is done. Don't duplicate it.

For each thing **not yet captured**, file it now by the capture skill's rules (Steps 2 to 6 of `capture`): source `session:<today>`, same id grammar, same episode rules, same indexes and logs. Show a verification notice only if numbers are involved. Never ask the person to confirm details: write what they said, leave the rest out.

A dated plan the person mentioned ("follow-up on the 3rd") goes into the relevant hub's Open items with its date.

---

## Step 3: Close a problem the person said is over

Close an episode **only** when the person has said the problem is resolved, done, sorted, cleared or similar. Never on inference.

The closing ritual, for that episode and its anchor Condition:

1. **Condition:** set `clinicalStatus` to `resolved` (or `remission` / `inactive` if those are the person's or clinician's words), add `abatementDateTime` (the date the person gave, else today), keep `verificationStatus` and `code` as they were. Add the person's statement as a note, attributed: `note: [{text: "Owner, <today>: \"<their words>\""}]`, and a line in the body ("On <today> the owner said: \"it was wax, cleared at the clinic\"."). Don't turn their words into a coded diagnosis. Retag `active` → `resolved`. Rewrite the description (status `resolved`).
2. **Episode hub:** `vault.episode.status: finished`, `vault.episode.period.end: "<date>"`. Tags: replace `active` with `closed`. Write the `## Conclusion` section from the records and the person's words only:
   - **Outcome:** what the person said and the date.
   - **Diagnosis as recorded:** the clinician's last stated impression, quoted, and the person's own account of the cause, attributed to them.
   - **What was done:** visits, tests and treatments from the timeline.
   - **Still open in the records:** any open item never completed (e.g. "Audiology results were not added to the vault"), stated as fact.
   - **If it comes back:** who was looking after it (from the care team), from the records. No medical advice.
   Leave Open items as they were, and add one line under them: "Closed <date>."
   Regenerate the timeline. Rewrite the description: `finished · <start>–<end> · <anchor problem> · <outcome in a few words>`.
3. **Logs:** `memory/episodes/log.md` `- **Closed** [Title](./<id>.md): <outcome> (owner, /ownmydata:save)`; `memory/conditions/log.md` `- **Updated** [Title](./<id>.md): resolved <date> (owner)`. Update both index lines.
4. **Nothing moves.** Every file stays where it is and every link still works.

**Records suggest it may be over, but the person hasn't said so** (an abatement in a letter, a discharge note): mention it in one line in your report ("The letter from 3 Nov says the ear is clear. Say so if you'd like me to close that problem.") and leave it open.

---

## Step 4: Tidy what the session touched

- Every hub touched this session: regenerate the timeline from the records with its `vault.episode`, update Open items and the description's last event.
- Every folder written this session: `index.md` lines in filename order and current; today's `log.md` entries present.

---

## Step 5: Rewrite the hot-state card

Rebuild `memory/_state.md` whole, exactly by `memory/reference/state-card.md`, with `## Last session` set to today and `generated.by: "/ownmydata:save"`.

---

## Step 6: Report and ask

Two to four plain lines on what you did, for example:

> Filed the GP visit you mentioned. Closed the left ear problem with the outcome you gave (wax, cleared at the clinic). The card is up to date for next time.

Never mention what you left blank or what the person didn't say (dates, names, places): absent information is not news.

Then exactly: "Anything I missed?"

If they add something, file it (Step 2 rules) and update the card again. Don't ask a second time.

---

## Reminders

- Never ask the person to recap. Never ask anything but "Anything I missed?".
- Close a problem only on the person's word. Mention, don't act on, what the records only suggest.
- Never change a value, unit, range, flag or code during save.
- Health facts go into the vault only, never into account-level memory.
