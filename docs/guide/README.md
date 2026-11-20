# ownmydata help guides

Static HTML, no build step, no third-party requests. Styled to match [ownmydata.health](https://ownmydata.health) (`pifpof/ownmydata-website`): same tokens, self-hosted fonts and components, light and dark.

- `index.html`: start here. Why the project exists, the community, how the pieces fit, where to start, what we promise.
- `plugin.html`: the complete plugin guide, from install to troubleshooting.
- `viewer.html`: the complete viewer guide, with screenshots.
- `guide.css`: shared styles. The accent is the single `--accent` token (light and dark values).
- `fonts/`: Schibsted Grotesk and IBM Plex Mono (SIL OFL 1.1, see `fonts/LICENSE.md`), copied from the website.
- `img/`: viewer screenshots of the fictional sample vault, from the viewer's acceptance run (`app/tests/e2e/accept.mjs`).

Open `index.html` in a browser to read them locally. To publish at `ownmydata.health/help/`, copy this folder into the website repo as `help/`.

When the plugin or viewer changes, update the matching guide in the same pull request. Never use real health data in examples or screenshots.
