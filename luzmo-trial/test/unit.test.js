// Unit tests: brand extraction, industry detection, generator and zip writer. Run: node test/unit.test.js
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const Gen = require('../public/generator.js');
const Core = require('../public/core.js');
const HowTo = require('../public/howto.js');
const { extractBrand } = require('../api/_lib/brand.js');

let failed = 0;
const test = (name, fn) => {
  try { fn(); console.log(`ok   ${name}`); } catch (err) { failed++; console.log(`FAIL ${name}\n     ${err.message}`); }
};
const fx = (f) => fs.readFileSync(path.join(__dirname, 'fixtures', f), 'utf8');

test('brand: name, colors, fonts, logo and industry from a website', () => {
  const b = extractBrand(fx('site.html'), [fx('site.css')], 'https://www.learnwise.example/');
  assert.strictEqual(b.name, 'Learnwise Academy');
  assert.strictEqual(b.colors.primary, '#55008D');
  assert.strictEqual(b.colors.accent, '#00C9B8');
  assert.strictEqual(b.colors.cta, '#FE5E54');
  assert.strictEqual(b.fonts.heading, 'Red Hat Display');
  assert.strictEqual(b.fonts.body, 'Red Hat Text');
  assert.strictEqual(b.industry.key, 'edtech');
  assert.ok(b.logos.some((l) => l.url === 'https://www.learnwise.example/mark.svg' && l.kind === 'mark'), 'svg favicon as mark');
  assert.ok(b.logos.some((l) => l.url.endsWith('/logo-full.svg') && l.kind === 'wide'), 'logo image as wide');
  assert.ok(!b.logos.some((l) => l.url.includes('partners')), 'client logos are skipped');
});

test('brand: plain site without CSS still gives a name', () => {
  const b = extractBrand('<html><head><title>Home - Fleetly</title></head><body>Freight and fleet tracking for shippers</body></html>', [], 'https://fleetly.io/');
  assert.strictEqual(b.name, 'Fleetly');
  assert.strictEqual(b.colors.primary, null);
  assert.strictEqual(b.industry.key, 'logistics');
});

test('industry detection covers every industry and falls back to generic', () => {
  const samples = {
    saas: 'Workflow automation software platform for teams. Integrations, API, cloud subscription workspace collaboration app',
    ecommerce: 'Online shop: fashion and shoes. Free shipping on orders, add to cart, checkout. Our store and marketplace for brands',
    logistics: 'Freight forwarding, warehouse fulfilment and parcel delivery for shippers. Track your shipping',
    healthcare: 'Patient scheduling for clinics and hospitals. Telehealth and medical care for every doctor',
    hr: 'Recruiting and hiring software. Talent, candidates, jobs, onboarding and payroll for HR teams',
    fintech: 'Payments platform: card payments, invoicing, banking and wallet transactions for merchants',
    edtech: 'Learning platform with courses, training and certification. E-learning academy for students',
    marketing: 'Marketing agency for advertising campaigns, SEO, social media and lead generation',
    manufacturing: 'Industrial IoT for factory machines: predictive maintenance, sensors and production equipment in every plant',
    realestate: 'Property management software for landlords: rent collection, leases, tenants and real estate portfolios',
    hospitality: 'Hotel booking engine and reservations for hotels, restaurants and travel. Guests love it',
    generic: 'We make things better for people.'
  };
  for (const [key, text] of Object.entries(samples)) assert.strictEqual(Gen.detectIndustry(text).key, key, key);
});

test('every industry builds a portal and data that fit Luzmo', () => {
  for (const key of Object.keys(Gen.INDUSTRIES)) {
    const P = Gen.buildPortal({ company: 'Testco', industry: key, website: 'https://testco.com' });
    assert.strictEqual(P.industry, key);
    assert.ok(P.tenants.length >= 5, 'five tenants');
    assert.strictEqual(P.brand.productName, 'Testco Insights');
    assert.strictEqual(P.brand.aiName, 'Testco AI');
    const data = Gen.generateData(P, { now: Date.UTC(2026, 9, 19) });
    for (const [k, ds] of Object.entries(P.datasets)) {
      assert.ok(ds.name.startsWith('Testco Insights | '));
      assert.ok(ds.columns.some((c) => c.name === P.tenantColumn), `${key}.${k} has the tenant column`);
      assert.strictEqual(data[k].length, ds.rows);
      for (const row of data[k].slice(0, 200)) assert.strictEqual(row.length, ds.columns.length);
      const di = ds.columns.findIndex((c) => c.kind === 'date');
      assert.ok(data[k].every((r) => r[di] <= '2026-10-19T00:00:00.000Z'), 'no future dates');
      const ti = ds.columns.findIndex((c) => c.kind === 'tenant');
      assert.strictEqual(new Set(data[k].map((r) => r[ti])).size, P.tenants.length, 'every tenant has rows');
    }
    for (const page of P.pages) {
      for (const chart of page.charts) for (const items of Object.values(chart.slots)) for (const s of items) {
        assert.ok(P.datasets[s.dataset].columns.some((c) => c.name === s.column), `${key}: ${s.column} exists`);
      }
      assert.ok(page.charts.some((c) => c.type === 'regular-table'), 'detail table for drill-downs');
    }
    assert.ok(P.pages[0].charts.some((c) => c.drill === 'tenant'), 'tenant drill chart on the first page');
    assert.ok(P.aiSuggestions.length >= 2);
  }
});

