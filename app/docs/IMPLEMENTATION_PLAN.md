# Own My Data.Health Viewer: v0 Implementation Plan

**Date:** 2026-11-19
**Reads with:** `REQUIREMENTS.md`
**Estimate:** about 20 hours, 9 phases. Commit at the end of each phase; don't start a phase until the previous one's **Done when** passes.

---

## Stack (same as PositioningHQ Desktop, minus the AI parts)

| Layer | Choice | Note |
|---|---|---|
| Shell | Electron (current stable, PHQ is on 44) | |
| Build | electron-vite | config copied from `phq-desktop`, including the dev-only CSP relax |
| UI | React 19, TypeScript strict | |
| Styling | Tailwind v4, shadcn/ui (new-york, lucide) | PHQ `globals.css` tokens and DejaVu Serif + Inter, copied |
| State | Zustand | route history, vault snapshot, UI state |
| Validation | zod | every IPC payload |
| Markdown | react-markdown + remark-gfm | PHQ's `Markdown.tsx` and `resolveWikiPath` as the starting point |
| Frontmatter | gray-matter | PHQ already uses it; YAML 1.2 via js-yaml |
| Watching | chokidar | as PHQ |
| Packaging | electron-builder, DMG arm64 + x64 | unsigned, `identity: "-"` as PHQ |
| Tests | Vitest | reader, path guard, link resolution, labels |
| Lint | ESLint flat + Prettier (tailwind plugin) | PHQ configs |

Not carried over: `@anthropic-ai/sdk`, safeStorage, crawler, document converters, skills sync.

Versions: start from PHQ's `package.json` versions (known to work together), then `npm outdated` once; don't chase majors in v0.

---

## Repo and location

**Decided 2026-11-19:** same repo as the plugin, `pifpof/ownmydata-health`, in an `app/` folder. One release, two downloads.

- **Why:** the app reads the vault format the plugin defines. A format change and the viewer change that reads it land in one commit and one tested release. Clone weight is small: tracked plugin files are under 1 MB, app source adds about 1 to 2 MB (`node_modules`, `out/` and `dist/` are gitignored).
- **One version number** for both. `install.sh` checks that `app/package.json` matches the plugin version, alongside the three files it already checks. An app-only fix is a patch release of both; the plugin zip is simply unchanged.
- **Release assets** on the GitHub release `vX.Y.Z`: `ownmydata.zip` (plugin), `ownmydata-X.Y.Z-arm64.dmg`, `ownmydata-X.Y.Z-x64.dmg`.
- **Plugin zip stays clean:** `install.sh` already zips an explicit list (`.claude-plugin`, `skills`, `schema`, README, LICENSE), so `app/` never enters it. Phase 0 confirms `claude plugin validate` doesn't object to the extra folder.
- `app/CLAUDE.md` holds the app's building rules; the root `CLAUDE.md` gets one line pointing to it.

Local only until you say push, same rule as the plugin.

