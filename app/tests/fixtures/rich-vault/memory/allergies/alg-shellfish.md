---
type: allergy-intolerance
title: "Shellfish allergy"
description: "Shellfish · throat swelling · criticality high (ER visit 2018, carries EpiPen)"
tags: [allergy]
aliases: [shellfish, seafood allergy]
generated: {by: "/ownmydata:intake", at: "2026-11-18T12:39:03-07:00"}
sources:
  - resource: "session:2026-11-18"
fhir:
  resourceType: AllergyIntolerance
  id: alg-shellfish
  clinicalStatus:
    coding:
      - {system: "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical", code: active}
  category: [food]
  criticality: high
  code: {text: "Shellfish"}
  patient: {reference: "Patient/pt-self"}
  asserter: {reference: "Patient/pt-self"}
  lastOccurrence: "2018"
  reaction:
    - manifestation:
        - text: "Throat swelling"
      description: "Shellfish makes my throat swell. ER once in 2018; I carry an EpiPen now."
  note:
    - text: "Needed emergency room treatment once, in 2018. Carries an EpiPen (owner, 2026-11-18)."
vault:
  narrative: generated
---

# Shellfish allergy

From what the owner said on 2026-11-18: shellfish makes their throat swell. They went to the emergency room for it once, in 2018, and now carry an EpiPen.

## Links
- Patient: [Pat Sample](../patient/pt-self.md)
