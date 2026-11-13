# Agent instructions

This file is the only canonical source of project rules. Tool-specific files such as `CLAUDE.md` or `GEMINI.md` must only point here. Do not add or edit rules in those files.

## What this repo is

Two static sites on GitHub Pages (served from the root of `main`). No bundler.

1. **Tech Learning** (this directory’s `index.html`) — adult engineering drills. Edit lessons in `data.js`. App behavior lives in `app.js` and `styles.css`.
2. **Homeschool** (`homeschool/`) — family learning homes. Canonical rules: `homeschool/AGENTS.md`, `homeschool/SPEC.md`, `homeschool/DESIGN.md`. Faith-friendly Christian family content is allowed **in that tree only**.

## Homeschool exception to the public-content rule

The root “never include names of minors” rule is relaxed **only** for the six first names in `homeschool/stages.json` (folders + UI). Still never last names, birth dates, photos of the learners, addresses, school or medical details, or grade labels. Do not copy homeschool first names into the adult Tech Learning app.

## Public content rule

This repository is public. Keep every file generic and professional.

Never include:

- Family names, names of minors or a spouse, or household details
- Health information, finances, addresses, or phone numbers
- Employer or client names, or anything that identifies a specific engagement
- Private repository names, internal bot identifiers, or personal or faith-related goals
- Secrets, tokens, credentials, or live environment values

Do not paste private skill text, private paths, or review notes that would identify a private system. If a drill uses a private skill, the learner keeps that material off this repo and off the in-app notes they might later export and share.

## Content structure

Modules in `data.js` are ranked. Keep that order unless the maintainer changes the learning plan.

Each module has:

- A short lesson (200 words or fewer)
- One to three drills
- A `done_when` list for every drill — concrete completion criteria, not vibes

Current module intent:

1. Verification habit — checklist review of agent output
2. Hands-on practice loop — short daily drills with agentic CLIs; plan, implement, review
3. Private-to-public generalization — turn private `SKILL.md` files into generic public skills
4. Stack depth with agents — MCP, Kotlin/Spring or JVM, Rails, containers
5. AI-era estimation and pricing — fixed fee vs time and materials; price judgment and outcomes, not hours

The first verification drill uses `examples/payments-skill-draft/`. Treat that folder as an agent-written draft, not as a finished public skill.

## Product rules

- Progress (checkboxes and notes) is stored in `localStorage` and must be exportable and importable as JSON.
- "Today's drill" is the next incomplete drill in module order.
- The CLI comparison table may use only well-known, verifiable facts. Do not invent version numbers, prices, benchmarks, or unconfirmed command flags.
- Stay accessible: semantic HTML, labels, keyboard access, visible focus, and `prefers-color-scheme` (with an optional override).
- Prefer a local static server for development. Do not add a bundler, framework, or npm build.

## Agent workflow

Plan the change and its done-when first. Implement the smallest diff that lands it. Review the diff, run or describe the checks, and scan for private references before you consider the work done.

Research is not authorization. Finding a possible approach, URL, or command does not authorize publishing, committing to a remote, or changing anyone else's systems.

Do not create GitHub remotes, repositories, or Pages settings unless the maintainer explicitly asks. Do not commit secrets.
