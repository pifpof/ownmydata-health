# Interview guide

The intake interview in the order a family doctor takes a new patient's history: safety-critical first (allergies, medications), then the medical story (conditions, hospital stays, surgeries), then the context (family, vaccines, check-ups, lifestyle), then the sensitive sections, each asked about before any question. The guide is a menu, not a script to read out: follow the person, keep each message to **one question**, and skip whatever their answers make irrelevant.

Every section has:

- **Gate**: a yes/no or "anything?" question. "No", "none", "skip" or "not really" ends the section; mark it `done (none)` or `skipped` and move on.
- **For each item**: the follow-ups worth asking, **at most two per item**, in order of clinical value. If the first answer already covers them, don't ask.
- **Writes**: the record each item becomes. Rules for self-reported records are in SKILL.md, Step 4.

Phrasing rules: plain words, no jargon, examples in brackets so the person knows the kind of answer that helps. Never ask for exact dates: "roughly when?" and accept "2015", "in my twenties", "as a kid".

---

## 1. About you

| Ask | Writes |
|---|---|
| "What's your date of birth? Month and year is plenty." | `Patient.birthDate` (`"1980-05"` or full date as given) |
| "For health records, how should I record your sex? (female, male, or something else; or skip)" | `Patient.gender` (`female`, `male`, `other`; skip → leave out). Administrative gender only. If they say something more specific, keep their words in the patient file body. |

## 2. Allergies

**Gate:** "Do you have any allergies or bad reactions: to medicines, foods, or anything else like latex, bee stings or pollen?"

If they mention several, take them one at a time.

**For each:**
1. "What happens when you're exposed to <it>? (for example a rash, swelling, trouble breathing, stomach upset)"
2. Only if the reaction sounds serious and they haven't said: "Have you ever needed emergency treatment for it, like an EpiPen or a hospital visit?"

**Writes:** AllergyIntolerance. `code.text` = the substance in their words. `category` only when obvious (a drug → `medication`, a food → `food`, pollen/latex/insect → `environment`). `reaction[0].manifestation[].text` = what happens; `reaction[0].description` = their wording; `severity` only if they use the words mild, moderate or severe; `criticality: high` only if they say it was life-threatening or needed emergency treatment. "It just upsets my stomach" → `type: intolerance`; otherwise leave `type` out.

## 3. Medications and supplements

**Gate:** "Do you take any medicines regularly? Prescription, over-the-counter, or supplements and vitamins all count."

**For each:**
1. "How much do you take, and how often? (as it says on the label is perfect)"
2. "What do you take it for?" (skip if obvious, e.g. "vitamin D")

Then once, after the list: "Anything you take only now and then, like a puffer, painkillers or sleep aids?"

**Writes:** MedicationStatement, `status: active`, `dosage[].text` as said, the reason as `reasonCode[].text`, `stale_after` six months from today. If the reason is a condition they haven't mentioned yet, note it for section 4.

## 4. Ongoing health conditions

**Gate:** "Has a doctor ever told you that you have a long-term condition? (for example high blood pressure, diabetes, asthma, thyroid, heart, arthritis, migraines)"

**For each:**
1. "Roughly when were you diagnosed?"
2. "Is it still something you're dealing with, or is it settled now?"

**Writes:** Condition, `category: problem-list-item`, `clinicalStatus` `active` (still dealing with it) or `resolved`/`inactive` (settled), onset from step 1.

## 5. Past illnesses and hospital stays

**Gate:** "Have you ever been in hospital overnight, or had a serious illness that's now over? (for example pneumonia, a kidney infection, COVID that hit hard)"

