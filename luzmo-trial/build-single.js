// Builds dist/<slug>-demo.html from portal.json: the whole portal in one file that asks for the
// Luzmo key when opened. The file never contains a key. Usage: npm run build:single
const fs = require('fs');
const path = require('path');
const read = (f) => fs.readFileSync(path.join(__dirname, f), 'utf8');
const P = JSON.parse(read('portal.json'));
const safe = (s) => s.replace(/<\/script/gi, '<\\/script').replace(/<!--/g, '<\\!--');
const json = (v) => JSON.stringify(v).replace(/</g, '\\u003c');

let html = read('public/index.html');
const swap = (from, to) => {
  if (!html.includes(from)) throw new Error(`Missing in index.html: ${from}`);
  html = html.replace(from, () => to);
};
swap('<link rel="stylesheet" href="styles.css" />', `<style>${read('public/styles.css')}</style>`);
for (const src of ['vendor/luzmo-embed.js', 'generator.js', 'core.js', 'howto.js', 'track.js', 'kit.js', 'wizard.js']) swap(`<script src="${src}"></script>`, `<script>${safe(read(`public/${src}`))}</script>`);
swap('<script src="trial-settings.js"></script>', '<script>window.LUZMO_TRIAL_TRACK_URL = ""; window.LUZMO_TRIAL_DEBUG = false;</script>');
swap('<script src="app.js"></script>', [
  `<script type="application/json" id="local-json">${json({ portal: P })}</script>`,
  `<script type="text/plain" id="ack-lib-src">${safe(read('public/vendor/ack.js'))}</script>`,
  '<script>window.__LOCAL__ = JSON.parse(document.getElementById("local-json").textContent);</script>',
  `<script>${safe(read('public/app.js'))}</script>`
].join('\n'));
fs.mkdirSync(path.join(__dirname, 'dist'), { recursive: true });
const out = path.join(__dirname, 'dist', `${P.slug}-demo.html`);
fs.writeFileSync(out, html);
console.log(`Wrote ${path.relative(__dirname, out)} (${(html.length / 1e6).toFixed(1)} MB)`);
