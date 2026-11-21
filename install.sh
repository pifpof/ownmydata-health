#!/usr/bin/env bash
# install.sh: build distributable packages for the ownmydata plugin.
#
# Produces in dist/:
#
#   1. dist/ownmydata.zip
#      The whole plugin, from plugin/: .claude-plugin/, skills/, schema/ (the
#      empty vault template, including memory/reference/ rules), README.md,
#      LICENSE, NOTICE.md.
#      Unzip and install the folder as a Claude Code plugin, or push the repo
#      to GitHub and run:
#        /plugin marketplace add pifpof/ownmydata-health
#        /plugin install ownmydata@ownmydata
#
#   2. dist/<skill>.skill (one per skill)
#      ZIP archives with the skill folder at the root, for single-skill
#      installs (e.g. Claude Cowork: Customize -> Skills -> Upload).
#      setup-health-vault.skill also carries the vault template as
#      setup-health-vault/references/vault-template/, because a single
#      installed skill can't see the plugin's schema/ folder (plugin/schema/).
#
#   3. dist/ownmydata-<version>-arm64.dmg and -x64.dmg (with --with-app, macOS only)
#      The read-only vault viewer app from app/. Unsigned: first open is
#      right-click -> Open.
#
# Usage:
#   ./install.sh               Build the plugin packages
#   ./install.sh --clean       Wipe dist/ first, then build
#   ./install.sh --with-app    Also build the viewer app DMGs (needs npm install in app/)

set -euo pipefail
export COPYFILE_DISABLE=1   # no macOS resource-fork cruft in zips

REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"
PLUGIN_DIR="$REPO_ROOT/plugin"
DIST_DIR="$REPO_ROOT/dist"
TMP_DIR="$REPO_ROOT/.build-tmp"
PACK_VERSION="$(sed -n 's/.*"version": *"\([^"]*\)".*/\1/p' "$PLUGIN_DIR/.claude-plugin/plugin.json" | head -1)"

GOLD='\033[38;5;214m'; GREEN='\033[0;32m'; RED='\033[0;31m'; NC='\033[0m'
say() { echo -e "${GOLD}▸ $*${NC}"; }
ok()  { echo -e "  ${GREEN}✓${NC} $*"; }
err() { echo -e "  ${RED}✗${NC} $*"; }

# Versions must agree (repo CLAUDE.md rule)
for f in .claude-plugin/marketplace.json package.json app/package.json; do
  v="$(sed -n 's/.*"version": *"\([^"]*\)".*/\1/p' "$REPO_ROOT/$f" | head -1)"
  if [[ "$v" != "$PACK_VERSION" ]]; then err "$f version $v != plugin/.claude-plugin/plugin.json $PACK_VERSION"; exit 1; fi
done

# LICENSE and NOTICE.md live at the repo root and, identical, inside plugin/ (repo CLAUDE.md rule)
for f in LICENSE NOTICE.md; do
  cmp -s "$REPO_ROOT/$f" "$PLUGIN_DIR/$f" || { err "$f and plugin/$f differ"; exit 1; }
done

[[ " $* " == *" --clean "* ]] && { say "Cleaning dist/"; rm -rf "$DIST_DIR"; }
mkdir -p "$DIST_DIR"
rm -rf "$TMP_DIR"; mkdir -p "$TMP_DIR"

say "Building ownmydata v${PACK_VERSION}"

# 1. Combined package
STAGE="$TMP_DIR/ownmydata"
mkdir -p "$STAGE"
cp -R "$PLUGIN_DIR/.claude-plugin" "$PLUGIN_DIR/skills" "$PLUGIN_DIR/schema" "$STAGE/"
cp "$PLUGIN_DIR/README.md" "$PLUGIN_DIR/LICENSE" "$PLUGIN_DIR/NOTICE.md" "$STAGE/"
# The zip is installable on its own (/plugin marketplace add ./ownmydata), so it carries the
# marketplace manifest too, with the plugin at the zip root instead of ./plugin.
sed 's#"source": "./plugin"#"source": "./"#' "$REPO_ROOT/.claude-plugin/marketplace.json" > "$STAGE/.claude-plugin/marketplace.json"
grep -q '"source": "./"' "$STAGE/.claude-plugin/marketplace.json" || { err "marketplace.json source not rewritten"; exit 1; }
find "$STAGE" -name ".DS_Store" -delete
rm -f "$DIST_DIR/ownmydata.zip"
(cd "$TMP_DIR" && zip -qrX "$DIST_DIR/ownmydata.zip" "ownmydata/")
ok "ownmydata.zip: full plugin"

# 2. Per-skill packages
for skill_dir in "$PLUGIN_DIR"/skills/*/; do
  name="$(basename "$skill_dir")"
  [[ -f "$skill_dir/SKILL.md" ]] || { err "$name: no SKILL.md, skipped"; continue; }
  cp -R "$skill_dir" "$TMP_DIR/$name"
  if [[ "$name" == "setup-health-vault" ]]; then
    mkdir -p "$TMP_DIR/$name/references"
    cp -R "$PLUGIN_DIR/schema" "$TMP_DIR/$name/references/vault-template"
  fi
  find "$TMP_DIR/$name" -name ".DS_Store" -delete
  rm -f "$DIST_DIR/$name.skill"
  (cd "$TMP_DIR" && zip -qrX "$DIST_DIR/$name.skill" "$name/")
  ok "$name.skill"
done

rm -rf "$TMP_DIR"

# 3. Viewer app (optional)
if [[ " $* " == *" --with-app "* ]]; then
  say "Building the viewer app"
  (cd "$REPO_ROOT/app" && npm run build:mac)
  cp "$REPO_ROOT"/app/dist/ownmydata-"$PACK_VERSION"-*.dmg "$DIST_DIR/"
  ok "ownmydata-$PACK_VERSION DMGs"
fi

say "Done: dist/ownmydata.zip plus $(find "$DIST_DIR" -maxdepth 1 -name '*.skill' | wc -l | tr -d ' ') .skill files"
