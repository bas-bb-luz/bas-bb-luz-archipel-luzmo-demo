# Archipel Insights: Luzmo demo portal

A branded Luzmo demo for Archipel Academy. Templated dashboards per organisation (row-level security), self-service with the Embedded Dashboard Editor (EDE) and the ACK report builder, and an AI assistant that answers questions and builds or changes dashboards. Patterns follow the Otto Group demo.

## Deploy on Vercel

1. Import this GitHub repository in Vercel (Add New, Project). Framework preset: Other. Keep the other defaults.
2. Add environment variables in Vercel (Settings, Environment Variables). Names must be exactly these, in capitals with underscores:
   - `LUZMO_API_KEY` and `LUZMO_API_TOKEN` from a Luzmo demo account (Profile, API tokens). Copy them with the copy buttons in Luzmo.
   - `SETUP_SECRET`: a password for the setup page (recommended)
   - Only for US accounts: `LUZMO_API_HOST=https://api.us.luzmo.com` and `LUZMO_APP_SERVER=https://app.us.luzmo.com`
3. Deploy. If you added the variables after the first deploy, redeploy (Deployments, the top one, ⋯, Redeploy): a deployment only sees variables that existed when it was built.
4. Open the URL and click "Set up Luzmo". It loads the data, theme and dashboards (about a minute).
5. Later runs open the portal straight away. Add `?setup` to the URL to load the data again.

Do not put the key or token in `.env.example` or any other file in the repo. Vercel only reads the Environment Variables in its settings.

### Troubleshooting

Open `/api/config` on your deployment. `"configured": false` means the server has no key or token; `"missing"` and `"seenVariables"` show which names it does see (names only, never values). `"luzmoError"` means Luzmo rejected the key or token.

The API key and token stay on the server. The browser only gets short-lived embed tokens, minted per organisation in `api/token.js`.

## Run locally

```bash
cp .env.example .env   # fill in the key and token
npm run dev            # http://localhost:3000
```

`npm run build:single` writes `dist/archipel-demo.html`, an offline single file that asks for the key and token in the browser.

## Files

| Path | What it does |
| --- | --- |
| `prospect.json` | Brand, organisations, datasets, pages and AI prompts |
| `data/` | Synthetic data, one array of rows per dataset |
| `public/core.js` | Luzmo logic shared by server and browser: setup, tokens, dashboards |
| `public/app.js` | The portal: pages, EDE, ACK builder, AI assistant |
| `api/` | Vercel functions: `config`, `setup`, `token`, `dashboards` |
| `public/vendor/` | Luzmo embed library and the bundled Analytics Components Kit |
