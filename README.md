# Own My Data.Health

**We have the right to own our health data.** Own My Data.Health was created on that one belief, and it matters more than ever in a future where AI is becoming part of how our healthcare works.

Today your health story is scattered. A lab report in one portal, a specialist's letter in an email, a prescription in a drawer, a family history that lives only in your memory. Each clinic, insurer and system holds a piece, and none of them holds the whole picture. When AI starts helping with care, it will help most where the picture is complete and accurate. The question is who holds that picture. We believe it should be you.

## Why this exists

1. AI will play a bigger role in our healthcare. Of everything ahead, that is the one thing we can be sure of.
2. AI works best with more data, and with data that is relevant and accurate. The more complete the picture of your health, the better it can help.
3. That picture shouldn't be owned by governments, insurance companies or health providers.
4. It's yours. You have the right to own it, and to use it however you choose.

## A community, not a product

Own My Data.Health is built by people who want the same thing: to **gather** our own health data, **keep it safe**, and **use it to get better care**. Better questions at the next appointment. A complete history when you change doctors. The right numbers in front of the right person. A picture of your health that an AI you choose can actually help with.

We help each other do that. It's open source because owning your data shouldn't depend on any one company, including us. Nothing about it is locked in: if this project vanished tomorrow, your records would still be yours, and still readable.

**If you believe that too, there's a place for you here, whether or not you write code.** See [Contributing](#contributing).

## What it does

Own My Data.Health is a Claude plugin that keeps your health records in a folder of plain text files on your own computer, and does the filing for you.

Drop in a lab report, a visit note, a specialist letter or a photo of one, or just say what happened ("saw the ENT today, she ordered a hearing test"). Claude files the original, writes it up, links it to the problem it belongs to, and later answers "what happened with my ear?" with the records named.

You never fill in a form. You never tag anything. You never answer a question just so a record is complete.

Your records follow HL7 FHIR R4, the standard health systems use, so they're portable to any other system. The folder follows the Open Knowledge Format, so it's in the best shape for any AI to find its way around.

> **Not medical advice.** Own My Data.Health keeps your records straight and tells you what they say. It does not diagnose, prescribe, or tell you to start, stop or change treatment. For sudden or severe symptoms it tells you to get urgent care.

---

## Install

### From the zip file (`ownmydata.zip`)

1. Unzip it. You get a folder called `ownmydata`.
2. In Claude Code, from the folder that contains `ownmydata`:

   ```
   /plugin marketplace add ./ownmydata
   /plugin install ownmydata@ownmydata
   ```

   To try it for one session without installing: `claude --plugin-dir ownmydata.zip`.

### From GitHub

In Claude Code:

```
/plugin marketplace add pifpof/ownmydata-health
/plugin install ownmydata@ownmydata
```

### Single skills (Claude desktop)

Run `./install.sh`, then upload skills one at a time from `dist/*.skill` under Customize → Skills. Start with `setup-health-vault.skill`; it carries the empty vault template.

### Choose a folder for your vault

Pick or create an empty folder on your own computer. Avoid:

- **Cloud-synced folders** (iCloud, Dropbox, Google Drive, OneDrive), unless you're comfortable with your health records being copied there too.
- **Folders inside another Claude vault or a git repository**, so your health records don't mix with other notes or end up in version control.

### Set up a Claude desktop Project (recommended)

A dedicated Project keeps health sessions separate from everything else.

