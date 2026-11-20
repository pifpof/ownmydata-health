# Viewer acceptance (v0)

Run 2026-11-19 on macOS (Apple Silicon), Electron 44, against `tests/fixtures/rich-vault` (the fictional Pat Sample vault from the intake acceptance run, plus one broken-YAML file). Driver: `npm run accept` (`tests/e2e/accept.mjs`), which launches the built app with its own settings folder, drives it with Playwright and saves screenshots.

## Results

```
PASS VA1a welcome shown on first launch
PASS VA2 not-a-vault message
PASS VA1 overview with owner name
PASS VA5 Visits › ENT consult, 2026-10-12 | Episodes › Left ear investigation | Episodes
PASS VA6 chips, facts, sources, backlinks
PASS VA7 tables=1 headers=Analyte,Code,Value,Unit,Range,Flag,Note
PASS VA8a neutral in list
PASS VA8b filter does not find hidden words
PASS VA8c hidden page
PASS VA8d shown after click
PASS VA10 broken file shown, app alive
PASS VA9a rows 2 -> 3 within 2s
PASS VA9b open record updated in place
PASS VA11 blocked: Failed to fetch
PASS VA3a relaunch opens overview
PASS VA8e hidden again after relaunch
PASS VA3b moved vault -> choose with reason
```

| # | Check | How it was verified | Result |
|---|---|---|---|
| VA1 | Fresh launch → Welcome → choose vault → Overview with the owner's name and the card | e2e driver (folder dialog stubbed) | pass |
| VA2 | Choosing a non-vault folder shows the not-a-vault message, writes nothing | e2e driver | pass |
| VA3 | Relaunch opens the same vault; a moved vault returns to Choose with "can't be found" | e2e driver, two relaunches | pass |
| VA4 | Every record file appears in exactly one section; none in Other for the sample vault | unit test against `examples/sample-vault` vs a file walk | pass |
| VA5 | Episode → timeline "visit" → encounter; Back → episode; Back → Episodes list | e2e driver, breadcrumbs checked at each step | pass |
| VA6 | Condition page: status chips, key facts with linked references, Open original, Linked from | e2e driver + screenshot | pass |
| VA7 | Lab report results table renders as a table with the Flag column | e2e driver + screenshot | pass |
| VA8 | Restricted record: neutral in the list, not findable by its hidden words, hidden until Show, shown after Show, hidden again after relaunch | e2e driver + unit test (main process withholds body, fields and sources) | pass |
| VA9 | Add a file while open → in its list within 2 s; edit the open record → page updates in place | e2e driver writes to the vault copy | pass |
| VA10 | Broken YAML shows as "Couldn't read this file" in Conditions; the app keeps working | e2e driver + unit test | pass |
| VA11 | `fetch('https://example.com')` from the page is blocked | e2e driver | pass |
| VA12 | Vault byte-identical before and after loading and opening every file | unit test (SHA-256 over the fixture) | pass |
| VA13 | `npm run build:mac` → arm64 and x64 DMGs; the packaged app opens to Welcome | build + Playwright launch of `dist/mac-arm64/ownmydata.app` | pass (unsigned) |
| OV1 | Overview: section cards with icon tiles and counts; search across all records finds "ear thing", and a private record's hidden words find nothing | e2e driver + screenshots (2026-11-20) | pass |
| VA14 | Typecheck, lint, unit tests | `npm run typecheck && npm run lint && npm test` (20 tests) | pass |

## Not yet checked

- On the maintainer's real vault (the spot-check).
- Opening a DMG on a second Mac (Gatekeeper's right-click Open path).
- Windows and Linux (the code is portable; nothing is packaged or tested there yet).
- VA11 covers the page; the main process makes no requests of its own (no fetch, http or update code exists in `src/main`).

## Fixed during the run

- Datetimes showed raw (`2026-11-05T07:45:00-07:00`); now `2026-11-05 07:45`, and headers show the date only.
- Dates in words ("since I was a teenager") were clipped in lists; they wrap now.
- Lab table cells broke words mid-word ("Hemoglob in"); cells keep words whole and the table scrolls sideways if it must.
- Lifestyle answers from the intake showed as "Measurement"; now "Lifestyle". Common codes (`problem-list-item`, `LAB`, `social-history`, encounter classes) show as plain words in key facts.
