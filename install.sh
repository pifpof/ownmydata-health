#!/usr/bin/env bash
# install.sh: build distributable packages for the ownmydata plugin.
#
# Produces in dist/:
#
#   1. dist/ownmydata.zip
#      The whole plugin: .claude-plugin/, skills/, schema/ (the empty vault
#      template, including memory/reference/ rules), README.md, LICENSE.
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
#      installed skill can't see the plugin's schema/ folder.
#
# Usage:
#   ./install.sh           Build everything
#   ./install.sh --clean   Wipe dist/ first, then build

set -euo pipefail
export COPYFILE_DISABLE=1   # no macOS resource-fork cruft in zips

REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"
DIST_DIR="$REPO_ROOT/dist"
TMP_DIR="$REPO_ROOT/.build-tmp"
PACK_VERSION="$(sed -n 's/.*"version": *"\([^"]*\)".*/\1/p' "$REPO_ROOT/.claude-plugin/plugin.json" | head -1)"

GOLD='\033[38;5;214m'; GREEN='\033[0;32m'; RED='\033[0;31m'; NC='\033[0m'
say() { echo -e "${GOLD}▸ $*${NC}"; }
ok()  { echo -e "  ${GREEN}✓${NC} $*"; }
err() { echo -e "  ${RED}✗${NC} $*"; }

# Versions must agree (repo CLAUDE.md rule)
for f in .claude-plugin/marketplace.json package.json; do
  v="$(sed -n 's/.*"version": *"\([^"]*\)".*/\1/p' "$REPO_ROOT/$f" | head -1)"
  if [[ "$v" != "$PACK_VERSION" ]]; then err "$f version $v != plugin.json $PACK_VERSION"; exit 1; fi
done

[[ "${1:-}" == "--clean" ]] && { say "Cleaning dist/"; rm -rf "$DIST_DIR"; }
mkdir -p "$DIST_DIR"
rm -rf "$TMP_DIR"; mkdir -p "$TMP_DIR"

say "Building ownmydata v${PACK_VERSION}"

# 1. Combined package
STAGE="$TMP_DIR/ownmydata"
mkdir -p "$STAGE"
cp -R "$REPO_ROOT/.claude-plugin" "$REPO_ROOT/skills" "$REPO_ROOT/schema" "$STAGE/"
cp "$REPO_ROOT/README.md" "$REPO_ROOT/LICENSE" "$STAGE/"
find "$STAGE" -name ".DS_Store" -delete
rm -f "$DIST_DIR/ownmydata.zip"
(cd "$TMP_DIR" && zip -qrX "$DIST_DIR/ownmydata.zip" "ownmydata/")
ok "ownmydata.zip: full plugin"

# 2. Per-skill packages
for skill_dir in "$REPO_ROOT"/skills/*/; do
  name="$(basename "$skill_dir")"
  [[ -f "$skill_dir/SKILL.md" ]] || { err "$name: no SKILL.md, skipped"; continue; }
  cp -R "$skill_dir" "$TMP_DIR/$name"
  if [[ "$name" == "setup-health-vault" ]]; then
    mkdir -p "$TMP_DIR/$name/references"
    cp -R "$REPO_ROOT/schema" "$TMP_DIR/$name/references/vault-template"
  fi
  find "$TMP_DIR/$name" -name ".DS_Store" -delete
  rm -f "$DIST_DIR/$name.skill"
  (cd "$TMP_DIR" && zip -qrX "$DIST_DIR/$name.skill" "$name/")
  ok "$name.skill"
done

rm -rf "$TMP_DIR"
say "Done: dist/ownmydata.zip plus $(find "$DIST_DIR" -maxdepth 1 -name '*.skill' | wc -l | tr -d ' ') .skill files"
