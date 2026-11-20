# Reference

Rules the skills follow: file format, record types, code allow-list, row schemas, description templates. Copied in at setup.

<!-- OKF index: no frontmatter. One line per file: - [Title](./file.md): description, 150 characters or fewer. Derived from each file's frontmatter; /ownmydata:health-check rebuilds it. -->

## Files

- [Code allow-list](./code-allowlist.md): The only LOINC codes Claude may add when a source prints none. Exact name and unit matches only. LOINC attribution.
- [Description templates](./descriptions.md): Index-line templates per record type, 150 characters or fewer, plus title and alias conventions.
- [File format](./file-format.md): How every vault file is built: OKF header, fhir: block, vault: block, body narrative, Links section.
- [Record templates](./record-templates.md): A filled-in skeleton for every record type v0.1 writes, including the episode hub and the patient file.
- [Required-field defaults](./required-field-defaults.md): The only values Claude may fill in when a source is silent (past-event status, encounter class), and what stays out.
- [Resource map](./resource-map.md): Which record type to write for what, its id prefix, folder, OKF type and path rules for Type/id references.
- [Row schemas](./row-schemas.md): The lab-v1 results table: columns, what each maps to in FHIR, and how to write values, units, ranges and flags.
- [State card](./state-card.md): How the hot-state card memory/_state.md is built, section by section, so every skill rebuilds it the same way.
