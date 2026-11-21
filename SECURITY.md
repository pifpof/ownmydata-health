# Security and privacy

Own My Data.Health keeps people's health records, so problems that could expose that data are treated as the most serious kind of bug.

## Reporting a problem

Email **hello@parallel79.com** with "Security" in the subject. Please don't open a public issue for:

- anything that could cause health information to leave the vault folder (into Claude's memory, another folder, a web search, a commit, an export),
- a way the vault template or a skill could put real data into a git repository,
- a way a document or page could instruct Claude to do something the person didn't ask for (prompt injection through a captured document).

Use fictional data to show the problem. You'll get a reply within a few days.

## If real health data was posted here by mistake

If you see real health information in an issue, pull request or commit, email hello@parallel79.com straight away and don't repost or quote it. The maintainers will hide or remove it and, where needed, rewrite history.

## Scope

The plugin runs inside Claude. When a person gives Claude a document, the AI provider processes it; that is outside this project's control and is explained in the README. This project's responsibility is what the skills write and where they write it.
