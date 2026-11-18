---
type: document-reference
title: "Consultation note PDF, 2026-10-12"
description: "2026-10-12 · ENT consultation note PDF · Dr. A. Example, Example ENT Clinic"
tags: [document]
generated: {by: "/ownmydata:capture", at: "2026-11-18T08:42:24-07:00"}
sources:
  - resource: "data/documents/2026/2026-10-12-ent-consult-note.pdf"
fhir:
  resourceType: DocumentReference
  id: doc-20261012-ent-consult-note
  status: current
  docStatus: final
  type: {text: "Consultation note - Otolaryngology"}
  subject: {reference: "Patient/pt-self"}
  date: "2026-11-18T08:42:24-07:00"
  author:
    - {reference: "Practitioner/prac-example-ent", display: "Dr. A. Example"}
  description: "ENT consultation note from Example ENT Clinic for the 2026-10-12 visit."
  content:
    - attachment:
        contentType: "application/pdf"
        url: "data/documents/2026/2026-10-12-ent-consult-note.pdf"
        title: "Consultation note - Otolaryngology, 2026-10-12"
  context:
    encounter: [{reference: "Encounter/enc-20261012-ent-consult"}]
    related:
      - {reference: "Encounter/enc-20261012-ent-consult"}
      - {reference: "Condition/cond-20261012-hearing-loss-left"}
      - {reference: "MedicationStatement/med-20261012-olive-oil-drops"}
      - {reference: "Practitioner/prac-example-ent"}
      - {reference: "Practitioner/prac-familydoc-family"}
      - {reference: "Organization/org-example-ent-clinic"}
vault:
  source:
    sha256: "c45cc5d1f1acbbcabb824924f316c7348a70d52ec775b411d8c2f406d26feac8"
    original_filename: "01-ent-consult-note-2026-10-12.pdf"
  narrative: generated
---

# Consultation note PDF, 2026-10-12

Original as received, never edited: [2026-10-12-ent-consult-note.pdf](../../../data/documents/2026/2026-10-12-ent-consult-note.pdf). One page, signed by Dr. A. Example.

Records made from it:
- [ENT consult, 2026-10-12](../../encounters/2026/enc-20261012-ent-consult.md)
- [Left-sided hearing loss, likely conductive](../../conditions/cond-20261012-hearing-loss-left.md)
- [Olive oil drops, left ear](../../medications/med-20261012-olive-oil-drops.md)
- [Dr. A. Example](../../patient/care-team/prac-example-ent.md)
- [Dr. B. Familydoc](../../patient/care-team/prac-familydoc-family.md)
- [Example ENT Clinic](../../patient/care-team/org-example-ent-clinic.md)

## Links
- Episode: [Left ear investigation](../../episodes/ep-20261012-left-ear.md)
