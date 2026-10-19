// "How it's built" content for the side drawer on every page, plus the two take-home documents
// (architecture for the CTO, demo script for the PM). Everything is written from the portal spec,
// so names, columns and organisations match what the trial user sees.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.LuzmoHowTo = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  const DOCS = {
    agents: { label: 'Luzmo developer docs (AGENTS.md)', url: 'https://developer.luzmo.com/AGENTS.md' },
    academy: { label: 'Luzmo Academy', url: 'https://academy.luzmo.com/' },
    auth: { label: 'Create an embed authorization', url: 'https://developer.luzmo.com/api/createAuthorization' },
    params: { label: 'Multi-tenant data with parameter filters', url: 'https://developer.luzmo.com/guide/dashboard-embedding--handling-multi-tenant-data--parameter-filtering' },
    component: { label: 'Embed component API', url: 'https://developer.luzmo.com/guide/embedding--component-api-reference' },
    ede: { label: 'Embedded dashboard editor', url: 'https://developer.luzmo.com/guide/dashboard-embedding--embedded-dashboard-editor' },
    editModes: { label: 'Edit modes', url: 'https://developer.luzmo.com/guide/dashboard-embedding--embedded-dashboard-editor--embed-the-dashboard-with-an-edit-mode' },
    ack: { label: 'Analytics Components Kit overview', url: 'https://developer.luzmo.com/guide/ack--overview' },
    grid: { label: 'ACK item grid', url: 'https://developer.luzmo.com/guide/ack--components--chart-rendering--luzmo-item-grid' },
    flex: { label: 'Flex component API', url: 'https://developer.luzmo.com/guide/flex--component-api-reference' },
    aiprompt: { label: 'Create AIPrompt', url: 'https://developer.luzmo.com/api/createAIPrompt' },
    aiguide: { label: 'The AIPrompt endpoint', url: 'https://developer.luzmo.com/guide/guides--adding-luzmo-iq-to-agentic-workflow--the-aiprompt-endpoint' },
    vercel: { label: 'Vercel: import a Git repository', url: 'https://vercel.com/docs/getting-started-with-vercel/import' }
  };

  function topics(P) {
    const ds = Object.entries(P.datasets);
    const [firstKey, first] = ds[0];
    const tenantCol = P.tenantColumn;
    const tenant = P.tenants[0]?.name || 'Customer A';
    const page = P.pages[0];
    const ai = P.brand.aiName || `${P.brand.logoText} AI`;
    return [
      {
        id: 'live-link',
        title: 'Live link with Luzmo',
        summary: `Every page in ${P.brand.productName} embeds a Luzmo dashboard by its id. Nothing about the charts is hard-coded in the portal. Change a chart, a filter, the theme or the layout in Luzmo and the portal shows it on the next load. No code change and no deploy.`,
        steps: [
          'Click "Open in Luzmo" in the bar at the top. The same dashboard opens in your Luzmo account.',
          'Change something: a chart type, a title, a colour, add a chart.',
          'Save in Luzmo and reload this page. Your change is here.',
          'New dashboards you create in Luzmo and share with the portal show up the same way. That is how your product team ships new analytics without a release.'
        ],
        snippet: `<!-- The whole page is one element. The id points to the dashboard in Luzmo. -->
<luzmo-embed-dashboard
  appServer="https://app.luzmo.com"
  apiHost="https://api.luzmo.com"
  authKey="<embed key from your server>"
  authToken="<embed token from your server>"
  dashboardId="<${page ? `${P.brand.productName} | ${page.title}` : 'dashboard'} id>">
</luzmo-embed-dashboard>`,
        lang: 'html',
        docs: [DOCS.component, DOCS.agents]
      },
      {
        id: 'embedding',
        title: 'Embedding and row-level security',
        summary: `Each ${P.tenantLabel.toLowerCase()} sees only its own rows, from the same dashboards. The server mints a short-lived embed token per ${P.tenantLabel.toLowerCase()} with a filter on the "${tenantCol}" column. The browser only ever gets that token, never your API key.`,
        steps: [
          `Your app knows who is logged in and which ${P.tenantLabel.toLowerCase()} they belong to.`,
          'Your server calls Luzmo with the API key and token (they stay on the server) to create an embed authorization.',
          `The authorization carries the ${tenantCol} filter, the dashboards and datasets it may use, the theme, the locale and the AI context.`,
          'The browser receives only the embed key and token and renders the dashboard. Switching "Viewing as" in this portal mints a new token.'
        ],
        snippet: `// Server side. POST https://api.luzmo.com/0.1.0/authorization
const auth = await luzmo('authorization', {
  action: 'create',
  properties: {
    type: 'embed',
    role: 'designer',            // 'viewer' if users may not edit
    expiry: new Date(Date.now() + 864e5).toISOString(),
    username: '${P.slug}-${tenant.toLowerCase().replace(/[^a-z0-9]+/g, '-')}',
    suborganization: '${P.slug}-${tenant.toLowerCase().replace(/[^a-z0-9]+/g, '-')}',
    access: {
      datasets:   [{ id: datasetId, rights: 'use' }],
      dashboards: [{ id: dashboardId, rights: 'use' }]
    },
    filters: [{
      clause: 'where', origin: 'global',
      securable_id: datasetId, column_id: ${tenantCol}ColumnId,
      expression: '? = ?', value: '${tenant}'
    }],
    theme: { /* your brand */ }, locale_id: 'en',
    iq: { context: 'You are ${ai} ...' },
    feature_overrides: ['flag_embedded_studio_update']
  }
});
return { key: auth.id, token: auth.token }; // the only thing the browser sees`,
        lang: 'js',
        docs: [DOCS.auth, DOCS.params, DOCS.component],
        production: 'For production, use a dataset parameter filter set with parameter_overrides on the token. Token filters like the one above can be bypassed by designer users. Parameter filters cannot. Plug in your own login instead of the "Viewing as" switch.'
      },
      {
        id: 'datasets',
        title: 'How the datasets were created',
        summary: `The trial pushed synthetic ${P.industryLabel.toLowerCase()} data into your Luzmo account through the Core API. ${ds.map(([, d]) => `"${d.name}" (${d.rows.toLocaleString('en')} rows)`).join(' and ')}. Column names and descriptions were set too, because the descriptions are what make AI answers good.`,
        steps: [
          'Every Core API call is a POST to https://api.luzmo.com/0.1.0/<resource> with the action in the body.',
          'The first chunk creates the dataset with data create. Later chunks append in blocks of 5,000 rows (the limit is 10,000 per call). A rerun starts with replace.',
          'Luzmo infers column types from the values. ISO dates become datetime.',
          'Each column then gets a readable name and a business description with column update. The dataset gets a description with securable update.',
          'Datasets are found again by name, so the server needs no database of its own. With your own data you connect your warehouse or database in Luzmo instead.'
        ],
        snippet: `// POST https://api.luzmo.com/0.1.0/data
await luzmo('data', {
  action: 'create',
  properties: {
    type: 'create',             // later chunks: { securable_id, type: 'append' }
    data: rows,                 // arrays in header order, max 10,000 per call
    options: {
      update_metadata: true,
      header: ${JSON.stringify(first.columns.slice(0, 4).map((c) => c.name))} /* ... */,
      name: { en: '${first.name}' }
    }
  }
});

// Then per column: readable name and description for the AI
await luzmo('column', { action: 'update', id: columnId,
  properties: { name: { en: '${first.columns[1]?.label || first.columns[1]?.name}' }, description: { en: '${(first.columns[1]?.description || '').replace(/'/g, "\\'")}' } } });`,
        lang: 'js',
        docs: [DOCS.agents, DOCS.academy]
      },
      {
        id: 'dashboards',
        title: 'How the dashboards were created',
        summary: `Each page is a Luzmo dashboard created through the API from a chart spec. ${P.pages.length} page dashboards plus one self-service dashboard, all with the ${P.brand.productName} theme. After this, the dashboards are ordinary Luzmo dashboards you can change in Luzmo.`,
        steps: [
          'A theme with your colours and fonts is created once with theme create.',
          'A dashboard is a securable with type "dashboard" and a contents object: version, three screen modes (desktop, tablet, mobile) with the same items, and the theme id.',
          'Each item has a type, a position on a 48-column grid, options and slots. Slots point to dataset and column ids. Measures carry an aggregation, dates a level.',
          'After creating the dashboard, the datasets are linked with associate.'
        ],
        snippet: `// POST https://api.luzmo.com/0.1.0/securable
await luzmo('securable', {
  action: 'create',
  properties: {
    type: 'dashboard',
    name: { en: '${P.brand.productName} | ${page?.title || 'Overview'}' },
    contents: {
      version: '0.1.99', syncScreenModes: true,
      views: ['desktop', 'tablet', 'mobile'].map((screenModus) => ({
        screenModus,
        options: { theme: { id: themeId }, columns: 48, rowHeight: 16 },
        items: [{
          type: 'bar-chart',
          position: { col: 0, row: 0, sizeX: 24, sizeY: 26 },
          options: { title: { en: 'My chart' } },
          slots: [
            { name: 'measure', content: [{ datasetId, columnId, aggregationFunc: 'sum' }] },
            { name: 'y-axis',  content: [{ datasetId, columnId, level: 1 }] }
          ]
        }]
      }))
    }
  }
});
await luzmo('securable', { action: 'associate', id: dashboardId,
  resource: { role: 'Securables', id: datasetId } });`,
        lang: 'js',
        docs: [DOCS.agents, DOCS.academy]
      },
      {
        id: 'ede',
        title: 'Edit: the embedded dashboard editor',
        summary: 'The Edit button switches the same embedded dashboard into Luzmo\'s editor, white-labelled in your brand. Users drag charts, change them, add new ones and save, without leaving your product.',
        steps: [
          'The embed token has role "designer" and the feature flag flag_embedded_studio_update. Without that flag the editor cannot save.',
          'The page sets editMode to "editLimited" (or "editFull" for the full catalogue) on the same element.',
          `Shared template pages are never overwritten. Changes land in a "(my version)" copy per ${P.tenantLabel.toLowerCase()}, listed under My dashboards.`,
          'Use this path when users need calculated measures, formulas or the full chart catalogue.'
        ],
        snippet: `<luzmo-embed-dashboard
  dashboardId="<id>"
  authKey="<designer embed key>" authToken="<designer embed token>"
  editMode="editLimited"
  mainColor="${P.brand.primary}" accentColor="${P.brand.accent}">
</luzmo-embed-dashboard>`,
        lang: 'html',
        docs: [DOCS.ede, DOCS.editModes]
      },
      {
        id: 'ack',
        title: 'Report builder: Analytics Components Kit',
        summary: 'The report builder is made of Luzmo web components inside your own layout. Data fields, drop slots, options, filters, a live preview and a canvas grid. Your app owns every pixel and Luzmo renders the charts and runs the queries.',
        steps: [
          'luzmo-data-field-panel lists the columns of the datasets on the token.',
          'Users drag fields into luzmo-item-slot-drop-panel. The page keeps slots, options and filters in its own state.',
          'luzmo-embed-viz-item renders the live preview from that state. "Add to canvas" puts it on luzmo-item-grid.',
          'Save creates or updates a Luzmo dashboard for this organisation, so it also opens in the editor and in Luzmo.',
          '"Prompt to chart" lets Luzmo IQ fill the same state from a sentence.'
        ],
        snippet: `<luzmo-data-field-panel datasetIds='["<dataset id>"]'></luzmo-data-field-panel>
<luzmo-item-slot-drop-panel itemType="bar-chart"></luzmo-item-slot-drop-panel>
<luzmo-embed-viz-item type="bar-chart"></luzmo-embed-viz-item>
<luzmo-item-grid></luzmo-item-grid>

<script>
slotsPanel.addEventListener('luzmo-slots-contents-changed', (e) => {
  state.slots = e.detail.slotsContents;   // your state, your layout
  preview.slots = state.slots;
});
</script>`,
        lang: 'html',
        docs: [DOCS.ack, DOCS.grid, DOCS.flex]
      },
      {
        id: 'ai',
        title: `${ai}: the AI assistant`,
        summary: `${ai} answers questions in plain language with text and live charts, and can build or change a dashboard. It calls Luzmo IQ with the same embed token as the dashboards, so answers stay inside the ${P.tenantLabel.toLowerCase()}'s own data.`,
        steps: [
          'Questions go to POST /0.1.0/aiprompt with agent "analyst", the embed key and token, and stream: true.',
          'Events stream back: progress, text_delta, asset_start, asset_delta, asset_end and finish. Charts arrive as items and render with luzmo-embed-viz-item.',
          '"Build a dashboard about ..." goes to agent "dashboard" and the result is saved as a new Luzmo dashboard.',
          'Each chart has "Add to dashboard": this page, a new dashboard, an existing one or the report builder canvas.',
          'The token\'s iq.context tells IQ who the user is and how your metrics are defined.'
        ],
        snippet: `const res = await fetch('https://api.luzmo.com/0.1.0/aiprompt', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
  body: JSON.stringify({
    action: 'create', version: '0.1.0',
    key: embed.key, token: embed.token,   // tenant-scoped, never your API key
    properties: {
      agent: 'analyst', task: 'generate', stream: true,
      response_mode: 'mixed', locale_id: 'en',
      input: [{ type: 'text', text: '${(P.aiSuggestions?.[0] || 'What changed last month?').replace(/'/g, "\\'")}' }]
    }
  })
});`,
        lang: 'js',
        docs: [DOCS.aiprompt, DOCS.aiguide],
        production: 'Luzmo IQ is an add-on. If your trial account does not have it, the assistant shows a note instead of failing. Ask us to switch it on.'
      },
      {
        id: 'exports',
        title: 'Exports and scheduled emails',
        summary: 'The Export menu on every dashboard downloads a PDF or PNG, emails the dashboard now, or schedules a recurring email. The Exports page lists the schedules for the organisation you are viewing as.',
        steps: [
          'Download PDF or PNG calls exportDashboard on the embedded dashboard element.',
          'Email now and Schedule email call sendExportEmail. Schedule opens Luzmo\'s own schedule dialog.',
          'The recipient is prefilled from the email on the embed token. In this trial that is the email you entered in the wizard.',
          'The Exports page reads schedules with schedule get and keeps the ones on this portal\'s dashboards for this organisation.'
        ],
        snippet: `const dash = document.querySelector('luzmo-embed-dashboard');
await dash.exportDashboard('pdf');            // or 'png'
await dash.sendExportEmail('scheduled',
  { en: '${P.brand.productName}: dashboard export' },
  { en: 'Your scheduled export from ${P.brand.productName}.' });

// Server: list schedules
await luzmo('schedule', { action: 'get', find: {
  include: [
    { model: 'Securable', where: { type: 'dashboard' }, attributes: ['id', 'name'], jointype: 'inner' },
    { model: 'User', attributes: ['id', 'name', 'email', 'username'] }
  ],
  order: [['updated_at', 'desc']]
} });`,
        lang: 'js',
        docs: [DOCS.component, DOCS.agents]
      },
      {
        id: 'deploy',
        title: 'Deploying this portal',
        summary: 'The portal is a plain static site with five small server functions. It runs on Vercel, on localhost, or as one HTML file. The datasets and dashboards already live in your Luzmo account, so a deployed copy finds them by name and opens straight away.',
        steps: [
          'Download the starter kit. It contains this code and a portal.json with your brand, organisations and settings. No keys.',
          'Vercel: push the folder to a new GitHub repository, import it in Vercel, add LUZMO_API_KEY, LUZMO_API_TOKEN and SETUP_SECRET under Environment Variables, deploy.',
          'Localhost: copy .env.example to .env, fill in the key and token, run npm run dev and open http://localhost:3000.',
          'Single file: open the HTML file in Chrome and paste the key and token. For a quick look only, because the key sits in the browser.',
          'Keys only ever live in Vercel\'s settings or your own .env. Never in the repository.'
        ],
        snippet: `# Localhost
cp .env.example .env     # add LUZMO_API_KEY and LUZMO_API_TOKEN
npm run dev              # http://localhost:3000

# Vercel environment variables (Settings, Environment Variables)
LUZMO_API_KEY=...
LUZMO_API_TOKEN=...
SETUP_SECRET=...         # password for the setup page
# US accounts only
LUZMO_API_HOST=https://api.us.luzmo.com`,
        lang: 'bash',
        docs: [DOCS.vercel, DOCS.agents]
      }
    ];
  }

  // Which topics a page opens with. The drawer can still switch to any topic.
  function forRoute(route) {
    if (!route) return ['live-link'];
    if (route === 'self') return ['ede', 'ack'];
    if (route === 'ai') return ['ai'];
    if (route === 'exports') return ['exports'];
    if (route === 'deploy') return ['deploy'];
    if (route.startsWith('dash:')) return ['live-link', 'ede', 'exports'];
    return ['live-link', 'embedding', 'datasets', 'dashboards'];
  }

  function markdown(P) {
    const out = [`# ${P.brand.productName}: how it's built`, '', `Embedded analytics for ${P.company}, built on Luzmo. Generated by the Luzmo trial on ${new Date().toISOString().slice(0, 10)}.`, ''];
    out.push('## Architecture', '', '```', `Browser (${P.brand.productName})`, '  | gets only short-lived embed tokens', '  v', 'Your server  --- API key + token --->  Luzmo Core API (datasets, dashboards, tokens, schedules)', '  |', '  v', 'Luzmo embed components (dashboards, editor, report builder, IQ)  <---  Luzmo app + IQ', '```', '');
    out.push('## Where the keys live', '', '- The Luzmo API key and token live on the server only: Vercel Environment Variables or a local `.env`.', '- The browser gets an embed key and token per organisation. They expire after a day and carry the row filter.', '- In the hosted trial wizard the key stays in your browser session. It is never stored on shared infrastructure.', '');
    out.push('## Data', '', ...Object.values(P.datasets).map((d) => `- **${d.name}**: ${d.description} ${d.rows.toLocaleString('en')} synthetic rows. Columns: ${d.columns.map((c) => `\`${c.name}\``).join(', ')}.`), '');
    out.push(`Tenant column: \`${P.tenantColumn}\`. Organisations: ${P.tenants.map((t) => t.name).join(', ')}.`, '');
    for (const t of topics(P)) {
      out.push(`## ${t.title}`, '', t.summary, '', ...t.steps.map((s, i) => `${i + 1}. ${s}`), '');
      if (t.production) out.push(`**For production.** ${t.production}`, '');
      out.push(`\`\`\`${t.lang}`, t.snippet, '```', '', ...t.docs.map((d) => `- [${d.label}](${d.url})`), '');
    }
    out.push('## What to change for production', '', '- Replace the "Viewing as" switch with your own login. Mint the token from the logged-in user.', '- Use parameter filters with `parameter_overrides` instead of token filters for tenant isolation.', '- Connect your real data source in Luzmo (database, warehouse or API) instead of the synthetic datasets.', '- Use role `viewer` for users who should not edit, `designer` for self-service.', '- Keep one suborganization per customer so saved dashboards never leak across customers.', '');
    return out.join('\n');
  }

  function demoScript(P) {
    const [t1, t2] = P.tenants;
    const page = P.pages[0];
    const ai = P.brand.aiName || `${P.brand.logoText} AI`;
    const ask = P.aiSuggestions?.[0] || 'What changed last month?';
    const build = P.aiBuildSuggestions?.[0] || 'Build a dashboard on the main KPIs by month';
    return [
      `# ${P.brand.productName}: 5-minute demo script`,
      '',
      `For: pitching embedded analytics inside ${P.company} to your CPO or CTO. Everything below runs on your own Luzmo trial account.`,
      '',
      '## Before you start',
      '',
      `- Open the portal on ${page ? `"${page.title}"` : 'the first page'} and set "Viewing as" to ${t1?.name || 'the first organisation'}.`,
      '- Have app.luzmo.com open in a second tab.',
      '',
      '## 1. The product, in our brand (30 seconds)',
      '',
      `"This is ${P.brand.productName}, analytics inside ${P.company}. Same logo, colours and fonts as our product. Our customers would never know it is a third-party tool."`,
      '',
      '## 2. Multi-tenant (45 seconds)',
      '',
      `Switch "Viewing as" from ${t1?.name} to ${t2?.name}. "Same dashboards, different numbers. Each customer only ever sees its own rows. The filter sits in a server-side token, not in the browser."`,
      '',
      '## 3. Self-service editing (1 minute)',
      '',
      '- Click Edit. Change a chart type, add a chart, save.',
      '- "Our customers build their own views without a ticket to our team. Shared templates stay untouched. Changes land in their own copy."',
      '- Open Self-service, Report builder. Drag a field into a slot, add the chart to the canvas, save.',
      '',
      `## 4. ${ai} (1 minute 30)`,
      '',
      `- Ask: "${ask}"`,
      '- Point at the chart in the answer. Click "Add to dashboard", This page.',
      `- Ask: "${build}". Open the new dashboard from My dashboards.`,
      '- "Questions in plain language, answered on the customer\'s own data only."',
      '',
      '## 5. Exports (30 seconds)',
      '',
      '- Export, Schedule email. Weekly PDF to yourself. Show it on the Exports page.',
      '',
      '## 6. The live link (45 seconds)',
      '',
      '- Click "Open in Luzmo". Change a chart title in Luzmo and save. Reload the portal.',
      '- "Our analytics team ships new dashboards from Luzmo. No release, no code change."',
      '',
      '## Close',
      '',
      '"This took ten minutes on a trial. The question is not whether we can build it. It is whether we want to spend a year building and maintaining it ourselves."',
      '',
      `Next step: [book a technical call](${P.links?.technicalCall || 'https://calendly.com/d/cygt-jjc-tr4/luzmo-technical-call-1h'}) to walk through security, multi-tenancy and pricing.`
    ].join('\n');
  }

  return { topics, forRoute, markdown, demoScript, DOCS };
});
