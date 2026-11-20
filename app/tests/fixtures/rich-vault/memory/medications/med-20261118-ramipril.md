---
type: medication-statement
title: "Ramipril 5 mg"
description: "Ramipril · 5 mg once a day · active, said 2026-11-18 · for blood pressure"
tags: [medication]
aliases: [ramipril]
generated: {by: "/ownmydata:intake", at: "2026-11-18T12:39:03-07:00"}
sources:
  - resource: "session:2026-11-18"
stale_after: 2027-05-18
fhir:
  resourceType: MedicationStatement
  id: med-20261118-ramipril
  status: active
  medicationCodeableConcept: {text: "Ramipril"}
  subject: {reference: "Patient/pt-self"}
  dateAsserted: "2026-11-18"
  informationSource: {reference: "Patient/pt-self"}
  reasonCode:
    - text: "Blood pressure"
  reasonReference:
    - {reference: "Condition/cond-20261118-high-blood-pressure", display: "High blood pressure"}
  dosage:
    - text: "5 mg once a day"
vault:
  narrative: generated
---

# Ramipril 5 mg

From what the owner said on 2026-11-18: ramipril 5 mg, once a day, for blood pressure.

## Links
- Patient: [Pat Sample](../patient/pt-self.md)
- Problem: [High blood pressure](../conditions/cond-20261118-high-blood-pressure.md)
