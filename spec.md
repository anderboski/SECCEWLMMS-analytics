# BUSINESS DEFINITION

We are going to create a webapp which will have information about my SECCEWLMMS scores. This is an sheet I use to track information about how my day went (how I slept, ate, sozialiced, exercised, etc.) as well as a few additional columns for the exercise done (e.g. maybe one day I did biceps, back and also went climbing). The data is in a google sheets, so the webapp will need to connect to it.

The explanation on each of the different columns is in this path under /explanation.txt. A few example results can be found in this path under /example.txt. Also examples of *selector* can be found under /selector_examples.txt

In the google sheet, the scores live under *SCORES* tab and *Selector* containes all the categories available for sports.

# TECHNICAL DEFINITION
The web application should be built using REACT. It should have two pages:
* /rawdata - Displays the raw data in *SCORES* as a filterable table
* /analytics - Contains the different analytics
* /definitions - Contains the definitions in *Selector*

## /rawdata
This is a simple table. There has to be options to order and filter the table by each of the different columns.

## /definitions
Another simple page. It displays the information in a simple format.

## /analytics
This page should contain the following two graphs, which are independent.
* Score timegraph: a linegraph plot. 
    * Y axis: score from 0 to 10 (convert % to 0-100)
    * X axis: timeline. Possible to choose between day, week, month and year scale
    * Plot: thick black smooth line for main score. Dotted, more transparent, different coloured lines for all other values individually. Each line has the metric name with the same color near it.
    * Filters: Possible to filter only for weekdays or weekends (default both). Possible to choose start date and end date (default all data). Possible to choose which metrics to display (they don't effect main score (%). Default all)
* Sport barchart:
    * One bar of a different colour for each sport in *Selector*. Ordered from most frequent to least frequent.
    * Filters: Possible to filter only for weekdays or weekends (default both). Possible to choose start date and end date (default all data). Possible to choose which metrics to display (they don't effect main score (%). Default all)

## Navigation
top right of the page should contain 3 buttons, one for each of the pages. Current page coloured blue.

## Colour palette
Pastel colour, a bit of a retro look.

## Source of data

The data lives in a private Google Sheet, read via the **Google Sheets API v4** authenticated with a **service account** (e.g. `<name>@<project>.iam.gserviceaccount.com`). The app runs locally only.

Because a service account requires signing a JWT with its private key, authentication **must happen server-side** — it cannot run in the browser. The app therefore has a **small local backend** (Node) that authenticates and proxies read-only sheet data to the React frontend. The sheet stays **fully private** (shared only with the service account); no credentials are exposed to the client.

### Architecture
```
Browser (React)  →  GET /api/scores , /api/selector  →  Local Node API
                                                            │ Sheets API v4 + service account (JWT, readonly scope)
                                                            ▼
                                                  Google Sheet (PRIVATE)
```

### Connection details
* **Auth:** Service account JSON (`useraccount.json`, git-ignored) signs an RS256 JWT (scope `https://www.googleapis.com/auth/spreadsheets.readonly`), exchanged at the Google token endpoint for an access token. Node's built-in `crypto`/`fetch` can do this with zero dependencies; the real app may use `googleapis`/`google-auth-library` for convenience.
* **Sharing:** The sheet is shared with the service account email as **Viewer**. It does **not** need to be public.
* **Read:** `GET https://sheets.googleapis.com/v4/spreadsheets/{SPREADSHEET_ID}/values/{RANGE}` with `Authorization: Bearer {token}`.
  * *SCORES* range: `SCORES!A1:Q` (Date, Wkd, 10 metrics, %, X1–X3).
  * *Selector* range: `Selector!A1:A` (single column, header `VALUES`).
* **Config / secrets:** `SHEET_URL` (spreadsheet ID derived from it) in git-ignored `.env`; service account JSON kept local and git-ignored. Neither is shipped to the browser.
* **Caching/refresh:** Data fetched on page load; (optional) a manual refresh control.

### Connection status
* ✓ Service account auth verified (token obtained).
* ✓ Sheet shared with the service account; reads succeed (660 score rows, 12 sports).
* Run locally with `npm install` then `npm run dev` (Vite serves the app + `/api/*` on http://localhost:5173).

### Build decisions / notes
* Main score `%` is plotted on the 0–10 axis as `value ÷ 10` (e.g. 82.14% → 8.21) so it shares the metrics' scale.
* *SCORES* also has a trailing `Comment` column (Q); shown in the raw-data table. Rows with trailing empty cells are normalized client-side.
* The sport barchart omits the "which metrics to display" filter (it was copied from the line chart and has no effect on sport counts); it keeps the meaningful weekday/weekend + date-range filters.
* /definitions shows the Selector sport categories plus the 10 scoring-metric definitions (weights from `explanation.txt`).
* Stack: React + Vite, react-router-dom, Recharts; backend auth is zero-dependency (Node `crypto`/`fetch`) in a Vite middleware plugin.

### Data layout (from `example.txt` + `explanation.txt`)
*SCORES* columns, in order:
* `Date`, `Wkd` (weekday abbreviation)
* 10 metric score columns (0–10), mapped to full names **by position** (headers repeat letters), forming "SECCEWLMMS":
  1. S (wt 1.5) — Sleep well
  2. E (wt 1.0) — Eat / drink well
  3. C (wt 1.0) — Clean self / Environment
  4. C (wt 1.5) — Curtail Internet Use
  5. E (wt 1.5) — Exercise
  6. W (wt 1.5) — Work a bit
  7. L (wt 0.5) — Laugh
  8. M (wt 1.0) — Meditate + Journal
  9. M (wt 0.5) — Listen to music + sing
  10. S (wt 0.5) — Socialize
* `%` — weighted main score (e.g. `82.14%`); convert to 0–100 for the score timegraph.
* `X1`, `X2`, `X3` — sports/exercises done that day; values are drawn from the *Selector* tab.

*Selector* tab: a single column with header `VALUES`, listing the available sport/exercise names (e.g. Pec, Biceps, Back, Triceps, …). These are the valid values for the `X1`–`X3` columns, the source for the sport barchart, and the content of the /definitions page.

### Inputs still needed from the user
* Share the sheet with the service account's email (found in `useraccount.json` as `client_email`) as Viewer.

