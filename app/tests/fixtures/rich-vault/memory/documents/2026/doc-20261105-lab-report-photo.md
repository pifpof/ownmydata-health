---
type: document-reference
title: "Lab report photo, 2026-11-05"
description: "2026-11-05 · Lab report photo · Example Medical Laboratory"
tags: [document]
generated: {by: "/ownmydata:capture", at: "2026-11-18T08:45:36-07:00"}
sources:
  - resource: "data/documents/2026/2026-11-05-lab-report-photo.png"
fhir:
  resourceType: DocumentReference
  id: doc-20261105-lab-report-photo
  status: current
  type: {text: "Laboratory report"}
  subject: {reference: "Patient/pt-self"}
  date: "2026-11-18T08:45:36-07:00"
  author:
    - {reference: "Organization/org-example-medical-laboratory", display: "Example Medical Laboratory"}
  description: "Photo of a laboratory report from Example Medical Laboratory, collected 2026-11-05. Ferritin value partly obscured by a smudge."
  content:
    - attachment:
        contentType: "image/png"
        url: "data/documents/2026/2026-11-05-lab-report-photo.png"
        title: "Laboratory report (photo), 2026-11-05"
  context:
    related:
      - {reference: "DiagnosticReport/rpt-20261105-blood-tests"}
      - {reference: "Organization/org-example-medical-laboratory"}
      - {reference: "Practitioner/prac-familydoc-family"}
vault:
  source:
    sha256: "ec788342196e43403ae4bd45810f56a1b07a9ad6c1fe748ff75b45cbf7e643b0"
    original_filename: "03-lab-report-photo-smudged-2026-11-05.png"
  narrative: generated
---

# Lab report photo, 2026-11-05

Original as received, never edited: [2026-11-05-lab-report-photo.png](../../../data/documents/2026/2026-11-05-lab-report-photo.png). A smudge covers the middle digit of the ferritin result.

Records made from it:
- [Blood tests, 2026-11-05](../../reports/2026/rpt-20261105-blood-tests.md)
- [Example Medical Laboratory](../../patient/care-team/org-example-medical-laboratory.md) (already in the vault)
- [Dr. B. Familydoc](../../patient/care-team/prac-familydoc-family.md) (ordering clinician, already in the vault)
