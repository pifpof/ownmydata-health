# Own My Data.Health Viewer: v0 Requirements

**Version:** v0 (scaffold + basic navigation)
**Date:** 2026-11-19
**Owner:** 1617289 B.C. Ltd.
**Status:** Draft for approval. Decided 2026-11-19: lives in the plugin repo under `app/`, released with it; restricted records hidden until Show.
**Companion doc:** `IMPLEMENTATION_PLAN.md` (build order, estimates)

---

## 1. What this is

A desktop app that opens an Own My Data.Health health vault (the folder the plugin writes) and lets the owner browse it: episodes, conditions, medications, results, visits, documents and the rest, with links between them that work like a website.

The plugin stays the only writer. The app reads; Claude writes.

**Why now:** the vault is plain markdown with YAML and FHIR blocks. It's readable in Obsidian or a text editor, but not friendly. A viewer gives the owner a calm, clickable view of their own record without opening Claude.

**v0 goal:** the scaffold every later layout plugs into. Point the app at a vault, see everything in it, drill from a section to a list to a record and follow links. Layout polish comes later; the structure must make that easy (section 7).

---

## 2. Scope

### 2.1 In scope

1. Electron app, macOS (Apple Silicon and Intel) first; code runs on Windows and Linux unchanged.
2. **Open a vault:** first launch asks for the vault folder; the app checks it's a vault (`memory.md` with `layout: "hv-1.0"`) and remembers it. "Open another vault…" in the menu and sidebar.
3. **Sidebar** of sections with record counts (section 4). Empty sections are shown dimmed, not hidden, so the owner learns what the vault can hold.
4. **Overview** home page: patient name, the hot-state card (`memory/_state.md`) rendered, and active episodes.
5. **Section list:** one row per record: title, date, status, description. Newest first. A text filter over title, aliases and description.
6. **Record page:** header (title, kind, status, date), a "Key facts" panel drawn from the `fhir:` block, the markdown body, sources, "Linked from" (backlinks), and a collapsed "All data" view of the raw frontmatter.
7. **Links work in the app:** relative `.md` links and `Type/id` references open the target record. Back and forward (buttons, ⌘[ / ⌘], mouse buttons). Breadcrumb: Section › Record.
8. **Originals:** a source pointing into `data/documents/` gets "Open original" (default app) and "Show in Finder".
9. **Restricted records** (`vault.sensitivity: restricted`): listed with a lock and a neutral title; body and key facts hidden until the owner clicks "Show". Hidden again on relaunch.
10. **Live refresh:** when Claude changes the vault while the app is open, lists and the open record update within about a second, without losing the place.
11. **Tolerant reading:** a file that won't parse shows in its section as "Couldn't read this file" with the reason; the app never crashes on bad data. Unknown `type` values land in "Other".
12. **All files** view: the vault's `memory/` tree as plain folders and files, for anything the sections don't cover.
13. Light theme, Parallel79° tokens (same as PositioningHQ Desktop).

### 2.2 Out of scope for v0

- Any writing to the vault: no editing, no corrections, no "mark verified". (Corrections go through Claude.)
- AI, chat, API keys, any network access at all.
- Charts and trends of lab values, timelines as graphics, a dashboard layout.
- Full-text search across bodies (v0 filters lists by title, aliases and description only).
- Rendering originals inside the app (PDF/image preview). v0 opens them in the default app.
- Multiple vaults side by side, recent-vaults list.
- Dark mode, signing and notarization, auto-update, CI builds, Windows/Linux installers (the code is portable; packaging them is later).
- Printing or export.

---

## 3. User flow

```
First launch:   Welcome -> Choose vault folder -> (valid) Overview
                                               -> (not a vault) explain, choose again
Later launches: remembered folder still a vault -> Overview
                folder gone or no longer a vault -> Choose vault folder, with a one-line reason
```

**Welcome** (one screen): "Own My Data.Health Viewer shows the health vault Claude keeps for you. It only reads the folder: nothing is changed, and nothing leaves your computer." Button: **Choose your vault folder**.

**Not a vault:** "That folder doesn't have a health vault in it. Pick the folder you chose when you set up Own My Data.Health (it has a file called memory.md)."

---

## 4. Navigation model

Sidebar, top to bottom. Each item maps to vault folders and record types; this mapping lives in one registry file (section 7).

| Group | Section | Reads from | Record types |
|---|---|---|---|
| | **Overview** | `memory/_state.md`, `patient/pt-self.md`, `episodes/` | |
| Your health | Episodes | `episodes/` | episode |
| | Conditions | `conditions/` | condition |
| | Medications | `medications/` | medication-statement |
| | Allergies | `allergies/` | allergy-intolerance |
| | Results | `reports/<yyyy>/`, `observations/**` | diagnostic-report, observation |
| | Visits | `encounters/<yyyy>/` | encounter |
| | Procedures | `procedures/` | procedure |
| | Vaccines | `immunizations/` | immunization |
| | Family history | `family-history/` | family-member-history |
| People and things | Care team | `patient/care-team/` | practitioner, organization |
| | Devices | `patient/devices/` | device |
| Your files | Documents | `documents/<yyyy>/` | document-reference |
| | Notes and questions | `library/` | any |
| | Decisions | `decisions/` | any |
| | Plans | `plans/` | any |
| Vault | All files | `memory/` tree | any |
| | Other | anything not matched above (unknown type or folder) | any |

`memory/reference/`, `_intake.md`, `index.md` and `log.md` files are shown only under All files.

