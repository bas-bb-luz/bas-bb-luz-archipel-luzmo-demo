// Archipel Insights demo portal on Luzmo.
// On Vercel the browser talks to /api/* (credentials stay server-side) and only ever holds embed tokens.
// The offline single-file build (window.__LOCAL__) runs the same core in the browser with a key typed in.
(function () {
  const Core = window.LuzmoKitCore;
  const $ = (sel) => document.querySelector(sel);
  const el = (tag, props = {}, children = []) => {
    const node = Object.assign(document.createElement(tag), props);
    children.forEach((c) => c != null && node.append(c));
    return node;
  };
  const LOCAL = window.__LOCAL__ || null;
  const ALL = Core.ALL;

  const S = {
    P: null,
    apiHost: 'https://api.luzmo.com',
    appServer: 'https://app.luzmo.com',
    state: { datasets: {}, pageDashboards: {}, customDashboards: [] },
    tokens: {},
    auth: null,
    tenant: null,
    current: null,
    editing: {},
    iqPanel: false,
    selfTab: 'ede',
    chatOpen: false,
    chats: {},
    builder: null
  };
  let backend;
  const P = () => S.P;
  const AI_NAME = () => `${P().brand.logoText} AI`;
  const tenants = () => [ALL, ...P().tenants.map((t) => t.name)];

  function toast(msg, action) {
    const t = el('div', { className: 'toast' }, [el('span', {}, [msg])]);
    if (action) t.append(el('button', { className: 'link', onclick: () => { action.run(); t.remove(); } }, [action.label]));
    document.body.append(t);
    setTimeout(() => t.remove(), 6000);
  }

  function log(msg, kind = '') {
    const box = $('#log');
    if (!box) return;
    box.hidden = false;
    box.append(el('div', { className: `log-line ${kind}` }, [msg]));
    box.scrollTop = box.scrollHeight;
  }

  // ---------- backends ----------
  async function postJson(url, body, headers = {}) {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw Object.assign(new Error(json.error || `HTTP ${res.status}`), { status: res.status });
    return json;
  }

  // Vercel: every write and every token goes through the server functions.
  function serverBackend(config) {
    return {
      local: false,
      setupProtected: config.setupProtected,
      async setup(secret) {
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
      async getItems(id) {
        return (await postJson('/api/dashboards', { op: 'get', tenant: S.tenant, id })).items;
      },
      async create(name, items) {
        const out = await postJson('/api/dashboards', { op: 'create', tenant: S.tenant, name, items });
        S.state.customDashboards = mergeDashboards(out.dashboards);
        S.tokens[S.tenant] = out.token;
        return out.dashboard;
      },
      async save(id, items, name) {
        const out = await postJson('/api/dashboards', { op: 'save', tenant: S.tenant, id, items, name });
        S.state.customDashboards = mergeDashboards(out.dashboards);
      }
    };
  }

  // Server lists only this tenant's dashboards; keep the other tenants' entries we already know.
  function mergeDashboards(list) {
    const others = (S.state.customDashboards || []).filter((d) => d.tenant !== S.tenant && d.tenant !== ALL);
    return [...others, ...list];
  }

  // Offline file: the same core runs here, calling Luzmo directly with the key from the form.
  function localBackend(creds) {
    const call = async (resource, body) => {
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
    const core = Core.createCore({ P: P(), call, log });
    S.state = core.state;
    return {
      local: true,
      async setup() {
        await core.discover();
        log('Connected to Luzmo', 'ok');
        await core.setupTheme();
        for (const key of Object.keys(P().datasets)) {
          const rows = LOCAL.data[key];
          let offset = 0;
          while (offset !== null) offset = await core.setupDataChunk(key, rows, offset);
          await core.setupColumns(key);
        }
        await core.setupDashboards();
      },
      async open() {
        await core.discover();
        if (!core.ready()) throw new Error('No earlier setup found in this Luzmo account. Use "Set up Luzmo" first.');
        log('Found the demo in Luzmo', 'ok');
      },
      token: (tenant) => core.mintToken(tenant, 1),
      getItems: (id) => core.getItems(id),
      async create(name, items) {
        const d = await core.createDashboard(name, items, S.tenant);
        S.tokens[S.tenant] = await core.mintToken(S.tenant, 1);
        return d;
      },
      save: (id, items, name) => core.saveItems(id, items, name)
    };
  }

  // ---------- AI: /aiprompt with the tenant's embed token ----------
  // Same call as the Otto demo: embed key/token only, so answers respect the tenant filter.
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
    || (id === S.state.dashboardId ? 'the demo dashboard' : P().pages.find((p) => S.state.pageDashboards[p.id] === id)?.title || 'this dashboard');
  const routeFor = (id) => {
    if (id === S.state.dashboardId) return 'self';
    const page = P().pages.find((p) => S.state.pageDashboards[p.id] === id);
    return page ? page.id : `dash:${id}`;
  };

  async function createDashboard(name, items) {
    const d = await backend.create(name, items);
    S.auth = S.tokens[S.tenant];
    renderNav();
    return d.id;
  }

  // Template pages are shared by every organisation, so AI and builder changes land in the user's own copy.
  // Each template gets one copy per organisation, reused for later changes.
  const copyName = (id) => `${dashName(id)} (my version)`;
  const existingCopy = (id) => visibleDashboards().find((d) => d.name === copyName(id) && d.tenant === S.tenant);

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
      toast('Added to the report builder canvas', { label: 'Open', run: () => { S.selfTab = 'ack'; go('self'); } });
      return;
    }
    if (target === 'new') {
      const name = window.prompt('Name for the new dashboard', value.options?.title?.en || 'My dashboard');
      if (!name) return;
      const id = await createDashboard(name.trim(), [Core.chartToItem(value)]);
      toast(`Created "${name.trim()}"`, { label: 'Open', run: () => go(`dash:${id}`) });
      return;
    }
    const source = isTemplate(target) && existingCopy(target) ? existingCopy(target).id : target;
    const items = await backend.getItems(source);
    const out = await saveChanged(target, [...items, Core.chartToItem(value, items)]);
    if (S.current === routeFor(target) || out.copied) go(routeFor(out.id));
    toast(out.copied ? `Saved in your own version of ${dashName(target)}` : `Added to ${dashName(target)}`, { label: 'Open', run: () => go(routeFor(out.id)) });
  }

  // ---------- chat ----------
  // The assistant decides on its own: answer a question, build a new dashboard, or change the open one.
  const BUILD_RE = /\b(build|create|make|generate|design|set up|start|give me)\b[^.?!]{0,60}\b(dashboard|report)\b|\bnew (dashboard|report)\b/i;
  const EDIT_RE = /^(please |can you |could you )?(add|remove|delete|drop|change|replace|rename|move|resize|swap|turn|make|put|include|sort|colou?r|split|combine|show)\b|\b(this|the|my) (dashboard|report|page)\b/i;
  const ADD_LAST_RE = /\badd (it|that|this|these|those|the charts?)\b/i;

  function openDashboard() {
    const route = S.current || '';
    if (route.startsWith('dash:')) return route.slice(5);
    if (route === 'self' && S.selfTab === 'ede') return S.state.dashboardId;
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

  // Every mounted chat panel re-renders, so a panel rebuilt mid-answer still shows the latest state.
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
        reply.text = `${r.text ? `${r.text}\n\n` : ''}I built **${name}** with ${r.dashboard.items.length} items. You find it under My dashboards.`;
        reply.link = { label: 'Open dashboard', to: `dash:${id}` };
      } else if (intent === 'edit') {
        const target = openDashboard();
        reply.progress = `Updating ${dashName(target)}`;
        const items = await backend.getItems(isTemplate(target) && existingCopy(target) ? existingCopy(target).id : target);
        const contents = { views: [{ screenModus: 'desktop', items }] };
        const r = await runDashboardAgent(text, contents, onEvent);
        const out = await saveChanged(target, r.dashboard.items);
        reply.text = `${r.text ? `${r.text}\n\n` : ''}${out.copied ? `Done. This page is shared, so I saved the change in **your own version**.` : `Done. I updated ${dashName(target)}.`}`;
        go(routeFor(out.id));
      } else {
        const r = await askAnalyst(chat, text, onEvent);
        reply.text = r.text || (r.charts.length ? '' : 'I could not find an answer in the data.');
        reply.charts = r.charts;
      }
    } catch (err) {
      reply.error = err.message;
      if (/license|addon|not enabled/i.test(err.message)) reply.error += ' Check that IQ is enabled on this Luzmo account.';
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
      el('option', { value: 'builder' }, ['Report builder canvas']),
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

  function chatPanel({ compact }) {
    const wrap = el('div', { className: `ai-chat ${compact ? 'compact' : ''}` });
    const list = el('div', { className: 'ai-messages' });
    const input = el('textarea', { rows: 1, placeholder: `Ask ${AI_NAME()} anything, or ask for a dashboard` });
    const submit = () => { const t = input.value; input.value = ''; send(t); };
    input.onkeydown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } };
    const sendBtn = el('button', { className: 'ai-send', onclick: submit, title: 'Send' }, ['Send']);
    let renderedCharts = new WeakMap();
    function render() {
      const chat = chatState();
      list.innerHTML = '';
      if (!chat.messages.length) {
        list.append(el('div', { className: 'ai-intro' }, [
          el('div', { className: 'ai-avatar big' }, [P().brand.logoText.charAt(0)]),
          el('h3', {}, [`Hi, I'm ${AI_NAME()}`]),
          el('p', {}, [S.tenant === ALL ? `Ask about learning across all ${P().tenants.length} organisations, or ask me to build or change a dashboard.` : `Ask about learning at ${S.tenant}, or ask me to build or change a dashboard. I only see your organisation's data.`])
        ]));
        const sugg = el('div', { className: 'ai-suggestions' });
        const prompts = [...(P().aiSuggestions || []).slice(0, compact ? 2 : 4), ...(P().aiBuildSuggestions || []).slice(0, compact ? 1 : 2)];
        if (openDashboard()) prompts.push('Add a chart with learning hours per month to this dashboard');
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
    wrap.focusInput = () => input.focus();
    return wrap;
  }

  // Floating assistant on every page, like MIA in the Otto demo. Opens by itself on the first visit.
  function renderChatPopup() {
    $('#aiFab')?.remove();
    $('#aiPop')?.remove();
    if (S.current === 'ai') return;
    const pop = el('div', { id: 'aiPop', className: `ai-pop ${S.chatOpen ? 'open' : ''}` }, [
      el('div', { className: 'ai-pop-head' }, [
        el('span', { className: 'ai-avatar' }, [P().brand.logoText.charAt(0)]),
        el('strong', {}, [AI_NAME()]),
        el('button', { className: 'link', onclick: () => { go('ai'); } }, ['Full screen']),
        el('button', { className: 'icon-btn', title: 'Close', onclick: () => { S.chatOpen = false; renderChatPopup(); } }, ['×'])
      ]),
      S.chatOpen ? chatPanel({ compact: true }) : null
    ]);
    const fab = el('button', { id: 'aiFab', className: `ai-fab ${S.chatOpen ? 'hidden' : ''}`, title: `Ask ${AI_NAME()}`, onclick: () => { S.chatOpen = true; renderChatPopup(); } }, [
      el('span', { className: 'ai-avatar' }, [P().brand.logoText.charAt(0)]), el('span', {}, [`Ask ${AI_NAME()}`])
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
      S.builder = { tenant: S.tenant, type: 'bar-chart', slots: [], options: { display: { title: true } }, filters: [], editingId: null, items: [], name: '', dashboardId: null, mode: 'manual', panel: 'data' };
    }
    return S.builder;
  }

  async function openInBuilder(id) {
    if (isTemplate(id) && existingCopy(id)) id = existingCopy(id).id;
    const items = await backend.getItems(id);
    S.builder = { ...ensureBuilder(), items: items.filter((i) => i.type !== 'text'), name: isTemplate(id) ? `${dashName(id)} (my version)` : dashName(id), dashboardId: isTemplate(id) ? null : id };
    S.selfTab = 'ack';
    go('self');
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
        renderSelf();
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
      renderSelf();
    };
    const resetBtn = el('button', { className: 'btn', onclick: () => { Object.assign(B, { slots: [], filters: [], options: { display: { title: true } }, editingId: null }); renderSelf(); } }, ['Reset']);

    // Prompt to chart: Luzmo's item agent fills the same builder state.
    const aiChat = Object.assign(el('luzmo-ai-chat'), auth, {
      appServer: S.appServer, agent: 'item', task: 'generate', modelPreference: 'performance', hideDatasetButton: true,
      selectedDatasets: ids.map((id) => ({ id })), placeholder: 'e.g. completion rate by department as a bar chart'
    });
    aiChat.addEventListener('luzmo-complete', (e) => {
      const d = e.detail || {};
      const chart = d.chart?.generatedChart || d.chart || d.generatedChart;
      if (d.error || !chart?.type) return toast(typeof d.error === 'string' ? d.error : 'The AI could not build that chart');
      Object.assign(B, { mode: 'manual', type: chart.type, slots: chart.slots || [], options: Core.cleanOptions(chart.options || {}), filters: Core.queryableFilters(chart.filters || []), editingId: null });
      renderSelf();
    });

    const modeTabs = el('div', { className: 'tabs' }, [['manual', 'Manual'], ['prompt', 'Prompt to chart']].map(([k, label]) => el('button', {
      className: k === B.mode ? 'on' : '', onclick: () => { B.mode = k; renderSelf(); }
    }, [label])));

    const compose = B.mode === 'prompt'
      ? el('div', { className: 'ack-compose' }, [modeTabs, el('p', { className: 'muted' }, ['Describe the chart you want. Luzmo IQ builds the chart configuration.']), el('div', { className: 'ack-ai' }, [aiChat])])
      : el('div', { className: 'ack-compose' }, [
        modeTabs, typeButtons,
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
        if (found) Object.assign(B, { editingId: found.id, type: found.type, slots: structuredClone(found.slots), options: Core.cleanOptions(found.options), filters: found.filters || [], mode: 'manual', panel: 'data' });
        renderSelf();
      } else if (action === 'delete' || action === 'clone') {
        renderSelf();
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
        renderNav();
      } catch (err) {
        toast(`Could not save. ${err.message}`);
      } finally {
        saveBtn.disabled = false;
      }
    } }, [B.dashboardId ? 'Save' : 'Save as new dashboard']);
    const clearBtn = el('button', { className: 'btn', onclick: () => { S.builder = null; ensureBuilder(); renderSelf(); } }, ['Clear canvas']);

    host.append(
      el('div', { className: 'ack-top' }, [el('aside', { className: 'card ack-fields' }, [el('h3', {}, ['Data fields']), fields]), el('section', { className: 'card' }, [compose])]),
      el('div', { className: 'card ack-canvas' }, [
        el('div', { className: 'ack-canvas-bar' }, [el('h3', {}, ['Report canvas']), nameInput, clearBtn, saveBtn]),
        B.items.length ? grid : el('div', { className: 'placeholder', style: 'padding:40px' }, ['No charts yet. Build one above, add one from the AI chat, or open a dashboard in the builder.'])
      ])
    );
    refreshPreview();
  }

  // ---------- pages ----------
  function applyBrand() {
    const b = P().brand;
    const root = document.documentElement.style;
    root.setProperty('--primary', b.primary);
    root.setProperty('--accent', b.accent);
    root.setProperty('--bg', b.background);
    root.setProperty('--surface', b.surface);
    root.setProperty('--text', b.text);
    root.setProperty('--muted', b.muted);
    root.setProperty('--font', `'${b.font}', system-ui, sans-serif`);
    root.setProperty('--font-heading', `'${b.headingFont || b.font}', system-ui, sans-serif`);
    if (b.cta) root.setProperty('--cta', b.cta);
    document.title = b.productName;
    const mark = $('#brandMark');
    const letter = () => { mark.className = 'brand-mark letter'; mark.textContent = b.logoText.charAt(0); };
    if (b.logoMarkUrl) {
      mark.textContent = '';
      mark.append(el('img', { src: b.logoMarkUrl, alt: b.logoText, onerror: letter }));
    } else {
      letter();
    }
    $('#brandName').textContent = b.productName;
    $('#brandSub').textContent = P().company;
  }

  function routes() {
    return [
      ...P().pages.map((p) => ({ id: p.id, group: 'Analytics', label: p.title, title: p.title, subtitle: p.subtitle, render: () => renderDashboardPage(S.state.pageDashboards?.[p.id], p) })),
      { id: 'self', group: 'Self-service', label: 'Self-service', title: 'Self-service', subtitle: 'Build your own reports with the dashboard editor or the report builder', render: renderSelf },
      { id: 'ai', group: 'Self-service', label: AI_NAME(), badge: 'AI', title: AI_NAME(), subtitle: 'Ask questions in plain language. Get answers, charts and dashboards.', render: () => $('#view').append(el('div', { className: 'card ai-page' }, [chatPanel({ compact: false })])) },
      ...visibleDashboards().map((d) => ({ id: `dash:${d.id}`, group: 'My dashboards', label: d.name, title: d.name, subtitle: 'Your own dashboard. Edit it yourself or ask the AI to change it.', render: () => renderDashboardPage(d.id, null) }))
    ];
  }

  function renderNav() {
    const nav = $('#nav');
    nav.innerHTML = '';
    let group = null;
    for (const r of routes()) {
      if (r.group !== group) { group = r.group; nav.append(el('div', { className: 'nav-label' }, [group])); }
      const btn = el('button', { className: r.id === S.current ? 'active' : '', onclick: () => go(r.id) }, [el('span', { className: 'nav-text' }, [r.label])]);
      if (r.badge) btn.append(el('span', { className: 'badge' }, [r.badge]));
      nav.append(btn);
    }
    if (group !== 'My dashboards') nav.append(el('div', { className: 'nav-label' }, ['My dashboards']));
    nav.append(el('button', { className: 'nav-new', onclick: () => { S.builder = null; S.selfTab = 'ack'; go('self'); } }, ['+ Create new']));
  }

  function go(id) {
    const all = routes();
    const r = all.find((x) => x.id === id) || all[0];
    S.current = r.id;
    renderNav();
    $('#pageTitle').textContent = r.title;
    $('#pageSubtitle').textContent = r.subtitle;
    $('#view').innerHTML = '';
    renderChatPopup();
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

  // View a dashboard, with an Edit button (EDE) and an "Edit in report builder" button (ACK).
  function renderDashboardPage(id, page) {
    if (!id) {
      if (page) return renderFlexFallback(page);
      return $('#view').append(el('div', { className: 'card placeholder', style: 'padding:48px' }, ['This dashboard is not available.']));
    }
    const editing = !!S.editing[id];
    const toolbar = el('div', { className: 'toolbar' }, [
      el('span', { className: 'hint-inline' }, [editing ? 'You are editing. Save in the editor toolbar.' : isTemplate(id) ? 'Shared template. Edits are saved for your organisation.' : 'Your own dashboard.']),
      el('button', { className: `btn ${editing ? '' : 'primary'}`, onclick: () => { S.editing[id] = !editing; go(S.current); } }, [editing ? 'Done editing' : 'Edit']),
      el('button', { className: 'btn', onclick: () => openInBuilder(id).catch((err) => toast(err.message)) }, ['Edit in report builder']),
      el('button', { className: 'btn', onclick: () => { S.chatOpen = true; renderChatPopup(); } }, ['Ask AI to change it'])
    ]);
    $('#view').append(toolbar, el('div', { className: `page-dash ${editing ? 'editing' : ''}` }, [dashboardEmbed(id, editing ? 'editLimited' : 'view')]));
  }

  function renderFlexFallback(page) {
    $('#view').append(el('div', { className: 'notice' }, [`${page.title} has no Luzmo dashboard yet. Run the setup again.`]));
  }

  function renderSelf() {
    if (S.current !== 'self') return go('self');
    const view = $('#view');
    view.innerHTML = '';
    const tabs = el('div', { className: 'tabs big' }, [['ede', 'Dashboard editor (EDE)'], ['ack', 'Report builder (ACK)']].map(([k, label]) => el('button', {
      className: k === S.selfTab ? 'on' : '', onclick: () => { S.selfTab = k; renderSelf(); renderChatPopup(); }
    }, [label])));
    view.append(tabs);
    if (S.selfTab === 'ede') {
      if (!S.state.dashboardId) return view.append(el('div', { className: 'card placeholder', style: 'padding:48px' }, ['The demo dashboard is not in Luzmo yet. Run the setup again.']));
      const bar = el('div', { className: 'toolbar' }, [
        el('span', { className: 'hint-inline' }, ['Full Luzmo editor inside the portal. Drag charts, add new ones and save.']),
        el('button', { className: 'btn', onclick: () => { S.iqPanel = !S.iqPanel; renderSelf(); } }, [S.iqPanel ? 'Close Luzmo IQ' : 'Luzmo IQ panel'])
      ]);
      const wrap = el('div', { className: `builder ${S.iqPanel ? 'with-chat' : ''}` }, [el('div', { className: 'card' }, [dashboardEmbed(S.state.dashboardId, 'editLimited')])]);
      if (S.iqPanel) {
        const chat = el('luzmo-iq-embed-chat');
        Object.assign(chat, luzmoProps(), { dashboardId: S.state.dashboardId, availableDatasets: datasetIds() });
        wrap.append(el('div', { className: 'card' }, [chat]));
      }
      view.append(bar, wrap);
    } else {
      const host = el('div', { className: 'ack-builder' });
      view.append(host);
      renderBuilder(host);
    }
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
    if (S.current?.startsWith('dash:') && !visibleDashboards().some((d) => `dash:${d.id}` === S.current)) S.current = P().pages[0].id;
    go(S.current || P().pages[0].id);
  }

  function showPortal() {
    $('#setup').hidden = true;
    if (!$('#portal')) document.body.append(document.getElementById('portal-template').content.cloneNode(true));
    $('#portal').hidden = false;
    applyBrand();
    // Load the Luzmo runtimes up front so charts in the chat do not mount half-initialised.
    try { globalThis.preloadDashboard?.(S.appServer); globalThis.preloadVizItem?.(S.appServer); globalThis.preloadIQ?.(S.appServer); } catch { /* optional */ }
    const select = $('#tenant');
    select.innerHTML = '';
    for (const t of tenants()) select.append(el('option', { value: t }, [t]));
    S.tenant = tenants()[1] || tenants()[0];
    select.value = S.tenant;
    select.onchange = () => switchTenant(select.value);
    // Pop the assistant open once per visit so people see it straight away.
    let seen = false;
    try { seen = sessionStorage.getItem('ai-pop-seen') === '1'; sessionStorage.setItem('ai-pop-seen', '1'); } catch { /* storage blocked */ }
    S.chatOpen = !seen;
    switchTenant(S.tenant);
  }

  // ---------- setup screen ----------
  function showSetup({ lead, creds, secret, canOpen }) {
    $('#setup').hidden = false;
    $('#setupCompany').textContent = P().company;
    $('#setupLead').textContent = lead;
    $('#credFields').hidden = !creds;
    $('#secretField').hidden = !secret;
    if (creds) {
      const region = $('#region');
      region.onchange = () => { $('#customHost').hidden = region.value !== 'custom'; };
      // Prefill from a personal build (.env baked in) or from "Remember on this computer".
      let saved = LOCAL.creds || null;
      try { saved = JSON.parse(localStorage.getItem('luzmo-kit-creds') || 'null') || saved; } catch { /* storage blocked */ }
      if (saved?.key) {
        $('#apiKey').value = saved.key;
        $('#apiToken').value = saved.token || '';
        if (saved.apiHost && [...region.options].some((o) => o.value === saved.apiHost)) region.value = saved.apiHost;
        $('#rememberCreds').checked = !LOCAL.creds;
      }
    }
    const lock = (on) => document.querySelectorAll('#setup button').forEach((b) => { b.disabled = on; });
    const run = async (full) => {
      $('#log').innerHTML = '';
      lock(true);
      try {
        if (creds) {
          const host = $('#region').value === 'custom' ? $('#customHost').value.trim().replace(/\/$/, '') : $('#region').value;
          const key = $('#apiKey').value.trim();
          const token = $('#apiToken').value.trim();
          if (!key || !token) throw new Error('Fill in the API key and token first.');
          try {
            if ($('#rememberCreds').checked) localStorage.setItem('luzmo-kit-creds', JSON.stringify({ key, token, apiHost: host }));
            else localStorage.removeItem('luzmo-kit-creds');
          } catch { /* storage blocked */ }
          S.apiHost = host;
          S.appServer = host.includes('.us.') ? 'https://app.us.luzmo.com' : host === 'https://api.luzmo.com' ? 'https://app.luzmo.com' : host;
          backend = localBackend({ apiHost: host, key, token });
          if (full) await backend.setup(); else await backend.open();
        } else if (full) {
          await backend.setup($('#setupSecret').value);
        }
        log('All set. Opening the portal.', 'ok');
        setTimeout(showPortal, 500);
      } catch (err) {
        log(err.message, 'err');
        if (/Could not reach/.test(err.message)) log('If the region is right, your browser may block calls from a local file. Open the file in Chrome.', 'muted');
      } finally {
        lock(false);
      }
    };
    $('#setupBtn').onclick = () => run(true);
    $('#openBtn').hidden = !creds && !canOpen;
    $('#openBtn').onclick = () => (creds ? run(false) : showPortal());
  }

  async function boot() {
    if (LOCAL) {
      S.P = LOCAL.prospect;
      const counts = Object.keys(P().datasets).map((k) => `${LOCAL.data[k].length.toLocaleString('en')} ${Core.pretty(k).toLowerCase()} rows`);
      return showSetup({ lead: `This file sets up the demo in your Luzmo account and opens the portal. It pushes ${counts.join(' and ')}. Use a demo account, never production.`, creds: true });
    }
    let config;
    try {
      const res = await fetch('/api/config');
      config = await res.json();
      if (!res.ok) throw new Error(config.error || `HTTP ${res.status}`);
    } catch (err) {
      document.body.append(el('div', { className: 'notice', style: 'margin:40px' }, [`The portal server is not reachable: ${err.message}`]));
      return;
    }
    S.P = config.prospect;
    S.apiHost = config.apiHost;
    S.appServer = config.appServer;
    S.state = config.state || S.state;
    backend = serverBackend(config);
    if (!config.configured) {
      $('#setupBtn').hidden = true;
      $('#openBtn').hidden = true;
      showSetup({ lead: `Missing on the server: ${config.missing.join(' and ')}. In Vercel open Settings, Environment Variables, add them with exactly these names, then redeploy (Deployments, the top one, ⋯, Redeploy).`, creds: false });
      log(config.seenVariables?.length ? `The server sees these variable names: ${config.seenVariables.join(', ')}` : 'The server sees no Luzmo variables at all. They are not saved yet, or this deployment is older than the variables.', 'warn');
      return;
    }
    if (config.luzmoError) {
      showSetup({ lead: 'The server has a key and token, but Luzmo did not accept them.', creds: false });
      $('#setupBtn').hidden = true;
      $('#openBtn').hidden = true;
      log(config.luzmoError, 'err');
      log('Paste the key and token into Vercel again with the copy buttons in Luzmo, check the region (EU or US), then redeploy.', 'muted');
      return;
    }
    const forceSetup = new URLSearchParams(location.search).has('setup');
    if (!config.ready || forceSetup) {
      return showSetup({ lead: 'Loads the synthetic data, column descriptions, theme and dashboards into the Luzmo account of this deployment. It takes about a minute.', creds: false, secret: config.setupProtected, canOpen: config.ready });
    }
    showPortal();
  }

  boot();
})();
