---
name: start
description: "Start-of-session brief for the ownmydata health vault. Use whenever the person says '/start' or '/ownmydata:start', opens a health session, comes back after time away, or asks 'where do things stand', 'what's going on with my health stuff', 'catch me up', 'what's pending', or 'what's open'. Reads the vault's router, hot-state card and active problem hubs, then opens in under ten lines with the active problems (last event, what's pending), anything new since the last session, and anything due for a look. Never lists bookkeeping such as unverified files or missing fields."
version: 0.1.0
allowed-tools: [Read, Bash]
---

# ownmydata: Start

## What This Skill Does

Opens a health session with where things stand, so the person never has to catch you up. It reads a small, fixed set of files and nothing else: the router, the hot-state card, and the hub of each active problem.

---

## Tone and Approach

Calm, plain, short: under ten lines. Lead with the problems that are open. No greeting ritual, no "how can I help", no list of commands. Use plain words ("problem", "visit", "results"), never record-type names.

Never mention unverified files, missing codes or fields, verification, or anything else that is the vault's housekeeping. Those are your concern, not theirs.

---

## Step 1: Find the vault

The folder holding `memory.md` with `layout: "hv-1.0"`. None → hand over to the `setup-health-vault` skill.

Get today's date: `date +%Y-%m-%d`.

---

## Step 2: Read the fixed set

1. `memory.md` (the router).
2. `memory/_state.md` (the hot-state card).
3. Each hub listed under `## Active episodes` in the card, **and** each line of `memory/episodes/index.md` whose description starts with `active` or `onhold` (the card can be older than the latest capture). Read those hubs only.
4. "New since last session": take the date under the card's `## Last session`. If there is one, read only the `## <date>` sections on or after it at the top of `memory/encounters/log.md`, `memory/reports/log.md` and their current-year logs (`memory/encounters/<yyyy>/log.md`, `memory/reports/<yyyy>/log.md`), plus `memory/episodes/log.md`. If there is no last session yet, skip this.
5. "Due for a look": `grep -rl "^stale_after:" memory/` and keep the files whose date is before today. Read just their `title`.

Nothing else. Don't open reports, visits or conditions themselves.

---

## Step 3: Empty vault

If there are no episode hubs and no records in any folder index (only the patient file), say exactly:

> "Nothing in here yet. Drop in a document or tell me what's going on."

and stop.

---

## Step 4: The brief

Under ten lines, in this order, leaving out any part that has nothing in it:

1. **Each active problem**, one line: its title, the last event with its date, and what's pending (from the hub's timeline and Open items).
   > Left ear investigation: last, hearing test today (2026-11-18). Waiting on audiology results (about two weeks) and the ENT follow-up.
2. **New since last session**, one line: the main records added (visits, results), briefly. If a report's description says a value couldn't be read, you may say once "one lab value couldn't be read clearly", nothing more.
3. **Recent flagged results** from the card's `## Recent results`, one line, as the lab flagged them (`WBC flagged low on 2026-10-14`). Plain facts; no interpretation.
4. **Due for a look**: one line naming items past their review date ("Your medication list was last confirmed in May"). Information, not a task.

End there. Don't ask what they want to do, don't offer a menu.

---

## Reminders

- Fixed reading set: router, card, active hubs, the top of a few logs. Never read whole folders.
- Under ten lines. No bookkeeping, no verification talk, no record-type jargon.
- Finished problems are not listed.
- Restricted items (`vault.sensitivity: restricted`) are never named in the brief.
