# SECCEWLMMS

A small React web app for visualizing a personal daily-habit scoring system tracked in a Google Sheet.

**SECCEWLMMS** is an acronym for the ten things scored each day — **S**leep, **E**at, **C**lean, **C**urtail (internet), **E**xercise, **W**ork, **L**augh, **M**editate, **M**usic, **S**ocialize. Each gets a 0–10 score with a weight, producing a single weighted daily percentage. The sheet also records which sports/exercises were done that day.

## Goal

Turn a habit-tracking spreadsheet into a browsable dashboard:

- See every day's raw scores in a sortable / filterable table.
- Watch trends over time (day / week / month / year) for the overall score and any individual metric.
- See which sports you do most, sliceable by date range and weekday.

The Google Sheet stays the single source of truth — the app only reads from it.

## Features

- **`/rawdata`** — the full *SCORES* table. Click any header to sort; filter the text columns (date, weekday, sports, comment).
- **`/analytics`**
  - *Score timegraph* — a thick black line for the overall score (plotted on a 0–10 scale), with optional dotted colored lines per metric. Switch the x-axis between day/week/month/year, filter by date range and weekday/weekend.
  - *Sport barchart* — one bar per sport, ordered most→least frequent. Filter by date range and toggle specific weekdays (e.g. "all Mondays and Tuesdays in a range").
- **`/definitions`** — the list of sport categories plus the ten scoring metrics and their weights.
- Pastel / retro styling; current page highlighted in blue.

## How it works

```
Browser (React + Vite)  →  GET /api/scores , /api/selector  →  Local Node API (Vite middleware)
                                                                  │ Sheets API v4 + service account (JWT, read-only)
                                                                  ▼
                                                        Google Sheet (PRIVATE)
```

Google service accounts authenticate by signing a JWT with a private key. That **must** happen server-side, so a tiny Vite middleware plugin (`vite.config.js` + `server/sheets.mjs`) does the auth and proxies read-only sheet data to the frontend. The private key never reaches the browser, and the sheet can stay fully private (shared only with the service account). The auth is dependency-free — it uses Node's built-in `crypto` and `fetch`.

## Reuse it with your own sheet

### 1. Set up the sheet

Create a Google Sheet with two tabs:

- **`SCORES`** — columns in this order: `Date`, `Wkd` (weekday abbreviation like `Mon`), then the 10 metric scores, then `%` (weighted total like `82.14%`), then `X1`, `X2`, `X3` (sports done that day), and an optional `Comment`. See `example.txt` and `explanation.txt`.
- **`Selector`** — a single column with header `VALUES` listing the valid sport names. See `selector_eaxmples.txt`.

If your layout differs, adjust the column mapping in `src/lib/transform.js` and the metric list in `src/lib/metrics.js`.

### 2. Create a service account

1. In the [Google Cloud Console](https://console.cloud.google.com/), create (or pick) a project.
2. Enable the **Google Sheets API**.
3. Create a **service account**, then create a **JSON key** for it and download it.
4. Save that file as `useraccount.json` in the project root. *(It is git-ignored — see `useraccount.example.json` for its shape.)*
5. **Share your Google Sheet** with the service account's email (the `client_email` field in the JSON) as a **Viewer**. The sheet does not need to be public.

### 3. Configure environment

```bash
cp .env.example .env
# edit .env and set SHEET_URL to your sheet's URL
```

### 4. Run

```bash
npm install
npm run dev
```

Open http://localhost:5173. Vite serves the app and the `/api/*` endpoints together — one process, no separate backend to run.

## Project structure

```
server/sheets.mjs        # zero-dep service-account auth + Sheets read helper
vite.config.js           # Vite config + local /api middleware plugin
src/
  App.jsx                # routes + data loading
  lib/
    useData.js           # fetches + parses both tabs
    transform.js         # parsing, filtering, time-bucketing, sport counts
    metrics.js           # metric definitions, weights, colors
  pages/                 # RawData, Analytics, Definitions
  charts/                # ScoreTimeGraph, SportBarChart
  components/            # Nav, FilterControls
```

## Tech stack

React, Vite, React Router, Recharts, date-fns. Node 18+ recommended (uses global `fetch`).

## Privacy & security

- `useraccount.json` (your private key) and `.env` (your sheet URL) are **git-ignored** — never commit them.
- The sample data in `example.txt`, `explanation.txt`, and `selector_eaxmples.txt` is illustrative; replace it with your own or remove it.
- The app is read-only and intended to run locally.

## License

MIT — do whatever you like.
