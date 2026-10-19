// A small in-memory stand-in for the Luzmo Core API, with CORS, for tests without network access.
// It records every call so tests can assert on what the portal sent.
const http = require('http');
const crypto = require('crypto');

function createMock({ port = 4010, iq = true } = {}) {
  const db = { securables: [], columns: [], themes: [], schedules: [], calls: [] };
  const opts = { iq };
  const id = () => crypto.randomUUID();
  const nameOf = (n) => (typeof n === 'string' ? n : n?.en);
  const typeOf = (v) => (typeof v === 'number' ? 'numeric' : /^\d{4}-\d{2}-\d{2}T/.test(String(v)) ? 'datetime' : 'hierarchy');

  function handle(resource, body) {
    const { action } = body;
    const p = body.properties || {};
    if (body.key !== 'test-key' && !String(body.key).startsWith('embed-')) return [401, { message: 'Invalid key/token' }];
    switch (`${resource}:${action}`) {
      case 'securable:get': {
        const w = body.find?.where || {};
        const rows = db.securables.filter((s) => (!w.type || s.type === w.type) && (!w.id || s.id === w.id));
        return [200, { count: rows.length, rows }];
      }
      case 'securable:create': {
        const s = { id: id(), type: p.type, name: p.name, contents: p.contents, custom_metadata: p.custom_metadata || null };
        db.securables.push(s);
        return [200, s];
      }
      case 'securable:update': {
        const s = db.securables.find((x) => x.id === body.id);
        if (!s) return [404, { message: 'Not found' }];
        Object.assign(s, p);
        return [200, s];
      }
      case 'securable:associate':
        return [200, {}];
      case 'data:create': {
        let ds = p.securable_id && db.securables.find((x) => x.id === p.securable_id);
        if (!ds) {
          ds = { id: id(), type: 'dataset', name: p.options.name, rows: 0 };
          db.securables.push(ds);
          p.options.header.forEach((h, i) => db.columns.push({ id: id(), securable_id: ds.id, source_name: h, name: { en: h }, type: typeOf(p.data.find((r) => r[i] != null)?.[i]) }));
        }
        ds.rows = (p.type === 'append' ? ds.rows : 0) + p.data.length;
        return [200, { id: ds.id }];
      }
      case 'column:get':
        return [200, { rows: db.columns.filter((c) => c.securable_id === body.find?.where?.securable_id) }];
      case 'column:update': {
        const c = db.columns.find((x) => x.id === body.id);
        Object.assign(c, p);
        return [200, c];
      }
      case 'theme:get':
        return [200, { rows: db.themes }];
      case 'theme:create': {
        const t = { id: id(), ...p };
        db.themes.push(t);
        return [200, t];
      }
      case 'theme:update':
        return [200, {}];
      case 'authorization:create':
        return [200, { id: `embed-${id()}`, token: `tok-${id()}`, properties: p }];
      case 'schedule:get':
        return [200, { rows: db.schedules }];
      default:
        return [400, { message: `Mock does not support ${resource}:${action}` }];
    }
  }

  function aiprompt(body, res) {
    if (!opts.iq) {
      res.writeHead(403, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      return res.end(JSON.stringify({ message: 'The IQ add-on is not enabled for this organization' }));
    }
    const stream = body.properties?.stream;
    const chart = { type: 'bar-chart', options: { title: { en: 'Mock chart' } }, slots: [{ name: 'measure', content: [{ datasetId: 'd', columnId: 'c', type: 'numeric', aggregationFunc: 'sum' }] }] };
    if (!stream) {
      res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      return res.end(JSON.stringify({ assistant_message: { message: 'Mock answer.' } }));
    }
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Access-Control-Allow-Origin': '*' });
    const send = (o) => res.write(`data: ${JSON.stringify(o)}\n\n`);
    send({ type: 'start', conversation_id: 'conv-1' });
    send({ type: 'text_delta', delta: 'The **highest** value is in ' });
    send({ type: 'text_delta', delta: 'the first group.' });
    send({ type: 'asset_start', asset_id: 'a1', asset_type: 'item' });
    send({ type: 'asset_delta', asset_id: 'a1', delta: chart });
    send({ type: 'asset_end', asset_id: 'a1' });
    send({ type: 'finish' });
    res.end();
  }

  const server = http.createServer((req, res) => {
    if (req.method === 'OPTIONS') {
      res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': 'POST, GET, OPTIONS' });
      return res.end();
    }
    const m = req.url.match(/^\/0\.1\.0\/([a-z]+)/);
    if (!m) { res.writeHead(404, { 'Access-Control-Allow-Origin': '*' }); return res.end(); }
    let raw = '';
    req.on('data', (c) => (raw += c));
    req.on('end', () => {
      const body = JSON.parse(raw || '{}');
      db.calls.push({ resource: m[1], action: body.action, body });
      if (m[1] === 'aiprompt') return aiprompt(body, res);
      const [status, out] = handle(m[1], body);
      res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify(out));
    });
  });
  return new Promise((resolve) => server.listen(port, () => resolve({ db, opts, server, url: `http://localhost:${port}`, close: () => new Promise((r) => server.close(r)) })));
}

module.exports = { createMock };
if (require.main === module) createMock({ port: Number(process.env.PORT || 4010) }).then((m) => console.log(`Mock Luzmo on ${m.url}`));
