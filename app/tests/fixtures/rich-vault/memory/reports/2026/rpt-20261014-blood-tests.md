---
type: diagnostic-report
title: "Blood tests, 2026-10-14"
description: "2026-10-14 · Lab · Glucose, creatinine, WBC, RBC · 1 low (WBC)"
tags: [report, lab]
aliases: [bloodwork, blood test, October bloodwork, annual physical bloodwork, fasting labs, Glucose, fasting, fasting glucose, blood sugar, Creatinine, kidney, WBC, white count, white blood cells, RBC, red count, red blood cells]
generated: {by: "/ownmydata:capture", at: "2026-11-18T08:46:29-07:00"}
verified: {by: "human:owner", at: "2026-11-18T08:46:41-07:00"}
sources:
  - resource: "data/documents/2026/2026-10-14-lab-report.pdf"
fhir:
  resourceType: DiagnosticReport
  id: rpt-20261014-blood-tests
  status: final
  category:
    - coding: [{system: "http://terminology.hl7.org/CodeSystem/v2-0074", code: LAB}]
  code: {text: "Blood tests"}
  subject: {reference: "Patient/pt-self"}
  effectiveDateTime: "2026-10-14T07:45:00-07:00"
  issued: "2026-10-14T16:20:00-07:00"
  performer:
    - {reference: "Organization/org-example-medical-laboratory", display: "Example Medical Laboratory"}
vault:
  rowSchema: lab-v1
  inherit:
    status: final
    subject: "Patient/pt-self"
    category: laboratory
    effectiveDateTime: "2026-10-14T07:45:00-07:00"
    performer: "Organization/org-example-medical-laboratory"
  documents: ["DocumentReference/doc-20261014-lab-report"]
  coding_note: "Glucose, fasting, Creatinine and WBC codes as printed on the report. RBC code from the allow-list (not printed on the report)."
  narrative: generated
---

# Blood tests, 2026-10-14

Collected 2026-10-14 at 07:45, reported 2026-10-14 at 16:20 by Example Medical Laboratory. Ordered by Dr. B. Familydoc. Clinical information on the report: "Annual physical, fasting". Ranges and flags are the laboratory's own; the report notes "Ranges are for adults. Flags: H high, L low."

## Results

| Analyte | Code | Value | Unit | Range | Flag | Note |
|---|---|---|---|---|---|---|
| Glucose, fasting | loinc:2345-7 | 5.2 | mmol/L | 3.3–6.0 | | |
| Creatinine | loinc:2160-0 | 87 | umol/L | 45–90 | | value given by owner; the PDF prints 78 |
| WBC | loinc:6690-2 | 3.9 | x10E9/L | 4.0–11.0 | L | |
| RBC | loinc:789-8 | 4.6 | x10E12/L | 4.2–5.8 | | code from allow-list |

## Links
- Lab: [Example Medical Laboratory](../../patient/care-team/org-example-medical-laboratory.md)
- Ordered by: [Dr. B. Familydoc](../../patient/care-team/prac-familydoc-family.md)
- Source: [Lab report PDF, 2026-10-14](../../documents/2026/doc-20261014-lab-report.md)
