# Changelog

## 0.2.1

- Plugin icon added (`plugin/.claude-plugin/icon.png`), for the Claude plugin directory listing.
- README: new section "What the plugin runs, sends and fetches", listing every tool and command the skills use, what they read outside the vault, and that the plugin and viewer make no network requests.
- The plugin moved into its own folder, `plugin/` (skills, vault template, manifest, icon, a short listing README and the licence). Install commands are unchanged. The viewer app, docs, fixtures, examples and tests remain in the repo, outside the plugin, so installers get only what the plugin needs.
- Copyright and package metadata now name 1617289 B.C. Ltd.; added NOTICE.md. One contact address across the repo and guides: hello@parallel79.com.

## 0.2.0

- New: the Own My Data.Health viewer, a read-only desktop app for browsing a vault (`app/`, macOS DMGs on the release). Sections, lists with a filter, record pages with key facts, sources and backlinks, working links, live refresh. Never writes to the vault, never goes online, hides private records until you click Show.
- New skill: `intake`, a health history interview. Asks the questions a family doctor asks a new patient, one at a time: allergies, medications, conditions, hospital stays, surgeries, injuries, family history, vaccines, check-ups and screenings, lifestyle, and, only with permission, mental and reproductive health. Every question can be skipped, the interview can be paused and resumed, and each answer is saved as it comes. Runs only when asked.
- New: help guides in `docs/guide/` (start here, plugin guide, viewer guide). Static HTML, open `docs/guide/index.html` in a browser.
- README: "Why this exists" (the project's manifesto), corrected GitHub install commands, Contributing section.
- Added `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, issue and pull request templates.
- Removed an internal research note from `docs/`.

## 0.1.0

- First release. Skills: `setup-health-vault`, `capture`, `start`, `save`, `health-check`, `recenter`.
- Vault layout following the Open Knowledge Format v0.2, with records in the shape of HL7 FHIR R4.
- Fictional fixtures, an example vault and acceptance scenarios A1 to A15.