```
ownmydata-health/                 (existing plugin repo)
├── .claude-plugin/, skills/, schema/, docs/, examples/, tests/, install.sh   unchanged
└── app/
    ├── CLAUDE.md                 rules for building sessions (read-only, no network, no real data)
    ├── README.md                 build and run; the root README gets a Download section
    ├── docs/REQUIREMENTS.md, docs/IMPLEMENTATION_PLAN.md
    ├── electron.vite.config.ts, electron-builder.yml, package.json, tsconfig*.json, eslint.config.mjs
    ├── resources/                icons
    ├── tests/
    │   ├── fixtures/             a broken-YAML file and a restricted record; tests read ../examples/sample-vault directly
    │   └── unit/*.test.ts
    └── src/
        ├── shared/                   no Node or DOM APIs
        │   ├── ipc-contract.ts       channels + zod schemas
        │   ├── vault-model.ts        RecordSummary, RecordDetail, VaultSnapshot, ReadProblem
        │   ├── sections.ts           section registry (requirements §4)
        │   ├── record-meta.ts        main date, status words, kind labels, source display
        │   ├── fhir-labels.ts        element → friendly label dictionary
        │   └── refs.ts               Type/id → path (resource-map §3), relative link resolution
        ├── main/
        │   ├── index.ts              lifecycle, single instance, menu (Open another vault…, Back/Forward)
        │   ├── window.ts             from PHQ: hardened BrowserWindow, nav lock, bounds
        │   ├── network-lock.ts       webRequest: cancel everything not file:// or dev server
        │   ├── settings.ts           userData/settings.json: vaultPath, windowBounds
        │   ├── vault/guard.ts        realpath + inside-vault check
        │   ├── vault/detect.ts       is this a vault (memory.md, layout hv-1.0)
        │   ├── vault/reader.ts       scan memory/, parse, build snapshot + link graph
        │   ├── vault/watcher.ts      chokidar, 300 ms debounce, incremental re-read
        │   └── ipc/                  vault:*, shell:openOriginal, shell:showInFolder
        ├── preload/index.ts          window.api, typed, nothing else
        └── renderer/src/
            ├── App.tsx               Welcome | ChooseVault | Shell
            ├── store/                route.ts (history), vault.ts (snapshot), ui.ts (revealed restricted ids, filters, scroll)
            ├── components/           ui/ (shadcn), Markdown.tsx, StatusChip, LockBadge, Breadcrumb
            └── features/
                ├── onboarding/       Welcome, ChooseVault
                ├── shell/            Sidebar, Toolbar (back/forward/breadcrumb), Shell
                ├── overview/         OverviewView
                ├── list/             SectionList (columns from the registry), FilterBox
                ├── record/           RecordView, KeyFacts, Sources, Backlinks, RawData,
                │                     renderers/index.ts (type → component), renderers/GenericRecord.tsx
                └── files/            FilesTree, FileView (any .md, rendered)
```

---

## Key design decisions

1. **Main process owns the vault.** It reads every `.md` under `memory/` (vaults are hundreds to low thousands of files; a full read takes well under a second), keeps the snapshot in memory, and sends the renderer summaries; a record's body and full frontmatter come on demand. Re-reads on change are per file.
2. **Classification** by registry: a record goes to the section whose folders contain it and whose types include its `type`. Folder match but type mismatch, or no match, goes to Other with the reason shown. `index.md`, `log.md`, `_state.md`, `_intake.md` and `reference/` are system files: All files only (the card is also rendered on Overview).
3. **Links** are resolved in main when the snapshot is built: relative markdown links in bodies, `reference: "Type/id"` anywhere in `fhir:`, `vault.episode`, `vault.documents`, episode `anchor`. That gives outbound links per record and the backlink index in one pass. Unresolved links render as plain text with a dotted underline and a tooltip "Not in the vault".
4. **Restricted:** main sends restricted records' summaries with the neutral description only and withholds body and fhir until the renderer asks with `reveal: true` (sent when the owner clicks Show). The reveal set lives in renderer memory only, so relaunch hides again.
5. **No network**, two layers: CSP in `index.html` (`default-src 'self'`, no `connect-src` to anywhere else) and `session.webRequest.onBeforeRequest` cancelling anything that isn't `file:` or (in dev) the Vite server. External links go through `shell.openExternal`, http(s) only, on click.
6. **Originals:** `shell.openPath` / `shell.showItemInFolder`, only for paths that pass the guard and sit under `data/`.
7. **Never write:** the vault is opened read-only by convention and enforced by review: no `fs.write*`, `rename`, `rm` or `mkdir` imports anywhere under `main/vault/`. A unit test greps for them.

---

## Phases

### Phase 0: Scaffold (2 h)

Create `app/` in the plugin repo from PHQ's configs (electron-vite, builder, tsconfigs, eslint, prettier, globals.css, fonts, shadcn `button`, `badge`, `input`, `dialog`). Strip everything AI. Product name "ownmydata", appId `com.parallel79.ownmydata`. Root `.gitignore` gains `app/node_modules/`, `app/out/`, `app/dist/`; `install.sh` gains the app version check; `claude plugin validate` still passes. Empty window with the sidebar frame. `CLAUDE.md` with the rules from requirements §6.

