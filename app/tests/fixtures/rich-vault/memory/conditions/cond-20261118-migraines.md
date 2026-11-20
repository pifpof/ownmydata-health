---
type: condition
title: "Migraines"
description: "since teenage years · Migraines · active · a few times a month"
tags: [condition, active]
aliases: [migraine, migraines, headaches, headache]
generated: {by: "/ownmydata:intake", at: "2026-11-18T12:39:03-07:00"}
sources:
  - resource: "session:2026-11-18"
fhir:
  resourceType: Condition
  id: cond-20261118-migraines
  clinicalStatus:
    coding: [{system: "http://terminology.hl7.org/CodeSystem/condition-clinical", code: active}]
  category:
    - coding: [{system: "http://terminology.hl7.org/CodeSystem/condition-category", code: problem-list-item}]
  code: {text: "Migraines"}
  subject: {reference: "Patient/pt-self"}
  onsetString: "since I was a teenager"
  recordedDate: "2026-11-18"
  asserter: {reference: "Patient/pt-self"}
  note:
    - text: "Still gets them a few times a month (owner, 2026-11-18)."
vault:
  narrative: generated
---

# Migraines

From what the owner said on 2026-11-18: migraines since they were a teenager; still gets them a few times a month. Takes ibuprofen now and then for headaches.

## Links
- Patient: [Pat Sample](../patient/pt-self.md)
- Medication: [Ibuprofen, as needed](../medications/med-20261118-ibuprofen.md)
