---
type: procedure
title: "Ear wax cleared at the clinic"
description: "Ear wax cleared at the clinic · completed · reported by owner 2026-11-18"
tags: [procedure, episode/ep-20261012-left-ear]
aliases: [ear wax removal, wax cleared, ear cleaned, ear syringing, ear wax]
generated: {by: "/ownmydata:save", at: "2026-11-18T08:46:56-07:00"}
sources:
  - resource: "session:2026-11-18"
fhir:
  resourceType: Procedure
  id: proc-20261118-ear-wax-cleared
  status: completed
  code: {text: "Ear wax cleared at the clinic"}
  subject: {reference: "Patient/pt-self"}
  reasonReference:
    - {reference: "Condition/cond-20261012-hearing-loss-left", display: "Left-sided hearing loss, likely conductive"}
  note:
    - text: "Owner, 2026-11-18: \"The ear thing is sorted, it was wax, cleared at the clinic\""
vault:
  episode: ep-20261012-left-ear
  narrative: additional
---

# Ear wax cleared at the clinic

On 2026-11-18 the owner said: "The ear thing is sorted, it was wax, cleared at the clinic." This is the owner's account; there is no clinic record of it in the vault.

## Links
- Episode: [Left ear investigation](../episodes/ep-20261012-left-ear.md)
- Problem: [Left-sided hearing loss, likely conductive](../conditions/cond-20261012-hearing-loss-left.md)
