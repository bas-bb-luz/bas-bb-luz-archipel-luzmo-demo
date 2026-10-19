# Luzmo trial portal

From a Luzmo trial key and a company website to a branded, multi-tenant analytics portal in about ten minutes. Self-service editing, a report builder, an AI assistant and scheduled exports are included. Everything is built inside the trial user's own Luzmo account, for any industry.

## What a trial user does

1. **Connect Luzmo.** Region, API key and token, plus their work email for exports. "Test connection" makes one call to Luzmo. The key stays in the browser tab (sessionStorage) and only ever goes to Luzmo.
2. **Company and brand.** Paste the website and click "Fetch brand". The server reads the HTML and CSS and returns the company name, logo options, primary, accent and button colours, fonts and the industry. Then name the insights module (for example "Acme Insights") and the AI assistant (for example "Acme AI"). Manual entry always works.
3. **Data and features.** The industry is preselected from the website (SaaS, e-commerce, logistics, healthcare, HR, payments, education, marketing, manufacturing, real estate, hospitality or generic). The customer organisations (tenants) are editable. Eight features are on by default and each can be switched off.
4. **Build.** Creates the datasets with synthetic data, column descriptions, a theme and the dashboards in their Luzmo account, then checks Luzmo IQ and opens the portal.
5. **Deploy and take home.** Vercel, localhost or a single file, plus four downloads.

The wizard output is config, not code. It is one `portal.json` (brand, tenants, datasets, pages, features), and the same code serves every trial user.

## The portal