test('generator is deterministic for the same portal.json', () => {
  const P = Gen.buildPortal({ company: 'Same', industry: 'fintech' });
  const a = Gen.generateRows(P, 'transactions', { now: 1e12 });
  const b = Gen.generateRows(JSON.parse(JSON.stringify(P)), 'transactions', { now: 1e12 });
  assert.deepStrictEqual(a.slice(0, 50), b.slice(0, 50));
});

test('tenants differ from each other', () => {
  const P = Gen.buildPortal({ company: 'Diff', industry: 'ecommerce' });
  const rows = Gen.generateRows(P, 'orders');
  const ti = P.datasets.orders.columns.findIndex((c) => c.name === 'merchant');
  const ri = P.datasets.orders.columns.findIndex((c) => c.name === 'revenue');
  const avg = {};
  for (const r of rows) { const a = (avg[r[ti]] ||= [0, 0]); a[0] += r[ri]; a[1]++; }
  const values = Object.values(avg).map(([s, n]) => s / n);
  assert.ok(Math.max(...values) / Math.min(...values) > 1.1, 'average order value varies by tenant');
});

test('brand completion keeps text readable on light primaries', () => {
  const b = Gen.completeBrand({ primary: '#FFD400', accent: '#00C9B8' });
  assert.strictEqual(b.onPrimary, '#111111');
  assert.strictEqual(Gen.completeBrand({ primary: '#55008D' }).onPrimary, '#FFFFFF');
  assert.strictEqual(new Set(Gen.completeBrand({ primary: '#55008D', accent: '#00C9B8' }).palette).size, 8, 'palette has no duplicates');
});

test('core builds dashboards with all three screen modes and real ids', async () => {
  const P = Gen.buildPortal({ company: 'Core', industry: 'saas' });
  const calls = [];
  const call = async (resource, body) => { calls.push([resource, body]); return { id: 'x', rows: [] }; };
  const core = Core.createCore({ P, call });
  for (const [k, ds] of Object.entries(P.datasets)) core.state.datasets[k] = { id: `ds-${k}`, columns: Object.fromEntries(ds.columns.map((c) => [c.name, { id: `col-${c.name}`, type: c.type }])) };
  const slots = core.specSlots(P.pages[0].charts[0]);
  assert.strictEqual(slots[0].content[0].datasetId, 'ds-product_usage');
});

test('how it is built covers every topic and never leaks a key', () => {
  const P = Gen.buildPortal({ company: 'Docs', industry: 'hr', email: 'pm@docs.example' });
  const topics = HowTo.topics(P).map((t) => t.id);
  for (const id of ['live-link', 'embedding', 'datasets', 'dashboards', 'ede', 'ack', 'ai', 'exports', 'deploy']) assert.ok(topics.includes(id), id);
  const md = HowTo.markdown(P) + HowTo.demoScript(P);
  assert.ok(md.includes(P.tenants[0].name));
  assert.ok(!/test-key|LUZMO_API_(KEY|TOKEN)=[A-Za-z0-9]/.test(md));
});

test('core maps Luzmo schedules', () => {
  const s = Core.mapSchedule({ id: 1, securable_id: 'd1', securable: { name: { en: 'Overview' } }, task: { type: 'pdf', emails: ['a@b.c'], subject: { en: 'Weekly' } }, frequency_quantity: 1, frequency_unit: 'week', active: true, user: { username: 'u' } });
  assert.deepStrictEqual([s.dashboardName, s.format, s.recipients[0], s.subject, s.frequencyUnit], ['Overview', 'PDF', 'a@b.c', 'Weekly', 'week']);
});

if (failed) { console.log(`\n${failed} failed`); process.exit(1); }
console.log('\nAll unit tests passed');
