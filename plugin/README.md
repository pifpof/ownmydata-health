# Own My Data.Health

**Own your health data.** Own My Data.Health keeps your health records in a folder of plain text files on your own computer, and Claude does the filing for you.

Drop in a lab report, a visit note, a specialist letter or a photo of one, or just say what happened ("saw the ENT today, she ordered a hearing test"). Claude files the original, writes it up, links it to the problem it belongs to, and later answers "what happened with my ear?" with the records named.

You never fill in a form. You never tag anything. You never answer a question just so a record is complete.

**Who it's for:** anyone who wants one complete, accurate record of their own health, kept by them and not by a portal, a clinic or an insurer. That includes people managing a long-running condition, preparing for appointments, changing doctors, or keeping records for a family member who has asked them to.

> **Not medical advice.** Own My Data.Health keeps your records straight and tells you what they say. It does not diagnose, prescribe, or tell you to start, stop or change treatment. For sudden or severe symptoms it tells you to get urgent care.

## Install

In Claude Code:

```
/plugin marketplace add pifpof/ownmydata-health
/plugin install ownmydata@ownmydata
```

Then pick an empty folder on your computer for your vault. Avoid cloud-synced folders and git repositories. In that folder, run:

```
/ownmydata:setup-health-vault
```

Setup asks two things, your name and where the vault should live. Then drop in your first document.

For extra separation, run your health sessions in a dedicated Claude Project linked to the vault folder, with its memory turned off. The full guide, including the Project instructions to paste in, is in the [repository README](https://github.com/pifpof/ownmydata-health#readme).

## The seven skills

- **setup-health-vault**: creates your vault from the empty template. Two questions, nothing else.
- **capture**: files a document, photo, pasted text or plain sentence. Keeps the original untouched, writes the record, links it to the problem it belongs to, and lists the numbers it read so you can check them.
- **intake**: a health history interview, one question at a time, covering what a family doctor asks a new patient. Skip anything and pause any time. Mental and reproductive health are asked about only if you say yes.
- **start**: a short brief at the start of a session: what's open, the latest on each problem, and what you're waiting on.
- **save**: at the end of a session, files anything not yet filed, refreshes the summary, and closes problems you say are over.
- **health-check**: checks the vault and tidies its indexes.
- **recenter**: re-reads the vault's rules if a long session starts to drift.

## How records stay trustworthy

Each record is a plain markdown file you can read. The data follows HL7 FHIR R4, the standard health systems use, and the folder follows the Open Knowledge Format v0.2, so any AI can find its way around it.

- **Copied, never computed.** Values, units, ranges and flags are copied exactly as the source prints them.
- **No invented codes.** A medical code is written only when the document prints it, or when it matches a short, checked list.
- **Absent stays absent.** If the document doesn't say it, the record doesn't either.
- **Every answer names its source.**

## Privacy

- Full privacy policy: [ownmydata.health/legal/privacy.html](https://ownmydata.health/legal/privacy.html).
- Your vault is a folder on your computer. The plugin contains code and an empty vault template, never anyone's real data.
- When you give Claude a document, its contents are processed by the AI provider so it can be read, as with anything you share with Claude.
- Claude writes your health information only into the vault: never into its own account memory, and never into a web search.
- The vault's own .gitignore keeps your records out of git, in case you ever put the folder under version control.

## What the plugin runs, sends and fetches

- **Runs:** seven skills that read and write markdown files in your vault folder. Four tools are used: Read, Write, Edit and Bash; recenter only reads. The skills don't pre-approve any of them, so Claude Code asks before a skill writes a file or runs a command, unless you've allowed it in your settings. Bash is used for file work and nothing else:
  - date, for timestamps;
  - mkdir, cp and mv, to create folders and file your originals: a document you hand over is copied into the vault's documents folder, and one dropped in the vault's inbox is moved there;
  - shasum, to fingerprint originals so nothing is filed twice;
  - find and grep, to list and search the vault;
  - git ls-files, during health-check only if your vault is inside a git repository, to check that no health files are tracked. It never commits or pushes.
- **Reads outside your vault:** setup reads the empty vault template that ships with the plugin. If it can't find it next to the skill, it looks for the plugin's own files under your Claude folders (~/.claude or ~/Library/Application Support/Claude). Capture reads the documents you hand it, wherever they are.
- **Has none of these:** no hooks, no MCP servers, no background processes.
- **Sends:** nothing. The plugin makes no network requests and has no servers, accounts or telemetry.
- **Fetches:** nothing. The one web address inside the skills (an ownmydata.health CodeSystem address) is a label written into records for values without a standard code. It is never opened.
- **Your AI provider:** sees whatever you share with it in the chat, as in any chat.

## More

The [ownmydata-health repository](https://github.com/pifpof/ownmydata-health) also has:
- an optional read-only viewer app for macOS, which never goes online;
- the help guides;
- a complete fictional example vault;
- the design documents.

Open source under the MIT licence, © 2026 1617289 B.C. Ltd. See the LICENSE and NOTICE.md files. Contact: hello@parallel79.com. Website: [ownmydata.health](https://ownmydata.health).
