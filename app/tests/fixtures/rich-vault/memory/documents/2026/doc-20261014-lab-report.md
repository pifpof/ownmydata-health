---
type: document-reference
title: "Lab report PDF, 2026-10-14"
description: "2026-10-14 · Lab report PDF · Example Medical Laboratory"
tags: [document]
generated: {by: "/ownmydata:capture", at: "2026-11-18T08:44:10-07:00"}
verified: {by: "human:owner", at: "2026-11-18T08:46:41-07:00"}
sources:
  - resource: "data/documents/2026/2026-10-14-lab-report.pdf"
fhir:
  resourceType: DocumentReference
  id: doc-20261014-lab-report
  status: current
  type: {text: "Laboratory report"}
  subject: {reference: "Patient/pt-self"}
  date: "2026-11-18T08:44:10-07:00"
  author:
    - {reference: "Organization/org-example-medical-laboratory", display: "Example Medical Laboratory"}
  description: "Laboratory report from Example Medical Laboratory, collected 2026-10-14."
  content:
    - attachment:
        contentType: "application/pdf"
        url: "data/documents/2026/2026-10-14-lab-report.pdf"
        title: "Laboratory report, 2026-10-14"
  context:
    related:
      - {reference: "DiagnosticReport/rpt-20261014-blood-tests"}
      - {reference: "Organization/org-example-medical-laboratory"}
      - {reference: "Practitioner/prac-familydoc-family"}
vault:
  source:
    sha256: "3852ae7ecf3341e4c11594b7fc061f77a1b2292da91b5da5af60d8f9faea5b66"
    original_filename: "02-lab-report-2026-10-14.pdf"
  narrative: generated
---

# Lab report PDF, 2026-10-14

Original as received, never edited: [2026-10-14-lab-report.pdf](../../../data/documents/2026/2026-10-14-lab-report.pdf). One page.

Records made from it:
- [Blood tests, 2026-10-14](../../reports/2026/rpt-20261014-blood-tests.md)
- [Example Medical Laboratory](../../patient/care-team/org-example-medical-laboratory.md)
- [Dr. B. Familydoc](../../patient/care-team/prac-familydoc-family.md) (ordering clinician, already in the vault)
