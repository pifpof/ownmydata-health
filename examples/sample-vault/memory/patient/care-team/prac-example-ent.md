---
type: practitioner
title: "Dr. A. Example"
description: "Dr. A. Example · ENT (otolaryngology) consultant · Example ENT Clinic"
tags: [care-team, practitioner]
aliases: [Example, Dr. Example, my ENT, ear doctor, ENT, otolaryngologist]
generated: {by: "/ownmydata:capture", at: "2026-11-18T08:42:24-07:00"}
sources:
  - resource: "data/documents/2026/2026-10-12-ent-consult-note.pdf"
fhir:
  resourceType: Practitioner
  id: prac-example-ent
  name:
    - text: "Dr. A. Example"
  qualification:
    - code: {text: "MD"}
    - code: {text: "FRCSC (Otolaryngology)"}
vault:
  narrative: additional
---

# Dr. A. Example

Consultant in otolaryngology (ENT), Example ENT Clinic. Printed credentials: "MD, FRCSC (Otolaryngology)". First seen in the records on 2026-10-12.

## Links
- [Example ENT Clinic](./org-example-ent-clinic.md)
- Seen at: [ENT consult, 2026-10-12](../../encounters/2026/enc-20261012-ent-consult.md)
- Episode: [Left ear investigation](../../episodes/ep-20261012-left-ear.md)
