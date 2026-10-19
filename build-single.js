// Builds dist/archipel-demo.html: the whole portal in one offline file that calls Luzmo from the browser.
// Usage: npm run build:single
const fs = require('fs');
const path = require('path');
const read = (f) => fs.readFileSync(path.join(__dirname, f), 'utf8');
const P = JSON.parse(read('prospect.json'));
const data = Object.fromEntries(Object.keys(P.datasets).map((k) => [k, JSON.parse(read(`data/${k}.json`))]));
const safe = (s) => s.replace(/<\/script/gi, '<\\/script').replace(/<!--/g, '<\\!--');
const json = (v) => JSON.stringify(v).replace(/</g, '\\u003c');

let html = read('public/index.html');
const swap = (from, to) => {
  if (!html.includes(from)) throw new Error(`Missing in index.html: ${from}`);
  html = html.replace(from, () => to);
};
swap('<link rel="stylesheet" href="styles.css" />', `<style id="app-css">${read('public/styles.css')}</style>`);
swap('<script src="vendor/luzmo-embed.js"></script>', `<script>${safe(read('public/vendor/luzmo-embed.js'))}</script>`);
swap('<script src="core.js"></script>', `<script>${safe(read('public/core.js'))}</script>`);
swap('<script src="app.js"></script>', [
  `<script type="application/json" id="local-json">${json({ prospect: P, data })}</script>`,
  // The report builder is large, so it is only evaluated when someone opens it.
  `<script type="text/plain" id="ack-lib-src">${safe(read('public/vendor/ack.js'))}</script>`,
  '<script>window.__LOCAL__ = JSON.parse(document.getElementById("local-json").textContent);</script>',
  `<script>${safe(read('public/app.js'))}</script>`
].join('\n'));
fs.mkdirSync(path.join(__dirname, 'dist'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'dist', 'archipel-demo.html'), html);
console.log(`Wrote dist/archipel-demo.html (${(html.length / 1e6).toFixed(1)} MB)`);

// Personal copy with the .env credentials filled in. Keep it to yourself; dist/ is not committed.
const env = {};
if (fs.existsSync(path.join(__dirname, '.env'))) {
  for (const line of read('.env').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2];
  }
}
if (env.LUZMO_API_KEY && env.LUZMO_API_TOKEN) {
  const creds = { key: env.LUZMO_API_KEY, token: env.LUZMO_API_TOKEN, apiHost: env.LUZMO_API_HOST || 'https://api.luzmo.com' };
  const personal = html.replace('window.__LOCAL__ = JSON.parse(document.getElementById("local-json").textContent);',
    () => `window.__LOCAL__ = JSON.parse(document.getElementById("local-json").textContent); window.__LOCAL__.creds = ${json(creds)};`);
  fs.writeFileSync(path.join(__dirname, 'dist', 'archipel-demo-with-key.html'), personal);
  console.log('Wrote dist/archipel-demo-with-key.html (credentials from .env)');
}
