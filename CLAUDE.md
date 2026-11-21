# Health Vault plugin: developer instructions

This repo is the source of the `ownmydata` Claude plugin (repo `pifpof/ownmydata-health`, site ownmydata.health; commands read `/ownmydata:capture`). Never use the name "HealthVault" in anything public. It is public and MIT-licensed. It mirrors the AI Chief of Staff plugin (github.com/pifpof/parallel79-cos) in repo layout and skill style.

## Read first

1. `fixtures/EXPECTED.md` and `tests/acceptance.md`: what v0.1 must do, and the last acceptance run. Win over the spec for v0.1 behaviour.
2. `docs/architecture-spec.md`: the knowledge-base architecture (OKF v0.2 + FHIR R4). Wins for file formats and anything beyond v0.1.

## Rules for working in this repo

- **Brand name.** In anything a person reads, the project is **Own My Data.Health**. `ownmydata` is only an identifier: the plugin and marketplace name (`/ownmydata:capture`, `ownmydata@ownmydata`), package and file names, and the Mac app's name. `ownmydata.health` is only the domain. Never "HealthVault".
- **Ownership and contact.** Copyright, licence, author and owner fields name 1617289 B.C. Ltd. with hello@parallel79.com. Never add personal names, personal emails, addresses, phone numbers or tax numbers to the repo. Keep `LICENSE` and `NOTICE.md` identical to their copies in `plugin/` (`install.sh` checks).
- **No real health data, ever.** Only the fictional documents in `fixtures/` may be captured, and only into `.test-vault/` (gitignored) or, at M6, `examples/sample-vault/`. If you see anything that looks like a real person's health information, stop and tell the maintainer.
- **The governing principle:** FHIR shapes what Claude writes, never what the user supplies. Every skill decision is tested against it: no forms, no required fields, no completion questions, no blocking steps.
- **Generic plugin.** No maintainer- or user-specific names, clinics, conditions or paths inside `plugin/` (its `skills/` and `schema/`).
- **Scriptless skills.** Skills may use Bash for file copy and hashing only. No Python or Node in the skill path in v0.1. Test helpers in `tests/` are fine.
- **House style:** match the AI Chief of Staff skills: frontmatter `name` and a long trigger-rich `description` only. No `version` field (Claude Code doesn't read it, and the plugin directory refuses unread fields). `allowed-tools` may list only Read, Grep, Glob and LS (the directory refuses anything else from an unverified organization), so leave it out unless a skill only reads. Nothing in `plugin/` may be a file without an extension, an empty placeholder or a script: setup creates empty vault folders with `mkdir -p`. Run `claude plugin validate ./plugin` before every release; sections "What This Skill Does", "Tone and Approach", numbered "Step" headings. Plain English to the user.
- **OKF:** never write a top-level `status` in any frontmatter. FHIR fields go under `fhir:`; vault-only fields under `vault:`.
- **FHIR R4 (4.0.1)** element names and value sets only. Do not use R5 shapes.
- **Work in milestones.** Stop after each, list files changed, summarise the diff, and wait for "go".
- **Versioning:** keep `plugin/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `package.json` and `app/package.json` versions identical (`install.sh` checks).
- **Two READMEs.** `plugin/README.md` is the plugin directory listing; the root `README.md` is the full GitHub page. When a fact changes (install, skills, privacy, what the plugin runs, sends and fetches), change it in both.
- **Git:** commit at the end of each milestone with a clear message. Never push unless the maintainer says so.

## Layout

`plugin/` (the plugin folder, the only thing installers get and the path submitted to the plugin directory: `.claude-plugin/plugin.json` and `icon.png`, `skills/`, `schema/` (empty vault copied by setup, including the shared rules in `memory/reference/`), `README.md`, `LICENSE`) · `.claude-plugin/marketplace.json` (repo root, source `./plugin`) · `fixtures/` (fictional inputs + `EXPECTED.md`) · `examples/sample-vault/` · `tests/` · `docs/` · `app/` (the read-only viewer app; its own rules are in `app/CLAUDE.md`).
