---
type: medication-statement
title: "EpiPen (carried for shellfish allergy)"
description: "EpiPen · carried for emergencies · active, said 2026-11-18 · for shellfish allergy"
tags: [medication]
aliases: [epipen, adrenaline auto-injector, epinephrine]
generated: {by: "/ownmydata:intake", at: "2026-11-18T12:39:03-07:00"}
sources:
  - resource: "session:2026-11-18"
stale_after: 2027-05-18
fhir:
  resourceType: MedicationStatement
  id: med-20261118-epipen
  status: active
  medicationCodeableConcept: {text: "EpiPen"}
  subject: {reference: "Patient/pt-self"}
  dateAsserted: "2026-11-18"
  informationSource: {reference: "Patient/pt-self"}
  reasonCode:
    - text: "Shellfish allergy"
  dosage:
    - text: "Carried for emergencies"
vault:
  narrative: generated
---

# EpiPen (carried for shellfish allergy)

From what the owner said on 2026-11-18: they carry an EpiPen because of their shellfish allergy.

## Links
- Patient: [Pat Sample](../patient/pt-self.md)
- Allergy: [Shellfish allergy](../allergies/alg-shellfish.md)
