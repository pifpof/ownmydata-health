---
type: reference
title: "Record templates"
description: "A filled-in skeleton for every record type v0.1 writes, including the episode hub and the patient file."
tags: [reference, system]
aliases: [templates, skeletons]
generated:
  by: "ownmydata plugin"
  at: "2026-11-18"
sources:
  - resource: "ownmydata plugin v0.1.0"
---

# Record templates

Skeletons only. Every `<…>` is filled from the source or **deleted with its line**. An element the source doesn't support is left out entirely, never written empty. Optional elements are marked `# if stated`. Rules: [file-format.md](./file-format.md); allowed values: [resource-map.md](./resource-map.md) §5.

## Patient (`memory/patient/pt-self.md`)

```markdown
---
type: patient
title: "<Name as given>"
description: "The vault owner. One patient per vault."
tags: [patient]
aliases: [me, self]
generated: {by: "/ownmydata:setup-health-vault", at: "<now>"}
sources:
  - resource: "session:<yyyy-mm-dd>"
fhir:
  resourceType: Patient
  id: pt-self
  name:
    - text: "<Name as given>"
vault:
  sensitivity: restricted
  narrative: generated
---

# <Name as given>

The vault owner. Everything in this vault is about this person.
```

## Practitioner / Organization (`memory/patient/care-team/`)

```markdown
---
type: practitioner
title: "<Dr. A. Example>"
description: "<name · role or specialty · where>"
tags: [care-team, practitioner]
aliases: [<surname>, <"my ENT">]
generated: {by: "/ownmydata:capture", at: "<now>"}
sources:
  - resource: "<data/documents/… or session:…>"
fhir:
  resourceType: Practitioner
  id: prac-<surname>-<word>
  name:
    - text: "<as printed>"
  qualification:                       # if stated
    - code: {text: "<MD>"}
vault:
  narrative: additional
---

# <Dr. A. Example>

<Role/specialty as printed>, <organization>. First seen in the records on <date>.

## Links
- [<Organization>](./org-<…>.md)
- Seen at: [<visit title>](../../encounters/<yyyy>/<enc id>.md)
```

Organization: `type: organization`, tags `[care-team, organization]`, `fhir: {resourceType: Organization, id: org-<slug>, name: "<as printed>", type: [{text: "<ENT clinic>"}], address: [{text: "<as printed>"}]}`.

## Encounter (`memory/encounters/<yyyy>/`)

```markdown
---
type: encounter
title: "<ENT consult>, <yyyy-mm-dd>"
description: "<date · setting · clinician · reason/outcome>"
tags: [encounter, episode/<ep id>]
aliases: [<ENT visit>, <ear doctor>]
generated: {by: "/ownmydata:capture", at: "<now>"}
sources:
  - resource: "<data/documents/… or session:…>"
fhir:
  resourceType: Encounter
  id: enc-<yyyymmdd>-<slug>
  status: finished
  class: {system: "http://terminology.hl7.org/CodeSystem/v3-ActCode", code: AMB, display: ambulatory}   # if evident
  type:
    - text: "<ENT consultation>"
  subject: {reference: "Patient/pt-self"}
  participant:                          # if stated
    - individual: {reference: "Practitioner/<id>", display: "<name>"}
  period:
    start: "<date, or date-time with offset>"
  reasonCode:                           # if stated
    - text: "<as written>"
  diagnosis:                            # if a Condition was recorded at this visit
    - condition: {reference: "Condition/<id>", display: "<name>"}
  serviceProvider: {reference: "Organization/<id>", display: "<name>"}   # if stated
vault:
  episode: <ep id>                      # if attached
  documents: ["DocumentReference/<doc id>"]   # if from a file
  narrative: additional
---

# <ENT consult>, <yyyy-mm-dd>

<Who, where, why, in one or two sentences.>

**Findings:** <as written, quoted where clinical>.
**Impression:** "<quoted>" (<clinician>).
**Plan:**
1. <as written>

## Links
- Problem: [<Condition title>](../../conditions/<cond id>.md)
- Episode: [<Episode title>](../../episodes/<ep id>.md)
- Clinician: [<name>](../../patient/care-team/<prac id>.md)
- Source: [<document title>](../../documents/<yyyy>/<doc id>.md)
```

