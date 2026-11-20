---
type: condition
title: "Broken left wrist"
description: "2010 · Broken left wrist · resolved · skiing injury, fine now"
tags: [condition, resolved]
aliases: [broken wrist, wrist fracture, fractured wrist, left wrist, skiing injury]
generated: {by: "/ownmydata:intake", at: "2026-11-18T12:44:05-07:00"}
sources:
  - resource: "session:2026-11-18"
fhir:
  resourceType: Condition
  id: cond-20261118-broken-left-wrist
  clinicalStatus:
    coding: [{system: "http://terminology.hl7.org/CodeSystem/condition-clinical", code: resolved}]
  category:
    - coding: [{system: "http://terminology.hl7.org/CodeSystem/condition-category", code: problem-list-item}]
  code: {text: "Broken left wrist"}
  bodySite:
    - text: "Left wrist"
  subject: {reference: "Patient/pt-self"}
  onsetDateTime: "2010"
  recordedDate: "2026-11-18"
  asserter: {reference: "Patient/pt-self"}
  note:
    - text: "Owner, 2026-11-18: \"broke my left wrist skiing in 2010, fine now\""
vault:
  narrative: generated
---

# Broken left wrist

From what the owner said on 2026-11-18: broke their left wrist skiing in 2010; it's fine now.

## Links
- Patient: [Pat Sample](../patient/pt-self.md)
