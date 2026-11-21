---
name: health-check
description: "Check and tidy the Own My Data.Health health vault. Use whenever the person says '/health-check' or '/ownmydata:health-check', asks to 'check the vault', 'tidy up', 'is everything in order', 'fix the links', or periodically as maintenance. Validates every record against the vault's rules (file format, ids, folders, FHIR R4 status values, links and references, sources, lab tables, codes, duplicate originals), rebuilds the folder indexes, problem timelines and hot-state card from the files, fixes what is safe to fix, and reports the rest grouped by severity. Never edits a value, unit, range, flag or code, and never turns missing information into a task for the person."
---

# Own My Data.Health: Health check

## What This Skill Does

Keeps the vault from rotting. It checks every record against the rules in `memory/reference/`, rebuilds the derived pages (folder indexes, problem timelines, the hot-state card) from the files, repairs what can be repaired without judgment, and reports what's left.

---

## Tone and Approach

A short, calm report. Fix the safe things silently and list them in one line each. Errors and warnings are for the vault's upkeep and are phrased as what you found, not as chores. Information lines (missing elements the source never stated, unverified counts) are said once, plainly, and never as something the person must do.

---

## Step 1: Orient

Find the vault (`memory.md` with `layout: "hv-1.0"`). Read `memory/reference/file-format.md`, `resource-map.md`, `row-schemas.md`, `code-allowlist.md`, `required-field-defaults.md`, `descriptions.md`, `state-card.md`. Get the time: `date +%Y-%m-%dT%H:%M:%S%z`.

List the files: `find memory -name '*.md' -not -name index.md -not -name log.md | sort`. Read each record's frontmatter; read bodies where a check needs them. For a large vault, work folder by folder.

---

## Step 2: Run the validators

| # | Check | Severity |
|---|---|---|
| V1 | Every file other than `index.md`/`log.md` has frontmatter that parses and a non-empty `type`. No top-level `status` anywhere. `index.md`/`log.md` have no frontmatter (except `memory/index.md`, which may declare only `okf_version`). | error |
| V2 | `type` matches `fhir.resourceType` in kebab-case (`diagnostic-report` ↔ `DiagnosticReport`) and the folder the file sits in (`resource-map.md` §2). | error |
| V3 | `fhir.id` equals the filename stem and fits the id grammar (prefix, `yyyymmdd` where dated, lowercase letters, digits, hyphens, at most 64 characters). | error |
| V4 | Elements FHIR requires that are absent because the source didn't state them (e.g. `Encounter.class`, `Condition.verificationStatus` from a sentence, a report's `issued`). | **info only** |
| V5 | Every status value is from its R4 value set (`resource-map.md` §5): Encounter, Condition clinical and verification, DiagnosticReport, Observation, Procedure, MedicationStatement, Immunization, DocumentReference, AllergyIntolerance, and episode `vault.episode.status`. | error |
| V6 | Condition: an `abatement…` element means `clinicalStatus` is `resolved`, `remission` or `inactive`; `clinicalStatus` is absent when `verificationStatus` is `entered-in-error`. | error |
| V7 | Every `reference: "Type/id"` in a `fhir:` block, every `vault.episode`, `vault.documents` entry and episode `anchor` resolves to a file by `resource-map.md` §3. Every relative link in a body or index resolves to an existing file (ignore links inside backticks or code blocks). | error |
| V8 | Every clinical record has at least one `sources` entry, and each non-`session:` source path exists in the vault. | warn |
| V9 | `lab-v1` tables: the exact seven-column header, seven cells per row, Code blank or `loinc:<digits>-<digit>`, Flag blank or one of `H L N HH LL A`. Dates in `fhir:` are ISO 8601 (partial dates allowed; date-times carry an offset). | error |
| V10 | Every code (`loinc:` in a table, any `coding` in `fhir:`) is either on the allow-list with a matching name **and** unit (and the file's `vault.coding_note` says so), or printed in the original: open the source document and look for it. A code found in neither place → warn. | warn |
| V21 | No two files in `data/documents/` share a SHA-256 (`shasum -a 256`), and every file in `data/documents/` appears in `data/load-log.md`. Also note files left in `data/inbox/`. | warn |
| V13 | Count of records with no `verified` key. | **info only** |
| -- | Vault git safety: `.gitignore` exists and lists `memory/`, `data/`, `outputs/`, `trash/`. If the vault is inside a git repository (`git -C . rev-parse --show-toplevel`), check `git ls-files memory data` is empty. | warn |

---

## Step 3: Auto-fix what is safe

Do these without asking:

1. **Rebuild every `index.md`** from the frontmatter of the files in that folder: heading and one-line description kept as they are, then `## Files` with `- [<title>](./<file>): <description>` for each file, sorted by filename. Year parents list `- [<yyyy>](./<yyyy>/index.md): <n> files`, years ascending. Keep any `## Notes` section as it was. Folder with no files: `## Files` with nothing under it.
2. **Rebuild every episode timeline** between `<!-- timeline:start -->` and `<!-- timeline:end -->`: one row per record whose `vault.episode` is the hub's id, oldest first, `| <date> | <what, from the record's title or description> | [<kind>](<relative link>) |`. Touch nothing outside the markers.
3. **Rebuild `memory/_state.md`** exactly by `state-card.md`, keeping `## Last session` as it was, `generated.by: "/ownmydata:health-check"`.
4. **Broken relative links** where exactly one file in the vault has the target's filename: rewrite the link to point at it. More than one candidate, or none → report it.
5. **Missing log lines** for files that exist but were never logged: add `- **Created** [Title](./file.md): found by health check (/ownmydata:health-check)` under today.
6. **Missing `.gitignore`** in the vault, or one missing the four lines: create or extend it.
7. **Outdated rules files.** If the plugin's vault template (found as in `setup-health-vault` Step 4) has `memory/reference/` files with a newer plugin version in their `sources` than the vault's copies, copy them over the vault's `memory/reference/` files. They belong to the plugin, not the person. Log one line in `memory/reference/log.md`.

Log each fix in the affected folder's `log.md` only if a file's content changed (indexes and the card don't need log lines).

**Never** edit a value, unit, range, flag, code, date, status or any clinical wording. Never delete or move a record or an original. Those findings are reported, not fixed.

---

## Step 4: Report

Grouped, short, plain English, in this order (leave out empty groups):

```
Health check, <date>: <n> records checked.

Fixed:
- Rebuilt <n> folder indexes, <n> timelines and the card.
- <each other fix, one line>

Errors (<n>):
- <file>: <what is wrong>, in plain words

Warnings (<n>):
- <file>: <what>

For information:
- <n> records leave out details their source didn't state (normal; nothing to do).
- <n> records haven't been checked against their originals yet (normal).
```

No errors and no warnings → "Everything checks out." after the Fixed lines. Never phrase an information line as a request.

---

## Reminders

- Fix structure, never substance: indexes, timelines, the card, links, logs, `.gitignore`.
- Values, units, ranges, flags, codes and clinical wording are only ever reported.
- V4 and V13 are information, never tasks.
- Restricted items appear in the report by filename only, never by content.
