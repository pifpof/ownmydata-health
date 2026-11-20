---
type: organization
title: "Example ENT Clinic"
description: "Example ENT Clinic · ENT clinic · Exampletown"
tags: [care-team, organization]
aliases: [ENT clinic, ear clinic, Example ENT]
generated: {by: "/ownmydata:capture", at: "2026-11-18T08:42:24-07:00"}
sources:
  - resource: "data/documents/2026/2026-10-12-ent-consult-note.pdf"
fhir:
  resourceType: Organization
  id: org-example-ent-clinic
  name: "Example ENT Clinic"
  type:
    - text: "ENT clinic"
  address:
    - text: "100 Sample Street, Exampletown"
vault:
  narrative: generated
---

# Example ENT Clinic

ENT (otolaryngology) clinic at 100 Sample Street, Exampletown. First seen in the records on 2026-10-12.

## Links
- Clinician: [Dr. A. Example](./prac-example-ent.md)
- Visit: [ENT consult, 2026-10-12](../../encounters/2026/enc-20261012-ent-consult.md)