- One Luzmo dashboard per page, embedded by id. Anything changed in Luzmo shows in the portal on the next load. **Open in Luzmo** in the top bar proves it.
- **Viewing as** switches organisation. Every organisation gets its own embed token with a row-level filter on the tenant column.
- **Drill-downs.** Clicking a bar or slice filters the whole dashboard, down to a detail table at the bottom of every page. In the "All organisations" view, clicking an organisation offers "Drill into ..." to open the portal as that organisation.
- **Edit dashboard** on every dashboard, with a choice between the **Full editor** (Luzmo's embedded editor, `editFull`) and the **Report builder** (Analytics Components Kit). Shared template pages are never overwritten. Edits land in one "(my version)" copy per organisation.
- **One AI assistant**, floating bottom left, with an "Expand" mode. It answers questions with text and live charts, builds dashboards, changes the open dashboard, and adds any chart to a dashboard. Without Luzmo IQ on the account it shows a clear note and a "Request Luzmo IQ" button.
- **Export** on every dashboard. Download PDF, download PNG, email now, schedule email. The **Scheduled exports** page lists schedules for the organisation.
- **How it's built** drawer on every page. Short explanation, numbered steps, a copyable snippet and doc links for nine topics.
- **Top bar** with Book a technical call, Open in Luzmo, Invite a teammate and "Take this with you" (downloads and share link).

## Downloads (none contain a key or token)

| Download | For | Contents |
| --- | --- | --- |
| Starter kit (zip) | Engineer or CTO | This code with `portal.json` prefilled, `HOW-IT-IS-BUILT.md`, `DEMO-SCRIPT.md` |
| One-file demo (HTML) | PM | The whole portal in one file. It asks for the key when opened |
| How it's built (MD) | CTO | Architecture, token flow, API calls, where keys live, production changes |
| Demo script (MD) | PM, to pitch the CPO | A 5-minute walkthrough of their own portal |

## Three ways to run it

| Mode | When | Where the key lives |
| --- | --- | --- |
| Hosted wizard | No `portal.json` or no key on the server. The hosted trial | The user's browser tab only |
| Deployed portal | `portal.json` plus `LUZMO_API_KEY` and `LUZMO_API_TOKEN` on the server | Vercel Environment Variables or `.env` |
| Single file | `window.__LOCAL__` in the HTML | The browser, while the file is open |

### Vercel

1. Import this repository in Vercel (Add New, Project). If it sits in a subfolder of a bigger repo, set **Root Directory** to that folder (`luzmo-trial`). Framework preset: Other.
2. For the **hosted trial wizard**, add no Luzmo variables at all. The site then runs the wizard.
3. For a **deployed portal** (the starter kit), add these under Settings, Environment Variables. Names exactly like this:
   - `LUZMO_API_KEY` and `LUZMO_API_TOKEN`
   - `SETUP_SECRET`, a password for the setup page
   - US accounts only: `LUZMO_API_HOST=https://api.us.luzmo.com`
   - Optional: `PORTAL_JSON` with the contents of `portal.json`, instead of committing the file
4. Deploy. A deployment only sees variables that existed when it was built, so redeploy after adding them.

### Localhost

```bash
cp .env.example .env   # fill in the key and token, or leave empty for the wizard
npm run dev            # http://localhost:3000
```

### Single file

`npm run build:single` writes `dist/<slug>-demo.html` from `portal.json`. The wizard and the portal can also download it directly.

## Settings for the trial host

`public/trial-settings.js` holds three public settings.

- `LUZMO_TRIAL_TRACK_URL`. Where funnel events are POSTed. Events always go to `window.dataLayer` and fire a `luzmo-trial-event` DOM event.
- `LUZMO_TRIAL_TEMPLATE_REPO`. A public GitHub repo for the one-click "Deploy to Vercel" button.
- `LUZMO_TRIAL_DEBUG`. Logs every event in the console.

Tracked events: `wizard_started`, `luzmo_connected`, `brand_fetched` (success or manual), `industry_changed`, `toggles_changed`, `setup_started`, `setup_finished` (with seconds and time since wizard start), `portal_opened`, `tenant_switched`, `edit_opened`, `builder_opened`, `builder_used`, `dashboard_saved`, `ai_opened`, `ai_question_asked`, `ai_chart_added`, `ai_dashboard_built`, `iq_missing`, `export_created`, `schedule_created`, `drill_through`, `howto_opened`, `download`, `deploy_option`, `share_link_copied`, `cta_clicked` and `activated`. Activation means setup finished plus an AI question, a dashboard edit or an export in the same session.

## Files

| Path | What it does |
| --- | --- |
| `public/wizard.js` | The trial wizard, the live preview and the deploy panel |
| `public/generator.js` | Industry library and detection, `buildPortal` (portal.json) and the seeded data generator |
| `public/core.js` | Luzmo logic shared by browser and server. Setup steps, discovery, tokens, dashboards, schedules |
| `public/app.js` | The portal. Pages, Edit dashboard (full editor and report builder), assistant, exports, drill-downs, How it's built, CTA bar |
| `public/howto.js` | How it's built content, the architecture document and the demo script |
| `public/kit.js` | Downloads (zip writer, single file, markdown) |
| `public/track.js` | Funnel events |
| `api/brand.js` | Fetches a website and its CSS server-side and extracts the brand (`api/_lib/brand.js`) |
| `api/config.js` | Tells the browser to run the wizard or the deployed portal |
| `api/setup.js`, `api/token.js`, `api/dashboards.js`, `api/exports.js` | Deployed portal functions. The key stays server-side |
| `scripts/build-kit.js` | Writes `public/kit/sources.json` so the browser can zip the starter kit. Vercel build command |
| `public/vendor/` | `@luzmo/embed` 8.1.0 and the bundled Analytics Components Kit 1.0.8 |
| `test/` | Mock Luzmo server, unit tests and a Playwright end-to-end run |

## Tests

```bash
npm test
```

Unit tests cover brand extraction, industry detection, the generator for every industry and the zip writer. The end-to-end test runs the full wizard in Chromium against a mock Luzmo API: connect, brand, build, portal, tenant switch, edit menus, exports, How it's built and downloads. It also checks that no download contains the key.

## Long-term

Inside the Luzmo app the wizard should use the logged-in session instead of an API key. Steps 2 to 5 stay the same.
