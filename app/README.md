# Own My Data.Health viewer

A desktop app for browsing your Own My Data.Health health vault: episodes, conditions, medications, results, visits, documents and the rest, with links between them that work like a website.

**It only reads.** The Own My Data.Health plugin is the only thing that writes to the vault; the viewer never changes a file. **It never goes online**: no telemetry, no update checks, no remote fonts, and every network request is blocked twice (a content security policy and a block in the app's network session). Private records (mental health, reproductive and sexual health, substance use, genetic results) stay hidden until you click **Show**, and are hidden again every time the app opens.

Reads vaults with `layout: "hv-1.0"` (Own My Data.Health plugin v0.1 and v0.2).

## Install (macOS)

1. Download `ownmydata-<version>-arm64.dmg` (Apple Silicon) or `-x64.dmg` (Intel) from the GitHub release.
2. Open the DMG and drag **ownmydata** to Applications.
3. The app isn't signed yet, so the first time, **right-click it and choose Open**, then Open again.
4. Choose your vault folder: the folder you picked when you set up Own My Data.Health (it has a file called `memory.md`).

## What you see

- **Overview:** your name, problems being followed now, the summary card Claude keeps up to date, and what's in the vault.
- **Sections** in the sidebar, with counts: Episodes, Conditions, Medications, Allergies, Results, Visits, Procedures, Vaccines, Family history, You, Care team, Devices, Documents, Notes and questions, Decisions, Plans.
- **Lists** newest first, with a filter that matches names, aliases and summaries ("ear thing" finds the episode).
- **Record pages:** status, key facts, the record's text with working links, its sources (with **Open original** for documents), and every record that links to it. "All data" shows exactly what's stored.
- **All files:** every markdown file in the vault, including indexes, change logs and rules.
- **Back and forward:** toolbar buttons, ⌘[ and ⌘], mouse buttons, or a two-finger swipe.
- **Live:** when Claude updates the vault while the app is open, what you're looking at updates within a second or so.

A file that can't be read shows as "Couldn't read this file" with the reason; saying "check my vault" to Claude usually fixes it.

## Develop

```bash
cd app
npm install
npm run dev          # the app with hot reload
npm test             # unit tests (reader, links, guard, labels, no-write check)
npm run accept       # builds, then drives the real app through VA1-VA12 with screenshots
npm run build:mac    # unsigned DMGs in app/dist/
```

From the repo root, `./install.sh --with-app` builds the plugin packages and the DMGs into `dist/` for a release.

Stack: Electron, electron-vite, React, TypeScript, Tailwind v4, shadcn/ui, Zustand, zod (the same as PositioningHQ Desktop). Requirements and plan: `docs/`. Rules for working on it: `CLAUDE.md`.

## Layout of the code

- `src/shared/sections.ts`: the sidebar sections and which folders and record types each holds. Reordering or adding a section is one edit here.
- `src/shared/record-meta.ts`, `fhir-labels.ts`, `refs.ts`: the words for dates, statuses and fields, and how references and links resolve.
- `src/main/vault/`: reading the vault (read-only), the path guard, the watcher.
- `src/renderer/src/features/record/renderers/`: one page component per record type. Only the generic page exists in v0; a custom Episode or Lab report page is one new file plus one line in `index.ts`.
