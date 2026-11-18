---
type: reference
title: "Code allow-list"
description: "The only LOINC codes Claude may add when a source prints none. Exact name and unit matches only. LOINC attribution."
tags: [reference, system]
aliases: [loinc, codes, coding rule]
generated:
  by: "ownmydata plugin"
  at: "2026-11-18"
sources:
  - resource: "ownmydata plugin v0.1.0"
---

# Code allow-list

## The coding rule

1. **`text` always.** `code.text` (or the Analyte column) carries the source's own wording.
2. **A code only if** (a) the source prints it, (b) the item matches an entry below **exactly**, by name **and** unit, or (c) the person gives it.
3. **Never write a code from memory**, however sure you are. Unsure → no code, and `vault.coding_note` says why ("Source gives no code; not on the allow-list.").
4. A code the source prints is copied as printed, even if it isn't on this list.
5. Diagnoses, procedures, body sites, medications (SNOMED CT, ICD-10, RxNorm, DIN) and vaccines (CVX) are coded **only** when the source prints the code. This plugin ships no tables for them.

## How to match

An entry matches only when **both** hold:

- the printed name, ignoring case and punctuation, is one of the entry's **names**, and
- the printed unit is one of the entry's **units** (the unit tells you which LOINC code applies: glucose in mmol/L and glucose in mg/dL have **different** codes).

No unit printed → no match. When a code is added from this list, write it in the Code column (`loinc:789-8`) and set `vault.coding_note: "<analyte> code from the allow-list (not printed on the report)."`. In a `fhir:` `coding` entry use `system: "http://loinc.org"`.

## Laboratory

| LOINC | Long name | Names that match | Units that match |
|---|---|---|---|
| 2345-7 | Glucose [Mass/volume] in Serum or Plasma | Glucose; Glucose, serum; Glucose, plasma; Glucose, random | mg/dL |
| 2160-0 | Creatinine [Mass/volume] in Serum or Plasma | Creatinine; Creatinine, serum; Serum creatinine | mg/dL |
| 6690-2 | Leukocytes [#/volume] in Blood by Automated count | WBC; White blood cells; White blood cell count; Leukocytes; White cell count | x10E9/L; 10*9/L; 10^9/L; x10^9/L; 10E9/L; x10E3/uL; 10*3/uL; 10^3/uL; K/uL |
| 789-8 | Erythrocytes [#/volume] in Blood by Automated count | RBC; Red blood cells; Red blood cell count; Erythrocytes; Red cell count | x10E12/L; 10*12/L; 10^12/L; x10^12/L; 10E12/L; x10E6/uL; 10*6/uL; 10^6/uL; M/uL |

Not on this list, so never added unless printed: fasting glucose (a different code from 2345-7), glucose or creatinine in mmol/L or umol/L (different codes), hemoglobin, ferritin, TSH, HbA1c, lipids, electrolytes. They are added to this list only after each code has been checked against LOINC for the exact property and unit.

## Vital signs and body measurements

| LOINC | Long name | Names that match | Units that match |
|---|---|---|---|
| 8867-4 | Heart rate | Heart rate; Pulse; HR | /min; bpm; beats/min |
| 40443-4 | Heart rate --resting | Resting heart rate; Resting HR; RHR | /min; bpm; beats/min |
| 8480-6 | Systolic blood pressure | Systolic; Systolic blood pressure | mm[Hg]; mmHg |
| 8462-4 | Diastolic blood pressure | Diastolic; Diastolic blood pressure | mm[Hg]; mmHg |
| 8310-5 | Body temperature | Temperature; Body temperature; Temp | Cel; °C; C; [degF]; °F; F |
| 9279-1 | Respiratory rate | Respiratory rate; Breathing rate; RR | /min; breaths/min |
| 59408-5 | Oxygen saturation in Arterial blood by Pulse oximetry | SpO2; Oxygen saturation (pulse oximeter); O2 sat | %|
| 29463-7 | Body weight | Weight; Body weight | kg; lb; lbs; [lb_av] |
| 8302-2 | Body height | Height; Body height | cm; m; in; [in_i] |
| 39156-5 | Body mass index (BMI) [Ratio] | BMI; Body mass index | kg/m2; kg/m² |

2708-6 (oxygen saturation in arterial blood, from a blood gas) is printed on hospital blood-gas reports; copy it only when printed.

## Activity (reserved for the wearables skill in a later version)

41950-7 (number of steps in 24 hours, measured), 55411-3 (exercise duration), 73985-4 (exercise activity). Not used by v0.1.

## Attribution

This material contains content from LOINC® (http://loinc.org). LOINC is copyright © Regenstrief Institute, Inc. and the Logical Observation Identifiers Names and Codes (LOINC) Committee and is available at no cost under the license at http://loinc.org/license. LOINC® is a registered United States trademark of Regenstrief Institute, Inc.