1. Create a new Project and link it to your vault folder.
2. If the Project has a memory setting, turn it off, or make sure that memory isn't shared with your other chats. The vault is the memory.
3. Paste this into the Project instructions:

   ```
   This project is my personal health vault. The linked folder is the vault, and the Own My Data.Health plugin maintains it.

   1. At the start of every conversation, read CLAUDE.md in the vault folder and follow it exactly. It holds the safety, privacy and filing rules. If the folder has no memory.md yet, run /ownmydata:setup-health-vault first.
   2. Use only the Own My Data.Health skills here (/ownmydata:capture, intake, start, save, health-check, recenter). Never use another plugin's capture, sync, save, minutes or query skills in this project, even if a request sounds like one of theirs. Anything health-related goes into this vault and nowhere else.
   3. When I drop in a document or tell you something that happened, capture it. Don't ask me to fill in details.
   4. Never write my health information to Claude's memory, to any other folder or project, or into a web search.
   5. If I describe sudden or severe symptoms, tell me to get urgent care first, before anything else.
   ```

   Point 2 matters if you have other plugins with similar commands (a notes or "chief of staff" plugin, for example). Without it, "add this" with a lab report could be picked up by the wrong plugin and filed outside your vault.

### First run

In the Project (or in Claude Code, inside your vault folder), run:

```
/ownmydata:setup-health-vault
```

It asks two things, your name and where the vault should live, and you're done. Then drop in your first document.

### The viewer app (optional, macOS)

