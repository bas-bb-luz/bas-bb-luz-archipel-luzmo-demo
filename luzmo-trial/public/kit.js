// Downloads the trial user takes home: starter kit (zip), one-file demo (HTML), how it's built (MD)
// and the demo script (MD). Everything is built in the browser from the files of this site.
// None of them ever contain an API key or token.
(function () {
  // ---------- minimal zip writer (stored, no compression) ----------
  const CRC = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
    return t;
  })();
  const crc32 = (bytes) => { let c = 0xffffffff; for (let i = 0; i < bytes.length; i++) c = CRC[(c ^ bytes[i]) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };

  function zip(files) {
    const enc = new TextEncoder();
    const parts = [];
    const central = [];
    let offset = 0;
    const d = new Date();
    const time = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
    const date = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
    for (const f of files) {
      const name = enc.encode(f.name);
      const data = typeof f.data === 'string' ? enc.encode(f.data) : new Uint8Array(f.data);
      const crc = crc32(data);
      const local = new DataView(new ArrayBuffer(30));
      local.setUint32(0, 0x04034b50, true); local.setUint16(4, 20, true); local.setUint16(6, 0x0800, true); local.setUint16(8, 0, true);
      local.setUint16(10, time, true); local.setUint16(12, date, true); local.setUint32(14, crc, true);
      local.setUint32(18, data.length, true); local.setUint32(22, data.length, true); local.setUint16(26, name.length, true); local.setUint16(28, 0, true);
      parts.push(new Uint8Array(local.buffer), name, data);
      const c = new DataView(new ArrayBuffer(46));
      c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true); c.setUint16(10, 0, true);
      c.setUint16(12, time, true); c.setUint16(14, date, true); c.setUint32(16, crc, true); c.setUint32(20, data.length, true); c.setUint32(24, data.length, true);
      c.setUint16(28, name.length, true); c.setUint32(42, offset, true);
      central.push(new Uint8Array(c.buffer), name);
      offset += 30 + name.length + data.length;
    }
    const size = central.reduce((s, p) => s + p.length, 0);
    const end = new DataView(new ArrayBuffer(22));
    end.setUint32(0, 0x06054b50, true); end.setUint16(8, files.length, true); end.setUint16(10, files.length, true);
    end.setUint32(12, size, true); end.setUint32(16, offset, true);
    return new Blob([...parts, ...central, new Uint8Array(end.buffer)], { type: 'application/zip' });
  }

  function save(blob, filename) {
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: filename });
    document.body.append(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
  }

  // Strips anything that is not part of the portal spec, so a key can never ride along.
  const cleanPortal = (P) => {
    const copy = JSON.parse(JSON.stringify(P));
    delete copy.runtime;
    return copy;
  };

  async function text(path) {
    const res = await fetch(path, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`Could not read ${path} (${res.status})`);
    return res.text();
  }

  // kit/sources.json is written at build time (scripts/build-kit.js) with the server files and
  // the list of public files, since Vercel does not serve api/ as static files.
  async function starterKit(P) {
    const manifest = JSON.parse(await text('kit/sources.json'));
    const folder = `${P.slug}-portal`;
    const files = [];
    for (const [name, data] of Object.entries(manifest.sources)) files.push({ name: `${folder}/${name}`, data });
    for (const name of manifest.public) {
      const res = await fetch(name, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`Could not read ${name}`);
      files.push({ name: `${folder}/public/${name}`, data: await res.arrayBuffer() });
    }
    files.push({ name: `${folder}/portal.json`, data: `${JSON.stringify(cleanPortal(P), null, 2)}\n` });
    files.push({ name: `${folder}/HOW-IT-IS-BUILT.md`, data: window.LuzmoHowTo.markdown(P) });
    files.push({ name: `${folder}/DEMO-SCRIPT.md`, data: window.LuzmoHowTo.demoScript(P) });
    save(zip(files), `${folder}.zip`);
  }

  // The whole portal in one HTML file. It asks for the key when opened and never contains it.
  async function singleFile(P) {
    let html = await text('index.html');
    const safe = (s) => s.replace(/<\/script/gi, '<\\/script').replace(/<!--/g, '<\\!--');
    const json = (v) => JSON.stringify(v).replace(/</g, '\\u003c');
    const inline = async (src) => `<script>${safe(await text(src))}</script>`;
    const swap = (from, to) => { if (!html.includes(from)) throw new Error(`Missing in index.html: ${from}`); html = html.replace(from, () => to); };
    swap('<link rel="stylesheet" href="styles.css" />', `<style>${await text('styles.css')}</style>`);
    for (const src of ['vendor/luzmo-embed.js', 'generator.js', 'core.js', 'howto.js', 'track.js', 'kit.js', 'wizard.js']) swap(`<script src="${src}"></script>`, await inline(src));
    swap('<script src="trial-settings.js"></script>', '<script>window.LUZMO_TRIAL_TRACK_URL = ""; window.LUZMO_TRIAL_DEBUG = false;</script>');
    swap('<script src="app.js"></script>', [
      `<script type="application/json" id="local-json">${json({ portal: cleanPortal(P) })}</script>`,
      `<script type="text/plain" id="ack-lib-src">${safe(await text('vendor/ack.js'))}</script>`,
      '<script>window.__LOCAL__ = JSON.parse(document.getElementById("local-json").textContent);</script>',
      await inline('app.js')
    ].join('\n'));
    save(new Blob([html], { type: 'text/html' }), `${P.slug}-demo.html`);
  }

  const howItsBuilt = (P) => save(new Blob([window.LuzmoHowTo.markdown(P)], { type: 'text/markdown' }), `${P.slug}-how-its-built.md`);
  const demoScript = (P) => save(new Blob([window.LuzmoHowTo.demoScript(P)], { type: 'text/markdown' }), `${P.slug}-demo-script.md`);
  const portalJson = (P) => save(new Blob([`${JSON.stringify(cleanPortal(P), null, 2)}\n`], { type: 'application/json' }), 'portal.json');

  async function download(type, P) {
    window.LuzmoTrack?.('download', { type });
    if (type === 'starter-kit') return starterKit(P);
    if (type === 'single-file') return singleFile(P);
    if (type === 'how-its-built') return howItsBuilt(P);
    if (type === 'demo-script') return demoScript(P);
    if (type === 'portal-json') return portalJson(P);
    throw new Error(`Unknown download ${type}`);
  }

  window.LuzmoKit = { download, zip, crc32 };
})();
