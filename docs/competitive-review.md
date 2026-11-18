# Health Vault: review of existing open-source projects

**Date:** 2026-11-17
**Basis:** Public README and package pages read today, not the code. Star counts move daily. Nothing here was installed or tested.

## Reviewed

| Project | What it is | Storage | FHIR | Skills / interface | Maturity |
|---|---|---|---|---|---|
| **runesleo/ai-health-vault** | Obsidian template plus prompts for a family health archive | Markdown notes, CSV trackers | No (own field-naming guide) | 8 Claude Code skills (report extraction, meds, trends, visit prep, Apple Watch, checkup calendar) plus 8 portable prompts | ~350 stars, 9 commits, MIT |
| **kamens/hstack** | Claude Code skills that build a personal wiki on a disease or case | `raw/` (untouched sources) plus compiled Obsidian pages, `_index.md` per folder | No | 10 skills: wiki init/ingest/refresh/lint, visit prep, understand results, battle plan | 28 stars, 40 commits, MIT |
| **huifer/Claude-Ally-Health (WellAlly)** | File-based health system run by slash commands | JSON plus Markdown, month folders, global `index.json` | No | 62 commands, 20 analysis skills, drug-interaction grading | ~960 stars, 37 commits, MIT |
| **Health.md** | Apple Health and Android exporter (app, not a vault) | Daily Markdown, JSON, CSV, Obsidian Bases frontmatter | No | Scheduled exports, plus a separate Obsidian visualization plugin | Paid app (one-time), AGPL source |
| **jmandel/health-skillz** | Claude Skill that pulls records from patient portals over SMART on FHIR | Local SQLite, optional end-to-end encrypted upload to Claude | Yes, as the intake protocol | One skill plus a small server | ~80 stars, 294 commits, MIT. Epic-centred, US portals |
| **queelius/chartfold (health-memex)** | Consolidates EHR exports into one SQLite database with an MCP server | SQLite, 17 clinical tables | Ingests CDA, FHIR R4 JSON and XML, but flattens into its own schema | 31 MCP tools, printable summary, notes and analyses tables | 4 stars, v3.0, MIT |
| **medgemma-vault** | Local FHIR PHR | SQLite holding full FHIR JSON, files by SHA-256 | Yes: 7 resources, Bundle export, LOINC vitals | CLI: add, import (Apple Health, CSV, FHIR), export | v0.1.0, one maintainer. R4 vs R4B inconsistent |

Seen only in search snippets, not reviewed: HealthSamurai/phr (FHIR app on Aidbox), HealthLedger MCP (clinician packet builder), healthclaw-guardrails plugin.

## The pattern

Two camps, and nobody sits in the middle.

- **Wiki camp** (runesleo, hstack, Ally): Markdown, readable by an LLM, easy to start. None uses a clinical data standard. Structure is whatever the author invented, so nothing exports cleanly and two vaults cannot be compared.
- **FHIR camp** (health-skillz, medgemma-vault, chartfold): real standards, queryable, exportable. All of them keep data in SQLite or JSON blobs. None has a navigable, narrative wiki an LLM can read file by file, and none has episodes or a "state of play" card.

Our spec is FHIR resources as OKF markdown files. I found no project that does that. That is the gap.

## Where we are ahead (on paper)

1. **FHIR plus wiki in one structure.** One file per resource, narrative body, FHIR block in the frontmatter, deterministic export to a Bundle.
2. **A trust ladder.** Extracted values are unverified until you confirm them against the source. None of the READMEs describe anything like it. This matters most for lab numbers.
3. **Episodes.** A hub per problem with a generated timeline and a closing ritual. The wiki projects have notes per visit; none models a problem over time.
4. **Sensitivity tiers** that keep restricted items out of exports and visit briefs.
5. **Export validation as the acceptance test.** The only way to know the FHIR shape is real.
6. **Coding policy.** No guessed codes, no silent unit conversion, ranges only from the source. Only hstack and Ally state safety rules at all, and neither covers extraction accuracy.

## Where we are behind, and what to take