**For each:**
1. "Roughly when was that, and what was it for?" (if they haven't said)
2. "Where were you treated?" (only if they seem to know; it becomes an Organization)

**Writes:** a resolved Condition for the illness; an Encounter (`class: IMP`, `status: finished`, `period.start` partial date if given) for a hospital stay, linked to it. A hospital stay that was for a surgery goes in section 6 instead.

## 6. Surgeries and procedures

**Gate:** "Have you had any operations or procedures? Everything counts, from tonsils or wisdom teeth to scopes, biopsies or a C-section."

**For each:**
1. "Roughly when?"
2. "Any problems afterwards, or did it go fine?"

**Writes:** Procedure, `status: completed`, `performedDateTime` (partial) or `performedString` ("as a child"), `outcome.text` from step 2 if anything was said.

## 7. Injuries

**Gate:** "Any serious injuries over the years: broken bones, a concussion, a bad back or joint injury?"

**For each:**
1. "Roughly when, and does it still bother you?"

**Writes:** Condition with `code.text` the injury, `bodySite[].text` if said, `clinicalStatus` `active` if it still bothers them, else `resolved`.

## 8. Family history

Say once: "Next, your family's health. It helps doctors see what to watch for. Only blood relatives, and only what you know."

**Gate:** "Do you know of any health conditions in your close family: parents, brothers and sisters, children? (heart disease, stroke, cancer, diabetes, high blood pressure, dementia, mental health conditions, anything that runs in the family)"

If no → done. If yes, go relative by relative, **only the ones they name**:

1. "What do you know about your <relative>'s health?"
2. For each condition, if they might know: "Roughly how old were they when that started?"
3. If they haven't said whether the relative is living, and it seems relevant: "Is your <relative> still living?" If not, and only if they seem comfortable: "If you don't mind me asking, how old were they and what was the cause?"

Then once: "Anyone else in the family, like grandparents, aunts or uncles, with something that might run in families?"

**Writes:** one FamilyMemberHistory per relative (`fmh-<relationship>`, e.g. `fmh-mother`, `fmh-brother-2`), `status: completed` (or `partial` if they said they don't know much), `relationship` coded from the table in `resource-map.md` §5, `deceasedBoolean: true` or `deceasedAge` only if said, `condition[]` with `code.text`, `onsetAge` if given, `contributedToDeath: true` if they said it was the cause.

Be gentle. A death in the family is not a data point to the person: acknowledge it in a few words if they mention it ("I'm sorry") and don't press for details.

## 9. Vaccines

**Gate:** "Do you know roughly when you last had any of these: a tetanus shot, a flu shot, COVID vaccines? Rough guesses are fine, and so is 'no idea'."

Then, one at a time, only if they seem to know their history: "Any others, like hepatitis, shingles, pneumonia or travel vaccines?"

**Writes:** Immunization per vaccine they name, `status: completed`, `occurrenceDateTime` (partial) or `occurrenceString` ("about five years ago"), `primarySource: false`, `reportOrigin: {text: "Reported by the owner"}`. "Childhood vaccines all done" → one Immunization with `vaccineCode.text: "Routine childhood vaccines (as reported)"` and `occurrenceString: "childhood"`.

## 10. Check-ups and screenings

**Gate:** "When did you last have a general check-up with your family doctor, roughly?"

Then: "Have you had any screening tests? (for example a colonoscopy, mammogram, Pap test, PSA, bone density scan, or a heart test like an ECG or stress test)"

**For each screening:**
1. "Roughly when, and what did they tell you?"

Then, one question: "And your eyes, teeth and hearing: anything going on there, or regular check-ups?" Only record something specific (glasses since childhood, a hearing aid, a dental implant).

**Writes:** Procedure per screening, `status: completed`, date as given, `outcome.text` = what they were told, in their words ("normal, per the owner", "two polyps removed"). The last check-up is an Encounter with `type.text: "General check-up"` only if they give a rough date.

## 11. Lifestyle

Say once: "A few quick lifestyle questions. Doctors ask these of everyone."

| Ask | Writes (standalone Observation, category `social-history`) |
|---|---|
| "Do you smoke or vape, or did you in the past?" If past: "Roughly when did you stop?" | `code.text: "Tobacco use"`, `valueString` their answer |
| "How much alcohol do you drink in a typical week?" | `code.text: "Alcohol use"`, `valueString` |
| **Gate first:** "Is it OK if I ask about cannabis or other drugs? Skipping is completely fine." Then: "Do you use any, now or in the past?" | `code.text: "Substance use"`, `valueString`, `vault.sensitivity: restricted` |
| "What does exercise look like for you in a normal week?" | `code.text: "Physical activity"`, `valueString`, category `activity` instead of `social-history` |
| "How are you sleeping, generally?" | `code.text: "Sleep"`, `valueString` (only if they say something beyond "fine") |
| "What kind of work do you do? I only ask in case there's anything health-relevant, like shift work, chemicals or noise." | `code.text: "Occupation"`, `valueString` (only if health-relevant or they want it kept) |

"No" and "never" are answers worth keeping for tobacco, alcohol and substances (`valueString: "Never smoked (owner, <date>)"`). For sleep and work, skip "fine" answers.

## 12. Mental health (asked about first; restricted)

**Gate:** "The next section is about mental health: things like anxiety, depression, or anything you've seen someone for. It's completely optional, and it's kept private in your vault. Would you like to include it?"

If yes:
1. "Have you been diagnosed with or treated for anything like that, now or in the past?"
2. For each: "Is it something you're dealing with now, or more in the past?"

**Writes:** Condition with `vault.sensitivity: restricted`, neutral description (`descriptions.md`). Medications they mention here → MedicationStatement, also restricted.

**Safety:** if anything suggests they might harm themselves or are in crisis now, stop the interview and follow the safety rule in CLAUDE.md. Don't return to the interview in that conversation.

## 13. Reproductive and sexual health (asked about first; restricted)

**Gate:** "Next is reproductive and sexual health: things like pregnancies, periods or menopause, contraception, or prostate health. Also optional and kept private. Include it?"

If yes, ask only what fits what they've told you about themselves; never assume from their name.

- Pregnancy history (if relevant): "Have you been pregnant? If so, how many times, and were there any complications?" → Condition per complication; a count goes in an Observation (`code.text: "Pregnancy history"`, `valueString` their words).
- "Anything about periods, menopause or contraception that you'd like your record to show?" → Observation or MedicationStatement as fits, `valueString` their words.
- "Anything else in this area, like a past infection, fertility treatment or prostate issue, that you'd want a doctor to know?" → Condition or Procedure as fits.

**Writes:** all with `vault.sensitivity: restricted`.

## 14. Care team

| Ask | Writes |
|---|---|
| "Who's your family doctor, and at which clinic?" | Practitioner + Organization (resolve against `care-team/index.md` first); `Patient.generalPractitioner` |
| "Any specialists you see regularly?" (if not already known from records) | Practitioner per specialist, specialty in the body and description |
| "Which pharmacy do you use?" | Organization, `type[].text: "Pharmacy"` |

## 15. Devices and implants

**Gate:** "Do you have any medical devices or implants? (for example glasses, hearing aids, a CPAP machine, a pacemaker, joint replacements, an IUD, dental implants)"

**For each:**
1. "Since roughly when?"

**Writes:** Device (`dev-<slug>`), `status: active`, `type.text` their words, `patient`, `note[].text` with "since <when>". An implant from surgery also gets a Procedure in section 6 if they haven't given it already. An IUD goes in as restricted.

## 16. Anything else

"Last question: is there anything else about your health that you'd want a new doctor to know?"

Capture whatever they say by the same rules. Then close (SKILL.md, Step 6).
