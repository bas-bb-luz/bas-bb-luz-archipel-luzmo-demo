// The branded portal. Three ways to run it, same code:
// - Hosted trial: the wizard (wizard.js) builds everything in the trial user's Luzmo account from the
//   browser and opens the portal with the key held in the browser session only.
// - Deployed (Vercel or npm run dev with .env and portal.json): /api/* holds the key, the browser only
//   ever gets embed tokens.
// - Single file (window.__LOCAL__): asks for the key when opened, calls Luzmo from the browser.
(function () {
  const Core = window.LuzmoKitCore;
  const Gen = window.LuzmoTrialGen;
  const HowTo = window.LuzmoHowTo;
  const track = (name, props) => window.LuzmoTrack?.(name, props);
  const $ = (sel) => document.querySelector(sel);
  const el = (tag, props = {}, children = []) => {
    const node = Object.assign(document.createElement(tag), props);
    children.forEach((c) => c != null && c !== false && node.append(c));
    return node;
  };
  const ALL = Core.ALL;

  const S = {
    P: null,
    mode: 'browser',
    apiHost: 'https://api.luzmo.com',
    appServer: 'https://app.luzmo.com',
    state: { datasets: {}, pageDashboards: {}, customDashboards: [] },
    tokens: {},
    auth: null,
    tenant: null,
    current: null,
    chatOpen: false,
    chatWide: false,
    chats: {},
    builder: null,
    iq: null,
    howOpen: false,
    howTopic: null
  };
  let backend;
  const P = () => S.P;
  const F = () => Core.features(P());
  const AI_NAME = () => Core.aiName(P());
  const tenants = () => (F().tenants ? [ALL, ...P().tenants.map((t) => t.name)] : [ALL]);

  function toast(msg, action) {
    const t = el('div', { className: 'toast' }, [el('span', {}, [msg])]);
    if (action) t.append(el('button', { className: 'link', onclick: () => { action.run(); t.remove(); } }, [action.label]));
    document.body.append(t);
    setTimeout(() => t.remove(), 6000);
  }

  // Small dropdown menu used for Edit dashboard, Export, Create new and Take this with you.
  function menu(label, items, { primary = false, className = '' } = {}) {
    const wrap = el('div', { className: `menu ${className}` });
    const list = el('div', { className: 'menu-list', hidden: true });
    const btn = el('button', { className: `btn ${primary ? 'primary' : ''}`, onclick: (e) => { e.stopPropagation(); document.querySelectorAll('.menu-list').forEach((l) => { if (l !== list) l.hidden = true; }); list.hidden = !list.hidden; } }, [label, el('span', { className: 'caret' }, ['▾'])]);
    for (const it of items.filter(Boolean)) {
      list.append(el('button', {
        className: 'menu-item', disabled: !!it.disabled, title: it.title || '',
        onclick: async (e) => {
          e.stopPropagation();
          list.hidden = true;
          try { await it.run(); } catch (err) { toast(err.message); }
        }
      }, [el('strong', {}, [it.label]), it.hint ? el('small', {}, [it.hint]) : null]));
    }
    wrap.append(btn, list);
    return wrap;
  }
  document.addEventListener('click', () => document.querySelectorAll('.menu-list').forEach((l) => { l.hidden = true; }));

  // ---------- backends ----------
  async function postJson(url, body, headers = {}) {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw Object.assign(new Error(json.error || `HTTP ${res.status}`), { status: res.status });
    return json;
  }

  // Deployed portal: every write and every token goes through the server functions.
  function serverBackend(config) {
    return {
      local: false,
      setupProtected: config.setupProtected,
      async setup(secret, log) {
        let step = { step: 'start' };
        while (step) {
          const out = await postJson('/api/setup', step, secret ? { 'x-setup-secret': secret } : {});
          out.lines.forEach((l) => log(l.msg, l.kind));
          S.state = out.state;
          step = out.next;
        }
      },
      async token(tenant) {
        const out = await postJson('/api/token', { tenant });
        S.state = out.state;
        return out.token;
      },
      async getItems(id) { return (await postJson('/api/dashboards', { op: 'get', tenant: S.tenant, id })).items; },
      async create(name, items) {
        const out = await postJson('/api/dashboards', { op: 'create', tenant: S.tenant, name, items });
        S.state.customDashboards = mergeDashboards(out.dashboards);
        S.tokens[S.tenant] = out.token;
        return out.dashboard;
      },
      async save(id, items, name) {
        const out = await postJson('/api/dashboards', { op: 'save', tenant: S.tenant, id, items, name });
        S.state.customDashboards = mergeDashboards(out.dashboards);
      },
      async schedules() { return (await postJson('/api/exports', { tenant: S.tenant })).schedules; }
    };
  }

  // Server lists only this tenant's dashboards; keep the other tenants' entries we already know.
  function mergeDashboards(list) {
    const others = (S.state.customDashboards || []).filter((d) => d.tenant !== S.tenant && d.tenant !== ALL);
    return [...others, ...list];
  }

  // Browser: the same core runs here, calling Luzmo directly with the trial user's own key.
  function browserCall(creds) {
    return async (resource, body) => {
      let res;
      try {
        res = await fetch(`${creds.apiHost}/0.1.0/${resource}`, {
          method: 'POST', mode: 'cors', cache: 'no-cache', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...body, key: creds.key, token: creds.token, version: '0.1.0' })
        });
      } catch (err) {
        throw new Error(`Could not reach ${creds.apiHost}. Check the region and your internet connection. (${err.message})`);
      }
      const text = await res.text();
      let json;
      try { json = JSON.parse(text); } catch { json = text; }
      if (!res.ok) throw new Core.ApiError(res.status, json);
      return json;
    };
  }

  function localBackend(portal, creds, log = () => {}) {
    const core = Core.createCore({ P: portal, call: browserCall(creds), log: (...a) => log(...a) });
    return {
      local: true,
      core,
      testConnection: () => core.testConnection(),
      // Builds everything in the user's Luzmo account. onProgress gets a 0..1 fraction.
      async setup(onProgress = () => {}) {
        const data = Gen.generateData(portal);
        const total = Object.values(data).reduce((s, rows) => s + rows.length, 0);
        let done = 0;
        await core.discover();
        log('Connected to Luzmo', 'ok');
        await core.setupTheme();
        onProgress(0.05);
        for (const key of Object.keys(portal.datasets)) {
          let offset = 0;
          while (offset !== null) {
            const before = offset;
            offset = await core.setupDataChunk(key, data[key], offset);
            done += (offset ?? data[key].length) - before;
            onProgress(0.05 + 0.65 * (done / total));
          }
          await core.setupColumns(key);
        }
        onProgress(0.75);
        await core.setupDashboards();
        onProgress(0.95);
        S.state = core.state;
      },
      async open() {
        await core.discover();
        if (!core.ready()) throw new Error('This portal is not in your Luzmo account yet. Build it first.');
        S.state = core.state;
      },
      token: (tenant) => core.mintToken(tenant, 1),
      getItems: (id) => core.getItems(id),
      async create(name, items) {
        const d = await core.createDashboard(name, items, S.tenant);
        S.tokens[S.tenant] = await core.mintToken(S.tenant, 1);
        return d;
      },
      save: (id, items, name) => core.saveItems(id, items, name),
      schedules: () => core.listSchedules(S.tenant)
    };
  }

  // ---------- AI: /aiprompt with the tenant's embed token ----------
  // Embed key/token only, so answers respect the tenant filter.
  async function aiPrompt(properties, onEvent) {
    const res = await fetch(`${S.apiHost}/0.1.0/aiprompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
      body: JSON.stringify({ action: 'create', version: '0.1.0', key: S.auth.key, token: S.auth.token, properties: { stream: true, ...properties } })
    });
    if (!res.ok) {
      const text = await res.text();
      let json;
      try { json = JSON.parse(text); } catch { json = text; }
      throw new Core.ApiError(res.status, json);
    }
    if (!(res.headers.get('content-type') || '').includes('text/event-stream')) return fromFinal(await res.json(), '', new Map());
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let text = '';
    let conversationId;
    let final;
    const assets = new Map();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const frames = buffer.split('\n\n');
      buffer = frames.pop() || '';
      for (const frame of frames) {
        const data = frame.split('\n').filter((l) => l.startsWith('data:')).map((l) => l.slice(5).trimStart()).join('\n').trim();
        if (!data || data === '[DONE]') continue;
        let ev;
        try { ev = JSON.parse(data); } catch { continue; }
        if (typeof ev.conversation_id === 'string') conversationId = ev.conversation_id;
        if (ev.type === 'progress') {
          const msg = progressText(ev.progress);
          if (msg) onEvent?.({ type: 'progress', message: msg });
        } else if (ev.type === 'text_delta') {
          text += ev.delta;
          onEvent?.({ type: 'text', text });
        } else if (ev.type === 'asset_start') {
          assets.set(ev.asset_id, { type: ev.asset_type || 'item', value: {} });
          onEvent?.({ type: 'progress', message: ev.asset_type === 'dashboard' ? 'Building the dashboard' : 'Creating a chart' });
        } else if (ev.type === 'asset_delta') {
          const a = assets.get(ev.asset_id) || { type: 'item', value: {} };
          a.value = deepMerge(a.value, ev.delta || {});
          assets.set(ev.asset_id, a);
        } else if (ev.type === 'finish') {
          final = ev.result;
        } else if (ev.type === 'error') {
          throw new Error(ev.error_text || 'The AI returned an error');
        }
      }
    }
    const out = final ? fromFinal(final, text, assets) : { text: text.trim(), assets: [...assets.values()] };
    out.conversationId = out.conversationId || conversationId;
    return out;
  }

  function fromFinal(payload, streamed, assets) {
    const msg = payload?.assistant_message || {};
    const list = Array.isArray(msg.aiMessageAssets) ? msg.aiMessageAssets.map((a) => ({ type: a.type, value: a.value })) : [];
    return { text: (typeof msg.message === 'string' && msg.message.trim()) || streamed.trim(), assets: list.length ? list : [...assets.values()], conversationId: payload?.conversation_id };
  }

  function deepMerge(target, source) {
    const out = { ...target };
    for (const [k, v] of Object.entries(source)) out[k] = Core.isObj(v) && Core.isObj(out[k]) ? deepMerge(out[k], v) : v;
    return out;
  }

  function progressText(node) {
    const found = [];
    const walk = (n) => {
      if (!n) return;
      if (n.status === 'inProgress' && n.description) {
        let t = n.description;
        for (const [k, v] of Object.entries(n.description_metadata || n.descriptionMetadata || {})) t = t.replaceAll(`{{${k}}}`, Array.isArray(v) ? v.join(', ') : String(v));
        if (t.trim() && t.trim() !== '...') found.push(t.trim());
      }
      (n.children || []).forEach(walk);
    };
    walk(node);
    return found.pop() || null;
  }

  const aiBase = () => ({ locale_id: 'en', timezone_id: P().timezone || 'Europe/Amsterdam', text_format: 'markdown', response_mode: 'mixed', generated_asset_locale_ids: ['en'] });
  const datasetIds = () => Object.values(S.state.datasets).map((d) => d.id);
  const datasetInputs = () => datasetIds().map((id) => ({ type: 'dataset', id }));
  const isIqError = (msg) => /licen[cs]e|add-?on|not enabled|not allowed|upgrade|forbidden|iq/i.test(String(msg)) && /\b40[0-3]\b|licen|add-?on|enabled|upgrade/i.test(String(msg));

  async function askAnalyst(chat, text, onEvent) {
    const r = await aiPrompt({ agent: 'analyst', task: 'generate', ...aiBase(), ...(chat.conversationId ? { conversation_id: chat.conversationId } : {}), input: [{ type: 'text', text }] }, onEvent);
    chat.conversationId = r.conversationId || chat.conversationId;
    return { text: r.text, charts: r.assets.filter((a) => a.type === 'item' && a.value?.slots).map((a) => a.value) };
  }

  // Dashboard agent. Public docs differ on how the current dashboard is passed, so shapes are tried in order.
  async function runDashboardAgent(text, contents, onEvent) {
    const base = { agent: 'dashboard', task: 'generate', ...aiBase() };
    const input = [{ type: 'text', text }, ...datasetInputs()];
    const attempts = contents
      ? [{ type: 'dashboard', value: contents }, { type: 'dashboard', contents }].map((d) => () => aiPrompt({ ...base, input: [...input, d] }, onEvent))
      : [() => aiPrompt({ ...base, input }, onEvent), () => aiPrompt({ ...base, input: [{ type: 'text', text }] }, onEvent)];
    let firstErr;
    for (const attempt of attempts) {
      try {
        const r = await attempt();
        const dash = r.assets.map((a) => Core.dashboardFromAsset(a.value)).find(Boolean);
        if (!dash || !dash.items.length) throw new Error(r.text || 'The dashboard agent did not return a dashboard.');
        return { text: r.text, dashboard: dash };
      } catch (err) {
        if (!(err instanceof Core.ApiError)) throw err;
        firstErr = firstErr || err;
      }
    }
    throw firstErr;
  }

  // ---------- dashboards ----------
  const visibleDashboards = () => (S.state.customDashboards || []).filter((d) => S.tenant === ALL || d.tenant === S.tenant || d.tenant === ALL);
  const isTemplate = (id) => id === S.state.dashboardId || Object.values(S.state.pageDashboards || {}).includes(id);
  const dashName = (id) => visibleDashboards().find((d) => d.id === id)?.name
    || (id === S.state.dashboardId ? `${P().brand.productName} overview` : P().pages.find((p) => S.state.pageDashboards[p.id] === id)?.title || 'this dashboard');
  const routeFor = (id) => {
    const page = P().pages.find((p) => S.state.pageDashboards[p.id] === id);
    return page && F().templates ? page.id : `dash:${id}`;
  };
  // Deep link into the Luzmo app, to show that the portal is live-linked to the account.
  const luzmoAppUrl = (id) => `${S.appServer}/dashboard/${id}`;

  async function createDashboard(name, items) {
    const d = await backend.create(name, items);
    S.auth = S.tokens[S.tenant];
    renderNav();
    return d.id;
  }

  // Template pages are shared by every organisation, so edits land in the organisation's own copy.
  const copyName = (id) => `${dashName(id)} (my version)`;
  const existingCopy = (id) => visibleDashboards().find((d) => d.name === copyName(id) && d.tenant === S.tenant);

  async function ensureCopy(id) {
    if (!isTemplate(id)) return id;
    const copy = existingCopy(id);
    if (copy) return copy.id;
    const items = await backend.getItems(id);
    return createDashboard(copyName(id), items);
  }

  async function saveChanged(id, items) {
    if (isTemplate(id)) {
      const copy = existingCopy(id);
      if (copy) {
        await backend.save(copy.id, items);
        return { id: copy.id, copied: true };
      }
      return { id: await createDashboard(copyName(id), items), copied: true };
    }
    await backend.save(id, items);
    return { id, copied: false };
  }

  async function addChartTo(target, value) {
    if (target === 'builder') {
      ensureBuilder();
      S.builder.items.push(Core.chartToItem(value, S.builder.items));
      toast('Added to the report builder canvas', { label: 'Open', run: () => go('builder') });
      return;
    }
    if (target === 'new') {
      const name = window.prompt('Name for the new dashboard', value.options?.title?.en || 'My dashboard');
      if (!name) return;
      const id = await createDashboard(name.trim(), [Core.chartToItem(value)]);
      track('ai_chart_added', { target: 'new' });
      toast(`Created "${name.trim()}"`, { label: 'Open', run: () => go(`dash:${id}`) });
      return;
    }
    const source = isTemplate(target) && existingCopy(target) ? existingCopy(target).id : target;
    const items = await backend.getItems(source);
    const out = await saveChanged(target, [...items, Core.chartToItem(value, items)]);
    track('ai_chart_added', { target: 'dashboard' });
    if (S.current === routeFor(target) || out.copied) go(routeFor(out.id));
    toast(out.copied ? `Saved in your own version of ${dashName(target)}` : `Added to ${dashName(target)}`, { label: 'Open', run: () => go(routeFor(out.id)) });
  }

  // ---------- the assistant (one chat, everywhere) ----------
  // It decides on its own: answer a question, build a new dashboard, or change the open one.
  const BUILD_RE = /\b(build|create|make|generate|design|set up|start|give me)\b[^.?!]{0,60}\b(dashboard|report)\b|\bnew (dashboard|report)\b/i;
  const EDIT_RE = /^(please |can you |could you )?(add|remove|delete|drop|change|replace|rename|move|resize|swap|turn|make|put|include|sort|colou?r|split|combine|show)\b|\b(this|the|my) (dashboard|report|page)\b/i;
  const ADD_LAST_RE = /\badd (it|that|this|these|those|the charts?)\b/i;

  function openDashboard() {
    const route = S.current || '';
    if (route.startsWith('dash:') || route.startsWith('edit:')) return route.slice(5);
    return S.state.pageDashboards?.[route] || null;
  }

  function intentFor(text, chat) {
    const lastCharts = [...chat.messages].reverse().find((m) => m.role === 'ai' && m.charts?.length)?.charts;
    if (ADD_LAST_RE.test(text) && lastCharts) return 'addLast';
    if (BUILD_RE.test(text)) return 'build';
    if (openDashboard() && EDIT_RE.test(text)) return 'edit';
    return 'ask';
  }

  function chatState() {
    if (!S.chats[S.tenant]) S.chats[S.tenant] = { messages: [], conversationId: null, busy: false };
    return S.chats[S.tenant];
  }

  const PANELS = new Set();
  function rerender() {
    for (const r of [...PANELS]) if (r.node.isConnected) r.render(); else PANELS.delete(r);
  }

  async function send(text) {
    const chat = chatState();
    if (!text.trim() || chat.busy) return;
    const intent = intentFor(text, chat);
    chat.messages.push({ role: 'user', text });
    const reply = { role: 'ai', text: '', charts: [], progress: 'Querying', intent };
    chat.messages.push(reply);
    chat.busy = true;
    rerender();
    const onEvent = (ev) => {
      if (ev.type === 'progress') reply.progress = ev.message;
      if (ev.type === 'text') reply.text = ev.text;
      rerender();
    };
    track(intent === 'build' ? 'ai_dashboard_requested' : intent === 'edit' ? 'ai_edit_requested' : 'ai_question_asked', { tenant: S.tenant === ALL ? 'all' : 'one' });
    try {
      if (intent === 'addLast') {
        const charts = [...chat.messages].reverse().find((m) => m.role === 'ai' && m.charts?.length).charts;
        const target = openDashboard();
        if (target) {
          for (const c of charts) await addChartTo(target, c);
          reply.text = `Added ${charts.length === 1 ? 'the chart' : `${charts.length} charts`} to ${dashName(target)}.`;
        } else {
          const id = await createDashboard('My dashboard', charts.map((c, i) => Core.chartToItem(c, charts.slice(0, i).map((x) => Core.chartToItem(x)))));
          reply.text = 'I put the chart in a new dashboard called **My dashboard**.';
          reply.link = { label: 'Open dashboard', to: `dash:${id}` };
        }
      } else if (intent === 'build') {
        reply.progress = 'Designing a dashboard';
        const r = await runDashboardAgent(text, null, onEvent);
        const name = r.dashboard.name || 'New dashboard';
        const id = await createDashboard(name, r.dashboard.items);
        track('ai_dashboard_built', { items: r.dashboard.items.length });
        reply.text = `${r.text ? `${r.text}\n\n` : ''}I built **${name}** with ${r.dashboard.items.length} items. You find it under My dashboards.`;
        reply.link = { label: 'Open dashboard', to: `dash:${id}` };
      } else if (intent === 'edit') {
        const target = openDashboard();
        reply.progress = `Updating ${dashName(target)}`;
        const items = await backend.getItems(isTemplate(target) && existingCopy(target) ? existingCopy(target).id : target);
        const contents = { views: [{ screenModus: 'desktop', items }] };
        const r = await runDashboardAgent(text, contents, onEvent);
        const out = await saveChanged(target, r.dashboard.items);
        track('dashboard_saved', { via: 'ai' });
        reply.text = `${r.text ? `${r.text}\n\n` : ''}${out.copied ? 'Done. This page is shared, so I saved the change in **your own version**.' : `Done. I updated ${dashName(target)}.`}`;
        go(routeFor(out.id));
      } else {
        const r = await askAnalyst(chat, text, onEvent);
        reply.text = r.text || (r.charts.length ? '' : 'I could not find an answer in the data.');
        reply.charts = r.charts;
      }
      S.iq = true;
    } catch (err) {
      reply.error = err.message;
      if (isIqError(err.message)) {
        S.iq = false;
        reply.error = 'Luzmo IQ is not enabled on this Luzmo account yet, so the assistant cannot answer. Everything else in the portal works.';
        reply.iqMissing = true;
        track('iq_missing');
      }
    } finally {
      reply.progress = null;
      chat.busy = false;
      rerender();
    }
  }

  // Small markdown renderer for AI answers: paragraphs, lists, bold, italics, code and tables.
  function md(src) {
    const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const inline = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/(^|[^*])\*(?!\s)(.+?)\*/g, '$1<em>$2</em>').replace(/`(.+?)`/g, '<code>$1</code>');
    const out = [];
    const lines = src.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/^\s*\|.*\|\s*$/.test(line) && /^\s*\|?\s*:?-{2,}/.test(lines[i + 1] || '')) {
        const cells = (l) => l.trim().replace(/^\||\|$/g, '').split('|').map((c) => inline(c.trim()));
        let html = `<table><thead><tr>${cells(line).map((c) => `<th>${c}</th>`).join('')}</tr></thead><tbody>`;
        i += 2;
        while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) html += `<tr>${cells(lines[i++]).map((c) => `<td>${c}</td>`).join('')}</tr>`;
        i--;
        out.push(`${html}</tbody></table>`);
      } else if (/^\s*([-*]|\d+\.)\s+/.test(line)) {
        const ordered = /^\s*\d+\./.test(line);
        let html = ordered ? '<ol>' : '<ul>';
        while (i < lines.length && /^\s*([-*]|\d+\.)\s+/.test(lines[i])) html += `<li>${inline(lines[i++].replace(/^\s*([-*]|\d+\.)\s+/, ''))}</li>`;
        i--;
        out.push(html + (ordered ? '</ol>' : '</ul>'));
      } else if (/^#{1,4}\s/.test(line)) {
        out.push(`<p><strong>${inline(line.replace(/^#+\s/, ''))}</strong></p>`);
      } else if (line.trim()) {
        out.push(`<p>${inline(line)}</p>`);
      }
    }
    return out.join('');
  }

  const luzmoProps = () => ({ appServer: S.appServer, apiHost: S.apiHost, authKey: S.auth.key, authToken: S.auth.token });

  function vizItem(value, contextId, framed) {
    const viz = el('luzmo-embed-viz-item');
    Object.assign(viz, luzmoProps(), {
      contextId,
      type: value.type || 'bar-chart',
      slots: Core.queryableSlots(value.slots),
      filters: Core.queryableFilters(value.filters || []),
      options: { ...Core.cleanOptions(value.options || {}), theme: Core.itemTheme(P(), framed), locale: 'en', loader: { background: P().brand.surface, spinnerColor: P().brand.accent } }
    });
    return viz;
  }

  function chartCard(value, i) {
    const card = el('div', { className: 'ai-chart' }, [el('div', { className: 'ai-chart-body' }, [vizItem(value, `ai-${Date.now()}-${i}`, false)])]);
    const open = openDashboard();
    const select = el('select', { className: 'ai-add', title: 'Add this chart to a dashboard' }, [
      el('option', { value: '' }, ['Add to dashboard']),
      open ? el('option', { value: open }, [`This page: ${dashName(open)}`]) : null,
      el('option', { value: 'new' }, ['New dashboard...']),
      F().ack ? el('option', { value: 'builder' }, ['Report builder canvas']) : null,
      ...visibleDashboards().filter((d) => d.id !== open).map((d) => el('option', { value: d.id }, [d.name]))
    ]);
    select.onchange = async () => {
      const target = select.value;
      if (!target) return;
      select.disabled = true;
      try { await addChartTo(target, value); } catch (err) { toast(`Could not add the chart. ${err.message}`); }
      select.value = '';
      select.disabled = false;
    };
    card.append(el('div', { className: 'ai-chart-actions' }, [select]));
    return card;
  }

  function iqMissingCard() {
    return el('div', { className: 'iq-missing' }, [
      el('strong', {}, ['Luzmo IQ is not on this account yet']),
      el('p', {}, [`${AI_NAME()} runs on Luzmo IQ, an add-on. Ask us to switch it on for your trial and the assistant works straight away.`]),
      el('a', { className: 'btn primary small', href: P().links?.requestIq || P().links?.technicalCall, target: '_blank', rel: 'noopener', onclick: () => track('cta_clicked', { cta: 'request_iq' }) }, ['Request Luzmo IQ'])
    ]);
  }

  function chatPanel() {
    const wrap = el('div', { className: 'ai-chat' });
    const list = el('div', { className: 'ai-messages' });
    const input = el('textarea', { rows: 1, placeholder: `Ask ${AI_NAME()} anything, or ask for a dashboard` });
    const submit = () => { const t = input.value; input.value = ''; send(t); };
    input.onkeydown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } };
    const sendBtn = el('button', { className: 'ai-send', onclick: submit, title: 'Send' }, ['Send']);
    const renderedCharts = new WeakMap();
    function render() {
      const chat = chatState();
      list.innerHTML = '';
      if (!chat.messages.length) {
        const who = S.tenant === ALL ? `all ${P().tenants.length} ${P().tenantLabel.toLowerCase()}s` : S.tenant;
        list.append(el('div', { className: 'ai-intro' }, [
          el('div', { className: 'ai-avatar big' }, [P().brand.logoText.charAt(0)]),
          el('h3', {}, [`Hi, I'm ${AI_NAME()}`]),
          el('p', {}, [`Ask about ${P().area || 'your data'} for ${who}, or ask me to build or change a dashboard.`])
        ]));
        if (S.iq === false) list.append(iqMissingCard());
        const sugg = el('div', { className: 'ai-suggestions' });
        const prompts = [...(P().aiSuggestions || []).slice(0, S.chatWide ? 4 : 2), ...(P().aiBuildSuggestions || []).slice(0, 1)];
        if (openDashboard() && P().aiAddSuggestion) prompts.push(P().aiAddSuggestion);
        for (const q of prompts) sugg.append(el('button', { onclick: () => send(q) }, [q]));
        list.append(sugg);
      }
      for (const m of chat.messages) {
        if (m.role === 'user') {
          list.append(el('div', { className: 'msg user' }, [el('div', { className: 'bubble' }, [m.text])]));
          continue;
        }
        const body = el('div', { className: 'bubble' });
        if (m.text) body.append(el('div', { className: 'md', innerHTML: md(m.text) }));
        if (m.progress) body.append(el('div', { className: 'ai-progress' }, [el('span', { className: 'dot' }), m.progress]));
        if (m.error) body.append(el('div', { className: 'ai-error' }, [m.error]));
        if (m.iqMissing) body.append(iqMissingCard());
        if (m.link) body.append(el('button', { className: 'btn primary small', onclick: () => go(m.link.to) }, [m.link.label]));
        // Keep chart elements across re-renders so they do not reload on every streamed token.
        if (m.charts?.length) {
          if (!renderedCharts.has(m)) renderedCharts.set(m, m.charts.map(chartCard));
          renderedCharts.get(m).forEach((c) => body.append(c));
        }
        list.append(el('div', { className: 'msg ai' }, [el('div', { className: 'ai-avatar' }, [P().brand.logoText.charAt(0)]), body]));
      }
      list.scrollTop = list.scrollHeight;
      sendBtn.disabled = chatState().busy;
    }
    wrap.append(list, el('div', { className: 'ai-compose' }, [el('div', { className: 'ai-input' }, [input, sendBtn])]));
    render();
    PANELS.add({ node: wrap, render });
    return wrap;
  }

  // One floating assistant on every page. Opens by itself on the first visit; can widen to a side panel.
  function renderChatPopup() {
    $('#aiFab')?.remove();
    $('#aiPop')?.remove();
    if (!F().ai) return;
    const pop = el('div', { id: 'aiPop', className: `ai-pop ${S.chatOpen ? 'open' : ''} ${S.chatWide ? 'wide' : ''}` }, [
      el('div', { className: 'ai-pop-head' }, [
        el('span', { className: 'ai-avatar' }, [P().brand.logoText.charAt(0)]),
        el('strong', {}, [AI_NAME()]),
        F().howto ? el('button', { className: 'link', onclick: () => openHow('ai') }, ['How it\'s built']) : null,
        el('button', { className: 'link', onclick: () => { S.chatWide = !S.chatWide; renderChatPopup(); } }, [S.chatWide ? 'Smaller' : 'Expand']),
        el('button', { className: 'icon-btn', title: 'Close', onclick: () => { S.chatOpen = false; renderChatPopup(); } }, ['×'])
      ]),
      S.chatOpen ? chatPanel() : null
    ]);
    const fab = el('button', { id: 'aiFab', className: `ai-fab ${S.chatOpen ? 'hidden' : ''} ${S.iq === false ? 'off' : ''}`, title: `Ask ${AI_NAME()}`, onclick: () => { S.chatOpen = true; track('ai_opened'); renderChatPopup(); } }, [
      el('span', { className: 'ai-avatar' }, [P().brand.logoText.charAt(0)]), el('span', {}, [S.iq === false ? `${AI_NAME()} (needs IQ)` : `Ask ${AI_NAME()}`])
    ]);
    document.body.append(pop, fab);
  }

  // ---------- report builder (ACK) ----------
  const CHART_TYPES = [
    ['bar-chart', 'Bar'], ['column-chart', 'Column'], ['line-chart', 'Line'], ['donut-chart', 'Donut'],
    ['evolution-number', 'KPI'], ['regular-table', 'Table'], ['treemap-chart', 'Treemap']
  ];
  let ackLoading = null;
  function loadAck() {
    if (window.LuzmoACK) return Promise.resolve();
    if (!ackLoading) {
      ackLoading = new Promise((resolve, reject) => {
        const inline = document.getElementById('ack-lib-src');
        const s = el('script');
        if (inline) s.textContent = inline.textContent; else s.src = 'vendor/ack.js';
        s.onload = resolve;
        s.onerror = () => reject(new Error('Could not load the report builder components'));
        document.head.append(s);
        if (inline) resolve();
      });
    }
    return ackLoading;
  }

  function ensureBuilder() {
    if (!S.builder || S.builder.tenant !== S.tenant) {
      S.builder = { tenant: S.tenant, type: 'bar-chart', slots: [], options: { display: { title: true } }, filters: [], editingId: null, items: [], name: '', dashboardId: null, panel: 'data' };
    }
    return S.builder;
  }

  async function openInBuilder(id) {
    if (isTemplate(id) && existingCopy(id)) id = existingCopy(id).id;
    const items = await backend.getItems(id);
    S.builder = { ...ensureBuilder(), items: items.filter((i) => i.type !== 'text'), name: isTemplate(id) ? copyName(id) : dashName(id), dashboardId: isTemplate(id) ? null : id };
    track('builder_opened', { from: 'dashboard' });
    go('builder');
  }

  async function renderBuilder(host) {
    host.append(el('div', { className: 'placeholder', style: 'padding:40px' }, ['Loading the report builder']));
    try { await loadAck(); } catch (err) { host.innerHTML = ''; host.append(el('div', { className: 'ai-error' }, [err.message])); return; }
    host.innerHTML = '';
    const B = ensureBuilder();
    const auth = { apiUrl: S.apiHost, authKey: S.auth.key, authToken: S.auth.token, language: 'en' };
    const ids = datasetIds();

    const fields = Object.assign(el('luzmo-data-field-panel'), auth, { datasetIds: ids, datasetPicker: true, search: 'on', size: 'm' });
    const slots = Object.assign(el('luzmo-item-slot-drop-panel'), auth, { itemType: B.type, slotsContents: B.slots, size: 'm' });
    const optionsPanel = Object.assign(el('luzmo-item-option-panel'), auth, { itemType: B.type, options: B.options, slots: B.slots, size: 'm' });
    const filtersPanel = Object.assign(el('luzmo-filters'), auth, { datasetIds: ids, filters: B.filters, size: 'm' });
    const titleInput = el('input', { className: 'ack-title', placeholder: 'Chart title', value: B.options?.title?.en || '' });
    const previewHost = el('div', { className: 'ack-preview' });
    const addBtn = el('button', { className: 'btn primary' }, [B.editingId ? 'Update chart' : 'Add to canvas']);
    const hasContent = () => B.slots.some((s) => s.content?.length);

    let previewTimer;
    function refreshPreview() {
      clearTimeout(previewTimer);
      previewTimer = setTimeout(() => {
        previewHost.innerHTML = '';
        addBtn.disabled = !hasContent();
        if (!hasContent()) return previewHost.append(el('div', { className: 'placeholder' }, ['Drag fields into the slots to see a live preview']));
        previewHost.append(vizItem({ type: B.type, slots: B.slots, options: B.options, filters: B.filters }, `ack-preview-${Date.now()}`, false));
      }, 250);
    }
    slots.addEventListener('luzmo-slots-contents-changed', (e) => {
      B.slots = e.detail?.slotsContents || B.slots;
      slots.slotsContents = B.slots;
      optionsPanel.slots = B.slots;
      refreshPreview();
    });
    optionsPanel.addEventListener('luzmo-options-changed', (e) => {
      B.options = Core.cleanOptions({ ...(e.detail?.options || B.options), title: B.options.title });
      optionsPanel.options = B.options;
      refreshPreview();
    });
    filtersPanel.addEventListener('luzmo-filters-changed', (e) => {
      B.filters = e.detail?.filters || B.filters;
      filtersPanel.filters = B.filters;
      refreshPreview();
    });
    titleInput.oninput = () => { B.options = { ...B.options, title: { en: titleInput.value } }; refreshPreview(); };

    const typeButtons = el('div', { className: 'ack-types' }, CHART_TYPES.map(([type, label]) => el('button', {
      className: `chip ${type === B.type ? 'on' : ''}`,
      onclick: async () => {
        if (type === B.type) return;
        try {
          const r = await window.LuzmoACK.switchItem({ oldItemType: B.type, newItemType: type, slots: B.slots, options: B.options });
          B.slots = r.slots || [];
          B.options = Core.cleanOptions({ ...(r.options || {}), title: B.options.title });
        } catch {
          B.slots = [];
        }
        B.type = type;
        rerenderRoute();
      }
    }, [label])));

    const panels = { data: slots, options: optionsPanel, filters: filtersPanel };
    const panelHost = el('div', { className: 'ack-panel-host' }, [panels[B.panel]]);
    const subtabs = el('div', { className: 'tabs small' }, [['data', 'Data'], ['options', 'Options'], ['filters', 'Filters']].map(([k, label]) => el('button', {
      className: k === B.panel ? 'on' : '',
      onclick: (e) => { B.panel = k; panelHost.innerHTML = ''; panelHost.append(panels[k]); subtabs.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b === e.currentTarget)); }
    }, [label])));

    addBtn.onclick = () => {
      if (!hasContent()) return;
      const item = { type: B.type, slots: structuredClone(B.slots), options: { ...B.options }, filters: structuredClone(B.filters) };
      if (B.editingId) B.items = B.items.map((i) => (i.id === B.editingId ? { ...i, ...item } : i));
      else B.items.push({ id: crypto.randomUUID(), ...item, position: Core.nextPosition(B.items) });
      Object.assign(B, { slots: [], filters: [], options: { display: { title: true } }, editingId: null });
      track('builder_used');
      rerenderRoute();
    };
    const resetBtn = el('button', { className: 'btn', onclick: () => { Object.assign(B, { slots: [], filters: [], options: { display: { title: true } }, editingId: null }); rerenderRoute(); } }, ['Reset']);

    const compose = el('div', { className: 'ack-compose' }, [
      typeButtons,
      el('div', { className: 'ack-compose-main' }, [
        el('div', { className: 'ack-config' }, [subtabs, panelHost, titleInput]),
        el('div', { className: 'ack-preview-col' }, [previewHost, el('div', { className: 'ack-actions' }, [resetBtn, addBtn])])
      ])
    ]);

    // Canvas: ACK item grid in controlled mode.
    const grid = Object.assign(el('luzmo-item-grid'), luzmoProps(), {
      language: 'en', columns: 48, rowHeight: 16, viewMode: false,
      defaultItemActionsMenu: [{ type: 'group', actions: ['edit', 'clone', 'delete'] }],
      items: B.items.map((i) => ({ ...i, options: { ...i.options, theme: Core.itemTheme(P(), true) } }))
    });
    const strip = (items) => items.map((i) => ({ ...i, options: Core.cleanOptions(i.options || {}) }));
    grid.addEventListener('luzmo-item-grid-layout-changed', (e) => { if (e.detail?.updatedItems) B.items = strip(e.detail.updatedItems); });
    grid.addEventListener('luzmo-item-grid-item-action', (e) => {
      const { action, item, updatedItems } = e.detail || {};
      if (updatedItems) B.items = strip(updatedItems);
      if ((action === 'edit' || action === 'edit-data') && item?.id) {
        const found = B.items.find((i) => i.id === item.id);
        if (found) Object.assign(B, { editingId: found.id, type: found.type, slots: structuredClone(found.slots), options: Core.cleanOptions(found.options), filters: found.filters || [], panel: 'data' });
        rerenderRoute();
      } else if (action === 'delete' || action === 'clone') {
        rerenderRoute();
      }
    });
    const nameInput = el('input', { className: 'ack-name', placeholder: 'Report name', value: B.name });
    nameInput.oninput = () => { B.name = nameInput.value; };
    const saveBtn = el('button', { className: 'btn primary', onclick: async () => {
      if (!B.items.length) return toast('Add a chart to the canvas first');
      const name = (B.name || 'My report').trim();
      saveBtn.disabled = true;
      try {
        if (B.dashboardId) {
          await backend.save(B.dashboardId, B.items, name);
          toast(`Saved "${name}"`, { label: 'Open', run: () => go(`dash:${B.dashboardId}`) });
        } else {
          B.dashboardId = await createDashboard(name, B.items);
          toast(`Saved "${name}" under My dashboards`, { label: 'Open', run: () => go(`dash:${B.dashboardId}`) });
        }
        track('dashboard_saved', { via: 'builder' });
        renderNav();
      } catch (err) {
        toast(`Could not save. ${err.message}`);
      } finally {
        saveBtn.disabled = false;
      }
    } }, [B.dashboardId ? 'Save' : 'Save as new dashboard']);
    const clearBtn = el('button', { className: 'btn', onclick: () => { S.builder = null; ensureBuilder(); rerenderRoute(); } }, ['Clear canvas']);

    host.append(
      el('div', { className: 'ack-top' }, [el('aside', { className: 'card ack-fields' }, [el('h3', {}, ['Data fields']), fields]), el('section', { className: 'card' }, [compose])]),
      el('div', { className: 'card ack-canvas' }, [
        el('div', { className: 'ack-canvas-bar' }, [el('h3', {}, ['Report canvas']), nameInput, clearBtn, saveBtn]),
        B.items.length ? grid : el('div', { className: 'placeholder', style: 'padding:40px' }, [`No charts yet. Build one above, add one from ${AI_NAME()}, or open a dashboard with Edit dashboard, Report builder.`])
      ])
    );
    refreshPreview();
  }

  // ---------- brand ----------
  function loadFonts(b) {
    const families = [...new Set([b.font, b.headingFont].filter(Boolean))].filter((f) => !/^(system-ui|inter)$/i.test(f) || f === 'Inter');
    if (!families.length) return;
    const href = `https://fonts.googleapis.com/css2?${families.map((f) => `family=${encodeURIComponent(f).replace(/%20/g, '+')}:wght@400;500;600;700;800`).join('&')}&display=swap`;
    let link = document.getElementById('brand-fonts');
    if (!link) { link = el('link', { id: 'brand-fonts', rel: 'stylesheet' }); document.head.append(link); }
    if (link.href !== href) link.href = href;
  }

  function applyBrand(brand) {
    const b = brand || P().brand;
    const root = document.documentElement.style;
    const set = { '--primary': b.primary, '--accent': b.accent, '--cta': b.cta, '--on-primary': b.onPrimary, '--on-cta': b.onCta, '--bg': b.background, '--surface': b.surface, '--text': b.text, '--muted': b.muted };
    for (const [k, v] of Object.entries(set)) if (v) root.setProperty(k, v);
    root.setProperty('--font', `'${b.font}', system-ui, sans-serif`);
    root.setProperty('--font-heading', `'${b.headingFont || b.font}', system-ui, sans-serif`);
    loadFonts(b);
  }

  function brandMark(b) {
    const letter = () => el('div', { className: 'brand-mark letter' }, [b.logoText.charAt(0)]);
    if (b.logoMarkUrl) {
      const box = el('div', { className: 'brand-mark' });
      box.append(el('img', { src: b.logoMarkUrl, alt: b.logoText, onerror: () => box.replaceWith(letter()) }));
      return box;
    }
    if (b.logoUrl) {
      const box = el('div', { className: 'brand-logo' });
      box.append(el('img', { src: b.logoUrl, alt: b.logoText, onerror: () => box.replaceWith(letter()) }));
      return box;
    }
    return letter();
  }

  // ---------- routes ----------
  function routes(target) {
    const f = F();
    const list = [];
    if (f.templates) for (const p of P().pages) list.push({ id: p.id, group: 'Analytics', label: p.title, title: p.title, subtitle: p.subtitle, render: () => renderDashboardPage(S.state.pageDashboards?.[p.id]) });
    if (!f.templates && S.state.dashboardId) list.push({ id: `dash:${S.state.dashboardId}`, group: 'Analytics', label: 'Overview', title: `${P().brand.productName} overview`, subtitle: 'All key numbers on one dashboard', render: () => renderDashboardPage(S.state.dashboardId) });
    if (f.myDashboards) {
      for (const d of visibleDashboards()) list.push({ id: `dash:${d.id}`, group: 'My dashboards', label: d.name, title: d.name, subtitle: 'Your own dashboard. Edit it yourself or ask the assistant to change it.', render: () => renderDashboardPage(d.id) });
    }
    const want = target || S.current || '';
    const editing = want.startsWith('edit:') ? want.slice(5) : null;
    if (editing) list.push({ id: `edit:${editing}`, hidden: true, title: `Editing ${dashName(editing)}`, subtitle: 'Full Luzmo editor inside your product. Save in the editor toolbar.', render: () => renderEditor(editing) });
    if (f.ack) list.push({ id: 'builder', hidden: true, title: 'Report builder', subtitle: 'Build a report from your data fields. Your layout, Luzmo components.', render: () => { const host = el('div', { className: 'ack-builder' }); $('#view').append(host); renderBuilder(host); } });
    if (f.exports) list.push({ id: 'exports', group: 'Manage', label: 'Scheduled exports', title: 'Scheduled exports', subtitle: 'Recurring dashboard emails for this organisation', render: renderExports });
    list.push({ id: 'deploy', group: 'Manage', label: 'Deploy and download', title: 'Deploy and download', subtitle: 'Run this portal on Vercel or localhost, or take it home', render: renderDeploy });
    return list;
  }

  function createNewMenu() {
    const f = F();
    const items = [
      f.ede && { label: 'Full editor', hint: 'Start an empty dashboard in Luzmo\'s editor', run: async () => {
        const id = await createDashboard('New dashboard', []);
        track('edit_opened', { editor: 'full', from: 'new' });
        go(`edit:${id}`);
      } },
      f.ack && { label: 'Report builder', hint: 'Drag fields onto a canvas', run: () => { S.builder = null; track('builder_opened', { from: 'new' }); go('builder'); } }
    ].filter(Boolean);
    if (!items.length) return null;
    return menu('+ Create new', items, { className: 'nav-create' });
  }

  function renderNav() {
    const nav = $('#nav');
    nav.innerHTML = '';
    const visible = routes().filter((x) => !x.hidden);
    const button = (r) => el('button', { className: r.id === S.current ? 'active' : '', onclick: () => go(r.id) }, [el('span', { className: 'nav-text' }, [r.label])]);
    const groups = ['Analytics', ...(F().myDashboards ? ['My dashboards'] : []), 'Manage'];
    for (const group of groups) {
      const items = visible.filter((r) => r.group === group);
      if (!items.length && group !== 'My dashboards') continue;
      nav.append(el('div', { className: 'nav-label' }, [group]));
      items.forEach((r) => nav.append(button(r)));
      if (group === 'My dashboards') {
        const c = createNewMenu();
        if (c) nav.append(c);
      }
    }
  }

  function rerenderRoute() { go(S.current); }

  function go(id) {
    const all = routes(id);
    const r = all.find((x) => x.id === id) || all.find((x) => !x.hidden) || all[0];
    S.current = r.id;
    renderNav();
    $('#pageTitle').textContent = r.title;
    $('#pageSubtitle').textContent = r.subtitle;
    $('#view').innerHTML = '';
    renderCtaBar();
    renderChatPopup();
    if (S.howOpen) renderHow();
    try {
      r.render();
    } catch (err) {
      $('#view').append(el('div', { className: 'ai-error' }, [`This page could not load: ${err.message}`]));
    }
  }

  function dashboardEmbed(id, editMode) {
    const dash = el('luzmo-embed-dashboard');
    Object.assign(dash, luzmoProps(), {
      dashboardId: id, editMode, language: 'en',
      mainColor: P().brand.primary, accentColor: P().brand.accent,
      loaderBackground: P().brand.background, loaderSpinnerColor: P().brand.accent
    });
    return dash;
  }

  function editMenu(id) {
    const f = F();
    const items = [
      f.ede && { label: 'Full editor', hint: 'Luzmo\'s drag-and-drop editor, in your brand', run: async () => {
        const target = await ensureCopy(id);
        if (target !== id) toast('This page is shared, so you edit your own version');
        track('edit_opened', { editor: 'full' });
        go(`edit:${target}`);
      } },
      f.ack && { label: 'Report builder', hint: 'Your own layout with Luzmo components', run: () => openInBuilder(id) }
    ].filter(Boolean);
    return items.length ? menu('Edit dashboard', items, { primary: true }) : null;
  }

  function exportMenu(getDash) {
    if (!F().exports) return null;
    const subject = { en: `${P().brand.productName}: dashboard export` };
    const message = { en: `Your export from ${P().brand.productName}.` };
    const run = (kind, fn) => async () => {
      const dash = getDash();
      if (!dash?.exportDashboard) throw new Error('The dashboard is still loading. Try again in a moment.');
      await fn(dash);
      track(kind === 'schedule' ? 'schedule_created' : 'export_created', { kind });
    };
    return menu('Export', [
      { label: 'Download PDF', run: run('pdf', (d) => d.exportDashboard('pdf')) },
      { label: 'Download PNG', run: run('png', (d) => d.exportDashboard('png')) },
      { label: 'Email now', hint: P().contactEmail ? `To ${P().contactEmail}` : 'Opens the email dialog', run: run('email', async (d) => { await d.sendExportEmail('once', subject, message); toast('Email export sent'); }) },
      { label: 'Schedule email', hint: 'Daily, weekly or monthly', run: run('schedule', (d) => d.sendExportEmail('scheduled', subject, message)) }
    ]);
  }

  function renderDashboardPage(id) {
    if (!id) return $('#view').append(el('div', { className: 'card placeholder', style: 'padding:48px' }, ['This dashboard is not in Luzmo yet. Run the setup again.']));
    const embed = dashboardEmbed(id, 'view');
    const hint = isTemplate(id)
      ? 'Live from Luzmo. Shared template, your edits are saved for your organisation.'
      : 'Your own dashboard, live from Luzmo.';
    const drill = el('div', { className: 'drill', hidden: true });
    const toolbar = el('div', { className: 'toolbar' }, [el('span', { className: 'hint-inline' }, [hint]), drill, exportMenu(() => embed), editMenu(id)]);
    // Drill-through: in the all-organisations view, clicking an organisation in a chart offers to
    // open the portal as that organisation (new token, own row filter). The event shape is not
    // documented, so the detail is searched for a known organisation name.
    embed.addEventListener('changedFilters', (e) => {
      if (S.tenant !== ALL || !F().tenants) return;
      const names = new Set(P().tenants.map((t) => t.name));
      const hits = new Set();
      const walk = (v, depth = 0) => {
        if (depth > 12 || v == null) return;
        if (typeof v === 'string') { if (names.has(v)) hits.add(v); return; }
        if (Array.isArray(v)) return v.forEach((x) => walk(x, depth + 1));
        if (typeof v === 'object') Object.values(v).forEach((x) => walk(x, depth + 1));
      };
      walk(e.detail);
      drill.innerHTML = '';
      drill.hidden = hits.size !== 1;
      if (hits.size === 1) {
        const t = [...hits][0];
        drill.append(el('button', { className: 'btn drill-btn', onclick: () => { track('drill_through', { to: 'tenant' }); $('#tenant').value = t; switchTenant(t); } }, [`Drill into ${t} →`]));
      }
    });
    $('#view').append(toolbar, el('div', { className: 'page-dash' }, [embed]), el('p', { className: 'drill-tip' }, [
      'Tip: click a bar or slice to filter the whole dashboard down to the detail table.',
      F().tenants && S.tenant === ALL ? ` Click an ${P().tenantLabel.toLowerCase()} to drill into their view.` : ''
    ]));
  }

  function renderEditor(id) {
    const embed = dashboardEmbed(id, 'editFull');
    const toolbar = el('div', { className: 'toolbar' }, [
      el('span', { className: 'hint-inline' }, ['Add items, change charts and save in the editor toolbar. Saved changes show everywhere this dashboard is used.']),
      exportMenu(() => embed),
      el('button', { className: 'btn primary', onclick: () => { track('dashboard_saved', { via: 'editor' }); go(`dash:${id}`); renderNav(); } }, ['Done editing'])
    ]);
    $('#view').append(toolbar, el('div', { className: 'page-dash editing' }, [embed]));
  }

  async function renderExports() {
    const view = $('#view');
    const box = el('div', { className: 'card exports' }, [el('div', { className: 'placeholder', style: 'padding:32px' }, ['Loading schedules from Luzmo'])]);
    const refresh = el('button', { className: 'btn', onclick: () => go('exports') }, ['Refresh']);
    view.append(el('div', { className: 'toolbar' }, [el('span', { className: 'hint-inline' }, ['Create a schedule from any dashboard with Export, Schedule email.']), refresh]), box);
    let rows;
    try {
      rows = await backend.schedules();
    } catch (err) {
      box.innerHTML = '';
      box.append(el('div', { className: 'ai-error', style: 'margin:16px' }, [`Could not read schedules: ${err.message}`]));
      return;
    }
    box.innerHTML = '';
    if (!rows.length) {
      box.append(el('div', { className: 'empty' }, [
        el('h3', {}, ['No scheduled exports yet']),
        el('p', {}, ['Open a dashboard, click Export, then Schedule email. Pick a frequency and the schedule shows up here.']),
        F().templates && P().pages[0] ? el('button', { className: 'btn primary', onclick: () => go(P().pages[0].id) }, [`Open ${P().pages[0].title}`]) : null
      ]));
      return;
    }
    const freq = (r) => (r.frequencyUnit ? `Every ${r.frequencyQuantity > 1 ? `${r.frequencyQuantity} ` : ''}${r.frequencyUnit}${r.frequencyQuantity > 1 ? 's' : ''}` : 'Once');
    const when = (s) => (s ? new Date(s).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : '');
    box.append(el('table', { className: 'table' }, [
      el('thead', {}, [el('tr', {}, ['Export', 'Dashboard', 'Format', 'Recipients', 'Frequency', 'Next run', 'Status'].map((h) => el('th', {}, [h])))]),
      el('tbody', {}, rows.map((r) => el('tr', {}, [
        el('td', {}, [r.subject || '']), el('td', {}, [r.dashboardName]), el('td', {}, [r.format || '']), el('td', {}, [r.recipients.join(', ')]),
        el('td', {}, [freq(r)]), el('td', {}, [when(r.scheduledAt)]),
        el('td', {}, [el('span', { className: `pill ${r.active === false ? 'off' : 'on'}` }, [r.active === false ? 'Paused' : r.lastStatus || 'Active'])])
      ])))
    ]));
  }

  // ---------- deploy and downloads ----------
  function downloadList() {
    const d = (type, label, hint) => ({ label, hint, run: async () => { toast('Preparing the download'); await window.LuzmoKit.download(type, P()); } });
    return [
      d('starter-kit', 'Starter kit (zip)', 'The code with your portal.json. No keys. For your engineers'),
      d('single-file', 'One-file demo (HTML)', 'Opens in Chrome, asks for the key. For a quick show-and-tell'),
      d('how-its-built', 'How it\'s built (MD)', 'Architecture, token flow, API calls. For your CTO'),
      d('demo-script', 'Demo script (MD)', 'A 5-minute walkthrough. For pitching your CPO')
    ];
  }

  function copy(text, what) {
    navigator.clipboard?.writeText(text).then(() => toast(`${what} copied`), () => window.prompt(`Copy ${what.toLowerCase()}`, text));
  }

  function codeBlock(text) {
    return el('div', { className: 'code' }, [el('pre', {}, [text]), el('button', { className: 'link copy', onclick: () => copy(text, 'Snippet') }, ['Copy'])]);
  }

  function renderDeploy() {
    const view = $('#view');
    view.append(window.LuzmoWizard.deployPanel(P(), { mode: S.mode, track, toast }));
  }

  // ---------- CTA bar and How it's built ----------
  function shareUrl() { return S.mode === 'server' ? location.origin : null; }

  function renderCtaBar() {
    const bar = $('#ctaBar');
    if (!bar) return;
    bar.innerHTML = '';
    const current = openDashboard() || S.state.dashboardId;
    const cta = (label, href, name, extra = {}) => el('a', { className: 'cta-link', href, target: '_blank', rel: 'noopener', onclick: () => track('cta_clicked', { cta: name }), ...extra }, [label]);
    const invite = () => {
      const url = shareUrl() || location.origin;
      const body = shareUrl()
        ? `Have a look at the analytics portal I built for ${P().company} on Luzmo: ${url}`
        : `I built an embedded analytics portal for ${P().company} on Luzmo in ten minutes. Start your own here: ${url}`;
      return `mailto:?subject=${encodeURIComponent(`${P().brand.productName} on Luzmo`)}&body=${encodeURIComponent(body)}`;
    };
    bar.append(
      el('span', { className: 'cta-note' }, [S.mode === 'server' ? 'Live on your Luzmo account' : 'Trial portal on your Luzmo account']),
      cta('Book a technical call', P().links?.technicalCall || 'https://calendly.com/d/cygt-jjc-tr4/luzmo-technical-call-1h', 'technical_call'),
      current ? cta('Open in Luzmo', luzmoAppUrl(current), 'open_in_luzmo') : null,
      el('a', { className: 'cta-link', href: invite(), onclick: () => track('cta_clicked', { cta: 'invite' }) }, ['Invite a teammate']),
      el('span', { className: 'cta-spacer' }),
      menu('Take this with you', [
        ...downloadList(),
        shareUrl() ? { label: 'Copy share link', hint: shareUrl(), run: () => { copy(shareUrl(), 'Link'); track('share_link_copied'); } } : { label: 'Get a share link', hint: 'Deploy to Vercel for a URL you can send', run: () => go('deploy') }
      ], { className: 'cta-menu' }),
      S.mode === 'browser' && !window.__LOCAL__ ? el('button', { className: 'cta-link button', onclick: () => window.LuzmoWizard.reopen() }, ['Back to setup']) : null
    );
  }

  function openHow(topic) {
    S.howOpen = true;
    S.howTopic = topic || HowTo.forRoute(S.current)[0];
    track('howto_opened', { topic: S.howTopic });
    renderHow();
  }

  function renderHow() {
    $('#how')?.remove();
    if (!S.howOpen) return;
    const all = HowTo.topics(P());
    const routeTopics = HowTo.forRoute(S.current);
    const t = all.find((x) => x.id === S.howTopic) || all.find((x) => x.id === routeTopics[0]);
    const drawer = el('aside', { id: 'how', className: 'how' }, [
      el('div', { className: 'how-head' }, [
        el('strong', {}, ['How it\'s built']),
        el('button', { className: 'icon-btn dark', title: 'Close', onclick: () => { S.howOpen = false; renderHow(); } }, ['×'])
      ]),
      el('div', { className: 'how-tabs' }, all.map((x) => el('button', { className: `${x.id === t.id ? 'on' : ''} ${routeTopics.includes(x.id) ? 'here' : ''}`, onclick: () => { S.howTopic = x.id; renderHow(); } }, [x.title]))),
      el('div', { className: 'how-body' }, [
        el('h2', {}, [t.title]),
        el('p', {}, [t.summary]),
        el('ol', {}, t.steps.map((s) => el('li', {}, [s]))),
        t.production ? el('p', { className: 'how-note' }, [el('strong', {}, ['For production. ']), t.production]) : null,
        codeBlock(t.snippet),
        el('div', { className: 'how-docs' }, t.docs.map((d) => el('a', { href: d.url, target: '_blank', rel: 'noopener' }, [d.label])))
      ])
    ]);
    document.body.append(drawer);
  }

  function notice(msg) {
    const n = $('#notice');
    n.hidden = !msg;
    n.textContent = msg || '';
  }

  async function switchTenant(tenant) {
    S.tenant = tenant;
    try {
      S.tokens[tenant] = await backend.token(tenant);
      S.auth = S.tokens[tenant];
      notice('');
    } catch (err) {
      return notice(`Could not get a Luzmo token: ${err.message}`);
    }
    track('tenant_switched', { all: tenant === ALL });
    if (S.current?.startsWith('dash:') && !routes().some((r) => r.id === S.current)) S.current = null;
    go(S.current);
  }

  function showPortal() {
    document.querySelectorAll('.screen').forEach((s) => { s.hidden = true; });
    $('#portal')?.remove();
    document.body.append(document.getElementById('portal-template').content.cloneNode(true));
    applyBrand();
    const b = P().brand;
    document.title = b.productName;
    $('#brandBox').append(brandMark(b), el('div', {}, [el('div', { className: 'brand-name' }, [b.productName]), el('div', { className: 'brand-sub' }, [P().company])]));
    // Load the Luzmo runtimes up front so charts in the chat do not mount half-initialised.
    try { globalThis.preloadDashboard?.(S.appServer); globalThis.preloadVizItem?.(S.appServer); if (F().ai) globalThis.preloadIQ?.(S.appServer); } catch { /* optional */ }
    const select = $('#tenant');
    select.innerHTML = '';
    for (const t of tenants()) select.append(el('option', { value: t }, [t]));
    $('.tenant').hidden = !F().tenants;
    S.tenant = tenants()[1] || tenants()[0];
    select.value = S.tenant;
    select.onchange = () => switchTenant(select.value);
    $('#howBtn').hidden = !F().howto;
    $('#howBtn').onclick = () => (S.howOpen ? (S.howOpen = false, renderHow()) : openHow());
    let seen = false;
    try { seen = sessionStorage.getItem('ai-pop-seen') === '1'; sessionStorage.setItem('ai-pop-seen', '1'); } catch { /* storage blocked */ }
    S.chatOpen = !seen && F().ai;
    track('portal_opened', { mode: S.mode });
    switchTenant(S.tenant);
  }

  // Called by the wizard (browser mode) or by boot (server mode).
  function open({ portal, backend: b, apiHost, appServer, mode, iq }) {
    S.P = portal;
    S.mode = mode;
    S.apiHost = apiHost || S.apiHost;
    S.appServer = appServer || (S.apiHost.includes('.us.') ? 'https://app.us.luzmo.com' : 'https://app.luzmo.com');
    S.iq = iq ?? null;
    S.chats = {};
    S.tokens = {};
    S.builder = null;
    S.current = null;
    backend = b;
    if (b.core) S.state = b.core.state;
    showPortal();
  }

  // ---------- deployed portal: setup screen ----------
  function showServerSetup(config, { lead, canSetup, canOpen, errors = [] }) {
    document.querySelectorAll('.screen').forEach((s) => { s.hidden = true; });
    const screen = $('#serverSetup');
    screen.hidden = false;
    S.P = config.portal;
    applyBrand();
    $('#ssTitle').textContent = `${config.portal.brand.productName} on Luzmo`;
    $('#ssLead').textContent = lead;
    const box = $('#ssLog');
    box.innerHTML = '';
    const log = (msg, kind = '') => { box.hidden = false; box.append(el('div', { className: `log-line ${kind}` }, [msg])); box.scrollTop = box.scrollHeight; };
    errors.forEach(([m, k]) => log(m, k));
    $('#ssSecretField').hidden = !(canSetup && config.setupProtected);
    $('#ssSetup').hidden = !canSetup;
    $('#ssOpen').hidden = !canOpen;
    $('#ssSetup').onclick = async () => {
      $('#ssSetup').disabled = true;
      try {
        await backend.setup($('#ssSecret').value, log);
        log('All set. Opening the portal.', 'ok');
        setTimeout(() => open({ portal: config.portal, backend, apiHost: config.apiHost, appServer: config.appServer, mode: 'server' }), 400);
      } catch (err) {
        log(err.message, 'err');
      } finally {
        $('#ssSetup').disabled = false;
      }
    };
    $('#ssOpen').onclick = () => open({ portal: config.portal, backend, apiHost: config.apiHost, appServer: config.appServer, mode: 'server' });
  }

  async function boot() {
    if (window.__LOCAL__?.portal) return window.LuzmoWizard.startSingleFile(window.__LOCAL__.portal);
    let config = null;
    try {
      const res = await fetch('/api/config', { cache: 'no-cache' });
      if (res.ok && (res.headers.get('content-type') || '').includes('json')) config = await res.json();
    } catch { /* static hosting: no server functions */ }
    if (!config || config.mode !== 'server') return window.LuzmoWizard.start({ server: !!config, config });
    S.mode = 'server';
    backend = serverBackend(config);
    if (config.luzmoError) {
      return showServerSetup(config, { lead: 'The server has a key and token, but Luzmo did not accept them.', canSetup: false, canOpen: false, errors: [[config.luzmoError, 'err'], ['Paste the key and token into Vercel again with the copy buttons in Luzmo, check the region (EU or US), then redeploy.', 'muted']] });
    }
    const forceSetup = new URLSearchParams(location.search).has('setup');
    if (!config.ready || forceSetup) {
      return showServerSetup(config, { lead: 'Loads the synthetic data, column descriptions, theme and dashboards into the Luzmo account of this deployment. It takes about a minute.', canSetup: true, canOpen: config.ready });
    }
    open({ portal: config.portal, backend, apiHost: config.apiHost, appServer: config.appServer, mode: 'server' });
  }

  window.LuzmoPortal = { open, localBackend, applyBrand, brandMark, el, toast, menu, codeBlock, copy, downloadList };
  let booted = false;
  const bootOnce = () => { if (!booted) { booted = true; boot(); } };
  if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', bootOnce); else bootOnce();
})();
