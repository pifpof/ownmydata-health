# Contributing to ownmydata

Thanks for being here. ownmydata exists because people should own their health data, and it gets better with every person who shows up: developers, clinicians, people who keep their own records, translators, writers, skeptics.

## Two rules before anything else

1. **No real health data in this repository. Ever.** Not in issues, pull requests, fixtures, examples, screenshots or logs. That includes your own. Use fictional records (see `fixtures/` for the style: an invented patient, invented clinic, and a "FICTIONAL TEST DOCUMENT" footer). If you need to show a bug that happened on real data, recreate it with made-up values.
2. **No forms, no required fields.** The format shapes what Claude writes, never what the person has to supply. A change that makes someone type, choose or confirm something they wouldn't do with a paper folder won't be merged unless it is optional.

## Ways to help

| You are... | You could... |
|---|---|
| Trying it out | Install it, file the fictional fixtures, and open an issue with what worked and what didn't. |
| A developer | Pick up an issue labelled `good first issue` or `help wanted`, or propose an importer for a record format. |
| A clinician, pharmacist or health-records person | Review `docs/architecture-spec.md` and the safety rules in `schema/CLAUDE.md`. Tell us where the model of a record is wrong. |
| Good with standards | Check FHIR R4 element names, value sets and LOINC codes in `references/code-allowlist.md`. |
| Multilingual | Translate the skills, the vault `CLAUDE.md` and the README. |
| A writer | Make the docs plainer. Most users will never have heard of FHIR. |

Not sure where you fit? Open an issue and say what you'd like to do.

## How the project is put together

- `skills/`: the skills, one `SKILL.md` each. They are instructions Claude follows, not code.
- `schema/`: the empty vault that `setup-health-vault` copies, including the vault `CLAUDE.md` (safety, privacy, zero-lift rules).
- `references/`: the shared rules (file format, resource map, required-field defaults, row schemas, code allow-list, description templates), copied into each vault's `memory/reference/`.
- `docs/architecture-spec.md`: why the folders, files and formats are the way they are. Read sections 1, 4 and 7 before changing a format.
- `fixtures/`: fictional source documents and `EXPECTED.md`, the exact results each skill should produce.
- `examples/sample-vault/`: a complete vault built from the fixtures.
- `tests/`: `acceptance.md` (scenarios A1 to A15 and the latest run) and `check_vault.py` (frontmatter, ids, links, lab tables).

Skills must work with no scripts: Claude reads and writes markdown. Scripts are welcome as optional helpers, never as a requirement.

## Making a change

1. **Open an issue first** for anything bigger than a typo, so we can agree on the shape before you spend time on it. Changes to the record format or the safety rules always need an issue.
2. **Fork, branch, change.** Keep one change per pull request.
3. **Test with the fixtures.** In a scratch folder (`.test-vault/` is gitignored), load your copy with `claude --plugin-dir <your clone>`, run the scenarios in `tests/acceptance.md` that your change touches, and compare against `fixtures/EXPECTED.md`. Then run:

   ```
   python3 tests/check_vault.py .test-vault
   claude plugin validate .
   ```

4. **Add a fixture** if your change handles a new kind of document: a fictional source document plus its expected result in `fixtures/EXPECTED.md`.
5. **Update the docs** your change affects: the skill, `references/`, `docs/architecture-spec.md`, README, `CHANGELOG.md`.
6. **Open the pull request** using the template. Say which acceptance scenarios you ran.

## Rules the format follows

If you change how records are written, keep these:

- Store what the source says in its FHIR R4 shape. Leave out what it doesn't say. Never guess to complete a record.
- Copy values, units, reference ranges and flags exactly as printed. Never convert or compute them.
- Write a medical code only when the document prints it or it matches the checked allow-list.
- Never write a top-level `status` in frontmatter (the Open Knowledge Format reserves it). FHIR fields go under `fhir:`, vault-only fields under `vault:`.
- Plain English to the person. FHIR terms stay inside the files.

## Safety

ownmydata is not a medical device and gives no medical advice. Changes must not make it diagnose, prescribe, give doses, predict prognosis, or advise starting, stopping or changing treatment. Red-flag symptoms always get "seek urgent care" first. Changes to the safety rules get extra review.

## Licence

By contributing you agree that your contribution is licensed under the MIT License, the same as the project. Do not add code tables or content you don't have the right to share (SNOMED CT and some national code sets have licence terms; ask first).

## Conduct

Everyone taking part follows the [Code of Conduct](CODE_OF_CONDUCT.md).