## Condition (`memory/conditions/`)

```markdown
---
type: condition
title: "<as written>"
description: "<onset · name · clinical status · episode>"
tags: [condition, active, episode/<ep id>]
aliases: [<left ear>, <hearing loss>, <ear thing>]
generated: {by: "/ownmydata:capture", at: "<now>"}
sources:
  - resource: "<…>"
fhir:
  resourceType: Condition
  id: cond-<yyyymmdd>-<slug>
  clinicalStatus:
    coding: [{system: "http://terminology.hl7.org/CodeSystem/condition-clinical", code: active}]
  verificationStatus:                   # only from the document's wording
    coding: [{system: "http://terminology.hl7.org/CodeSystem/condition-ver-status", code: provisional}]
  category:
    - coding: [{system: "http://terminology.hl7.org/CodeSystem/condition-category", code: problem-list-item}]
  code: {text: "<as written>"}
  bodySite: [{text: "<Left ear>"}]      # if stated
  subject: {reference: "Patient/pt-self"}
  encounter: {reference: "Encounter/<id>"}
  onsetDateTime: "<yyyy-mm>"            # if stated
  recordedDate: "<yyyy-mm-dd>"
  asserter: {reference: "Practitioner/<id>", display: "<name>"}
vault:
  episode: <ep id>
  coding_note: "Source gives no code; text only, by policy."
  narrative: additional
---

# <as written>

Recorded by <clinician> at the <date> <visit>. Status: **active**, verification **<provisional>**. The note says: "<quote>".

## Links
- Episode: [<title>](../episodes/<ep id>.md)
- Visit: [<title>](../encounters/<yyyy>/<enc id>.md)
- Source: [<title>](../documents/<yyyy>/<doc id>.md)
```

## DiagnosticReport with lab results (`memory/reports/<yyyy>/`)

```markdown
---
type: diagnostic-report
title: "Blood tests, <yyyy-mm-dd>"
description: "<date · Lab · panel · flags>"
tags: [report, lab]
aliases: [bloodwork, blood test, <analyte names and short forms>]
generated: {by: "/ownmydata:capture", at: "<now>"}
sources:
  - resource: "data/documents/<yyyy>/<file>"
fhir:
  resourceType: DiagnosticReport
  id: rpt-<yyyymmdd>-<slug>
  status: final
  category:
    - coding: [{system: "http://terminology.hl7.org/CodeSystem/v2-0074", code: LAB}]
  code: {text: "<panel as printed, or Blood tests>"}
  subject: {reference: "Patient/pt-self"}
  effectiveDateTime: "<collected, with offset>"
  issued: "<reported, with offset>"     # if printed
  performer:
    - {reference: "Organization/<lab id>", display: "<lab name>"}
vault:
  rowSchema: lab-v1
  inherit:
    status: final
    subject: "Patient/pt-self"
    category: laboratory
    effectiveDateTime: "<same as above>"
    performer: "Organization/<lab id>"
  documents: ["DocumentReference/<doc id>"]
  narrative: generated
---

# Blood tests, <yyyy-mm-dd>

Collected <time>, reported <time> by <lab>. Ordered by <clinician, if printed>. Clinical information on the report: "<as printed>". Ranges and flags are the laboratory's own.

## Results

| Analyte | Code | Value | Unit | Range | Flag | Note |
|---|---|---|---|---|---|---|
| <as printed> | <loinc:… or blank> | <as printed> | <as printed> | <low–high> | <printed flag or blank> | |

## Links
- Lab: [<lab>](../../patient/care-team/<org id>.md)
- Ordered by: [<clinician>](../../patient/care-team/<prac id>.md)
- Source: [<title>](../../documents/<yyyy>/<doc id>.md)
```

