---
type: encounter
title: "Hearing test, 2026-11-18"
description: "2026-11-18 · Hearing test · audiology clinic · results expected in about two weeks"
tags: [encounter, episode/ep-20261012-left-ear]
aliases: [hearing test, audiology, audiology appointment, audiogram, hearing check]
generated: {by: "/ownmydata:capture", at: "2026-11-18T08:45:12-07:00"}
sources:
  - resource: "session:2026-11-18"
fhir:
  resourceType: Encounter
  id: enc-20261118-hearing-test
  status: finished
  class: {system: "http://terminology.hl7.org/CodeSystem/v3-ActCode", code: AMB, display: ambulatory}
  type:
    - text: "Hearing test"
  subject: {reference: "Patient/pt-self"}
  period:
    start: "2026-11-18"
vault:
  episode: ep-20261012-left-ear
  narrative: additional
---

# Hearing test, 2026-11-18

The owner said: "Had a hearing test today at the audiology clinic, results in two weeks." This is the audiology step planned at the [ENT consult, 2026-10-12](./enc-20261012-ent-consult.md). The clinic wasn't named. Results are expected in about two weeks (said 2026-11-18).

## Links
- Episode: [Left ear investigation](../../episodes/ep-20261012-left-ear.md)
- Problem: [Left-sided hearing loss, likely conductive](../../conditions/cond-20261012-hearing-loss-left.md)
- Ordered at: [ENT consult, 2026-10-12](./enc-20261012-ent-consult.md)
