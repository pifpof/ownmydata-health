---
type: family-member-history
title: "Mother"
description: "Mother · type 2 diabetes (dx ~55)"
tags: [family-history]
aliases: [mum, mom, mother, mother's side, diabetes in the family]
generated: {by: "/ownmydata:intake", at: "2026-11-18T12:44:42-07:00"}
sources:
  - resource: "session:2026-11-18"
fhir:
  resourceType: FamilyMemberHistory
  id: fmh-mother
  status: completed
  patient: {reference: "Patient/pt-self"}
  relationship:
    coding: [{system: "http://terminology.hl7.org/CodeSystem/v3-RoleCode", code: MTH, display: mother}]
    text: "mum"
  condition:
    - code: {text: "Type 2 diabetes"}
      onsetString: "around 55"
vault:
  narrative: generated
---

# Mother

On 2026-11-18 the owner said: "my mum has type 2 diabetes", diagnosed "around 55".

## Links
- Patient: [Pat Sample](../patient/pt-self.md)
