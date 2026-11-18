---
type: patient
title: "Pat Sample"
description: "The vault owner. One patient per vault."
tags: [patient]
aliases: [me, self]
generated: {by: "/ownmydata:setup-health-vault", at: "2026-11-18T08:42:04-07:00"}
sources:
  - resource: "session:2026-11-18"
fhir:
  resourceType: Patient
  id: pt-self
  name:
    - text: "Pat Sample"
vault:
  sensitivity: restricted
  narrative: generated
---

# Pat Sample

The vault owner. Everything in this vault is about this person.
