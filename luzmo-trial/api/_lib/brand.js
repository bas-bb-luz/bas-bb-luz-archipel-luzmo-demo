// Pulls a brand out of a website's HTML and CSS: name, logo candidates, colors, fonts and the text
// that tells us the industry. Pure functions, so tests can feed fixtures without the network.
const Gen = require('../../public/generator.js');

const GENERIC_FONTS = new Set(['inherit', 'initial', 'unset', 'sans-serif', 'serif', 'monospace', 'cursive', 'fantasy', 'system-ui', '-apple-system', 'blinkmacsystemfont', 'segoe ui', 'roboto', 'helvetica', 'helvetica neue', 'arial', 'ui-sans-serif', 'ui-serif', 'apple color emoji', 'segoe ui emoji', 'segoe ui symbol', 'noto color emoji', 'var', 'times new roman', 'georgia']);

const decode = (s) => String(s || '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n)).trim();
const attr = (tag, name) => {
  const m = tag.match(new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'));
  return m ? decode(m[1] ?? m[2] ?? m[3] ?? '') : '';
};
const tags = (html, name) => html.match(new RegExp(`<${name}\\b[^>]*>`, 'gi')) || [];
const abs = (url, base) => { try { return new URL(url, base).href; } catch { return null; } };

function meta(html, key) {
  for (const t of tags(html, 'meta')) {
    const k = (attr(t, 'property') || attr(t, 'name') || attr(t, 'itemprop')).toLowerCase();
    if (k === key) return attr(t, 'content');
  }
  return '';
}

function stylesheetUrls(html, base) {
  const out = [];
  for (const t of tags(html, 'link')) {
    const rel = attr(t, 'rel').toLowerCase();
    const href = attr(t, 'href');
    if (rel.includes('stylesheet') && href && !/fonts\.googleapis\.com/.test(href)) out.push(abs(href, base));
  }
  return out.filter(Boolean).slice(0, 5);
}

function textOf(html) {
  return decode(html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ');
}

function companyName(html, url) {
  const host = new URL(url).hostname.replace(/^www\./, '');
  const root = host.split('.').slice(-2, -1)[0] || host;
  const site = meta(html, 'og:site_name');
  if (site) return site;
  const title = decode((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '');
  const parts = title.split(/\s+[|·•–—:-]\s+/).map((s) => s.trim()).filter(Boolean);
  const byDomain = parts.find((p) => p.toLowerCase().replace(/[^a-z0-9]/g, '').includes(root.replace(/[^a-z0-9]/g, '')));
  if (byDomain && byDomain.length <= 40) return byDomain;
  if (parts.length > 1) return parts.reduce((a, b) => (b.length < a.length ? b : a));
  return root.charAt(0).toUpperCase() + root.slice(1);
}

// Logo candidates, best first. "mark" means square-ish (icons), "wide" means a word mark.
function logos(html, base) {
  const found = [];
  const add = (url, kind, score, source) => {
    const u = abs(url, base);
    if (u && !found.some((f) => f.url === u) && !/^data:image\/gif/.test(u)) found.push({ url: u, kind, score: score + (/\.svg(\?|$)/i.test(u) ? 3 : 0), source });
  };
  for (const t of tags(html, 'img')) {
    const src = attr(t, 'src') || attr(t, 'data-src');
    const hint = `${src} ${attr(t, 'class')} ${attr(t, 'alt')} ${attr(t, 'id')}`.toLowerCase();
    if (src && /logo/.test(hint) && !/partner|client|customer|award|badge/.test(hint)) add(src, 'wide', 10, 'logo image');
  }
  for (const t of tags(html, 'link')) {
    const rel = attr(t, 'rel').toLowerCase();
    const href = attr(t, 'href');
    if (!href) continue;
    if (rel.includes('apple-touch-icon')) add(href, 'mark', 8, 'app icon');
    else if (rel.includes('icon') || rel.includes('mask-icon')) add(href, 'mark', /\.svg/i.test(href) ? 7 : /\.png/i.test(href) ? 5 : 2, 'favicon');
  }
  const og = meta(html, 'og:image');
  if (og) add(og, 'wide', 1, 'social image');
  add('/favicon.ico', 'mark', 0, 'favicon');
  return found.sort((a, b) => b.score - a.score).slice(0, 6);
}

// ---------- colors ----------
function toHex(c) {
  c = c.trim().toLowerCase();
  let m = c.match(/^#([0-9a-f]{3}|[0-9a-f]{6})([0-9a-f]{2})?$/);
  if (m) {
    if (m[2] && parseInt(m[2], 16) < 200) return null;
    return Gen.toHex(Gen.parseHex(m[1]));
  }
  m = c.match(/^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)(?:[\s,/]+([\d.]+%?))?\s*\)$/);
  if (m) {
    if (m[4] && parseFloat(m[4]) < (m[4].endsWith('%') ? 80 : 0.8)) return null;
    return Gen.toHex([+m[1], +m[2], +m[3]]);
  }
  return null;
}

function hsl(hex) {
  const [r, g, b] = Gen.parseHex(hex).map((v) => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (d) h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: (h * 60 + 360) % 360, s, l };
}
const isNeutral = (hex) => { const { s, l } = hsl(hex); return s < 0.2 || l > 0.94 || l < 0.07; };
const hueGap = (a, b) => { const d = Math.abs(hsl(a).h - hsl(b).h); return Math.min(d, 360 - d); };
const distance = (a, b) => { const x = Gen.parseHex(a); const y = Gen.parseHex(b); return Math.sqrt(x.reduce((s, v, i) => s + (v - y[i]) ** 2, 0)); };

const COLOR_RE = /#[0-9a-f]{3,8}\b|rgba?\([^)]*\)/gi;

function colors(html, cssList) {
  const css = [...(html.match(/<style[^>]*>[\s\S]*?<\/style>/gi) || []).map((s) => s.replace(/<\/?style[^>]*>/gi, '')), ...cssList].join('\n');
  const inline = tags(html, '[a-z0-9-]+').map((t) => attr(t, 'style')).filter(Boolean).join(';');
  const score = new Map();
  const roles = { primary: new Map(), accent: new Map(), cta: new Map() };
  const bump = (map, hex, w) => map.set(hex, (map.get(hex) || 0) + w);
  const theme = toHex(meta(html, 'theme-color') || '');
  if (theme && !isNeutral(theme)) { bump(score, theme, 25); bump(roles.primary, theme, 25); }
  // Rules: selector { declarations }. Inner rules of @media blocks match too.
  for (const m of `${css}\n x{${inline}}`.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = m[1].trim().toLowerCase();
    for (const decl of m[2].split(';')) {
      const i = decl.indexOf(':');
      if (i < 0) continue;
      const prop = decl.slice(0, i).trim().toLowerCase();
      const value = decl.slice(i + 1);
      for (const raw of value.match(COLOR_RE) || []) {
        const hex = toHex(raw);
        if (!hex || isNeutral(hex)) continue;
        bump(score, hex, 1);
        if (prop.startsWith('--')) {
          if (/primary|brand|main|theme/.test(prop)) bump(roles.primary, hex, 12);
          else if (/accent|secondary|highlight/.test(prop)) bump(roles.accent, hex, 10);
          else if (/cta|button|action|btn/.test(prop)) bump(roles.cta, hex, 10);
          else bump(score, hex, 1);
        }
        if (/(^|[\s.#_-])(btn|button|cta)/.test(selector) && /background/.test(prop)) bump(roles.cta, hex, 4);
        if (/(^|[\s,])(a|h1|h2|header|nav)([\s:.,#[]|$)/.test(selector) && /^color$|background/.test(prop)) bump(roles.primary, hex, 1.5);
      }
    }
  }
  // Merge near-identical shades, keeping the most used one.
  const merged = [];
  for (const [hex, n] of [...score.entries()].sort((a, b) => b[1] - a[1])) {
    const near = merged.find((m) => distance(m.hex, hex) < 34);
    if (near) near.n += n; else merged.push({ hex, n });
  }
  const top = (map) => [...map.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  const primary = top(roles.primary) || merged[0]?.hex || null;
  const distinct = (c, from) => c && from.every((f) => !f || (distance(c, f) > 60 && (hueGap(c, f) > 20 || Math.abs(hsl(c).l - hsl(f).l) > 0.25)));
  let accent = top(roles.accent);
  if (!distinct(accent, [primary])) accent = merged.map((m) => m.hex).find((h) => distinct(h, [primary])) || null;
  let cta = top(roles.cta);
  if (!distinct(cta, [primary]) && cta !== accent) cta = merged.map((m) => m.hex).find((h) => distinct(h, [primary, accent])) || accent;
  return { primary, accent, cta, found: merged.slice(0, 10).map((m) => m.hex) };
}

// ---------- fonts ----------
function firstFamily(value) {
  for (const part of value.split(',')) {
    const f = part.replace(/!important/, '').trim().replace(/^["']|["']$/g, '').trim();
    if (f && !GENERIC_FONTS.has(f.toLowerCase()) && !/^var\(/.test(f) && !/icon|awesome|emoji/i.test(f)) return f;
  }
  return null;
}

function fonts(html, cssList) {
  const google = [];
  for (const m of html.matchAll(/fonts\.googleapis\.com\/css2?\?[^"'\s>)]+/gi)) {
    for (const fam of decode(m[0]).matchAll(/family=([^&:]+)/g)) google.push(decodeURIComponent(fam[1].replace(/\+/g, ' ')).split('|')[0]);
  }
  const css = [...(html.match(/<style[^>]*>[\s\S]*?<\/style>/gi) || []), ...cssList].join('\n');
  for (const m of css.matchAll(/@import\s+url\(["']?([^"')]*fonts\.googleapis[^"')]*)/gi)) for (const fam of m[1].matchAll(/family=([^&:]+)/g)) google.push(decodeURIComponent(fam[1].replace(/\+/g, ' ')));
  const body = new Map();
  const heading = new Map();
  const any = new Map();
  const bump = (map, f, w = 1) => f && map.set(f, (map.get(f) || 0) + w);
  for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = m[1].trim().toLowerCase();
    if (selector.startsWith('@font-face')) continue;
    for (const fm of m[2].matchAll(/(--[\w-]*font[\w-]*|font-family)\s*:\s*([^;]+)/gi)) {
      const f = firstFamily(fm[2]);
      if (!f) continue;
      bump(any, f);
      const prop = fm[1].toLowerCase();
      if (prop.startsWith('--')) {
        // Custom properties say what they are in their name, whatever selector they sit on.
        if (/head|display|title/.test(prop)) bump(heading, f, 3);
        else if (/body|base|text|sans|main|primary/.test(prop)) bump(body, f, 3);
        continue;
      }
      if (/(^|,|\s)(body|html|:root)(\s|,|$)/.test(selector)) bump(body, f, 3);
      if (/(^|,|\s)h[1-3]\b/.test(selector)) bump(heading, f, 3);
    }
  }
  const top = (map) => [...map.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  const bodyFont = top(body) || google[google.length - 1] || top(any);
  const headingFont = top(heading) || google[0] || bodyFont;
  return { body: bodyFont, heading: headingFont, google: [...new Set(google)] };
}

function industryText(html) {
  const heads = (html.match(/<h[1-3][^>]*>[\s\S]*?<\/h[1-3]>/gi) || []).map(textOf).join('. ');
  const nav = (html.match(/<nav[\s\S]*?<\/nav>/gi) || []).map(textOf).join(' ');
  return [decode((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || ''), meta(html, 'description'), meta(html, 'og:description'), meta(html, 'keywords'), heads, nav, textOf(html).slice(0, 4000)].join(' \n ');
}

function extractBrand(html, cssList, url) {
  const name = companyName(html, url);
  const text = industryText(html);
  const industry = Gen.detectIndustry(text);
  const c = colors(html, cssList);
  const f = fonts(html, cssList);
  const logoList = logos(html, url);
  return {
    url,
    name,
    description: meta(html, 'description') || meta(html, 'og:description') || '',
    logos: logoList,
    logoUrl: logoList.find((l) => l.kind === 'wide')?.url || null,
    logoMarkUrl: logoList.find((l) => l.kind === 'mark')?.url || null,
    colors: c,
    fonts: f,
    industry,
    currency: Gen.currencyFor(url)
  };
}

module.exports = { extractBrand, stylesheetUrls, colors, fonts, logos, companyName, isNeutral };
