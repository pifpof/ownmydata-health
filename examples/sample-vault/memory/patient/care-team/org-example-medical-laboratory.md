---
type: organization
title: "Example Medical Laboratory"
description: "Example Medical Laboratory · Laboratory · Exampletown"
tags: [care-team, organization]
aliases: [lab, the lab, blood lab, Example Lab]
generated: {by: "/ownmydata:capture", at: "2026-11-18T08:45:36-07:00"}
sources:
  - resource: "data/documents/2026/2026-10-14-lab-report.pdf"
  - resource: "data/documents/2026/2026-11-05-lab-report-photo.png"
fhir:
  resourceType: Organization
  id: org-example-medical-laboratory
  name: "Example Medical Laboratory"
  type:
    - text: "Laboratory"
  address:
    - text: "200 Specimen Road, Exampletown"
vault:
  narrative: generated
---

# Example Medical Laboratory

Laboratory at 200 Specimen Road, Exampletown. First seen in the records on 2026-10-14.

## Links
- Report: [Blood tests, 2026-10-14](../../reports/2026/rpt-20261014-blood-tests.md)
- Report: [Blood tests, 2026-11-05](../../reports/2026/rpt-20261105-blood-tests.md)
