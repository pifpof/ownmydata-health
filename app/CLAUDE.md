# ownmydata viewer: developer instructions

Read `docs/REQUIREMENTS.md` and `docs/IMPLEMENTATION_PLAN.md` first. The repo-level rules in `../CLAUDE.md` apply too.

## Rules

- **Read-only.** Nothing under `src/main/vault/` or `src/main/ipc.ts` writes to disk; `tests/unit/no-writes.test.ts` enforces it. App settings live in the app's user-data folder, never in the vault.
- **No network.** Keep the strict CSP in `src/renderer/index.html` and the request block in `src/main/network-lock.ts`. No remote fonts, analytics, crash reporting or update checks. External links open in the browser only when clicked.
- **Every path from the renderer goes through `resolveInside`** (`src/main/vault/guard.ts`). Originals open only from under `data/`.
- **Restricted records** (`vault.sensitivity: restricted`, except the patient file) are withheld by the main process until the renderer asks with `reveal: true`. Never put their real title, aliases or body in a summary, a list, a filter index or a backlink.
- **No real health data.** Tests use `../examples/sample-vault` and `tests/fixtures/rich-vault` (fictional, from the intake acceptance run).
- **Version** in `package.json` matches the plugin's (`../install.sh` checks).
- **Layout changes are additive:** new sections in `src/shared/sections.ts`, new record pages in `features/record/renderers/`. Views never parse files.
- Before committing: `npm run typecheck && npm run lint && npm test`, and `npm run accept` for anything a user would see.
