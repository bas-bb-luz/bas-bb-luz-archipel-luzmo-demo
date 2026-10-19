// Server-side Luzmo access for the Vercel functions. Credentials come from environment variables
// (Vercel project settings, or .env locally) and never reach the browser.
const Core = require('../../public/core.js');
const P = require('../../prospect.json');

// First variable that is set wins. Pasted values often carry spaces or line breaks; keys and tokens never do.
const KEY_NAMES = ['LUZMO_API_KEY', 'LUZMO_KEY', 'API_KEY', 'LUZMO_APIKEY'];
const TOKEN_NAMES = ['LUZMO_API_TOKEN', 'LUZMO_TOKEN', 'API_TOKEN', 'LUZMO_APITOKEN'];
const pick = (names) => names.map((n) => (process.env[n] || '').replace(/\s+/g, '')).find(Boolean);

// Names only, never values: lets the setup screen show what the server can see.
const visibleNames = () => Object.keys(process.env).filter((n) => /LUZMO|^API_|SETUP_SECRET/i.test(n)).sort();

const env = () => ({
  key: pick(KEY_NAMES),
  token: pick(TOKEN_NAMES),
  apiHost: (process.env.LUZMO_API_HOST || 'https://api.luzmo.com').replace(/\/$/, ''),
  appServer: (process.env.LUZMO_APP_SERVER || 'https://app.luzmo.com').replace(/\/$/, '')
});

async function call(resource, body) {
  const e = env();
  if (!e.key || !e.token) throw new Error('LUZMO_API_KEY and LUZMO_API_TOKEN are not set on the server');
  const res = await fetch(`${e.apiHost}/0.1.0/${resource}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, key: e.key, token: e.token, version: '0.1.0' })
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = text; }
  if (!res.ok) throw new Core.ApiError(res.status, json);
  return json;
}

// Warm function instances reuse the discovered ids for a short while.
let cached = null;
async function getCore({ fresh = false, log } = {}) {
  if (!cached || fresh || Date.now() - cached.at > 30000) {
    const core = Core.createCore({ P, call, log: (...a) => cached?.logger?.(...a) });
    await core.discover();
    cached = { core, at: Date.now() };
  }
  cached.logger = log || null;
  return cached.core;
}

const TENANTS = [Core.ALL, ...P.tenants.map((t) => t.name)];
function tenantOf(value) {
  if (!TENANTS.includes(value)) throw Object.assign(new Error('Unknown organisation'), { status: 400 });
  return value;
}

function handler(fn) {
  return async (req, res) => {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
      const out = await fn(body, req);
      res.status(200).json(out);
    } catch (err) {
      res.status(err.status && err.status < 500 ? err.status : 500).json({ error: err.message });
    }
  };
}

module.exports = { P, Core, env, call, getCore, tenantOf, handler, visibleNames, KEY_NAMES, TOKEN_NAMES };
