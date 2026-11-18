---
type: medication-statement
title: "Olive oil drops, left ear"
description: "Olive oil drops · left ear twice daily 7 days · planned 2026-10-12 · before audiology"
tags: [medication, episode/ep-20261012-left-ear]
aliases: [olive oil, olive oil drops, ear drops, ear oil]
generated: {by: "/ownmydata:capture", at: "2026-11-18T08:42:24-07:00"}
sources:
  - resource: "data/documents/2026/2026-10-12-ent-consult-note.pdf"
fhir:
  resourceType: MedicationStatement
  id: med-20261012-olive-oil-drops
  status: intended
  medicationCodeableConcept: {text: "Olive oil drops"}
  subject: {reference: "Patient/pt-self"}
  context: {reference: "Encounter/enc-20261012-ent-consult"}
  dateAsserted: "2026-10-12"
  informationSource: {reference: "Practitioner/prac-example-ent", display: "Dr. A. Example"}
  reasonReference:
    - {reference: "Condition/cond-20261012-hearing-loss-left", display: "Left-sided hearing loss, likely conductive"}
  dosage:
    - text: "to left ear twice daily for 7 days before audiology"
vault:
  episode: ep-20261012-left-ear
  documents: ["DocumentReference/doc-20261012-ent-consult-note"]
  narrative: additional
---

# Olive oil drops, left ear

Planned at the 2026-10-12 ENT consult by Dr. A. Example. The plan reads: "Olive oil drops to left ear twice daily for 7 days before audiology." Status **intended**: the note plans it; the records don't say it was started.

## Links
- Episode: [Left ear investigation](../episodes/ep-20261012-left-ear.md)
- Problem: [Left-sided hearing loss, likely conductive](../conditions/cond-20261012-hearing-loss-left.md)
- Visit: [ENT consult, 2026-10-12](../encounters/2026/enc-20261012-ent-consult.md)
- Source: [Consultation note PDF, 2026-10-12](../documents/2026/doc-20261012-ent-consult-note.md)
