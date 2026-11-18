---
name: setup-health-vault
description: "First-time setup for a personal health vault (ownmydata). Use whenever someone says '/setup-health-vault' or '/ownmydata:setup-health-vault', 'set up my health vault', 'start a health vault', wants to start keeping their health records with Claude, or when any ownmydata skill finds no vault in the current folder (no memory.md with layout hv-1.0). Asks only the person's name and where the vault folder should live, copies the empty vault template, explains in one paragraph where the data stays, and ends by inviting the first document. Never asks for medical history up front: the vault learns from documents as they arrive."
version: 0.1.0
allowed-tools: [Read, Write, Edit, Bash]
---

# ownmydata: Set up the health vault

## What This Skill Does

Creates an empty health vault in a folder the person chooses: the folder layout, the router, the hot-state card, the rules files, and a patient file with their name. That's all. Doctors, problems, medications and results arrive later, from the documents they drop in.

It asks two things, one at a time: their name, and where the vault should live. It takes under two minutes of their attention.

---

## Tone and Approach

Warm, brief, plain English. This is the first impression, and the promise of the product is "you don't have to do anything". So: no forms, no medical history questions, no list of features, no tour. Two questions, one paragraph about privacy, one closing line.

Don't use FHIR words with the person. Say "vault", "records", "documents".

---

## Step 0: Check for an existing vault

Work out the candidate folder (the current working folder unless the person already named one). If `<folder>/memory.md` exists, **stop**. Say: "There's already a health vault in this folder, so I've left it as it is. Drop in a document, or say what's going on." Change nothing.

If the person has already said where the vault should go, use that folder for this check instead.

---

## Step 1: Ask their name

Skip this if they already said it. Otherwise ask exactly:

> "What name should the vault use for you? Just how you'd like it shown."

Take the answer as given. Don't split it into first and last name, don't ask for a birth date or anything else. If they volunteer more (birth date, sex, a health card number), you may keep it in step 6; never ask for it.

---

## Step 2: Ask where the vault lives

Skip this if they already said it. Otherwise ask exactly:

> "Where should the vault live? I'll use this folder (`<current folder path>`) unless you name another."

An answer like "here", "this one", "fine" or "yes" means the current folder. A path means that path (create it with `mkdir -p` if it doesn't exist). If the named folder already holds a vault (`memory.md`), go back to Step 0's stop message.

---

## Step 3: Cloud-sync check (one line, never blocks)

If the vault path contains any of `iCloud`, `Mobile Documents`, `Dropbox`, `Google Drive`, `GoogleDrive`, `OneDrive`, `CloudStorage`, `Box Sync`, say one line and carry on unless they object:

> "Heads up: that folder looks like it syncs to a cloud service, so your health records would be copied there too. I'll go ahead; say 'stop' if you'd rather pick a local folder."

Don't wait for an answer. Don't repeat it.

---

## Step 4: Find the vault template

The template is a folder that contains `memory.md`, `CLAUDE.md`, `_gitignore` and `memory/`. Look in this order and use the first that exists:

1. `<this skill's base directory>/references/vault-template/` (present when the skill was installed on its own as a `.skill` file)
2. `<this skill's base directory>/../../schema/` (present when the whole plugin is installed)
3. `$CLAUDE_PLUGIN_ROOT/schema/`, if that variable is set
4. Search: `find ~/.claude ~/Library/Application\ Support/Claude -path '*schema/memory/reference/row-schemas.md' 2>/dev/null | head -1`, then go up three levels.

The skill's base directory is shown when the skill loads. If none of these exists, stop and say: "I can't find the vault template that comes with the plugin, so the install looks incomplete. Reinstalling the ownmydata plugin should fix it." Don't build the vault by hand.

---

## Step 5: Copy the template

With Bash, never overwriting anything:

```bash
cp -Rn "<template>/." "<vault>/"
```

Then the vault's git safety file: if `<vault>/.gitignore` doesn't exist, `mv "<vault>/_gitignore" "<vault>/.gitignore"`. If it does exist, append any of `memory/`, `data/`, `outputs/`, `trash/` that are missing from it, then delete `<vault>/_gitignore`. Delete any `.DS_Store` that came across.

The rules files arrive with the template in `memory/reference/`. The other skills read them from there.

---

## Step 6: Write the patient file and stamp the system files

Get the current time with its offset: `date +%Y-%m-%dT%H:%M:%S%z`, then write the offset with a colon (`-0700` → `-07:00`). Today's date is the first ten characters.

Write `memory/patient/pt-self.md`:

```markdown
---
type: patient
title: "<Name as given>"
description: "The vault owner. One patient per vault."
tags: [patient]
aliases: [me, self]
generated: {by: "/ownmydata:setup-health-vault", at: "<now>"}
sources:
  - resource: "session:<today>"
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

Add `birthDate` or `gender` under `fhir:` only if the person volunteered them (gender is administrative gender: `male`, `female`, `other`, `unknown`).

Then:

- `memory/patient/index.md`: under `## Files`, add `- [<Name>](./pt-self.md): The vault owner. One patient per vault.`
- `memory/patient/log.md`: add `## <today>` and `- **Created** [<Name>](./pt-self.md): vault owner (/ownmydata:setup-health-vault)`
- `memory/reference/log.md`: add `## <today>` and `- **Created** rules files copied from the ownmydata plugin v<version in the template's reference files> (/ownmydata:setup-health-vault)`
- In `memory.md` and `memory/_state.md`, fill the empty `generated` fields: `by: "/ownmydata:setup-health-vault"`, `at: "<now>"`.

---

## Step 7: Privacy, in one paragraph

Say this, in these words or very close:

> "Your vault is set up in `<vault path>`. Everything stays in that folder as plain text files you can open yourself. When you give me a document, its contents are processed by the AI provider to read it, as with anything you share with Claude, but I only ever write your health information into this folder: never into Claude's own memory, and never into a web search. For extra separation, use a Claude Project with its own memory, or an incognito chat, for health sessions. I'm not a doctor: I keep your records straight and tell you what they say, and for anything urgent I'll tell you to get care."

---

## Step 8: Close

End with exactly these two lines and nothing after them:

> "Drop in your first document, or tell me what's going on."
> "When you have 15 minutes, say 'take my health history' and I'll fill in your background (allergies, conditions, family history), one question at a time."

---

## Reminders

- Two questions at most. Never ask about conditions, medications, doctors, allergies or anything else: the vault learns from documents.
- Never overwrite an existing vault or file. `cp -Rn`, and Step 0 first.
- The plugin repository never receives the person's data. The vault is wherever they chose.
- Never write the person's health information to account-level memory.
