---
type: reference
title: "Row schemas"
description: "The lab-v1 results table: columns, what each maps to in FHIR, and how to write values, units, ranges and flags."
tags: [reference, system]
aliases: [lab table, lab-v1, results table]
generated:
  by: "ownmydata plugin"
  at: "2026-11-18"
sources:
  - resource: "ownmydata plugin v0.1.0"
---

# Row schemas

v0.1 has one schema: `lab-v1`. Ledger schemas (`ledger-quantity-v1`, `ledger-bp-v1`, `ledger-symptom-v1`, `ledger-workout-v1`) arrive with wearables in a later version.

## `lab-v1`

A lab report is **one** DiagnosticReport file. Each result is one row of a table under `## Results` in the body. On export each row becomes an Observation, merged with `vault.inherit` and referenced from `DiagnosticReport.result`. The table is the only copy of the values: they are not repeated in the YAML.

Set in the frontmatter: `vault.rowSchema: lab-v1` and

```yaml
vault:
  rowSchema: lab-v1
  inherit:
    status: final
    subject: "Patient/pt-self"
    category: laboratory
    effectiveDateTime: "<same as fhir.effectiveDateTime>"
    performer: "Organization/<lab id>"
```

The header is exactly this, seven columns, in this order:

```
| Analyte | Code | Value | Unit | Range | Flag | Note |
|---|---|---|---|---|---|---|
```

| Column | FHIR target | How to write it |
|---|---|---|
| **Analyte** | `Observation.code.text` | The test name **as printed**: "Glucose, fasting", "WBC". Not expanded, not renamed. |
| **Code** | `Observation.code.coding` | `loinc:<code>` when the report prints a LOINC code for that row. Otherwise an exact allow-list match ([code-allowlist.md](./code-allowlist.md)). Otherwise **blank**. |
| **Value** | `valueQuantity.value`, `valueString`, or a quantity with `comparator` | Exactly as printed: `5.2`, `78`, `<0.5`, `>90`, `Negative`. Don't round, don't add or drop trailing zeros (`4.60` stays `4.60`). A character you can't read is written as `?` (`1?2`), never guessed; if you can't read the value at all, leave it blank. Either way, say so in Note. |
| **Unit** | `valueQuantity.unit` | Exactly as printed: `x10E9/L` stays `x10E9/L`, `umol/L` stays `umol/L`. **Never convert, never translate to UCUM in this column.** Not printed → blank, and Note says "unit not printed". |
| **Range** | `referenceRange.low`/`high`/`text` | The lab's own range, as printed. Two-sided ranges are written `low–high` with an en dash (`3.3–6.0` for a printed `3.3 - 6.0`); numbers unchanged. One-sided or text ranges as printed (`<5.0`, `>60`, `Negative`). Not printed → blank. **Never computed, never from memory.** |
| **Flag** | `interpretation` | Only what the lab printed, as one of `H`, `L`, `N`, `HH`, `LL`, `A`. A printed word that clearly means one of these (High, Low, Abnormal) is written as the letter. Anything else printed (`*`, `!`) → blank, and Note quotes it. **Not printed → blank**, even if the value is outside the range. |
| **Note** | `note` | Short: "middle digit obscured on photo", "unit not printed", "flag printed as *", "code from allow-list". Blank otherwise. |

Rows keep the report's order. One row per printed result. Section headings on the report (e.g. "Hematology") are not rows; mention them in the body if useful.

### Example

```
## Results

| Analyte | Code | Value | Unit | Range | Flag | Note |
|---|---|---|---|---|---|---|
| Glucose, fasting | loinc:2345-7 | 5.2 | mmol/L | 3.3–6.0 | | |
| WBC | loinc:6690-2 | 3.9 | x10E9/L | 4.0–11.0 | L | |
| Ferritin | | 1?2 | ug/L | 30–300 | | middle digit obscured on photo |
| TSH | | 2.1 | | 0.32–5.04 | | unit not printed |
```

### Corrections

When the person corrects a value, change only that cell (and the Note if it described the uncertainty, e.g. clear "middle digit obscured" once they give the digit, replacing it with "value given by owner"). Log it in the year folder's `log.md`: `- **Corrected** [Title](./file.md): creatinine 78 → 87 umol/L (owner)`.
