---
type: allergy-intolerance
title: "Penicillin allergy"
description: "Penicillin · hives · criticality not stated"
tags: [allergy]
aliases: [penicillin]
generated: {by: "/ownmydata:intake", at: "2026-11-18T12:39:03-07:00"}
sources:
  - resource: "session:2026-11-18"
fhir:
  resourceType: AllergyIntolerance
  id: alg-penicillin
  clinicalStatus:
    coding:
      - {system: "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical", code: active}
  category: [medication]
  code: {text: "Penicillin"}
  patient: {reference: "Patient/pt-self"}
  asserter: {reference: "Patient/pt-self"}
  reaction:
    - manifestation:
        - text: "Hives"
      description: "Penicillin gives me hives"
vault:
  narrative: generated
---

# Penicillin allergy

From what the owner said on 2026-11-18: penicillin gives them hives.

## Links
- Patient: [Pat Sample](../patient/pt-self.md)
