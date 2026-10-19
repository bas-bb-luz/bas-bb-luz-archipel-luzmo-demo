// The trial wizard: connect Luzmo, fetch the brand from a website, name the insights module, pick
// data and features, build everything in the trial user's own Luzmo account, then deploy or download.
// The API key and token stay in this browser tab (sessionStorage). Nothing secret is stored elsewhere.
(function () {
  const Gen = window.LuzmoTrialGen;
  const track = (name, props) => window.LuzmoTrack?.(name, props);
  const $ = (sel, root = document) => root.querySelector(sel);
  const el = (tag, props = {}, children = []) => {
    const node = Object.assign(document.createElement(tag), props);
    children.forEach((c) => c != null && c !== false && node.append(c));
    return node;
  };
  const P = () => window.LuzmoPortal;

  const STORE = 'luzmo-trial-wizard';
  const CREDS = 'luzmo-trial-creds';
  const FONTS = ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Source Sans 3', 'Nunito', 'Nunito Sans', 'Raleway', 'Work Sans', 'DM Sans', 'Manrope', 'Plus Jakarta Sans', 'IBM Plex Sans', 'Red Hat Display', 'Red Hat Text', 'Rubik', 'Outfit', 'Figtree', 'Space Grotesk', 'Mulish', 'Barlow', 'Merriweather', 'Playfair Display', 'Lora'];
  const FEATURES = [
    ['templates', 'Templated dashboards', 'One Luzmo dashboard per page, built from your data'],
    ['tenants', 'Multi-tenant "Viewing as"', 'Each customer sees only its own rows (row-level security)'],
    ['ede', 'Full editor', 'Luzmo\'s drag-and-drop dashboard editor, in your brand'],
    ['ack', 'Report builder', 'Your own layout with Luzmo components (ACK)'],
    ['ai', 'AI assistant', 'Questions, charts and dashboards in plain language. Needs Luzmo IQ'],
    ['exports', 'Exports and schedules', 'PDF, PNG, email now and scheduled emails'],
    ['howto', '"How it\'s built" panels', 'Short explanation, steps and code on every page'],
    ['myDashboards', 'My dashboards', 'Users save their own dashboards']
  ];
  const REGIONS = [['https://api.luzmo.com', 'EU (app.luzmo.com)'], ['https://api.us.luzmo.com', 'US (app.us.luzmo.com)'], ['custom', 'Other host (VPC)']];

  const W = {
    server: false,
    startedAt: Date.now(),
    region: 'https://api.luzmo.com',
    customHost: '',
    email: '',
    connected: null,
    website: '',
    fetched: null,
    company: '',
    moduleName: '',
    aiName: '',
    logoUrl: '',
    logoMarkUrl: '',
    primary: '#3B2A8C',
    accent: '#00BFA6',
    cta: '#FF6A3D',
    font: 'Inter',
    headingFont: 'Inter',
    currency: 'EUR',
    industry: 'generic',
    detected: null,
    tenantNames: '',
    tenantsFor: null,
    features: { ...Gen.DEFAULT_FEATURES },
    built: null,
    iq: null
  };
  let creds = { key: '', token: '' };
  let touchedNames = { moduleName: false, aiName: false };

  function load() {
    try { Object.assign(W, JSON.parse(localStorage.getItem(STORE) || '{}')); } catch { /* storage blocked */ }
    try { creds = { ...creds, ...JSON.parse(sessionStorage.getItem(CREDS) || '{}') }; } catch { /* storage blocked */ }
    W.startedAt = Date.now();
  }
  function persist() {
    const { server, startedAt, ...rest } = W;
    try { localStorage.setItem(STORE, JSON.stringify(rest)); } catch { /* storage blocked */ }
    try { sessionStorage.setItem(CREDS, JSON.stringify(creds)); } catch { /* storage blocked */ }
  }

  const apiHost = () => (W.region === 'custom' ? W.customHost.trim().replace(/\/$/, '') : W.region);
  const appServer = (host = apiHost()) => (host.includes('.us.') ? 'https://app.us.luzmo.com' : host === 'https://api.luzmo.com' ? 'https://app.luzmo.com' : host.replace('//api.', '//app.'));
  const credsReady = () => creds.key.trim() && creds.token.trim() && apiHost();

  function portalSpec() {
    const tenantNames = W.tenantNames.split('\n').map((s) => s.trim()).filter(Boolean);
    return Gen.buildPortal({
      company: W.company || 'Your company',
      website: W.website,
      moduleName: W.moduleName,
      aiName: W.aiName,
      email: W.email.trim(),
      industry: W.industry,
      tenantNames,
      currency: W.currency,
      features: W.features,
      brand: { primary: W.primary, accent: W.accent, cta: W.cta, font: W.font, headingFont: W.headingFont, logoText: W.company || 'Your company', logoUrl: W.logoUrl || null, logoMarkUrl: W.logoMarkUrl || null }
    });
  }

  function backendFor(spec, log) {
    return P().localBackend(spec, { apiHost: apiHost(), key: creds.key.trim(), token: creds.token.trim() }, log);
  }

  // ---------- small UI helpers ----------
  const field = (label, input, hint) => el('label', { className: 'w-field' }, [el('span', {}, [label]), input, hint ? el('small', {}, [hint]) : null]);
  const input = (props, key, onChange) => {
    const i = el('input', { value: W[key] ?? '', ...props });
    i.oninput = () => { W[key] = i.value; persist(); onChange?.(); };
    return i;
  };
  function status(node, msg, kind) {
    node.className = `w-status ${kind || ''}`;
    node.textContent = msg || '';
    node.hidden = !msg;
  }
  function colorInput(key, label) {
    const swatch = el('input', { type: 'color', value: W[key] });
    const hex = el('input', { className: 'hex', value: W[key], maxLength: 7, spellcheck: false });
    swatch.oninput = () => { W[key] = swatch.value.toUpperCase(); hex.value = W[key]; persist(); refreshPreview(); };
    hex.oninput = () => { if (Gen.parseHex(hex.value)) { W[key] = Gen.toHex(Gen.parseHex(hex.value)); swatch.value = W[key]; persist(); refreshPreview(); } };
    return el('label', { className: 'w-field color' }, [el('span', {}, [label]), el('div', { className: 'color-row' }, [swatch, hex])]);
  }
  function fontInput(key, label) {
    const i = input({ placeholder: 'Inter' }, key, refreshPreview);
    i.setAttribute('list', 'w-fonts');
    return field(label, i);
  }
  function step(n, title, lead, body, { done = false, id } = {}) {
    return el('section', { className: `w-step ${done ? 'done' : ''}`, id }, [
      el('div', { className: 'w-step-head' }, [el('span', { className: 'w-num' }, [done ? '✓' : String(n)]), el('div', {}, [el('h2', {}, [title]), lead ? el('p', {}, [lead]) : null])]),
      el('div', { className: 'w-step-body' }, body)
    ]);
  }

  // ---------- live preview of the portal ----------
  function previewValue(m, r) {
    if (m.format === '.0%') return `${Math.round(20 + r() * 70)}%`;
    if (m.agg === 'average') return (2 + r() * 40).toFixed(1);
    return Math.round(800 + r() * 9000).toLocaleString('en');
  }
  function refreshPreview() {
    const box = $('#wPreview');
    if (!box) return;
    let spec;
    try { spec = portalSpec(); } catch { return; }
    const b = spec.brand;
    box.style.setProperty('--pv-primary', b.primary);
    box.style.setProperty('--pv-accent', b.accent);
    box.style.setProperty('--pv-cta', b.cta);
    box.style.setProperty('--pv-on-primary', b.onPrimary);
    box.style.setProperty('--pv-on-cta', b.onCta);
    box.style.setProperty('--pv-bg', b.background);
    box.style.setProperty('--pv-font', `'${b.font}', system-ui, sans-serif`);
    box.style.setProperty('--pv-heading', `'${b.headingFont}', system-ui, sans-serif`);
    P().applyBrand(b);
    box.innerHTML = '';
    const nav = el('div', { className: 'pv-nav' }, [
      el('div', { className: 'pv-brand' }, [P().brandMark(b), el('div', {}, [el('strong', {}, [b.productName]), el('small', {}, [spec.company])])]),
      ...spec.pages.map((p, i) => el('div', { className: `pv-item ${i === 0 ? 'on' : ''}` }, [p.title])),
      el('div', { className: 'pv-label' }, ['My dashboards']),
      el('div', { className: 'pv-item' }, ['+ Create new'])
    ]);
    const page = spec.pages[0];
    const kpis = page.charts.filter((c) => c.type === 'evolution-number');
    const r = Gen.rng(spec.seed);
    const main = el('div', { className: 'pv-main' }, [
      el('div', { className: 'pv-top' }, [el('div', {}, [el('h3', {}, [page.title]), el('small', {}, [`Viewing as ${spec.tenants[0]?.name || ''}`])]), el('span', { className: 'pv-btn' }, ['Edit dashboard'])]),
      el('div', { className: 'pv-kpis' }, kpis.map((k, i) => el('div', { className: 'pv-kpi' }, [el('small', {}, [k.title]), el('strong', { style: `color:${b.palette[i % 3]}` }, [previewValue(k.slots.measure[0], r)])]))),
      el('div', { className: 'pv-chart' }, Array.from({ length: 12 }, (_, i) => el('span', { style: `height:${30 + Math.round(r() * 60 + i * 2)}%;background:${b.palette[i % 2 ? 1 : 0]}` }))),
      el('div', { className: 'pv-fab' }, [el('span', {}, [b.logoText.charAt(0)]), `Ask ${b.aiName}`])
    ]);
    box.append(nav, main);
  }

  // ---------- step 1: Luzmo ----------
  function stepConnect({ singleFile = false } = {}) {
    const st = el('p', { className: 'w-status', hidden: true });
    const region = el('select', {}, REGIONS.map(([v, l]) => el('option', { value: v, selected: W.region === v }, [l])));
    const custom = input({ placeholder: 'https://api.yourvpc.luzmo.com', hidden: W.region !== 'custom' }, 'customHost');
    region.onchange = () => { W.region = region.value; custom.hidden = W.region !== 'custom'; persist(); };
    const key = el('input', { value: creds.key, autocomplete: 'off', spellcheck: false, placeholder: 'e.g. 1a2b3c4d-....' });
    const token = el('input', { value: creds.token, type: 'password', autocomplete: 'off', spellcheck: false });
    key.oninput = () => { creds.key = key.value.replace(/\s+/g, ''); persist(); };
    token.oninput = () => { creds.token = token.value.replace(/\s+/g, ''); persist(); };
    const test = el('button', { className: 'w-btn', onclick: async () => {
      if (!credsReady()) return status(st, 'Fill in the API key and token first.', 'err');
      test.disabled = true;
      status(st, 'Connecting to Luzmo...', '');
      try {
        const spec = singleFile ? window.__LOCAL__.portal : portalSpec();
        const out = await backendFor(spec).testConnection();
        W.connected = { at: Date.now(), host: apiHost() };
        persist();
        status(st, `Connected. This account has ${out.datasets} datasets and ${out.dashboards} dashboards.${out.existing ? ' It already holds this portal, so you can open it straight away.' : ''}`, 'ok');
        track('luzmo_connected', { region: W.region === 'custom' ? 'custom' : W.region.includes('.us.') ? 'us' : 'eu' });
        $('#wStepConnect')?.classList.add('done');
      } catch (err) {
        W.connected = null;
        status(st, /401|403|invalid|not valid|authoriz/i.test(err.message) ? `Luzmo did not accept this key and token. Check the region and copy both again. (${err.message})` : err.message, 'err');
        track('luzmo_connect_failed');
      } finally {
        test.disabled = false;
      }
    } }, ['Test connection']);
    const body = [
      el('div', { className: 'w-grid2' }, [field('Region', region), field('Your work email', input({ type: 'email', placeholder: 'you@company.com' }, 'email'), 'Exports and scheduled emails go here')]),
      custom,
      el('div', { className: 'w-grid2' }, [field('API key', key), field('API token', token)]),
      el('p', { className: 'w-help' }, [
        'Where to find them: in ', el('a', { href: `${appServer()}`, target: '_blank', rel: 'noopener' }, ['Luzmo']),
        ', click your avatar (top right), then Profile, then API tokens, then Create API token. Copy both with the copy buttons.'
      ]),
      el('p', { className: 'w-safe' }, [singleFile
        ? 'The key and token only go to Luzmo, from this browser. Nothing is saved in this file.'
        : 'The key and token stay in this browser tab and only go to Luzmo. They are never sent to or stored on our servers. Close the tab and they are gone.']),
      el('div', { className: 'w-actions' }, [test]),
      st
    ];
    return step(1, 'Connect your Luzmo trial', 'Everything is built inside your own Luzmo account.', body, { done: !!W.connected, id: 'wStepConnect' });
  }

  // ---------- step 2: brand ----------
  function applyFetched(b) {
    W.fetched = { url: b.url, logos: b.logos, colors: b.colors, fonts: b.fonts, industry: b.industry, description: b.description };
    W.company = b.name || W.company;
    if (!touchedNames.moduleName) W.moduleName = `${W.company} Insights`;
    if (!touchedNames.aiName) W.aiName = `${W.company} AI`;
    const mark = b.logos.find((l) => l.kind === 'mark');
    const wide = b.logos.find((l) => l.kind === 'wide');
    W.logoMarkUrl = mark?.url || '';
    W.logoUrl = mark ? '' : wide?.url || '';
    if (b.colors.primary) W.primary = b.colors.primary;
    if (b.colors.accent) W.accent = b.colors.accent;
    if (b.colors.cta) W.cta = b.colors.cta;
    if (b.fonts.body) W.font = b.fonts.body;
    if (b.fonts.heading) W.headingFont = b.fonts.heading;
    W.currency = b.currency || W.currency;
    W.detected = b.industry;
    W.industry = b.industry.key;
    W.tenantNames = '';
    persist();
  }

  function stepBrand() {
    const st = el('p', { className: 'w-status', hidden: true });
    const url = input({ placeholder: 'yourcompany.com', type: 'url' }, 'website');
    const fetchBtn = el('button', { className: 'w-btn primary', onclick: async () => {
      if (!W.website.trim()) return status(st, 'Enter your website first.', 'err');
      if (!W.server) return status(st, 'Brand fetch needs the trial server. Fill in the fields below by hand.', 'warn');
      fetchBtn.disabled = true;
      status(st, 'Reading your website...', '');
      try {
        const res = await fetch('/api/brand', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: W.website.trim() }) });
        const b = await res.json();
        if (!res.ok) throw new Error(b.error || `HTTP ${res.status}`);
        applyFetched(b);
        track('brand_fetched', { result: 'success', industry: b.industry.key, colors: !!b.colors.primary, logo: b.logos.length > 0 });
        render();
        status($('#wBrandStatus'), `Found ${W.company}: ${b.logos.length} logo option${b.logos.length === 1 ? '' : 's'}, colors and fonts. Looks like ${b.industry.label.toLowerCase()}. Check and adjust below.`, 'ok');
      } catch (err) {
        track('brand_fetched', { result: 'manual', reason: String(err.message).slice(0, 80) });
        status(st, `Could not read that website (${err.message}). Some sites block this. Fill in the fields below by hand.`, 'warn');
      } finally {
        fetchBtn.disabled = false;
      }
    } }, ['Fetch brand']);
    st.id = 'wBrandStatus';

    const company = input({ placeholder: 'Acme' }, 'company', () => {
      if (!touchedNames.moduleName) { W.moduleName = W.company ? `${W.company} Insights` : ''; $('#wModule').value = W.moduleName; }
      if (!touchedNames.aiName) { W.aiName = W.company ? `${W.company} AI` : ''; $('#wAi').value = W.aiName; }
      persist();
      refreshPreview();
    });
    const moduleName = input({ id: 'wModule', placeholder: 'Acme Insights' }, 'moduleName', () => { touchedNames.moduleName = true; refreshPreview(); });
    const aiName = input({ id: 'wAi', placeholder: 'Acme AI' }, 'aiName', () => { touchedNames.aiName = true; refreshPreview(); });

    const logos = el('div', { className: 'w-logos' });
    const pickLogo = (l) => {
      if (l.kind === 'mark') { W.logoMarkUrl = l.url; W.logoUrl = ''; } else { W.logoUrl = l.url; W.logoMarkUrl = ''; }
      persist();
      render();
    };
    for (const l of W.fetched?.logos || []) {
      const on = l.url === W.logoMarkUrl || l.url === W.logoUrl;
      logos.append(el('button', { className: `w-logo ${on ? 'on' : ''}`, title: `${l.source} (${l.kind === 'mark' ? 'square' : 'wide'})`, onclick: () => pickLogo(l) }, [el('img', { src: l.url, alt: '', onerror: (e) => e.target.closest('button').remove() }), el('small', {}, [l.kind === 'mark' ? 'Icon' : 'Logo'])]));
    }
    logos.append(el('button', { className: `w-logo letter ${!W.logoUrl && !W.logoMarkUrl ? 'on' : ''}`, onclick: () => { W.logoUrl = ''; W.logoMarkUrl = ''; persist(); render(); } }, [el('span', {}, [(W.company || 'A').charAt(0)]), el('small', {}, ['Letter'])]));
    const logoUrl = el('input', { placeholder: 'https://.../logo.svg', value: W.logoMarkUrl || W.logoUrl || '' });
    logoUrl.onchange = () => { W.logoMarkUrl = logoUrl.value.trim(); W.logoUrl = ''; persist(); render(); };

    const currency = el('select', {}, ['EUR', 'USD', 'GBP', 'CHF', 'SEK', 'DKK', 'NOK', 'PLN', 'AUD', 'CAD'].map((c) => el('option', { value: c, selected: W.currency === c }, [c])));
    currency.onchange = () => { W.currency = currency.value; persist(); };

    const body = [
      el('div', { className: 'w-fetch' }, [field('Website', url), fetchBtn]),
      st,
      el('div', { className: 'w-grid3' }, [field('Company name', company), field('Insights module name', moduleName, 'What your customers see, e.g. "Acme Insights"'), field('AI assistant name', aiName)]),
      el('div', { className: 'w-field' }, [el('span', {}, ['Logo']), logos, logoUrl]),
      el('div', { className: 'w-grid3' }, [colorInput('primary', 'Primary'), colorInput('accent', 'Accent'), colorInput('cta', 'Buttons (CTA)')]),
      W.fetched?.colors?.found?.length ? el('div', { className: 'w-swatches' }, [el('small', {}, ['From your site, click to use as primary: ']), ...W.fetched.colors.found.map((c) => el('button', { style: `background:${c}`, title: c, onclick: () => { W.primary = c; persist(); render(); } }))]) : null,
      el('div', { className: 'w-grid3' }, [fontInput('headingFont', 'Heading font'), fontInput('font', 'Body font'), field('Currency', currency)])
    ];
    return step(2, 'Your company and brand', 'Paste your website. We pick up your name, logo, colors and fonts. You can change everything.', body, { done: !!(W.company && W.moduleName) });
  }

  // ---------- step 3: data and features ----------
  function stepData() {
    const inds = Gen.INDUSTRIES;
    const industry = el('select', {}, Object.entries(inds).map(([k, v]) => el('option', { value: k, selected: W.industry === k }, [`${v.label}${W.detected?.key === k ? ' (detected)' : ''}`])));
    industry.onchange = () => { W.industry = industry.value; W.tenantNames = ''; persist(); track('industry_changed', { industry: W.industry }); render(); };
    const ind = inds[W.industry] || inds.generic;
    if (W.tenantsFor !== W.industry) W.tenantNames = '';
    const spec = portalSpec();
    if (!W.tenantNames) {
      W.tenantNames = spec.tenants.map((t) => t.name).join('\n');
      W.tenantsFor = W.industry;
      persist();
    }
    const names = el('textarea', { rows: 5, value: W.tenantNames });
    names.oninput = () => { W.tenantNames = names.value; persist(); };
    const why = W.detected?.key === W.industry && W.detected.hits?.length ? `Detected from your website because of: ${W.detected.hits.join(', ')}.` : 'Pick the industry closest to your product. The data, pages and AI questions follow from it.';
    const datasets = el('ul', { className: 'w-datasets' }, Object.values(spec.datasets).map((d) => el('li', {}, [
      el('strong', {}, [d.label]), ` ${d.rows.toLocaleString('en')} rows, ${d.columns.length} columns. `,
      el('small', {}, [d.columns.filter((c) => ['dim', 'measure', 'flag'].includes(c.kind)).map((c) => Gen.labelOf(c)).join(', ')])
    ])));
    const toggles = el('div', { className: 'w-toggles' }, FEATURES.map(([k, label, hint]) => {
      const b = el('button', { className: `w-toggle ${W.features[k] ? 'on' : ''}`, onclick: () => {
        W.features[k] = !W.features[k];
        persist();
        b.classList.toggle('on', W.features[k]);
        track('toggles_changed', { feature: k, on: W.features[k] });
      } }, [el('strong', {}, [label]), el('small', {}, [hint])]);
      return b;
    }));
    const body = [
      el('div', { className: 'w-grid2' }, [field('Industry', industry, why), field(`Your customers (one ${ind.tenantNoun} per line)`, names, 'Fictional names are fine. Each one becomes a tenant with its own numbers.')]),
      el('div', { className: 'w-field' }, [el('span', {}, ['Synthetic data that will be created in your Luzmo account']), datasets]),
      el('div', { className: 'w-field' }, [el('span', {}, ['What should be in your portal']), toggles]),
      W.features.ai ? el('p', { className: 'w-help' }, ['The AI assistant needs Luzmo IQ on your account. We check it when we build. If it is off, the portal shows a note and a "Request IQ" button instead.']) : null
    ];
    return step(3, 'Data and features', 'Synthetic data that looks like your business. Everything is switched on, turn off what you do not need.', body, { done: !!W.built });
  }

  // ---------- step 4: build ----------
  async function checkIq(backend) {
    try {
      const auth = await backend.token(window.LuzmoKitCore.ALL);
      const res = await fetch(`${apiHost()}/0.1.0/aiprompt`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', version: '0.1.0', key: auth.key, token: auth.token, properties: { agent: 'analyst', task: 'generate', response_mode: 'text', stream: false, locale_id: 'en', input: [{ type: 'text', text: 'In one sentence, what data can you see?' }] } })
      });
      if (res.ok) return true;
      const text = await res.text();
      return /licen[cs]e|add-?on|not enabled|upgrade|iq/i.test(text) ? false : null;
    } catch {
      return null;
    }
  }

  function stepBuild() {
    const log = el('div', { className: 'w-log', hidden: true });
    const bar = el('div', { className: 'w-progress', hidden: true }, [el('span')]);
    const add = (msg, kind = '') => { log.hidden = false; log.append(el('div', { className: `log-line ${kind}` }, [msg])); log.scrollTop = log.scrollHeight; };
    const openBtn = el('button', { className: 'w-btn primary', hidden: !W.built, onclick: () => openPortal() }, ['Open my portal']);
    const buildBtn = el('button', { className: `w-btn ${W.built ? '' : 'primary'}`, onclick: async () => {
      if (!credsReady()) return add('Connect Luzmo in step 1 first.', 'err');
      if (!W.company) return add('Fill in your company name in step 2 first.', 'err');
      const spec = portalSpec();
      buildBtn.disabled = true;
      openBtn.hidden = true;
      log.innerHTML = '';
      bar.hidden = false;
      const t0 = Date.now();
      track('setup_started', { industry: spec.industry, features: Object.entries(spec.features).filter(([, v]) => !v).map(([k]) => k).join(',') || 'all' });
      try {
        const backend = backendFor(spec, add);
        await backend.setup((f) => { bar.firstChild.style.width = `${Math.round(f * 100)}%`; });
        if (spec.features.ai) {
          add('Checking Luzmo IQ for the AI assistant...');
          W.iq = await checkIq(backend);
          add(W.iq === false ? 'Luzmo IQ is not on this account. The assistant will show a "Request IQ" note.' : W.iq ? 'Luzmo IQ is on. The assistant is ready.' : 'Could not confirm Luzmo IQ. The assistant will tell you if it is missing.', W.iq === false ? 'warn' : 'ok');
        }
        bar.firstChild.style.width = '100%';
        const secs = Math.round((Date.now() - t0) / 1000);
        W.built = { at: Date.now(), slug: spec.slug, seconds: secs };
        persist();
        add(`Done in ${secs} seconds. ${Object.keys(spec.datasets).length} datasets, ${spec.pages.length + 1} dashboards and a theme are now in your Luzmo account.`, 'ok');
        track('setup_finished', { seconds: secs, sinceWizardStart: Math.round((Date.now() - W.startedAt) / 1000), iq: W.iq });
        openBtn.hidden = false;
        render();
        openPortal(backend, spec);
      } catch (err) {
        add(err.message, 'err');
        if (/Could not reach/.test(err.message)) add('If the region is right, a browser extension or network policy may block calls to Luzmo.', 'muted');
        track('setup_failed', { reason: String(err.message).slice(0, 80) });
      } finally {
        buildBtn.disabled = false;
      }
    } }, [W.built ? 'Build again' : 'Build in my Luzmo account']);
    const spec = (() => { try { return portalSpec(); } catch { return null; } })();
    const rows = spec ? Object.values(spec.datasets).reduce((s, d) => s + d.rows, 0) : 0;
    const body = [
      el('p', { className: 'w-help' }, [`Creates ${spec ? Object.keys(spec.datasets).length : 2} datasets (${rows.toLocaleString('en')} rows), column descriptions for the AI, a theme in your brand and ${spec ? spec.pages.length + 1 : 3} dashboards. About a minute. Running it again replaces the data.`]),
      el('div', { className: 'w-actions' }, [buildBtn, openBtn]),
      bar,
      log
    ];
    return step(4, 'Build it in Luzmo', null, body, { done: !!W.built });
  }

  async function openPortal(backend, spec) {
    spec = spec || portalSpec();
    if (!backend) {
      backend = backendFor(spec);
      try { await backend.open(); } catch (err) { P().toast(err.message); return; }
    }
    $('#wizard').hidden = true;
    P().open({ portal: spec, backend, apiHost: apiHost(), appServer: appServer(), mode: 'browser', iq: W.iq });
  }

  // ---------- step 5 and the portal's Deploy page ----------
  function deployPanel(spec, { mode = 'browser' } = {}) {
    const code = (t) => P().codeBlock(t);
    const repo = window.LUZMO_TRIAL_TEMPLATE_REPO;
    const portalJson = JSON.stringify(spec);
    const dl = (type, label, hint, who) => el('button', { className: 'w-dl', onclick: async (e) => {
      const b = e.currentTarget;
      b.disabled = true;
      try { await window.LuzmoKit.download(type, spec); } catch (err) { P().toast(`Download failed: ${err.message}`); } finally { b.disabled = false; }
    } }, [el('strong', {}, [label]), el('small', {}, [hint]), el('em', {}, [who])]);
    const tabs = {
      vercel: () => el('div', {}, [
        el('ol', { className: 'w-steps' }, [
          el('li', {}, ['Download the ', el('strong', {}, ['starter kit']), ' below and unzip it.']),
          el('li', {}, ['On GitHub, ', el('a', { href: 'https://github.com/new', target: '_blank', rel: 'noopener' }, ['create a new repository']), ' (private is fine). Click "uploading an existing file" and drag in everything inside the unzipped folder. Commit.']),
          el('li', {}, ['In Vercel, ', el('a', { href: 'https://vercel.com/new', target: '_blank', rel: 'noopener', onclick: () => track('deploy_option', { option: 'vercel' }) }, ['Add New, Project']), ', import that repository. Framework preset: Other. Keep the other defaults.']),
          el('li', {}, ['Open Environment Variables and add these three. Names exactly like this:', code(`LUZMO_API_KEY=<your key>\nLUZMO_API_TOKEN=<your token>\nSETUP_SECRET=<any password>${apiHost().includes('.us.') ? '\nLUZMO_API_HOST=https://api.us.luzmo.com' : ''}`)]),
          el('li', {}, ['Click Deploy and open the URL. The portal finds the datasets and dashboards you just built and opens straight away. That URL is the link to send your CPO.'])
        ]),
        repo ? el('div', { className: 'w-oneclick' }, [
          el('p', {}, ['Or deploy in one click. Paste the portal settings into PORTAL_JSON when Vercel asks.']),
          el('a', { className: 'w-btn primary', target: '_blank', rel: 'noopener', onclick: () => track('deploy_option', { option: 'vercel_button' }), href: `https://vercel.com/new/clone?repository-url=${encodeURIComponent(repo)}&env=LUZMO_API_KEY,LUZMO_API_TOKEN,SETUP_SECRET,PORTAL_JSON&envDescription=${encodeURIComponent('Luzmo API key and token from Profile, API tokens. PORTAL_JSON comes from the trial wizard.')}&project-name=${encodeURIComponent(spec.slug)}` }, ['Deploy to Vercel']),
          el('button', { className: 'w-btn', onclick: () => P().copy(portalJson, 'PORTAL_JSON value') }, ['Copy PORTAL_JSON value'])
        ]) : null,
        el('p', { className: 'w-safe' }, ['Credentials end up in Vercel\'s Environment Variables of your own project. Never in the repository.'])
      ]),
      local: () => el('div', {}, [
        el('ol', { className: 'w-steps' }, [
          el('li', {}, ['Download the starter kit below and unzip it. You need Node.js 18 or newer.']),
          el('li', {}, ['In a terminal, inside the folder:', code(`cp .env.example .env\n# open .env and fill in LUZMO_API_KEY and LUZMO_API_TOKEN${apiHost().includes('.us.') ? '\n# and LUZMO_API_HOST=https://api.us.luzmo.com' : ''}\nnpm run dev`)]),
          el('li', {}, ['Open ', el('a', { href: 'http://localhost:3000', target: '_blank', rel: 'noopener', onclick: () => track('deploy_option', { option: 'localhost' }) }, ['http://localhost:3000']), '.'])
        ]),
        el('p', { className: 'w-safe' }, ['Credentials end up in the .env file on your machine. It is in .gitignore, so it is never committed.'])
      ]),
      single: () => el('div', {}, [
        el('ol', { className: 'w-steps' }, [
          el('li', {}, ['Download the one-file demo below.']),
          el('li', {}, ['Open it in Chrome, paste the API key and token, click Open portal.'])
        ]),
        el('p', { className: 'w-safe' }, ['For a quick look only. The key sits in the browser while the file is open. The file itself never contains it.'])
      ])
    };
    let current = 'vercel';
    const host = el('div', { className: 'w-tab-body' }, [tabs[current]()]);
    const tabBar = el('div', { className: 'w-tabs' }, [['vercel', 'Vercel'], ['local', 'Localhost'], ['single', 'Single file']].map(([k, label]) => el('button', { className: k === current ? 'on' : '', onclick: (e) => {
      current = k;
      host.innerHTML = '';
      host.append(tabs[k]());
      tabBar.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b === e.currentTarget));
      track('deploy_option_viewed', { option: k });
    } }, [label])));
    return el('div', { className: 'w-deploy' }, [
      mode === 'server' ? el('p', { className: 'w-help' }, ['This portal is already deployed. Share this page\'s URL, or take a copy with the downloads below.']) : null,
      tabBar, host,
      el('h3', {}, ['Take this with you']),
      el('div', { className: 'w-dls' }, [
        dl('starter-kit', 'Starter kit (zip)', 'The code with your portal.json prefilled. README with Vercel and localhost steps. No keys.', 'For your engineers and CTO'),
        dl('single-file', 'One-file demo (HTML)', 'One file that asks for the key when opened.', 'For a quick show-and-tell'),
        dl('how-its-built', 'How it\'s built (MD)', 'Architecture, token flow with row-level security, API calls, what to change for production.', 'For your CTO'),
        dl('demo-script', 'Demo script (MD)', 'A 5-minute walkthrough of your portal.', 'For pitching your CPO')
      ])
    ]);
  }

  function stepDeploy() {
    let spec;
    try { spec = portalSpec(); } catch { return null; }
    return step(5, 'Deploy and take it home', 'Run your portal on Vercel or your laptop, and download what you need to sell it internally.', [deployPanel(spec)], { done: false });
  }

  // ---------- page ----------
  function render() {
    const root = $('#wizard');
    root.hidden = false;
    root.innerHTML = '';
    const resume = W.built && credsReady() ? el('div', { className: 'w-resume' }, [
      el('span', {}, [`Your portal "${W.moduleName}" is in your Luzmo account.`]),
      el('button', { className: 'w-btn primary', onclick: () => openPortal() }, ['Open my portal'])
    ]) : null;
    const steps = el('div', { className: 'w-steps-col' }, [stepConnect(), stepBrand(), stepData(), stepBuild(), stepDeploy()]);
    root.append(...[
      el('header', { className: 'w-header' }, [
        el('div', { className: 'w-logo-luzmo' }, ['Luzmo']),
        el('div', {}, [el('h1', {}, ['Your embedded analytics, in ten minutes']), el('p', {}, ['Connect your trial, paste your website, and get a branded, multi-tenant analytics portal with self-service and AI. Built in your own Luzmo account.'])]),
        el('a', { className: 'w-btn ghost', href: 'https://calendly.com/d/cygt-jjc-tr4/luzmo-technical-call-1h', target: '_blank', rel: 'noopener', onclick: () => track('cta_clicked', { cta: 'technical_call', where: 'wizard' }) }, ['Book a technical call'])
      ]),
      resume,
      el('div', { className: 'w-layout' }, [steps, el('aside', { className: 'w-preview-col' }, [el('div', { className: 'w-preview-label' }, ['Live preview']), el('div', { id: 'wPreview', className: 'w-preview' })])]),
      el('datalist', { id: 'w-fonts' }, [...new Set([...(W.fetched?.fonts?.google || []), W.fetched?.fonts?.body, W.fetched?.fonts?.heading, ...FONTS].filter(Boolean))].map((f) => el('option', { value: f })))
    ].filter(Boolean));
    refreshPreview();
  }

  function start({ server, config } = {}) {
    load();
    W.server = !!server;
    document.querySelectorAll('.screen').forEach((s) => { s.hidden = true; });
    track('wizard_started', { server: W.server, returning: !!W.built });
    if (config?.hasPortal && !config.configured) {
      P().toast('This deployment has portal.json but no Luzmo key yet. Add LUZMO_API_KEY and LUZMO_API_TOKEN in Vercel, or use the wizard below.');
    }
    render();
  }

  function reopen() {
    document.getElementById('portal')?.remove();
    document.getElementById('aiPop')?.remove();
    document.getElementById('aiFab')?.remove();
    document.getElementById('how')?.remove();
    document.title = 'Luzmo trial';
    render();
    window.scrollTo(0, 0);
  }

  // The one-file demo: only the connect step, then open (or build) the portal it was made for.
  function startSingleFile(spec) {
    load();
    document.querySelectorAll('.screen').forEach((s) => { s.hidden = true; });
    const root = $('#wizard');
    root.hidden = false;
    root.innerHTML = '';
    P().applyBrand(spec.brand);
    document.title = spec.brand.productName;
    const log = el('div', { className: 'w-log', hidden: true });
    const add = (msg, kind = '') => { log.hidden = false; log.append(el('div', { className: `log-line ${kind}` }, [msg])); };
    const go = async (build) => {
      if (!credsReady()) return add('Fill in the API key and token first.', 'err');
      log.innerHTML = '';
      const backend = backendFor(spec, add);
      try {
        if (build) await backend.setup(); else await backend.open();
        $('#wizard').hidden = true;
        P().open({ portal: spec, backend, apiHost: apiHost(), appServer: appServer(), mode: 'browser' });
      } catch (err) {
        add(err.message, 'err');
        if (/Could not reach/.test(err.message)) add('Your browser may block calls from a local file. Open the file in Chrome.', 'muted');
      }
    };
    root.append(
      el('header', { className: 'w-header' }, [P().brandMark(spec.brand), el('div', {}, [el('h1', {}, [spec.brand.productName]), el('p', {}, [`Analytics for ${spec.company}, powered by Luzmo. Connect the Luzmo account it was built in.`])])]),
      el('div', { className: 'w-layout single' }, [el('div', { className: 'w-steps-col' }, [
        stepConnect({ singleFile: true }),
        el('div', { className: 'w-actions' }, [el('button', { className: 'w-btn primary', onclick: () => go(false) }, ['Open portal']), el('button', { className: 'w-btn', onclick: () => go(true) }, ['Build it in this account'])]),
        log
      ])])
    );
  }

  window.LuzmoWizard = { start, startSingleFile, reopen, deployPanel };
})();
