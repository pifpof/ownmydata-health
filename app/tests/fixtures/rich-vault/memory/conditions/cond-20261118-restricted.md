---
type: condition
title: "Restricted condition"
description: "2021 · Condition · restricted"
tags: [condition, inactive]
aliases: [anxiety, therapist, therapy, mental health]
generated: {by: "/ownmydata:intake", at: "2026-11-18T12:47:11-07:00"}
sources:
  - resource: "session:2026-11-18"
fhir:
  resourceType: Condition
  id: cond-20261118-restricted
  clinicalStatus:
    coding: [{system: "http://terminology.hl7.org/CodeSystem/condition-clinical", code: inactive}]
  category:
    - coding: [{system: "http://terminology.hl7.org/CodeSystem/condition-category", code: problem-list-item}]
  code: {text: "Anxiety"}
  subject: {reference: "Patient/pt-self"}
  recordedDate: "2026-11-18"
  asserter: {reference: "Patient/pt-self"}
  note:
    - text: "Owner, 2026-11-18: \"anxiety, saw a therapist in 2021\""
vault:
  sensitivity: restricted
  narrative: generated
---

# Restricted condition

From what the owner said on 2026-11-18: anxiety; saw a therapist in 2021. More in the past now.

## Links
- Patient: [Pat Sample](../patient/pt-self.md)
