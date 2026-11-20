---
type: device
title: "Glasses"
description: "Glasses · active · since age 10"
tags: [device, active]
aliases: [glasses, spectacles, eyeglasses, vision correction]
generated: {by: "/ownmydata:intake", at: "2026-11-18T12:47:52-07:00"}
sources:
  - resource: "session:2026-11-18"
fhir:
  resourceType: Device
  id: dev-glasses
  status: active
  type: {text: "Glasses"}
  patient: {reference: "Patient/pt-self"}
  note:
    - text: "Worn since age 10 (owner, 2026-11-18)"
vault:
  narrative: generated
---

# Glasses

From what the owner said on 2026-11-18: has worn glasses since age 10.

## Links
- Patient: [Pat Sample](../pt-self.md)
