// Fetches a website and its stylesheets server-side (browsers block this with CORS) and returns
// the brand: name, logo candidates, colors, fonts and the detected industry. Holds no state.
const dns = require('dns').promises;
const net = require('net');
const { extractBrand, stylesheetUrls } = require('./_lib/brand');
const { handler } = require('./_lib/luzmo');

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36 LuzmoTrialBrandFetch/1.0';

function privateIp(ip) {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split('.').map(Number);
    return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || a >= 224;
  }
  const v = ip.toLowerCase();
  return v === '::1' || v === '::' || v.startsWith('fc') || v.startsWith('fd') || v.startsWith('fe80') || v.startsWith('::ffff:127.') || v.startsWith('::ffff:10.') || v.startsWith('::ffff:192.168.');
}

// Only public http(s) hosts, so the function cannot be used to reach internal networks.
async function assertPublic(url) {
  if (!/^https?:$/.test(url.protocol)) throw Object.assign(new Error('Only http and https websites'), { status: 400 });
  if (process.env.BRAND_ALLOW_PRIVATE === '1') return;
  const addrs = await dns.lookup(url.hostname, { all: true }).catch(() => []);
  if (!addrs.length) throw Object.assign(new Error(`Could not find ${url.hostname}`), { status: 400 });
  if (addrs.some((a) => privateIp(a.address))) throw Object.assign(new Error('That address is not public'), { status: 400 });
}

async function get(href, { limit, accept }) {
  let url = new URL(href);
  for (let hop = 0; hop < 5; hop++) {
    await assertPublic(url);
    const res = await fetch(url, { redirect: 'manual', headers: { 'User-Agent': UA, Accept: accept, 'Accept-Language': 'en,nl;q=0.8' }, signal: AbortSignal.timeout(7000) });
    if (res.status >= 300 && res.status < 400 && res.headers.get('location')) {
      url = new URL(res.headers.get('location'), url);
      continue;
    }
    if (!res.ok) throw Object.assign(new Error(`${url.hostname} answered ${res.status}`), { status: 502 });
    const reader = res.body.getReader();
    const chunks = [];
    let size = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      chunks.push(value);
      if (size > limit) { reader.cancel().catch(() => {}); break; }
    }
    return { url: url.href, text: Buffer.concat(chunks).toString('utf8') };
  }
  throw Object.assign(new Error('Too many redirects'), { status: 502 });
}

module.exports = handler(async (body) => {
  let raw = String(body.url || '').trim();
  if (!raw) throw Object.assign(new Error('Enter a website'), { status: 400 });
  if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`;
  const page = await get(raw, { limit: 2_000_000, accept: 'text/html,application/xhtml+xml' }).catch((err) => {
    throw Object.assign(new Error(`Could not load ${raw}: ${err.message}`), { status: err.status || 502 });
  });
  const css = await Promise.all(stylesheetUrls(page.text, page.url).map((u) => get(u, { limit: 900_000, accept: 'text/css' }).then((r) => r.text).catch(() => '')));
  return extractBrand(page.text, css, page.url);
});
