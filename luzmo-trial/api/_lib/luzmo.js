// Server-side Luzmo access for a deployed portal (Vercel or `npm run dev`). Credentials come from
// environment variables and never reach the browser. The portal itself is described by portal.json,
// which the trial wizard writes. Without portal.json or without credentials the site runs the wizard.
const fs = require('fs');
const path = require('path');
const Core = require('../../public/core.js');

const PORTAL_FILE = path.join(__dirname, '..', '..', 'portal.json');
let portalCache;
function portal() {
  if (portalCache === undefined) {
    portalCache = null;
    try {
      if (process.env.PORTAL_JSON) portalCache = JSON.parse(process.env.PORTAL_JSON);
      else if (fs.existsSync(PORTAL_FILE)) portalCache = JSON.parse(fs.readFileSync(PORTAL_FILE, 'utf8'));
    } catch (err) {
      portalCache = null;
      console.error(`portal.json could not be read: ${err.message}`);
    }
  }
  return portalCache;
}

// First variable that is set wins. Pasted values often carry spaces or line breaks; keys and tokens never do.
const pick = (names) => names.map((n) => (process.env[n] || '').replace(/\s+/g, '')).find(Boolean);
const visibleNames = () => Object.keys(process.env).filter((n) => /LUZMO|SETUP_SECRET|PORTAL_JSON/i.test(n)).sort();

const env = () => {
  const apiHost = (process.env.LUZMO_API_HOST || 'https://api.luzmo.com').replace(/\/$/, '');
  return {
    key: pick(['LUZMO_API_KEY', 'LUZMO_KEY']),
    token: pick(['LUZMO_API_TOKEN', 'LUZMO_TOKEN']),
    apiHost,
    appServer: (process.env.LUZMO_APP_SERVER || (apiHost.includes('.us.') ? 'https://app.us.luzmo.com' : 'https://app.luzmo.com')).replace(/\/$/, '')
  };
};

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
  const P = portal();
  if (!P) throw Object.assign(new Error('This deployment has no portal.json yet'), { status: 409 });
  if (!cached || fresh || Date.now() - cached.at > 30000) {
    const core = Core.createCore({ P, call, log: (...a) => cached?.logger?.(...a) });
    await core.discover();
    cached = { core, at: Date.now() };
  }
  cached.logger = log || null;
  return cached.core;
}

function tenantOf(value) {
  const P = portal();
  const tenants = [Core.ALL, ...(P?.tenants || []).map((t) => t.name)];
  if (!tenants.includes(value)) throw Object.assign(new Error('Unknown organisation'), { status: 400 });
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

module.exports = { portal, Core, env, call, getCore, tenantOf, handler, visibleNames };
