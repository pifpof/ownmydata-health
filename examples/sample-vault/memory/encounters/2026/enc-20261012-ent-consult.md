---
type: encounter
title: "ENT consult, 2026-10-12"
description: "2026-10-12 · ENT consult · Dr. A. Example · reduced hearing left ear, audiology ordered"
tags: [encounter, episode/ep-20261012-left-ear]
aliases: [ENT visit, ear doctor, ENT appointment, ear consult, hearing consult]
generated: {by: "/ownmydata:capture", at: "2026-11-18T08:42:24-07:00"}
sources:
  - resource: "data/documents/2026/2026-10-12-ent-consult-note.pdf"
fhir:
  resourceType: Encounter
  id: enc-20261012-ent-consult
  status: finished
  class: {system: "http://terminology.hl7.org/CodeSystem/v3-ActCode", code: AMB, display: ambulatory}
  type:
    - text: "Consultation - Otolaryngology"
  subject: {reference: "Patient/pt-self"}
  participant:
    - individual: {reference: "Practitioner/prac-example-ent", display: "Dr. A. Example"}
  period:
    start: "2026-10-12T09:30:00-07:00"
  reasonCode:
    - text: "Reduced hearing, left ear, since approximately September 2026."
  diagnosis:
    - condition: {reference: "Condition/cond-20261012-hearing-loss-left", display: "Left-sided hearing loss, likely conductive"}
  serviceProvider: {reference: "Organization/org-example-ent-clinic", display: "Example ENT Clinic"}
vault:
  episode: ep-20261012-left-ear
  documents: ["DocumentReference/doc-20261012-ent-consult-note"]
  narrative: additional
---

# ENT consult, 2026-10-12

Consultation with Dr. A. Example (otolaryngology) at Example ENT Clinic on 2026-10-12 at 09:30, on referral from Dr. B. Familydoc (family physician). Reason for referral: "Reduced hearing, left ear, since approximately September 2026."

**History:** "Patient reports muffled hearing on the left for about 4-5 weeks. Intermittent fullness. No pain, no discharge, no vertigo. No recent illness. Swims regularly."

**Examination:** "Right ear normal. Left external canal partially obscured; tympanic membrane not fully visualized. Weber lateralizes to the left. Rinne negative on the left."

**Impression:** "Left-sided hearing loss, likely conductive. Cause not yet established; possible cerumen impaction vs. middle ear effusion." (Dr. A. Example)

**Plan:**
1. Audiology: pure-tone audiogram and tympanometry.
2. Olive oil drops to left ear twice daily for 7 days before audiology.
3. Follow-up in clinic in 4 weeks with audiology results.

## Links
- Problem: [Left-sided hearing loss, likely conductive](../../conditions/cond-20261012-hearing-loss-left.md)
- Episode: [Left ear investigation](../../episodes/ep-20261012-left-ear.md)
- Planned medication: [Olive oil drops, left ear](../../medications/med-20261012-olive-oil-drops.md)
- Clinician: [Dr. A. Example](../../patient/care-team/prac-example-ent.md)
- Referred by: [Dr. B. Familydoc](../../patient/care-team/prac-familydoc-family.md)
- Clinic: [Example ENT Clinic](../../patient/care-team/org-example-ent-clinic.md)
- Source: [Consultation note PDF, 2026-10-12](../../documents/2026/doc-20261012-ent-consult-note.md)