A non-lab report (audiology, imaging): same file, no `rowSchema`/`inherit`, category `AU`/`RAD`, and a `## Findings` section quoting the report, plus `conclusion` in `fhir:` if the report prints one.

## DocumentReference (`memory/documents/<yyyy>/`)

```markdown
---
type: document-reference
title: "<Consultation note> PDF, <yyyy-mm-dd>"
description: "<date · kind · issuer>"
tags: [document]
generated: {by: "/ownmydata:capture", at: "<now>"}
sources:
  - resource: "data/documents/<yyyy>/<file>"
fhir:
  resourceType: DocumentReference
  id: doc-<yyyymmdd>-<slug>
  status: current
  type: {text: "<Consultation note>"}
  subject: {reference: "Patient/pt-self"}
  date: "<now, with offset>"
  author: [{reference: "<Practitioner or Organization>/<id>", display: "<name>"}]   # if stated
  description: "<one line>"
  content:
    - attachment:
        contentType: "<application/pdf | image/png | image/jpeg | text/plain>"
        url: "data/documents/<yyyy>/<file>"
        title: "<title>"
  context:
    encounter: [{reference: "Encounter/<id>"}]     # if there is one
    related:
      - {reference: "<Type>/<id>"}                 # every record made from it
vault:
  source:
    sha256: "<hex>"
    original_filename: "<name as received>"
  narrative: generated
---

# <Consultation note> PDF, <yyyy-mm-dd>

Original as received, never edited: [<file>](../../../data/documents/<yyyy>/<file>). Records made from it: [<title>](../../<folder>/<id>.md).
```

## Episode hub (`memory/episodes/`)

```markdown
---
type: episode
title: "<Left ear investigation>"
description: "<status · period · anchor problem · last event>"
tags: [episode, active]
aliases: [<ear thing>, <left ear>, <hearing>]
generated: {by: "/ownmydata:capture", at: "<now>"}
sources:
  - resource: "<…>"
vault:
  episode:
    status: active
    period:
      start: "<yyyy-mm or date>"
    anchor: "Condition/<id>"
    export_as: EpisodeOfCare
  narrative: additional
---

# <Left ear investigation>

**Summary.** <Two or three sentences from the records: what, since when, where it stands.>

**Care team:** [<name>](../patient/care-team/<id>.md)

## Open items
- <Pending result, planned follow-up, as written in the records>

## Open questions for next visit
- <Only questions the records or the person raised>

## Timeline
<!-- timeline:start -->
| Date | What | Link |
|---|---|---|
| <yyyy-mm-dd> | <ENT consult: audiology ordered> | [visit](../encounters/<yyyy>/<id>.md) |
<!-- timeline:end -->

## Conclusion
_Written when the episode is finished._
```

The timeline between the markers is regenerated from every record whose `vault.episode` is this hub's id, oldest first. Everything outside the markers is preserved.

## MedicationStatement (`memory/medications/`)

```yaml
type: medication-statement
fhir:
  resourceType: MedicationStatement
  id: med-<yyyymmdd>-<slug>
  status: <see required-field-defaults>
  medicationCodeableConcept: {text: "<as written>"}
  subject: {reference: "Patient/pt-self"}
  context: {reference: "Encounter/<id>"}          # if prescribed at a visit
  dateAsserted: "<yyyy-mm-dd>"
  informationSource: {reference: "Practitioner/<id>"}   # or Patient/pt-self for the person's own words
  dosage: [{text: "<exactly as written>"}]        # if stated
```

Add `stale_after` (six months on) only when the person says they take it now.

## Procedure, Observation, AllergyIntolerance, Immunization

Same header pattern. `fhir:` per [resource-map.md](./resource-map.md) §5, tags `[procedure]`, `[observation]`, `[allergy]`, `[immunization]`. AllergyIntolerance and Immunization use `patient:` instead of `subject:`.