| From | Take | Why |
|---|---|---|
| **chartfold** | Content-hash ids for source assets and a load log | References survive rebuilds. Our filename ids are stable, but a load log and dedupe of re-imported documents are missing from the spec. |
| **chartfold** | A rebuildable SQLite or DuckDB index built from the markdown, markdown stays the truth | SQL answers "ferritin over 5 years" better than series pages, and the series pages could be generated from it. Optional, v0.2. |
| **medgemma-vault** | SHA-256 dedupe on document intake, Bundle `collection` export, Apple Health import path | We record the hash but never say duplicates are rejected. Add it. |
| **hstack** | Run the clinical assessment in a separate subagent from the friendly summary, plus red/yellow/green escalation and crisis detection | Our safety rules are a list in CLAUDE.md. hstack makes them structural. Worth copying for `/query` and `/visit-prep`. |
| **Ally** | Explicit prohibitions: no dosing, no prescribing, no prognosis | We cover diagnosis and treatment changes. Add prognosis. Skip their interaction grading: that is clinical advice from a model. |
| **runesleo** | Plain prompts that work in any chat, not only Claude Code | Cheap fallback and a wider audience for the content. Not a v0.1 item. |
| **Health.md** | Use it, or its output format, as the wearable feeder instead of writing Apple Health parsing ourselves | Saves the ledger importer work. AGPL: use the app, do not copy code. For Garmin, the Garmin Connect tool already in your sessions covers it. |
| **health-skillz** | Treat its output as one more source for `data/fhir-import/` | It pulls US portal records, so it does not help a vault outside the US directly. Keep the import path open. |

## Pushback

1. **FHIR is our differentiator and our biggest cost. Nobody in the wiki camp felt they needed it.** The popular projects (Ally at ~960 stars) win on breadth of commands and ease of start, not rigor. Ask who actually receives a FHIR Bundle from you. If the honest answer is "nobody this year", then FHIR-shaped files with a deferred exporter, which is what the spec already says in phase v0.3, is correct. Do not let the validator work creep into v0.1.
2. **The spec is far heavier than anything reviewed.** hstack, the closest relative, ships a working wiki with ten skills and no schema. A sensible first build fits in a weekend: setup skill, capture for a visit note and a lab report, start, save, health-check V1 to V10, one worked example episode. Ledgers, series pages and export wait for pain.
3. **The "nobody does FHIR plus wiki" claim is a reason to look and not yet a reason to build.** It could mean untouched ground, or it could mean people tried and went back to SQLite. The ledger and series pattern is where that risk lives: months of wearable rows in markdown tables is the part most likely to hurt. The SQLite-index idea above is the escape hatch.
4. **Content angle.** "Your health data in a wiki an AI can read, in the same format hospitals use" is a clear line none of the others can claim. It is also a promise that only holds once an export validates. Do not publish that claim until it does.

## Suggested spec changes (not yet made)

1. Add a `load-log` per ingest and reject duplicate documents by SHA-256 (sections 13 and 19).
2. Add "no prognosis" to the clinical-safety rules (section 14.3).
3. Add escalation tiers and crisis detection to `CLAUDE.md` safety rules, and a rule that `/query` and `/visit-prep` separate the clinical assessment from the plain-language delivery.
4. Add an optional rebuildable query index (SQLite) as a v0.2 item; markdown stays authoritative.
5. Record wearable sourcing decision: Garmin through the connected tool, Apple Health through an export tool such as Health.md.
6. Mark v0.1 scope explicitly as the weekend list above.

## Sources

- github.com/runesleo/ai-health-vault
- github.com/kamens/hstack
- github.com/huifer/Claude-Ally-Health
- Health.md: App Store listing, healthmd.pages.dev docs, github.com/CodyBontecou/health-md, Obsidian plugin page
- github.com/jmandel/health-skillz
- github.com/queelius/chartfold and pypi.org/project/health-memex
- pypi.org/project/medgemma-vault
- Search snippets only: HealthSamurai/phr, HealthLedger MCP (glama.ai), healthclaw-guardrails (glama.ai)
