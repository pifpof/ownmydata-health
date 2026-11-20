---
type: observation
title: "Alcohol use"
description: "Alcohol use · a glass of wine or two on weekends · said 2026-11-18"
tags: [observation, lifestyle]
aliases: [alcohol, drinking, wine, drinks per week]
generated: {by: "/ownmydata:intake", at: "2026-11-18T12:45:55-07:00"}
sources:
  - resource: "session:2026-11-18"
fhir:
  resourceType: Observation
  id: obs-20261118-alcohol-use
  status: final
  category:
    - coding: [{system: "http://terminology.hl7.org/CodeSystem/observation-category", code: social-history}]
  code: {text: "Alcohol use"}
  subject: {reference: "Patient/pt-self"}
  effectiveDateTime: "2026-11-18"
  performer: [{reference: "Patient/pt-self"}]
  valueString: "A glass of wine or two on weekends (owner, 2026-11-18)"
vault:
  narrative: generated
---

# Alcohol use

On 2026-11-18 the owner said: "a glass of wine or two on weekends".

## Links
- Patient: [Pat Sample](../../../patient/pt-self.md)