**Drill-down:** Section → list → record → linked record → … Back returns to the exact list position and filter.

---

## 5. Record page

```
Conditions › Left-sided hearing loss, likely conductive               [◀ ▶]
──────────────────────────────────────────────────────────────────────────
Left-sided hearing loss, likely conductive
Condition · resolved · provisional · since 2026-09 · ended 2026-11-18

Key facts                         │  Body (markdown, links open in the app)
  Body site     Left ear          │
  Recorded      2026-10-12        │
  Recorded by   Dr. A. Example ↗  │
  Visit         ENT consult ↗     │
  Episode       Left ear invest.↗ │
                                  │
Sources                           │
  Consultation note PDF  [Open original] [Show in Finder]
  From what you told me, 2026-11-18
Linked from (4)
  Left ear investigation · Ear wax cleared at the clinic · …
▸ All data (raw frontmatter)
```

**Key facts** in v0 is generic, not per type: walk the `fhir:` block and show readable leaves with friendly labels (`onsetDateTime` → "Since", `clinicalStatus` → "Status", `{reference}` → a link to the target, `{text}` → the text, `coding` → its code, `display` if present). Skip `resourceType`, `id`, `subject`/`patient` (always the owner) and the `system` URLs. A small label dictionary covers the common elements; anything unlabelled shows its element name in plain case. Per-type layouts replace this later without touching the reader.

**Status chips** come from `clinicalStatus`, `verificationStatus`, `status` and `vault.episode.status`, in plain words.

**Date** shown in lists and the header: the record's main date by type (onset, effective, performed, occurrence, period start, `date`, else the id's `yyyymmdd`).

**Sources:** `session:<date>` shows as "From what you told me, <date>". A path into `data/` shows the file name and the two buttons. Missing file: "Original not found in the vault".

**Unverified:** records without `verified` show a quiet "Not yet checked against the original" line, consistent with the plugin's wording. Information only.

---

## 6. Privacy and security (non-negotiable)

1. **No network.** The renderer's CSP allows `'self'` only (no `connect-src` beyond it). The main process blocks every web request that isn't the app's own `file://` content. No telemetry, crash reporting, update checks or remote fonts. External `http(s)` links in records open in the system browser only after the owner clicks them.
2. **Read-only.** The app has no code path that writes inside the vault. App settings (the vault path, window size) live in the app's own user-data folder.
3. **Confined reads.** Every path the renderer asks for is resolved and checked to sit inside the chosen vault; anything else is refused. Symlinks that leave the vault are refused.
4. **Electron hardening** as PositioningHQ: `contextIsolation`, `sandbox`, no `nodeIntegration`, navigation locked to the app, permission requests denied, narrow typed preload API validated with zod.
5. **Restricted records** hidden until clicked, every launch (2.1 item 9). Their titles in lists use the record's neutral description.
6. The plugin's rule holds: no real health data in the repo. Tests use the plugin's fictional `examples/sample-vault`.

---

## 7. Built for the next layout

The point of v0 is that later visual work changes views, not plumbing.

- **One vault model.** The main process reads the vault into a typed snapshot (records with path, type, title, description, date, status, sensitivity, frontmatter, links out). Views never parse files.
- **Section registry** (`shared/sections.ts`): label, icon, folders, types, list columns, sort. Reordering the sidebar or adding a section is one edit.
- **Renderer registry** (`renderer/features/record/renderers/`): `type → component`, with `GenericRecord` as the fallback. A custom Episode or Lab Report page later is one new file plus one registry line.
- **Routes are data** (`{kind: 'section'|'record'|'overview'|'files', id}`), held in a history store. New layouts reuse back/forward and deep links for free.
- **Derived data in one place:** dates, status words and labels come from shared helpers, so a dashboard later shows the same words as the lists.

---

## 8. Acceptance (v0 is done when)

Run against a copy of `examples/sample-vault` from the plugin repo, then spot-checked by the maintainer on a real vault.

| # | Check |
|---|---|
| VA1 | Fresh install: Welcome, choose the sample vault, land on Overview showing the patient name, the card, and no active episodes. |
| VA2 | Choosing a folder that isn't a vault shows the not-a-vault message; nothing is written there. |
| VA3 | Relaunch opens the same vault straight to Overview. Rename the folder, relaunch: back to Choose with a reason. |
| VA4 | Every record file in the sample vault appears in exactly one section (counts match a `find`), or in Other. |
| VA5 | Episodes › Left ear investigation › timeline row "visit" opens the encounter; Back returns to the episode, Back again to the list at the same scroll position. |
| VA6 | A condition shows status chips, key facts with linked references, sources with Open original (opens the PDF) and Linked from. |
| VA7 | A lab report's results table renders as a table with flags visible. |
| VA8 | A restricted record (copy one in from the intake test vault) is hidden until Show, and hidden again after relaunch. |
| VA9 | With the app open, add a record file to the vault: it appears in its list within 2 seconds; edit the open record: the page updates in place. |
| VA10 | A file with broken YAML appears as "Couldn't read this file"; the app keeps working. |
| VA11 | DevTools network panel shows no request leaving the machine during a full browse. A `fetch('https://example.com')` from the console is blocked. |
| VA12 | The vault's files are byte-identical before and after a session (`shasum` over the folder). |
| VA13 | `npm run build:mac` produces a DMG that installs and opens (unsigned; right-click Open). |
| VA14 | Typecheck, lint and unit tests pass. |
