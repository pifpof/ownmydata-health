---
type: observation
title: "Tobacco use"
description: "Tobacco use · never smoked · said 2026-11-18"
tags: [observation, lifestyle]
aliases: [smoking, smoker, tobacco, vaping, cigarettes]
generated: {by: "/ownmydata:intake", at: "2026-11-18T12:45:44-07:00"}
sources:
  - resource: "session:2026-11-18"
fhir:
  resourceType: Observation
  id: obs-20261118-tobacco-use
  status: final
  category:
    - coding: [{system: "http://terminology.hl7.org/CodeSystem/observation-category", code: social-history}]
  code: {text: "Tobacco use"}
  subject: {reference: "Patient/pt-self"}
  effectiveDateTime: "2026-11-18"
  performer: [{reference: "Patient/pt-self"}]
  valueString: "Never smoked (owner, 2026-11-18)"
vault:
  narrative: generated
---

# Tobacco use

On 2026-11-18 the owner said they have never smoked.

## Links
- Patient: [Pat Sample](../../../patient/pt-self.md)
