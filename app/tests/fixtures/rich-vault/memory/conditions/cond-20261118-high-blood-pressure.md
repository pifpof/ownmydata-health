---
type: condition
title: "High blood pressure"
description: "around 2019 · High blood pressure · active · on ramipril"
tags: [condition, active]
aliases: [high blood pressure, blood pressure, hypertension, bp]
generated: {by: "/ownmydata:intake", at: "2026-11-18T12:39:03-07:00"}
sources:
  - resource: "session:2026-11-18"
fhir:
  resourceType: Condition
  id: cond-20261118-high-blood-pressure
  clinicalStatus:
    coding: [{system: "http://terminology.hl7.org/CodeSystem/condition-clinical", code: active}]
  category:
    - coding: [{system: "http://terminology.hl7.org/CodeSystem/condition-category", code: problem-list-item}]
  code: {text: "High blood pressure"}
  subject: {reference: "Patient/pt-self"}
  onsetString: "around 2019"
  recordedDate: "2026-11-18"
  asserter: {reference: "Patient/pt-self"}
vault:
  narrative: generated
---

# High blood pressure

From what the owner said on 2026-11-18: diagnosed around 2019; takes ramipril for it.

## Links
- Patient: [Pat Sample](../patient/pt-self.md)
- Medication: [Ramipril 5 mg](../medications/med-20261118-ramipril.md)
