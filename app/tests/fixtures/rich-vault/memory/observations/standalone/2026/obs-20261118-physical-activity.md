---
type: observation
title: "Physical activity"
description: "Physical activity · runs 3 times a week · said 2026-11-18"
tags: [observation, lifestyle]
aliases: [exercise, running, activity, workouts, fitness]
generated: {by: "/ownmydata:intake", at: "2026-11-18T12:46:12-07:00"}
sources:
  - resource: "session:2026-11-18"
fhir:
  resourceType: Observation
  id: obs-20261118-physical-activity
  status: final
  category:
    - coding: [{system: "http://terminology.hl7.org/CodeSystem/observation-category", code: activity}]
  code: {text: "Physical activity"}
  subject: {reference: "Patient/pt-self"}
  effectiveDateTime: "2026-11-18"
  performer: [{reference: "Patient/pt-self"}]
  valueString: "Runs 3 times a week (owner, 2026-11-18)"
vault:
  narrative: generated
---

# Physical activity

On 2026-11-18 the owner said: "I run 3 times a week".

## Links
- Patient: [Pat Sample](../../../patient/pt-self.md)