**Done when:** `npm run dev` opens a window; typecheck, lint and an empty test pass.

### Phase 1: Security baseline and settings (1.5 h)

`window.ts` from PHQ, `network-lock.ts`, CSP, permission denial, nav lock, settings store, preload with a zod-checked API.

**Done when:** VA11 passes on the empty app; settings survive relaunch.

### Phase 2: Open a vault (1.5 h)

Welcome and Choose screens, folder dialog, `detect.ts`, remembered path, relaunch paths (VA1 to VA3 minus content). Menu: Open another vault….

**Done when:** VA2 and VA3 pass.

### Phase 3: Vault reader (3.5 h)

`guard.ts`, `reader.ts`, `refs.ts`, `record-meta.ts`, snapshot types, classification, link graph, read problems. Unit tests against the fixture vault: every file classified (VA4), every link in the sample resolves, broken-YAML file becomes a ReadProblem, restricted withheld, path traversal refused, the no-write grep test.

**Done when:** tests pass; VA4 and VA10 hold at the data level.

### Phase 4: Shell, sidebar, routing (2 h)

Section registry, sidebar with counts and dimmed empties, route history store, back/forward (buttons, ⌘[ ⌘], mouse 3/4), breadcrumb.

**Done when:** every section is reachable and Back/Forward work between them.

### Phase 5: Lists (2 h)

`SectionList` driven by registry columns (title, date, status, description), newest first, filter box, lock badge for restricted, Couldn't-read rows, scroll and filter restored on Back.

**Done when:** each sample section lists the right records; filter narrows by alias ("ear thing" finds the episode).

### Phase 6: Record page (3.5 h)

`RecordView` with header and status chips, `GenericRecord` (Key facts walker + `fhir-labels.ts`), markdown body with in-app links (from PHQ `Markdown.tsx`), Sources with Open original / Show in Finder, Linked from, All data (raw YAML, collapsed), restricted Show gate, unverified line. Renderer registry with only the generic entry.

**Done when:** VA5 to VA8 pass.

### Phase 7: Overview, All files, live refresh (2 h)

Overview (name, rendered card with working links, active episodes), Files tree and file view, watcher pushing `vault:changed` with the changed paths; open views refetch only if affected.

**Done when:** VA9 passes; the card's links open records.

### Phase 8: Package and accept (2 h)

App icon (placeholder until branding), `build:mac`, `app/README.md` and a Download section in the root README (unsigned-app note, what it reads, privacy), version set to the next plugin release, full acceptance VA1 to VA14 with screenshots into `tests/acceptance.md`, then hand to you for the spot-check on your real vault.

**Done when:** all VA checks pass and the DMG opens.

**Total: about 20 hours.**

---

## Risks and how the plan handles them

| Risk | Handling |
|---|---|
| Health data shown on screen to whoever's nearby | Restricted records hidden by default; nothing else is hidden in v0. Your call whether the whole app should want a click-to-reveal on launch (I'd say no for v0). |
| Vault format changes under the app (plugin v0.3+) | Reader is tolerant: unknown types go to Other, unknown elements render with their raw name. The README pins "reads layout hv-1.0". |
| Gatekeeper blocks the unsigned DMG | Same as PHQ: fine for you; anyone else needs signing, which waits for the Apple Developer account. |
| Scope creep into a dashboard | v0 is navigation only. Trends, charts and per-type pages are v1, and the registries make them additive. |

---

## Decided

1. **Repo:** same repo, `app/` folder, one version, one release with plugin zip + DMGs (2026-11-19).
2. **Restricted records hidden until Show**, hidden again on relaunch (2026-11-19).

## Still open

1. **Product name** on the Dock and DMG: "ownmydata" (recommended) or "ownmydata Viewer". Building with "ownmydata" unless you say otherwise.
2. Anything in the out-of-scope list you want pulled into v0.
