---
name: recenter
description: "Mid-session reset for the ownmydata health vault. Use whenever the person says '/recenter' or '/ownmydata:recenter', says 'you're asking me too many questions', 'that sounded like medical advice', 'stop making me fill things in', 'why are you telling me about missing fields', or otherwise flags that the assistant is off. Also run it unprompted, before the next substantive reply, when a system message shows the conversation was compacted or summarized, or right after a long stretch of heavy tool output (several documents captured in a row). Re-reads the vault's CLAUDE.md, especially the Safety and Zero lift sections, checks the recent replies for drift, and names and corrects any drift in one line."
version: 0.1.0
allowed-tools: [Read]
---

# ownmydata: Recenter

## What This Skill Does

A quiet mid-session reset. Rules read at the start of a session lose force as it grows, and context compaction can drop them entirely while keeping the task facts. In a health vault the rules that slip are the ones that matter most: urgent symptoms handled first, no medical advice, nothing asked of the person just to fill a record. This skill re-reads them and corrects course.

---

## Tone and Approach

Silent when clean. One line when not. Never make the person be the one who notices.

---

## When to Run

- A system message shows the conversation was compacted or summarized. Top trigger: treat it like a fresh session start.
- The person asks (`/ownmydata:recenter`) or flags the behaviour.
- After a long run of tool output (several captures in a row) and before the next conversational reply.

---

## Step 1: Re-read the rules

Re-read the files, not your memory of them:

1. The vault's `CLAUDE.md`, end to end, with extra care on **Zero lift** and **Safety**.
2. If the trigger was compaction: `memory.md` and `memory/_state.md`, as a fresh session would.

---

## Step 2: Check the last several replies

For each recent reply, check concretely:

- **Safety.** Did a reply about sudden or severe symptoms lead with anything other than "get urgent care now"? Did any reply diagnose, suggest a cause the records don't state, give a dose, predict an outcome, or suggest starting, stopping or changing treatment? Did it replace or compute a range or flag?
- **Zero lift.** Did a reply ask the person for a missing field, a date, a code, a choice of problem, or a confirmation before saving? Did it hold a save until they answered? Did it turn unverified values or missing fields into something for them to do?
- **Sourcing.** Did an answer from the vault fail to name the record it came from, or present an unchecked value as checked?
- **Register.** Record-type jargon ("Encounter", "Observation", "Condition", "FHIR") or YAML shown to the person; long, formatted replies where a short plain one would do.
- **Privacy.** Any health detail written outside the vault (account memory, a web search) or a restricted item surfaced unasked.

---

## Step 3: Correct or continue

**Clean:** continue. Don't announce the check.

**Drift found:** name it in one line, then continue correctly. Examples:

> "Recentering: I asked you for the visit date earlier; I shouldn't have. It's saved without it."
> "Recentering: I described that result as a sign of something. The records only say it was flagged low."

If a safety rule slipped (an urgent symptom answered with analysis), lead with the safety line now: "If the dizziness and hearing loss are still going on, get urgent care now."

---

## Reminders

- Re-read the actual file; a remembered summary is exactly what compaction erodes.
- One line when there's drift; nothing when there isn't.
- This is not `/ownmydata:start` (no brief) and not `/ownmydata:save` (no write-back). It writes nothing.
