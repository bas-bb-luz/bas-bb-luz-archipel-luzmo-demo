// Shared Luzmo logic for the prospect portal. Runs in the Vercel functions (Node) and, for the
// offline single-file build, in the browser. `call(resource, body)` does the actual Core API request.
// Token, theme, EDE and dashboard shapes follow the Otto Group demo app, which runs against live Luzmo.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.LuzmoKitCore = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  const ALL = 'All organisations';
  const CHUNK = 5000;

  class ApiError extends Error {
    constructor(status, body) {
      const msg = typeof body === 'string' ? body : body?.message || body?.error?.message || JSON.stringify(body);
      super(`HTTP ${status}: ${String(msg).slice(0, 400)}`);
      this.status = status;
      this.body = body;
    }
  }

  const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
  const rowsOf = (res) => (Array.isArray(res?.rows) ? res.rows : Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []);
  const idOf = (res) => res?.id ?? rowsOf(res)[0]?.id ?? res?.securable_id;
  const nameOf = (r) => (typeof r?.name === 'string' ? r.name : r?.name?.en);
  const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const pretty = (name) => name.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
  const uuid = () => (globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : require('crypto').randomUUID());

  function hexToRgb(hex, alpha) {
    const h = hex.replace('#', '');
    const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
    const rgb = `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
    return alpha == null ? `rgb(${rgb})` : `rgba(${rgb}, ${alpha})`;
  }

  // ---------- themes ----------
  function dashboardTheme(P) {
    const b = P.brand;
    return {
      type: 'custom',
      mainColor: b.primary,
      background: b.background,
      itemsBackground: b.surface,
      editBackground: b.background,
      editDarkOrLight: 'light-edit',
      boxShadow: { size: 'none', color: 'rgb(0,0,0)' },
      borders: {
        'border-top-width': '1px',
        'border-right-width': '1px',
        'border-bottom-width': '1px',
        'border-left-width': '1px',
        'border-radius': '14px',
        'border-style': 'solid',
        'border-color': hexToRgb(b.primary, 0.1)
      },
      margins: [12, 12],
      // Charts also read this padding, a donut uses it as the gap between slices. Keep it small.
      itemSpecific: { rounding: 6, padding: 4 },
      title: { align: 'left', bold: true, italic: false, underline: false, border: false, fontSize: 15, lineHeight: 44 },
      font: { fontFamily: b.font, fontSize: 14 },
      axis: { fontSize: 12 },
      legend: { type: 'circle', fontSize: 12, lineHeight: 16 },
      tooltip: { background: b.primary, fontSize: 12 },
      colors: b.palette
    };
  }

  // Flex charts take an item theme only: no mainColor, background, id or darkOrLight.
  function itemTheme(P, framed = true) {
    const b = P.brand;
    const theme = {
      type: 'custom',
      itemsBackground: b.surface,
      colors: b.palette,
      font: { fontFamily: b.font, fontSize: 14 },
      title: { align: 'left', bold: true, fontSize: 15 }
    };
    if (!framed) {
      theme.borders = { 'border-style': 'none', 'border-radius': '0px', 'border-top-width': '0px', 'border-right-width': '0px', 'border-bottom-width': '0px', 'border-left-width': '0px' };
      theme.boxShadow = { size: 'none', color: 'rgba(0,0,0,0)' };
      theme.margins = [0, 0];
    }
    return theme;
  }

  // Token CSS. Host page CSS cannot reach into Luzmo's frames, so the brand color goes in here.
  function embedCss(P) {
    const p = P.brand.primary;
    return `
:root, :host, html, body {
  --luzmo-primary: ${p};
  --luzmo-primary-hover: ${p};
  --luzmo-primary-focus: ${p};
  --luzmo-primary-inverse-color: #ffffff;
  --luzmo-primary-rgb: ${hexToRgb(p).slice(4, -1)};
  --luzmo-accent: ${p};
  --luzmo-button-primary-background: ${p};
  --luzmo-button-primary-border-color: ${p};
  --luzmo-button-primary-color: #ffffff;
}`.trim();
  }

  function iqContext(P, tenant) {
    const ai = `${P.brand.logoText} AI`;
    return [
      `You are ${ai}, the learning analytics assistant inside the ${P.company} platform.`,
      tenant === ALL
        ? `The user is a ${P.company} admin who can see all customer organisations.`
        : `The user is an HR or L&D manager at ${tenant}. Only data for ${tenant} is available. Never mention other organisations.`,
      'Use the column descriptions. Completion rate is the average of is_completed. Compliance rate is the average of is_compliant.',
      'Archipel Unlimited is a flat monthly fee per employee. Pay per course is billed per enrollment.',
      'Answer briefly in plain business English and add a chart when it helps.'
    ].join('\n');
  }

  // ---------- slots, filters and dashboard contents ----------
  // Slot columns carry both key styles: Flex reads datasetId/columnId, dashboard contents set/column.
  function queryableColumn(col) {
    const datasetId = String(col.datasetId || col.set || col.dataset_id || '');
    const columnId = String(col.columnId || col.column || col.column_id || '');
    const next = { ...col, datasetId, columnId };
    if (datasetId) next.set = datasetId;
    if (columnId) next.column = columnId;
    const type = String(col.type || '');
    if (type === 'numeric' && !next.aggregationFunc && !next.formulaId && !next.formula) next.aggregationFunc = 'sum';
    if ((type === 'datetime' || type === 'hierarchy') && !next.level) {
      next.level = type === 'datetime' ? (col.lowestLevel > 0 ? col.lowestLevel : 5) : 1;
    }
    return next;
  }

  const queryableSlots = (slots) =>
    (Array.isArray(slots) ? slots : []).map((s) => ({
      name: typeof s?.name === 'string' ? s.name : 'unknown',
      content: Array.isArray(s?.content) ? s.content.map((c) => queryableColumn(c || {})) : []
    }));

  // AI filters come back in mixed key styles. Flex queries want snake_case column refs.
  function coreParam(p) {
    if (!isObj(p)) return p;
    const out = {};
    for (const [k, v] of Object.entries(p)) if (!['datasetId', 'columnId', 'formulaId', 'lowestLevel', 'lowest_level'].includes(k)) out[k] = v;
    for (const [camel, snake] of [['datasetId', 'dataset_id'], ['columnId', 'column_id'], ['formulaId', 'formula_id']]) {
      const v = p[camel] ?? p[snake];
      if (v !== undefined) out[snake] = v;
    }
    const lowest = p.lowestLevel ?? p.lowest_level;
    if (!out.level && lowest > 0) out.level = lowest;
    return out;
  }

  function queryableFilters(filters) {
    const walk = (node) => {
      if (!isObj(node)) return node;
      if (Array.isArray(node.parameters) && typeof node.expression === 'string') {
        const parameters = node.parameters.map((p, i) => (i === 0 ? coreParam(p) : p));
        const value = parameters[1];
        if (isObj(parameters[0]) && !parameters[0].level && (/^\d{4}-\d{2}-\d{2}T/.test(String(Array.isArray(value) ? value[0] : value)) || /[<>]|between/.test(node.expression))) {
          parameters[0] = { ...parameters[0], level: 5 };
        }
        return { ...node, parameters, properties: { type: 'where', ...(isObj(node.properties) ? node.properties : {}) } };
      }
      const next = { ...node };
      if (Array.isArray(node.filters)) next.filters = node.filters.map(walk);
      if (Array.isArray(node.subGroups)) next.subGroups = node.subGroups.map(walk);
      if (!next.origin) next.origin = 'itemFilter';
      return next;
    };
    return Array.isArray(filters) ? filters.map(walk) : [];
  }

  function cleanOptions(options = {}) {
    const next = { ...options };
    if (isObj(next.title) && 'show' in next.title && !('en' in next.title)) delete next.title;
    next.display = { ...(isObj(next.display) ? next.display : {}) };
    if (next.display.title === undefined) next.display.title = true;
    delete next.theme;
    return next;
  }

  function datasetIdsIn(items) {
    const ids = new Set();
    for (const item of items) for (const slot of item.slots || []) for (const c of slot.content || []) {
      const id = c.datasetId || c.set || c.dataset_id;
      if (id) ids.add(id);
    }
    return [...ids];
  }

  const itemsOf = (contents) => {
    const views = contents?.views || [];
    return (views.find((v) => v.screenModus === 'desktop') || views[0])?.items || [];
  };

  function nextPosition(items) {
    const bottom = items.reduce((m, i) => Math.max(m, (i.position?.row ?? 0) + (i.position?.sizeY ?? 20)), 0);
    return { col: 0, row: bottom, sizeX: 24, sizeY: 20 };
  }

  const chartToItem = (value, existing = []) => ({
    id: uuid(),
    type: value.type || 'bar-chart',
    options: cleanOptions(value.options || {}),
    slots: queryableSlots(value.slots || []),
    filters: queryableFilters(value.filters || []),
    position: value.position || nextPosition(existing)
  });

  // Dashboard agent output can be the contents, a securable with contents, or a list of items.
  function dashboardFromAsset(value) {
    const v = value?.contents || value?.dashboard?.contents || value;
    if (Array.isArray(v?.views)) return { name: nameOf(value) || value?.title?.en, items: itemsOf(v) };
    if (Array.isArray(v?.items)) return { name: nameOf(value), items: v.items };
    return null;
  }

  // Chart options with sensible defaults: a legend wherever colors carry meaning, tidy donut slices.
  function chartOptions(chart, extra = {}) {
    const o = chart.options || {};
    const hasLegend = chart.type === 'donut-chart' || Object.keys(chart.slots || {}).includes('legend');
    const base = chart.type === 'donut-chart' ? { slices: { padding: 2, roundedCorners: 4, ...(o.slices || {}) }, legend: { position: 'right', ...(o.legend || {}) } }
      : hasLegend ? { legend: { position: 'bottom', ...(o.legend || {}) } } : {};
    return { ...o, ...base, ...extra, display: { ...(hasLegend ? { legend: true } : {}), ...(o.display || {}), ...(extra.display || {}) } };
  }

  // ---------- the Luzmo-side model of one prospect ----------
  function createCore({ P, call, log = () => {}, exportEmail = null }) {
    const state = { datasets: {}, themeId: null, dashboardId: null, pageDashboards: {}, customDashboards: [] };

    function columnRef(dataset, column) {
      const ds = state.datasets[dataset];
      const col = ds?.columns?.[column];
      if (!col) throw new Error(`Column ${dataset}.${column} is not in Luzmo`);
      return { datasetId: ds.id, columnId: col.id, type: col.type };
    }

    function slotContent(s) {
      const ref = columnRef(s.dataset, s.column);
      const c = { datasetId: ref.datasetId, columnId: ref.columnId, type: ref.type, label: { en: s.label || pretty(s.column) } };
      if (s.agg) {
        c.aggregationFunc = s.agg;
        c.format = s.format || ',.0f';
      } else if (ref.type === 'datetime') {
        c.level = s.level || 3;
        c.lowestLevel = 5;
      } else if (ref.type === 'hierarchy') {
        c.level = 1;
      }
      return c;
    }

    const specSlots = (chart) => Object.entries(chart.slots).map(([name, items]) => ({ name, content: items.map(slotContent) }));

    function specFilters(chart) {
      if (!chart.filter) return [];
      const dataset = Object.values(chart.slots)[0][0].dataset;
      const ref = columnRef(dataset, chart.filter.column);
      return [{ condition: 'and', filters: [{ expression: '? = ?', parameters: [{ columnId: ref.columnId, datasetId: ref.datasetId }, chart.filter.value] }] }];
    }

    // Charts with a drillable column as a dimension get a click action. Luzmo shows it in the
    // data point menu and sends a customEvent named drill:<column> to the page.
    function drillOptions(chart) {
      const dims = Object.entries(chart.slots).filter(([name]) => name !== 'measure').flatMap(([, items]) => items.map((s) => s.column));
      const events = (P.drilldowns || []).filter((d) => dims.includes(d.column)).map((d) => ({ name: `drill:${d.column}`, label: { en: d.label } }));
      return events.length ? { interactivity: { ...(chart.options?.interactivity || {}), customEvents: { events } } } : {};
    }

    // Filters for a chart on a drill page: its own filter plus column = value on the chart's dataset.
    function drillFilters(chart, column, value) {
      const groups = specFilters(chart);
      const dataset = Object.values(chart.slots)[0][0].dataset;
      const col = state.datasets[dataset]?.columns?.[column];
      if (!col) return groups;
      const leaf = { expression: '? = ?', parameters: [{ columnId: col.id, datasetId: state.datasets[dataset].id }, value] };
      if (groups.length) groups[0].filters.push(leaf);
      else groups.push({ condition: 'and', filters: [leaf] });
      return groups;
    }

    function buildContents(items) {
      const normalized = items.map((it) => ({
        id: it.id || uuid(),
        type: it.type,
        position: it.position || { col: 0, row: 0, sizeX: 24, sizeY: 20 },
        options: it.type === 'text' ? it.options : cleanOptions(it.options),
        slots: queryableSlots(it.slots || []),
        filters: it.type === 'text' ? [] : queryableFilters(it.filters || [])
      }));
      const theme = state.themeId ? { id: state.themeId } : dashboardTheme(P);
      const view = (screenModus) => ({
        screenModus,
        options: { theme, share: { poweredBy: false, showBackground: false }, showTitle: false, columns: 48, rowHeight: 16, maxCols: 48, minCols: 48 },
        filterGroups: [],
        // Same items on every screen mode, so syncScreenModes cannot wipe desktop.
        items: normalized
      });
      return {
        version: '0.1.99',
        syncScreenModes: true,
        timezone: { type: 'fixed', id: P.timezone || 'Europe/Amsterdam' },
        parameters: [],
        filters: {},
        datasetLinks: Object.fromEntries(datasetIdsIn(normalized).map((id) => [id, []])),
        views: [view('desktop'), view('tablet'), view('mobile')]
      };
    }

    // Lays charts out on Luzmo's 48-column grid. withHeaders adds a title row per page.
    function pageItems(pages, withHeaders) {
      const items = [];
      let row = 0;
      for (const page of pages) {
        if (withHeaders) {
          items.push({ type: 'text', position: { sizeX: 48, sizeY: 4, row, col: 0 }, options: { content: { en: `<h2>${page.title}</h2>` }, display: { title: false } }, slots: [] });
          row += 4;
        }
        let col = 0;
        let rowHeight = 0;
        for (const chart of page.charts) {
          const sizeX = chart.w * 4;
          const sizeY = chart.h === 1 ? 12 : 26;
          if (col + sizeX > 48) { row += rowHeight; col = 0; rowHeight = 0; }
          items.push({
            type: chart.type,
            position: { sizeX, sizeY, row, col },
            options: chartOptions(chart, { title: { en: chart.title }, display: { title: true }, ...drillOptions(chart) }),
            slots: specSlots(chart),
            filters: specFilters(chart)
          });
          col += sizeX;
          rowHeight = Math.max(rowHeight, sizeY);
        }
        row += rowHeight;
      }
      return items;
    }

    const demoName = () => `${P.brand.productName} | ${P.company} demo`;
    const pageName = (page) => `${P.brand.productName} | ${page.title}`;
    const themeName = () => `${P.company} demo`;

    async function listSecurables(type, attributes = ['id', 'name', 'type']) {
      return rowsOf(await call('securable', { action: 'get', find: { where: { type }, attributes, limit: 500 } }));
    }

    async function readColumns(id) {
      const cols = rowsOf(await call('column', { action: 'get', find: { where: { securable_id: id } } }));
      const columns = {};
      for (const col of cols) columns[col.source_name || nameOf(col)] = { id: col.id, type: col.type };
      return columns;
    }

    // Rebuilds the id map from what exists in Luzmo, so a stateless server needs nothing stored.
    async function discover() {
      const datasets = await listSecurables('dataset');
      for (const [key, spec] of Object.entries(P.datasets)) {
        const found = datasets.find((r) => nameOf(r) === spec.name);
        if (found) state.datasets[key] = { id: found.id, columns: await readColumns(found.id) };
      }
      const dashboards = await listSecurables('dashboard', ['id', 'name', 'custom_metadata']);
      state.dashboardId = dashboards.find((r) => nameOf(r) === demoName())?.id || null;
      state.pageDashboards = {};
      for (const page of P.pages) {
        const found = dashboards.find((r) => nameOf(r) === pageName(page));
        if (found) state.pageDashboards[page.id] = found.id;
      }
      state.customDashboards = dashboards
        .filter((r) => (r.custom_metadata || r.customMetadata || {}).kit === P.slug)
        .map((r) => ({ id: r.id, name: nameOf(r) || 'Dashboard', tenant: (r.custom_metadata || r.customMetadata).tenant || ALL }));
      try {
        state.themeId = rowsOf(await call('theme', { action: 'get', find: { attributes: ['id', 'name'] } })).find((t) => nameOf(t) === themeName())?.id || null;
      } catch {
        state.themeId = null;
      }
      return state;
    }

    const ready = () => Object.keys(P.datasets).every((k) => state.datasets[k]?.id);

    // ---------- setup steps (each one short, so a serverless function can run it) ----------
    async function setupTheme() {
      const name = { en: themeName() };
      const theme = dashboardTheme(P);
      try {
        const existing = rowsOf(await call('theme', { action: 'get', find: { attributes: ['id', 'name'] } })).find((t) => nameOf(t) === name.en);
        if (existing) {
          await call('theme', { action: 'update', id: existing.id, properties: { name, theme } });
          state.themeId = existing.id;
        } else {
          state.themeId = idOf(await call('theme', { action: 'create', properties: { name, theme } }));
        }
        log('Theme is ready', 'ok');
      } catch (err) {
        state.themeId = null;
        log(`Could not save the theme, using it inline instead (${err.message})`, 'warn');
      }
    }

    // Pushes rows [offset, offset + CHUNK). Returns the next offset, or null when done.
    async function setupDataChunk(key, rows, offset) {
      const spec = P.datasets[key];
      const header = spec.columns.map((c) => c.name);
      const chunk = rows.slice(offset, offset + CHUNK);
      let id = state.datasets[key]?.id;
      if (offset === 0 && !id) {
        id = (await listSecurables('dataset')).find((r) => nameOf(r) === spec.name)?.id;
        log(id ? `Replacing data in "${spec.name}"` : `Creating dataset "${spec.name}"`);
      }
      if (!id) {
        const res = await call('data', { action: 'create', properties: { type: 'create', data: chunk, options: { update_metadata: true, header, name: { en: spec.name } } } });
        id = idOf(res);
        if (!id) throw new Error(`Luzmo created the dataset but returned no id: ${JSON.stringify(res).slice(0, 300)}`);
      } else {
        await call('data', { action: 'create', properties: { securable_id: id, type: offset === 0 ? 'replace' : 'append', data: chunk, options: { update_metadata: true, header } } });
      }
      state.datasets[key] = { id, columns: state.datasets[key]?.columns || {} };
      log(`  rows ${offset + 1} to ${offset + chunk.length} of ${rows.length}`, 'muted');
      return offset + CHUNK < rows.length ? offset + CHUNK : null;
    }

    // Labels and descriptions give the AI business context per column.
    async function setupColumns(key) {
      const spec = P.datasets[key];
      const id = state.datasets[key].id;
      await call('securable', { action: 'update', id, properties: { description: { en: spec.description } } })
        .catch((err) => log(`  could not set the dataset description (${err.message})`, 'warn'));
      const columns = await readColumns(id);
      for (const c of spec.columns) {
        const col = columns[c.name];
        if (!col) { log(`  column "${c.name}" not found in Luzmo`, 'warn'); continue; }
        const props = { name: { en: pretty(c.name) }, description: { en: c.description } };
        if (col.type !== c.type) {
          props.type = c.type;
          log(`  ${c.name} came in as ${col.type}, setting it to ${c.type}`, 'muted');
        }
        try {
          await call('column', { action: 'update', id: col.id, properties: props });
          col.type = c.type;
        } catch (err) {
          log(`  could not update ${c.name} (${err.message})`, 'warn');
        }
      }
      state.datasets[key].columns = columns;
      log(`  ${spec.name} is ready`, 'ok');
    }

    async function linkDatasets(dashboardId, ids) {
      for (const id of ids) {
        await call('securable', { action: 'associate', id: dashboardId, resource: { role: 'Securables', id } })
          .catch(() => call('securable', { action: 'associate', id: dashboardId, resource: { model: 'Dataset', id } }))
          .catch(() => { /* already linked or not needed */ });
      }
    }

    async function upsertNamed(name, contents, existing) {
      const found = existing.find((r) => nameOf(r) === name);
      let id = found?.id;
      if (id) await call('securable', { action: 'update', id, properties: { contents } });
      else id = idOf(await call('securable', { action: 'create', properties: { type: 'dashboard', name: { en: name }, contents } }));
      await linkDatasets(id, Object.values(state.datasets).map((d) => d.id));
      return id;
    }

    // The combined demo dashboard (self-service EDE) plus one dashboard per portal page.
    async function setupDashboards() {
      const existing = await listSecurables('dashboard');
      try {
        state.dashboardId = await upsertNamed(demoName(), buildContents(pageItems(P.pages, true)), existing);
        log('Demo dashboard is ready', 'ok');
      } catch (err) {
        state.dashboardId = null;
        log(`Demo dashboard failed. The rest still works. (${err.message})`, 'warn');
      }
      state.pageDashboards = {};
      for (const page of P.pages) {
        try {
          state.pageDashboards[page.id] = await upsertNamed(pageName(page), buildContents(pageItems([page], false)), existing);
          log(`  ${page.title} dashboard is ready`, 'ok');
        } catch (err) {
          log(`  ${page.title} falls back to Flex charts (${err.message})`, 'warn');
        }
      }
    }

    // ---------- tokens ----------
    const visibleDashboards = (tenant) => state.customDashboards.filter((d) => tenant === ALL || d.tenant === tenant || d.tenant === ALL);

    // Embed token locked to one organisation with a row-level filter on the tenant column.
    async function mintToken(tenant, days = 1) {
      const tenantKey = slugify(tenant);
      const datasets = Object.values(state.datasets);
      const filters = tenant === ALL ? [] : datasets
        .filter((ds) => ds.columns[P.tenantColumn])
        .map((ds) => ({ clause: 'where', origin: 'global', securable_id: ds.id, column_id: ds.columns[P.tenantColumn].id, expression: '? = ?', value: tenant }));
      const dashboards = [state.dashboardId, ...Object.values(state.pageDashboards), ...visibleDashboards(tenant).map((d) => d.id)].filter(Boolean);
      const base = {
        type: 'embed',
        expiry: new Date(Date.now() + days * 864e5).toISOString(),
        username: `${P.slug}-${tenantKey}`,
        name: tenant === ALL ? `${P.company} admin` : `${tenant} HR manager`,
        // The email prefills the recipient in export and schedule dialogs, so a real inbox helps in demos.
        email: exportEmail || `demo+${tenantKey}@${P.slug}.example`,
        suborganization: `${P.slug}-${tenantKey}`,
        role: 'designer',
        filters,
        access: {
          datasets: datasets.map((ds) => ({ id: ds.id, rights: 'use' })),
          dashboards: dashboards.map((id) => ({ id, rights: 'use' }))
        }
      };
      // flag_embedded_studio_update lets designers save in the embedded editor (EDE).
      const features = ['!flag_share', '!flag_commenting', '!flag_private_sharing', '!flag_create_datasets', '!flag_tour', 'flag_add_ai_items', 'flag_embedded_studio_update'];
      const extras = { theme: dashboardTheme(P), css: embedCss(P), locale_id: 'en', currency_id: 'EUR', iq: { context: iqContext(P, tenant) }, feature_overrides: features };
      const { iq, css, ...rest } = extras;
      const variants = [{ ...base, ...extras }, { ...base, ...rest }, { ...base, feature_overrides: features }, base];
      let firstErr;
      for (const properties of variants) {
        try {
          const auth = await call('authorization', { action: 'create', properties });
          return { key: auth.id, token: auth.token, tenant, expiry: base.expiry };
        } catch (err) {
          if (!(err instanceof ApiError)) throw err;
          firstErr = firstErr || err;
        }
      }
      throw firstErr;
    }

    // ---------- custom dashboards (My dashboards) ----------
    async function getContents(id) {
      const row = rowsOf(await call('securable', { action: 'get', find: { where: { id }, attributes: ['id', 'name', 'contents'] } }))[0];
      if (!row) throw new Error('Dashboard not found');
      return row.contents;
    }

    async function createDashboard(name, items, tenant) {
      const contents = buildContents(items);
      const id = idOf(await call('securable', {
        action: 'create',
        properties: { type: 'dashboard', name: { en: name }, contents, custom_metadata: { kit: P.slug, tenant, built_with: 'portal' } }
      }));
      if (!id) throw new Error('Luzmo did not return an id for the new dashboard');
      const used = datasetIdsIn(itemsOf(contents));
      await linkDatasets(id, used.length ? used : Object.values(state.datasets).map((d) => d.id));
      state.customDashboards.push({ id, name, tenant });
      return { id, name, tenant };
    }

    // Only the portal's own dashboards can be written through the portal.
    function assertWritable(id) {
      const allowed = id === state.dashboardId || Object.values(state.pageDashboards).includes(id) || state.customDashboards.some((d) => d.id === id);
      if (!allowed) throw new Error('This dashboard is not part of the demo');
    }

    async function saveItems(id, items, name) {
      assertWritable(id);
      const properties = { contents: buildContents(items) };
      if (name) properties.name = { en: name };
      await call('securable', { action: 'update', id, properties });
      const mine = state.customDashboards.find((d) => d.id === id);
      if (mine && name) mine.name = name;
    }

    async function getItems(id) {
      assertWritable(id);
      return itemsOf(await getContents(id));
    }

    // ---------- scheduled exports ----------
    // Same query as the Otto demo: schedules with their dashboard and creator. Only this portal's
    // dashboards, and only the ones created by this organisation's embed user unless viewing all.
    async function listSchedules(tenant) {
      const ours = new Set([state.dashboardId, ...Object.values(state.pageDashboards), ...state.customDashboards.map((d) => d.id)].filter(Boolean));
      const username = `${P.slug}-${slugify(tenant)}`;
      let rows = [];
      try {
        rows = rowsOf(await call('schedule', { action: 'get', find: {
          include: [
            { model: 'Securable', where: { type: 'dashboard' }, attributes: ['id', 'name', 'type'], jointype: 'inner' },
            { model: 'User', attributes: ['id', 'name', 'email', 'username'] }
          ],
          order: [['updated_at', 'desc']]
        } }));
      } catch {
        rows = rowsOf(await call('export', { action: 'get', find: {} }).catch(() => []));
      }
      return rows
        .map((r) => {
          const task = r.task || {};
          const securable = r.securable || r.securables?.[0] || {};
          const user = r.user || r.users?.[0] || {};
          return {
            id: r.id,
            dashboardId: r.securable_id || securable.id,
            dashboardName: nameOf(securable) || 'Dashboard',
            format: typeof task.type === 'string' ? task.type.toUpperCase() : undefined,
            recipients: Array.isArray(task.emails) ? task.emails : [],
            subject: task.subject,
            frequencyQuantity: r.frequency_quantity,
            frequencyUnit: r.frequency_unit,
            scheduledAt: r.scheduled_at || r.started_at,
            active: r.active,
            lastStatus: r.last_execution_status || null,
            username: user.username
          };
        })
        .filter((r) => ours.has(r.dashboardId) && (r.format || r.recipients.length))
        .filter((r) => tenant === ALL || !r.username || r.username === username);
    }

    return {
      state, ready, discover, mintToken, visibleDashboards, listSchedules,
      setupTheme, setupDataChunk, setupColumns, setupDashboards,
      createDashboard, saveItems, getItems,
      specSlots, specFilters, drillFilters
    };
  }

  return {
    ALL, CHUNK, ApiError, createCore, dashboardTheme, itemTheme, embedCss, iqContext, chartOptions,
    queryableSlots, queryableFilters, cleanOptions, chartToItem, nextPosition, itemsOf, dashboardFromAsset,
    rowsOf, nameOf, slugify, pretty, hexToRgb, isObj
  };
});
