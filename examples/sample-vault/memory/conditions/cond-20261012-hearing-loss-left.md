---
type: condition
title: "Left-sided hearing loss, likely conductive"
description: "2026-09 · Left-sided hearing loss, likely conductive · resolved 2026-11-18 · ep left ear"
tags: [condition, resolved, episode/ep-20261012-left-ear]
aliases: [left ear, hearing loss, ear thing, muffled hearing, reduced hearing, conductive hearing loss, blocked ear]
generated: {by: "/ownmydata:save", at: "2026-11-18T08:46:56-07:00"}
sources:
  - resource: "data/documents/2026/2026-10-12-ent-consult-note.pdf"
  - resource: "session:2026-11-18"
fhir:
  resourceType: Condition
  id: cond-20261012-hearing-loss-left
  clinicalStatus:
    coding: [{system: "http://terminology.hl7.org/CodeSystem/condition-clinical", code: resolved}]
  verificationStatus:
    coding: [{system: "http://terminology.hl7.org/CodeSystem/condition-ver-status", code: provisional}]
  category:
    - coding: [{system: "http://terminology.hl7.org/CodeSystem/condition-category", code: problem-list-item}]
  code: {text: "Left-sided hearing loss, likely conductive"}
  bodySite: [{text: "Left ear"}]
  subject: {reference: "Patient/pt-self"}
  encounter: {reference: "Encounter/enc-20261012-ent-consult"}
  onsetDateTime: "2026-09"
  abatementDateTime: "2026-11-18"
  recordedDate: "2026-10-12"
  asserter: {reference: "Practitioner/prac-example-ent", display: "Dr. A. Example"}
  note:
    - text: "Cause not yet established; possible cerumen impaction vs. middle ear effusion."
    - text: "Owner, 2026-11-18: \"The ear thing is sorted, it was wax, cleared at the clinic\""
vault:
  episode: ep-20261012-left-ear
  documents: ["DocumentReference/doc-20261012-ent-consult-note"]
  coding_note: "Source gives no code; text only, by policy."
  narrative: additional
---

# Left-sided hearing loss, likely conductive

Recorded by Dr. A. Example at the 2026-10-12 ENT consult. Status: **resolved** (2026-11-18), verification **provisional** (the note says "likely"). Onset: "since approximately September 2026", per the reason for referral.

The note says: "Cause not yet established; possible cerumen impaction vs. middle ear effusion." These are possibilities the clinician named, not diagnoses.

On 2026-11-18 the owner said: "The ear thing is sorted, it was wax, cleared at the clinic." That is the owner's account of the cause; no clinic record of it is in the vault.

## Links
- Episode: [Left ear investigation](../episodes/ep-20261012-left-ear.md)
- Wax cleared: [Ear wax cleared at the clinic](../procedures/proc-20261118-ear-wax-cleared.md)
- Visit: [ENT consult, 2026-10-12](../encounters/2026/enc-20261012-ent-consult.md)
- Recorded by: [Dr. A. Example](../patient/care-team/prac-example-ent.md)
- Source: [Consultation note PDF, 2026-10-12](../documents/2026/doc-20261012-ent-consult-note.md)
