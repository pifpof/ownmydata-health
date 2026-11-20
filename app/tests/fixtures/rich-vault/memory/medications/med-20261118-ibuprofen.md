---
type: medication-statement
title: "Ibuprofen, as needed"
description: "Ibuprofen · now and then · active, said 2026-11-18 · for headaches"
tags: [medication]
aliases: [ibuprofen, advil, nurofen, painkiller]
generated: {by: "/ownmydata:intake", at: "2026-11-18T12:39:03-07:00"}
sources:
  - resource: "session:2026-11-18"
stale_after: 2027-05-18
fhir:
  resourceType: MedicationStatement
  id: med-20261118-ibuprofen
  status: active
  medicationCodeableConcept: {text: "Ibuprofen"}
  subject: {reference: "Patient/pt-self"}
  dateAsserted: "2026-11-18"
  informationSource: {reference: "Patient/pt-self"}
  reasonCode:
    - text: "Headaches"
  dosage:
    - text: "Now and then"
      asNeededBoolean: true
vault:
  narrative: generated
---

# Ibuprofen, as needed

From what the owner said on 2026-11-18: takes ibuprofen now and then for headaches.

## Links
- Patient: [Pat Sample](../patient/pt-self.md)
