# Acceptance run: v0.1.0

**Date:** 2026-11-18 · **Claude Code** 2.1.327 · model Opus 5.5

**Method.** Every scenario ran as a real headless session, `claude -p … --plugin-dir <repo>`, so each skill was followed from its SKILL.md by a fresh model with no build context. Multi-turn scenarios used `--session-id` / `--resume`. The test vault lived in a scratch folder with no parent CLAUDE.md. The tester's other plugins stayed loaded, including AI Chief of Staff with its own `capture`/`start`/`save`, so routing was tested under real conditions. File checks used `tests/check_vault.py` plus file-hash snapshots before and after A2, A5, A8 and A12. The full run below is the second pass. The first pass found four issues, which were fixed in commit 633f325 (see Findings).

| # | Scenario | Result | Evidence |
|---|---|---|---|
| A1 | Setup in an empty folder | **Pass** | Two questions, one at a time. Full layout. `pt-self.md` has `name.text` only. Exact closing line. Checker: 0 errors. |
| A2 | Setup where a vault exists | **Pass** | Refused with one line. Hash snapshot unchanged. |
| A3 | ENT consult PDF | **Pass** | Encounter (AMB, 09:30-07:00, reasonCode, diagnosis, serviceProvider), Condition (active, provisional, no coding, bodySite left ear, onset 2026-09, asserter), 2 Practitioners, Organization, DocumentReference (sha256 + original filename), episode hub (open items: audiology, drops, 4-week follow-up), MedicationStatement `intended`. Links both ways. Key-facts notice. Nothing asked. |
| A4 | Lab PDF | **Pass** | One report, `lab-v1` table equal to EXPECTED.md: printed units (`x10E9/L`), ranges, flag L on WBC only, LOINC as printed, RBC `loinc:789-8` from the allow-list with `coding_note`. No episode. WBC first with ⚠. Triggered by "add this" with CoS also loaded. |
| A5 | Same lab PDF again | **Pass** | "Already in your vault" plus a link. Hash snapshot unchanged, so no new load-log line. |
| A6 | Hearing-test sentence | **Pass** | Encounter dated today, `session:` source, AMB, attached to the ear episode, open items updated ("results expected in about two weeks"). One saved line, no questions. |
| A7 | Smudged photo | **Pass** | Ferritin `1?2` with a note; TSH unit blank with a note; Hemoglobin `loinc:718-7` as printed. Notice order: Ferritin ⚠, TSH ⚠, Hemoglobin. No episode. |
| A8 | "the creatinine is 87 not 78" | **Pass** | Only the report file and `reports/2026/log.md` changed (snapshot diff). **Corrected** log line. |
| A9 | "numbers look right" | **Pass** | `verified: human:owner` on the 2026-10-14 report and its DocumentReference only. The A7 report is still unverified. No nudge about other captures. |
| A10 | `/ownmydata:start` | **Pass** | One line: the ear investigation, last event (hearing test today), pending (results, ENT follow-up). No bookkeeping. |
| A11 | "The ear thing is sorted…" then `/save` | **Pass** | Condition `resolved` + `abatementDateTime` + the owner's words as a note; episode `finished`, `period.end`, Conclusion written, tag `closed`. Nothing moved. Checker: 0 errors. Saying "sorted" ran save straight away; the explicit `/save` then found nothing new. |
| A12 | `/ownmydata:health-check` | **Pass** | No errors or warnings. Info: 14 unverified records. Rebuilt indexes and timeline are byte-identical; the card differs only in `generated`. |
| A13 | Repo audit + clean-room install | **Pass** | `git ls-files` has no vault data outside `schema/` (empty template) and `examples/` (fictional). No personal names or local paths in `schema/`, `skills/` or `examples/`. `dist/ownmydata.zip` loaded with `--plugin-dir` in an empty folder outside the repo: "set up my health vault" produced a valid vault (0 errors). `claude plugin validate .` passes (warnings: root CLAUDE.md is developer-only by design; no listing icon yet). |
| A14 | "What happened with my ear?" | **Pass** (after fix) | A sourced narrative with relative links. Sources list marks records "not yet checked against the original" or "from what you told me". No diagnosis beyond the records and the owner's words. The first full run named sources but not their verification state; fixed in the vault CLAUDE.md rule 7 and re-run. |
| A15 | Sudden hearing loss + spinning | **Pass** | Opens "Get medical help now". Stroke and emergency signs listed. Offers to note it in the vault later. Nothing captured. |

## Findings fixed during the run

1. **Dated id with no date.** Save wrote `proc-ear-wax-cleared` (the owner gave no date), which breaks the id grammar. Rule added: a dated id falls back to the date the vault learned about it. The record's own date elements stay empty.
2. **Saved-line format** wasn't followed for sentences (A6 replied in prose). It's now mandatory for every source.
3. **Verification nudge.** The A9 reply invited the owner to check the other report. Now forbidden: a confirmation reply never mentions other unchecked captures.
4. **Missing-field talk.** Save reported "date and clinic left blank". Now forbidden in capture and save: absent information is not news.
5. **Sourcing.** A14 didn't mark unverified records. The vault CLAUDE.md now requires a Sources list with verification state.

## Not tested

- Single-skill `.skill` install in Cowork (setup's `references/vault-template/` fallback). The build includes the template (checked with `unzip -l`), but the install wasn't exercised.
- Cloud-sync warning path (FR1.3) and the wrong-patient guard: covered by the skill text, not by a fixture.
- Batch capture of several files at once (FR2.13).

---

# Intake run: v0.2.0

**Date:** 2026-11-18. One live interview, run headless on a copy of `examples/sample-vault/` (a vault set up with v0.1 rules), answering as the fictional Pat Sample. 37 turns across two sessions.

| # | Check | Result |
|---|---|---|
| I1 | Opt-in intro, then waits for "yes" before the first question | **Pass** |
| I2 | v0.1 vault: rules files refreshed from the plugin before the interview | **Pass** (`resource-map.md` gained the FamilyMemberHistory rules) |
| I3 | One question per message, every turn | **Pass** |
| I4 | Doesn't re-ask what records show (ear drops, ear wax clearing, family doctor and ENT already known) | **Pass** |
| I5 | Follow-ups only where useful (emergency question for shellfish only, not penicillin; reason for ramipril, not vitamin D) | **Pass** |
| I6 | An answer in one section fills another (ramipril "for blood pressure" → condition, then only "when diagnosed?") | **Pass** |
| I7 | "pause", then "let's continue my health history" in a new session resumes at the right section | **Pass** |
| I8 | "skip" and "next section" honoured; sections marked `skipped` | **Pass** |
| I9 | Permission asked before substances, mental health, reproductive health; "rather not"/"no thanks" respected and marked `declined` | **Pass** |
| I10 | Mental health record `restricted`, neutral filename and description; left out of the read-back | **Pass** |
| I11 | Self-reported shape: `asserter`/`informationSource` Patient, no `verificationStatus`, `onsetString` for "since I was a teenager", `session:` source | **Pass** |
| I12 | FamilyMemberHistory: `FTH` relationship, `deceasedAge` 62, `contributedToDeath`; bereavement acknowledged in a few words, not pressed | **Pass** |
| I13 | Read-back at the end, card rebuilt (5 medications) | **Pass** |
| I14 | `tests/check_vault.py`: 96 files, 0 errors, 0 warnings | **Pass** |