To browse your vault outside Claude, download `ownmydata-<version>-arm64.dmg` (Apple Silicon) or `-x64.dmg` (Intel) from the [latest release](https://github.com/pifpof/ownmydata-health/releases), drag it to Applications, right-click it and choose **Open** the first time (it isn't signed yet), and choose your vault folder. It only reads the folder, never goes online, and keeps private records hidden until you click Show. More in [app/README.md](app/README.md).

---

## Three habits

1. **Hand it over.** Drop in a document or say what happened. `/ownmydata:capture` is there if you want it, but "add this" works. After saving, Claude lists the numbers it read so you can glance at them against the original. If one is wrong, say so and it's fixed. If you don't reply, nothing happens.
2. **Open with `/ownmydata:start`.** A few lines on what's open: each problem being followed, its last event, and what you're waiting on.
3. **Close with `/ownmydata:save`.** Anything you mentioned that isn't filed yet gets filed, and the summary for next time is refreshed. When you say a problem is over ("the ear thing is sorted"), save closes it with a short written conclusion.

**Once, when you have 15 minutes: `/ownmydata:intake`** (or "take my health history"). Claude asks the questions a family doctor asks a new patient, one at a time: allergies, medicines, conditions, operations, family history, vaccines, check-ups, lifestyle, and, only if you say yes, mental and reproductive health. Skip anything, pause any time; every answer is saved as you go.

Every so often, `/ownmydata:health-check` checks the vault and tidies its indexes. `/ownmydata:recenter` re-reads the vault's rules if a long session starts to drift.

---

## What's in a vault

```
your-vault/
├── CLAUDE.md          how Claude behaves in this vault: safety rules, privacy, tone
├── memory.md          the map
├── memory/            your records, one markdown file each
│   ├── _state.md      what's open right now
│   ├── episodes/      one page per problem being followed ("Left ear investigation")
│   ├── conditions/  encounters/  reports/  medications/  procedures/ ...
│   ├── patient/       you, plus care-team/ (doctors, clinics, labs)
│   └── reference/     the rules Claude follows when it writes
├── data/
│   ├── documents/     your originals, exactly as received, never edited
│   └── load-log.md    a fingerprint of every original, so nothing is filed twice
└── outputs/  trash/
```

Each record is a plain markdown file you can read. The data inside it follows **HL7 FHIR R4**, the standard health systems use, so it can be exported later. The folder follows the **Open Knowledge Format v0.2** (markdown, frontmatter, an index and a change log per folder). See `examples/sample-vault/` for a complete fictional vault.

How it stays trustworthy:

- **Copied, never computed.** Values, units, reference ranges and flags are copied exactly as the source prints them. Nothing is converted, and no range or flag is invented.
- **No invented codes.** A medical code is written only when the document prints it, or when it matches a short, checked allow-list by name and unit.
- **Absent stays absent.** If the document doesn't say it, the record doesn't either.
- **Every answer names its source**, and says when a value hasn't been checked against the original.

---

## Privacy

- Your vault is a folder on your computer. This repository contains code, an empty vault template and fictional examples, never anyone's real data.
- When you give Claude a document, its contents are processed by the AI provider so it can be read, as with anything you share with Claude.
- Claude writes your health information **only into the vault**: never into its own account memory, and never into a web search. For extra separation, run health sessions in a Claude Project with its own memory, or in an incognito chat.
- Setup warns you, in one line, if the folder you pick syncs to a cloud service.
- The vault's `.gitignore` keeps `memory/`, `data/`, `outputs/` and `trash/` out of git, in case you ever put the folder under version control. Never push a real vault to a public repository.

## What the plugin runs, sends and fetches

- **Runs:** seven skills that read and write markdown files in your vault folder. Four tools are used: Read, Write, Edit and Bash; `recenter` only reads. Bash is used for file work and nothing else:
  - `date`, for timestamps;
  - `mkdir`, `cp` and `mv`, to create folders and file your originals: a document you hand over is copied into `data/documents/`, and one dropped in `data/inbox/` is moved there;
  - `shasum`, to fingerprint originals so nothing is filed twice;
  - `find` and `grep`, to list and search the vault;
  - `git ls-files`, during `health-check` only if your vault is inside a git repository, to check that no health files are tracked. It never commits or pushes.
- **Reads outside your vault:** setup reads the empty vault template that ships with the plugin. If it can't find it next to the skill, it looks for the plugin's own files under `~/.claude` or `~/Library/Application Support/Claude`. Capture reads the documents you hand it, wherever they are.
- **Has none of these:** no hooks, no MCP servers, no background processes.
- **Sends:** nothing. The plugin makes no network requests and has no servers, accounts or telemetry.
- **Fetches:** nothing. The one web address inside the skills, `https://ownmydata.health/CodeSystem/…`, is a label written into records for values without a standard code. It is never opened.
- **Your AI provider:** sees whatever you share with it in the chat, as in any chat.
- **The viewer app (optional):** read-only, and it never goes online. A content security policy and a block in the app's network session stop every request, so there are no update checks, telemetry or remote fonts. Clicking a web link in a record opens it in your normal browser.

---

## Status

v0.2.0. Skills: `setup-health-vault`, `capture`, `intake`, `start`, `save`, `health-check`, `recenter`. Reads PDFs, photos of documents, pasted text and plain sentences. Plus a read-only viewer app for macOS (`app/`).

Planned: wearable imports into monthly ledgers, trend pages, visit-prep briefs, a question-answering skill, FHIR export and import.

The plugin itself is the `plugin/` folder (skills, the empty vault template and the manifest); everything else in this repository is the viewer app, docs, examples and tests. Design document: `docs/architecture-spec.md` (the knowledge-base architecture). Changes by version: `CHANGELOG.md`. Expected behaviour on the fictional fixtures: `fixtures/EXPECTED.md`; latest acceptance run: `tests/acceptance.md`.

## Contributing

Code, test documents, translations, reviews of the format, or just telling us what broke: all of it helps. Start with [CONTRIBUTING.md](CONTRIBUTING.md). Two rules matter more than any other:

- **No real health data in this repository, ever.** Issues, pull requests, fixtures and examples use fictional records only.
- **No forms, no required fields.** The format shapes what Claude writes, never what the person has to supply.

Please read the [Code of Conduct](CODE_OF_CONDUCT.md). To report a security or privacy problem, see [SECURITY.md](SECURITY.md). Website: [ownmydata.health](https://ownmydata.health).

## License

MIT, © 2026 1617289 B.C. Ltd. See [LICENSE](LICENSE) and [NOTICE.md](NOTICE.md).

Code allow-list content from LOINC® (http://loinc.org), copyright © Regenstrief Institute, Inc., used under the LOINC license.
