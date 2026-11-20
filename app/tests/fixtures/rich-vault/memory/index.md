---
okf_version: "0.2"
---

# Memory

This folder is an Open Knowledge Format (v0.2) bundle holding one person's health records in FHIR R4 shape. The full map, with when to open each folder, is the router: [memory.md](../memory.md).

## Folders

- [Patient](./patient/index.md): The vault owner's own record, plus the care team and devices.
- [Episodes](./episodes/index.md): One hub per problem or investigation, with a timeline and a conclusion.
- [Conditions](./conditions/index.md): Problems, diagnoses and persistent symptoms, active and resolved.
- [Visits](./encounters/index.md): Visits, calls and admissions, by year.
- [Reports](./reports/index.md): Lab, imaging and other diagnostic reports, by year.
- [Procedures](./procedures/index.md): Surgeries, biopsies, therapies.
- [Medications](./medications/index.md): What the person takes or has taken.
- [Allergies](./allergies/index.md): Allergies and intolerances.
- [Immunizations](./immunizations/index.md): Vaccines received.
- [Plans](./plans/index.md): Care plans and goals (later versions).
- [Family history](./family-history/index.md): Relatives' health history (later versions).
- [Documents](./documents/index.md): One record per stored original, by year.
- [Observations](./observations/index.md): One-off measurements; ledgers and series in later versions.
- [Library](./library/index.md): Questions for doctors and research notes.
- [Decisions](./decisions/index.md): Health and treatment decisions with reasons.
- [Reference](./reference/index.md): The rules the skills follow.

## System files

- [Hot-state card](./_state.md): What matters right now. Derived from the files, rebuildable.
- [Health history interview](./_intake.md): Progress of the intake interview, so it can pause and resume.
