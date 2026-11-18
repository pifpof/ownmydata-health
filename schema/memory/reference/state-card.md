---
type: reference
title: "State card"
description: "How the hot-state card memory/_state.md is built, section by section, so every skill rebuilds it the same way."
tags: [reference, system]
aliases: [hot-state card, _state.md]
generated:
  by: "ownmydata plugin"
  at: "2026-11-18"
sources:
  - resource: "ownmydata plugin v0.1.0"
---

# State card

`memory/_state.md` is a derived page: a snapshot of what matters now, built from the files. `/ownmydata:save` and `/ownmydata:health-check` rewrite it **whole** by the rules below, so the same vault on the same day always gives the same card. `/ownmydata:start` reads it.

Keep it under 2 KB and about 15 lines. Every line links to the file it came from (links are relative to `memory/`: `./episodes/<id>.md`). No raw lab values, only flags. Never: unverified files, missing codes, missing fields, or anything else that is bookkeeping. A restricted item (`vault.sensitivity: restricted`) appears only as a count: `- 1 restricted item`.

## Frontmatter

Keep the existing frontmatter; set `generated: {by: "/ownmydata:<skill>", at: "<now>"}`.

## Sections, in this order

**`## Active episodes`**: every episode hub with `vault.episode.status` `active` or `onhold`, sorted by id:
`- [<Title>](./episodes/<id>.md) · last: <What of the newest timeline row> (<its date>) · pending: <up to two open items, shortened>`
None → `- none`.

**`## Upcoming`**: open items in active hubs that carry a calendar date on or after today, soonest first: `- <yyyy-mm-dd> · <item> · [<episode title>](./episodes/<id>.md)`. Items with no date ("in 4 weeks") are not listed here; they show as pending above. None → `- none`.

**`## Needs review`**: files whose `stale_after` is before today, sorted by date: `- [<Title>](<path>) · review date <stale_after>`. Information only, never phrased as a task. None → `- none`.

**`## Recent results`**: reports whose effective date is within the last 30 days and whose description shows a printed flag or an unclear value, newest first: `- [<Title>](./reports/<yyyy>/<id>.md) · <the flags part of its description, e.g. "1 low (WBC)" or "1 value unclear">`. None → `- none`.

**`## Medications`**: `- <n> recorded: <name> (<status in plain words: taking, planned, stopped, finished, status unknown>), …`, at most five names, active first. None → `- none recorded`.

**`## Last session`**: `- <yyyy-mm-dd>`, the date of the last `/ownmydata:save`. `/ownmydata:health-check` keeps whatever is there.
