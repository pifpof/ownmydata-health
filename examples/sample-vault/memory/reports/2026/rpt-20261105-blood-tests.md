---
type: diagnostic-report
title: "Blood tests, 2026-11-05"
description: "2026-11-05 · Lab · Ferritin, hemoglobin, TSH · no flags · 1 value unclear"
tags: [report, lab]
aliases: [bloodwork, blood test, November bloodwork, fatigue bloodwork, follow-up labs, Ferritin, iron, iron stores, Hemoglobin, Hb, Hgb, haemoglobin, TSH, thyroid, thyroid stimulating hormone]
generated: {by: "/ownmydata:capture", at: "2026-11-18T08:45:36-07:00"}
sources:
  - resource: "data/documents/2026/2026-11-05-lab-report-photo.png"
fhir:
  resourceType: DiagnosticReport
  id: rpt-20261105-blood-tests
  status: final
  category:
    - coding: [{system: "http://terminology.hl7.org/CodeSystem/v2-0074", code: LAB}]
  code: {text: "Blood tests"}
  subject: {reference: "Patient/pt-self"}
  effectiveDateTime: "2026-11-05T07:45:00-07:00"
  issued: "2026-11-05T16:20:00-07:00"
  performer:
    - {reference: "Organization/org-example-medical-laboratory", display: "Example Medical Laboratory"}
vault:
  rowSchema: lab-v1
  inherit:
    status: final
    subject: "Patient/pt-self"
    category: laboratory
    effectiveDateTime: "2026-11-05T07:45:00-07:00"
    performer: "Organization/org-example-medical-laboratory"
  documents: ["DocumentReference/doc-20261105-lab-report-photo"]
  coding_note: "Hemoglobin code as printed on the report. Ferritin and TSH: no code printed; not on the allow-list."
  narrative: generated
---

# Blood tests, 2026-11-05

Collected 2026-11-05 at 07:45, reported 2026-11-05 at 16:20 by Example Medical Laboratory. Ordered by Dr. B. Familydoc. Clinical information on the report: "Follow-up, fatigue". Ranges and flags are the laboratory's own; the report notes "Ranges are for adults. Flags: H high, L low." No values are flagged on the report.

Read from a photo of the printed report. The middle digit of the ferritin value is covered by a smudge and can't be read. The report prints no unit for TSH.

## Results

| Analyte | Code | Value | Unit | Range | Flag | Note |
|---|---|---|---|---|---|---|
| Ferritin | | 1?2 | ug/L | 30–300 | | middle digit obscured on photo |
| Hemoglobin | loinc:718-7 | 147 | g/L | 135–175 | | |
| TSH | | 2.1 | | 0.32–5.04 | | unit not printed |

## Links
- Lab: [Example Medical Laboratory](../../patient/care-team/org-example-medical-laboratory.md)
- Ordered by: [Dr. B. Familydoc](../../patient/care-team/prac-familydoc-family.md)
- Source: [Lab report photo, 2026-11-05](../../documents/2026/doc-20261105-lab-report-photo.md)
