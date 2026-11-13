# Tech Learning

A static, self-paced drill app for working like a high-leverage engineer in the age of agentic coding tools. It assumes you already know the AI basics and that you learn by doing short, concrete drills.

The app is meant to be hosted with GitHub Pages from the root of `main`. There is no build step.

## Run locally

Serve the repo root with any static file server, then open the printed URL.

```bash
python3 -m http.server 8080
```

Visit `http://localhost:8080`.

Opening `index.html` as a `file://` URL usually works because content is loaded from `data.js`, but a local server is the reliable path and matches GitHub Pages.

Progress is stored in your browser (`localStorage`). Use Export / Import to back it up or move it to another browser. Clearing site data will clear progress unless you have an export.

## Add a module

1. Open `data.js`.
2. Append an object to `modules` with:
   - `id` — stable, unique, lowercase, hyphenated
   - `title`, `rank` (display and drill order)
   - `lesson` — 200 words or fewer
   - `drills` — one to three items, each with `id`, `title`, `prompt`, and `done_when` (an array of completion criteria)
3. Reload the app and walk the new drills once.

Keep module `id` and drill `id` values stable once you start recording progress; they are the storage keys.

To change app behavior (today's-drill picker, export format, theme), edit `app.js` and `styles.css`, not `data.js`.

## What's in the box

| Path | Role |
| --- | --- |
| `index.html` | App shell |
| `styles.css` | Layout and color schemes |
| `app.js` | Progress, navigation, and rendering |
| `data.js` | Lessons, drills, and the CLI comparison table |
| `examples/payments-skill-draft/` | Sample agent draft for the verification drill |
| `AGENTS.md` | Canonical instructions for humans and coding agents |
| `CLAUDE.md` | Pointer to `AGENTS.md` |

## License

MIT, Copyright (c) 2026 Cody Weber.
