---
type: family-member-history
title: "Father"
description: "Father · heart attack (age 62) · deceased at 62"
tags: [family-history]
aliases: [dad, father, father's side, heart attack, heart disease in the family]
generated: {by: "/ownmydata:intake", at: "2026-11-18T12:44:52-07:00"}
sources:
  - resource: "session:2026-11-18"
fhir:
  resourceType: FamilyMemberHistory
  id: fmh-father
  status: completed
  patient: {reference: "Patient/pt-self"}
  relationship:
    coding: [{system: "http://terminology.hl7.org/CodeSystem/v3-RoleCode", code: FTH, display: father}]
    text: "dad"
  deceasedAge: {value: 62, unit: "years", system: "http://unitsofmeasure.org", code: "a"}
  condition:
    - code: {text: "Heart attack"}
      onsetAge: {value: 62, unit: "years", system: "http://unitsofmeasure.org", code: "a"}
      contributedToDeath: true
vault:
  narrative: generated
---

# Father

On 2026-11-18 the owner said: "my dad had a heart attack". He was 62, and it was the cause of his death.

## Links
- Patient: [Pat Sample](../patient/pt-self.md)
