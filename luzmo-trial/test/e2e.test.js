// End-to-end run of the trial in Chromium against a mock Luzmo API and a fake company website.
// Covers: wizard (connect, brand fetch, build), portal (tenants, edit menu, exports, drill hint,
// How it's built, assistant with and without IQ), downloads without keys, the single file and a
// deployed portal (server mode). Screenshots land in test/output/. Run: node test/e2e.test.js
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');
const { createMock } = require('./mock-luzmo');

const { chromium } = require(require.resolve('playwright', { paths: [process.cwd(), '/opt/node-tools/node_modules', '/opt/node22/lib/node_modules'] }));

const ROOT = path.join(__dirname, '..');
const OUT = path.join(__dirname, 'output');
const KEY = 'test-key';
const TOKEN = 'test-token-SECRET-123';
fs.mkdirSync(OUT, { recursive: true });

function serveFixtures(port) {
  const types = { '.html': 'text/html', '.css': 'text/css', '.svg': 'image/svg+xml' };
  const server = http.createServer((req, res) => {
    const name = req.url === '/' ? 'site.html' : req.url.slice(1);
    const file = path.join(__dirname, 'fixtures', name);
    if (!fs.existsSync(file)) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'text/plain' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((r) => server.listen(port, () => r(server)));
}

function startPortal(port, env = {}) {
  const child = spawn(process.execPath, ['dev-server.js'], { cwd: ROOT, env: { ...process.env, PORT: String(port), LUZMO_API_KEY: '', LUZMO_API_TOKEN: '', ...env }, stdio: ['ignore', 'pipe', 'pipe'] });
  return new Promise((resolve, reject) => {
    child.stdout.on('data', (d) => { if (String(d).includes('http://localhost')) resolve(child); });
    child.stderr.on('data', (d) => process.stderr.write(d));
    child.on('exit', (code) => reject(new Error(`dev-server exited ${code}`)));
  });
}

const steps = [];
async function step(name, fn) {
  const t = Date.now();
  try {
    await fn();
    steps.push(`ok   ${name} (${Date.now() - t} ms)`);
    console.log(steps.at(-1));
  } catch (err) {
    console.log(`FAIL ${name}\n     ${err.message.split('\n').slice(0, 6).join('\n     ')}`);
    throw err;
  }
}

async function download(page, trigger) {
  const [dl] = await Promise.all([page.waitForEvent('download'), trigger()]);
  const file = path.join(OUT, dl.suggestedFilename());
  await dl.saveAs(file);
  return { name: dl.suggestedFilename(), file, buf: fs.readFileSync(file) };
}

(async () => {
  require('child_process').execSync('node scripts/build-kit.js', { cwd: ROOT, stdio: 'ignore' });
  const mock = await createMock({ port: 4010 });
  const site = await serveFixtures(4020);
  const portal = await startPortal(3100, { BRAND_ALLOW_PRIVATE: '1' });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const events = [];
  await page.exposeFunction('__trialEvent', (e) => events.push(e.name));
  await page.addInitScript(() => window.addEventListener('luzmo-trial-event', (e) => window.__trialEvent(e.detail)));
  let spec;
  let exitCode = 0;

  try {
    await step('wizard opens when the server has no key', async () => {
      await page.goto('http://localhost:3100/');
      await page.waitForSelector('#wizard:not([hidden]) .w-step');
      assert.strictEqual(await page.locator('.w-step').count(), 5);
      await page.screenshot({ path: path.join(OUT, '01-wizard.png'), fullPage: true });
    });

    await step('step 1: connect Luzmo with key and token', async () => {
      await page.getByLabel('Region').selectOption('custom');
      await page.getByPlaceholder('https://api.yourvpc.luzmo.com').fill(mock.url);
      await page.getByLabel('Your work email').fill('pm@learnwise.example');
      await page.getByLabel('API key').fill(KEY);
      await page.getByLabel('API token').fill(TOKEN);
      await page.getByRole('button', { name: 'Test connection' }).click();
      await page.getByText('Connected. This account has').waitFor();
      const creds = await page.evaluate(() => ({ local: localStorage.getItem('luzmo-trial-wizard'), session: sessionStorage.getItem('luzmo-trial-creds') }));
      assert.ok(!creds.local.includes(TOKEN), 'token never in localStorage');
      assert.ok(creds.session.includes(TOKEN), 'token kept in the session only');
    });

    await step('step 2: fetch brand from the website', async () => {
      await page.getByLabel('Website').fill('http://localhost:4020/');
      await page.getByRole('button', { name: 'Fetch brand' }).click();
      await page.getByText('Found Learnwise Academy').waitFor({ timeout: 15000 });
      assert.strictEqual(await page.getByLabel('Company name').inputValue(), 'Learnwise Academy');
      assert.strictEqual(await page.getByLabel('Insights module name').inputValue(), 'Learnwise Academy Insights');
      assert.strictEqual(await page.getByLabel('AI assistant name').inputValue(), 'Learnwise Academy AI');
      assert.strictEqual(await page.locator('.w-field.color .hex').first().inputValue(), '#55008D');
      assert.strictEqual(await page.getByLabel('Heading font').inputValue(), 'Red Hat Display');
      assert.ok(await page.locator('.w-logo img').count() >= 1, 'logo options');
      await page.getByLabel('Insights module name').fill('Learnwise Insights');
      await page.getByLabel('AI assistant name').fill('Wise AI');
      assert.ok((await page.locator('#wPreview').innerText()).includes('Learnwise Insights'), 'live preview follows');
    });

    await step('step 3: industry detected, features all on', async () => {
      assert.strictEqual(await page.getByLabel('Industry').inputValue(), 'edtech');
      assert.strictEqual(await page.locator('.w-toggle.on').count(), 8);
      await page.screenshot({ path: path.join(OUT, '02-wizard-filled.png'), fullPage: true });
    });

    await step('step 4: build in Luzmo and open the portal', async () => {
      await page.getByRole('button', { name: 'Build in my Luzmo account' }).click();
      await page.waitForSelector('#portal', { timeout: 60000 });
      spec = await page.evaluate(() => {
        const W = JSON.parse(localStorage.getItem('luzmo-trial-wizard'));
        return { built: W.built, module: W.moduleName };
      });
      const datasets = mock.db.securables.filter((s) => s.type === 'dataset');
      const dashboards = mock.db.securables.filter((s) => s.type === 'dashboard');
      assert.strictEqual(datasets.length, 2);
      assert.ok(datasets.every((d) => d.rows > 1000 && d.name.en.startsWith('Learnwise Insights | ')));
      assert.strictEqual(dashboards.length, 3, 'self-service + one per page');
      assert.ok(dashboards.every((d) => d.contents.views.length === 3), 'three screen modes');
      assert.strictEqual(mock.db.themes.length, 1);
      assert.ok(mock.db.calls.filter((c) => c.resource === 'column' && c.action === 'update').length > 15, 'columns described');
      const table = dashboards.flatMap((d) => d.contents.views[0].items).find((i) => i.type === 'regular-table');
      assert.ok(table?.slots[0].name === 'columns' && table.slots[0].content.length > 4, 'detail table for drill-downs');
      assert.ok(dashboards.flatMap((d) => d.contents.views[0].items).some((i) => i.options?.interactivity?.select), 'charts filter the dashboard on click');
      assert.ok(spec.built.seconds < 600);
    });

    await step('portal: brand, nav and tenant tokens', async () => {
      await page.waitForSelector('#nav button.active');
      assert.strictEqual(await page.locator('.brand-name').innerText(), 'Learnwise Insights');
      const nav = await page.locator('#nav').evaluate((n) => n.textContent);
      for (const label of ['Learning activity', 'Support tickets', 'My dashboards', 'Scheduled exports', 'Deploy and download']) assert.ok(nav.includes(label), label);
      const auths = mock.db.calls.filter((c) => c.resource === 'authorization');
      const last = auths.at(-1).body.properties;
      assert.strictEqual(last.filters.length, 2, 'row filter on both datasets');
      assert.strictEqual(last.email, 'pm@learnwise.example', 'exports go to the trial user');
      assert.ok(last.feature_overrides.includes('flag_embedded_studio_update'));
      assert.ok(last.iq.context.includes('Wise AI'));
      const options = await page.locator('#tenant option').allInnerTexts();
      assert.strictEqual(options.length, 6);
      await page.locator('#tenant').selectOption(options[2]);
      await page.waitForFunction((t) => document.querySelector('#tenant').value === t, options[2]);
      await page.waitForTimeout(300);
      assert.strictEqual(mock.db.calls.filter((c) => c.resource === 'authorization').at(-1).body.properties.filters[0].value, options[2]);
      await page.screenshot({ path: path.join(OUT, '03-portal.png') });
    });

    await step('portal: Edit dashboard offers full editor and report builder', async () => {
      if (await page.locator('#aiPop.open').count()) await page.locator('#aiPop .icon-btn').click();
      await page.locator('.toolbar').getByRole('button', { name: 'Edit dashboard ▾' }).click();
      await page.getByRole('button', { name: /Full editor/ }).waitFor();
      await page.getByRole('button', { name: /Report builder/ }).waitFor();
      await page.screenshot({ path: path.join(OUT, '04-edit-menu.png') });
      await page.getByRole('button', { name: /Full editor/ }).click();
      await page.getByText(/^Editing /).waitFor();
      const copy = mock.db.securables.find((s) => s.type === 'dashboard' && /\(my version\)/.test(s.name.en));
      assert.ok(copy && copy.custom_metadata.tenant, 'template copied for the tenant before editing');
      assert.strictEqual(await page.locator('luzmo-embed-dashboard').evaluate((e) => e.editMode), 'editFull');
      await page.getByRole('button', { name: 'Done editing' }).click();
      assert.ok((await page.locator('#nav').innerText()).includes('(my version)'), 'copy listed under My dashboards');
    });

    await step('portal: export menu and drill hint', async () => {
      await page.locator('#nav').getByRole('button', { name: 'Learning activity', exact: true }).click();
      await page.locator('.toolbar').getByRole('button', { name: 'Export ▾' }).click();
      for (const item of ['Download PDF', 'Download PNG', 'Email now', 'Schedule email']) await page.getByRole('button', { name: new RegExp(item) }).waitFor();
      await page.keyboard.press('Escape');
      await page.mouse.click(5, 990);
      assert.ok((await page.locator('.drill-tip').innerText()).includes('click a bar'));
    });

    await step('portal: drill into an organisation from the all view', async () => {
      await page.locator('#tenant').selectOption('All organisations');
      await page.waitForFunction(() => document.querySelector('.drill-tip')?.innerText.includes('drill into'));
      const tenant = (await page.locator('#tenant option').allInnerTexts())[1];
      await page.locator('luzmo-embed-dashboard').evaluate((e, t) => e.dispatchEvent(new CustomEvent('changedFilters', { detail: { changed: [{ expression: '? in ?', parameters: [{ columnId: 'x' }, [t]] }] } })), tenant);
      await page.getByRole('button', { name: `Drill into ${tenant} →` }).click();
      await page.waitForFunction((t) => document.querySelector('#tenant').value === t, tenant);
    });

    await step('portal: Scheduled exports lists schedules for this organisation', async () => {
      const tenant = await page.locator('#tenant').inputValue();
      const slug = 'learnwise-insights';
      const dash = mock.db.securables.find((s) => s.type === 'dashboard' && s.name.en.endsWith('Learning activity'));
      const username = `${slug}-${tenant.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
      mock.db.schedules.push(
        { id: 's1', securable_id: dash.id, securable: { id: dash.id, name: dash.name }, task: { type: 'pdf', emails: ['pm@learnwise.example'], subject: { en: 'Weekly learning report' } }, frequency_quantity: 1, frequency_unit: 'week', scheduled_at: '2026-10-26T08:00:00Z', active: true, user: { username } },
        { id: 's2', securable_id: dash.id, securable: { id: dash.id, name: dash.name }, task: { type: 'png', emails: ['other@x.example'], subject: { en: 'Other tenant' } }, frequency_quantity: 1, frequency_unit: 'day', active: true, user: { username: `${slug}-someone-else` } }
      );
      await page.locator('#nav button', { hasText: 'Scheduled exports' }).click();
      await page.getByText('Weekly learning report').waitFor();
      assert.strictEqual(await page.getByText('Other tenant').count(), 0, 'other organisations\' schedules are hidden');
      assert.ok((await page.locator('.table').innerText()).includes('Every week'));
      await page.screenshot({ path: path.join(OUT, '05-exports.png') });
    });

    await step('portal: How it\'s built drawer', async () => {
      await page.locator('#howBtn').click();
      await page.locator('#how h2', { hasText: 'Exports and scheduled emails' }).waitFor();
      await page.locator('#how .how-tabs button', { hasText: 'Live link with Luzmo' }).click();
      assert.ok((await page.locator('#how').innerText()).includes('no deploy'));
      assert.strictEqual(await page.locator('#how .how-tabs button').count(), 9);
      await page.waitForTimeout(300);
      await page.screenshot({ path: path.join(OUT, '06-how-its-built.png') });
      await page.locator('#how .icon-btn').click();
    });

    await step('assistant: one panel, answers with text and a chart', async () => {
      assert.strictEqual(await page.locator('luzmo-iq-embed-chat, luzmo-ai-chat').count(), 0, 'no extra AI panels');
      await page.locator('#nav').getByRole('button', { name: 'Learning activity', exact: true }).click();
      if (!(await page.locator('#aiPop.open').count())) await page.locator('#aiFab').click();
      await page.locator('#aiPop textarea').fill('Which department has the highest learning hours?');
      await page.locator('#aiPop textarea').press('Enter');
      await page.locator('#aiPop').getByText('first group').waitFor();
      await page.locator('#aiPop .ai-add').waitFor();
      const call = mock.db.calls.filter((c) => c.resource === 'aiprompt').at(-1).body;
      assert.ok(call.key.startsWith('embed-'), 'AI uses the embed token, not the API key');
      assert.strictEqual(call.properties.agent, 'analyst');
      await page.locator('#aiPop .link', { hasText: 'Expand' }).click();
      await page.waitForSelector('#aiPop.wide');
      await page.screenshot({ path: path.join(OUT, '07-assistant.png') });
    });

    await step('assistant: clear note and Request IQ when IQ is missing', async () => {
      mock.opts.iq = false;
      await page.locator('#aiPop textarea').fill('How did the completion rate change?');
      await page.locator('#aiPop textarea').press('Enter');
      await page.locator('#aiPop').getByText('Luzmo IQ is not enabled').waitFor();
      await page.locator('#aiPop').getByRole('link', { name: 'Request Luzmo IQ' }).first().waitFor();
      mock.opts.iq = true;
      await page.locator('#aiPop .icon-btn').click();
    });

    await step('downloads: starter kit, one file and documents, without keys', async () => {
      const take = async (label) => {
        await page.getByRole('button', { name: 'Take this with you ▾' }).click();
        return download(page, () => page.locator('.menu-list:not([hidden])').getByRole('button', { name: new RegExp(label) }).click());
      };
      const kit = await take('Starter kit');
      const text = kit.buf.toString('latin1');
      for (const f of ['portal.json', 'api/token.js', 'api/brand.js', 'public/app.js', 'public/vendor/ack.js', 'README.md', '.env.example', 'HOW-IT-IS-BUILT.md']) assert.ok(text.includes(f), `zip has ${f}`);
      const single = await take('One-file demo');
      const how = await take('How it\'s built');
      const script = await take('Demo script');
      for (const d of [kit, single, how, script]) {
        const s = d.buf.toString('latin1');
        assert.ok(!s.includes(TOKEN) && !s.includes(`"${KEY}"`), `${d.name} contains no key or token`);
      }
      assert.ok(single.buf.toString().includes('window.__LOCAL__'));
      assert.ok(how.buf.toString().includes('row-level') || how.buf.toString().includes('Embedding and row-level security'));
      assert.ok(script.buf.toString().includes('5-minute demo script'));
      const pj = JSON.parse(execUnzip(kit.file, 'portal.json'));
      assert.strictEqual(pj.brand.productName, 'Learnwise Insights');
      assert.strictEqual(pj.brand.aiName, 'Wise AI');
      fs.writeFileSync(path.join(OUT, 'portal.json'), JSON.stringify(pj, null, 2));
      fs.copyFileSync(single.file, path.join(OUT, 'single.html'));
    });

    await step('Back to setup shows the wizard with a resume bar', async () => {
      await page.getByRole('button', { name: 'Back to setup' }).click();
      await page.getByText('is in your Luzmo account').waitFor();
      await page.getByRole('button', { name: 'Open my portal' }).first().click();
      await page.waitForSelector('#portal');
    });

    await step('single file: asks for the key, then opens the portal', async () => {
      const p2 = await ctx.newPage();
      p2.on('pageerror', (e) => errors.push(`single: ${e.message}`));
      await p2.goto(`file://${path.join(OUT, 'single.html')}`);
      await p2.getByLabel('Region').selectOption('custom');
      await p2.getByPlaceholder('https://api.yourvpc.luzmo.com').fill(mock.url);
      await p2.getByLabel('API key').fill(KEY);
      await p2.getByLabel('API token').fill(TOKEN);
      await p2.getByRole('button', { name: 'Open portal' }).click();
      await p2.waitForSelector('#portal', { timeout: 20000 });
      assert.strictEqual(await p2.locator('.brand-name').innerText(), 'Learnwise Insights');
      await p2.close();
    });

    await step('deployed portal: server mode with portal.json opens straight away', async () => {
      const server = await startPortal(3101, { LUZMO_API_KEY: KEY, LUZMO_API_TOKEN: TOKEN, LUZMO_API_HOST: mock.url, PORTAL_JSON: fs.readFileSync(path.join(OUT, 'portal.json'), 'utf8') });
      try {
        const p3 = await ctx.newPage();
        p3.on('pageerror', (e) => errors.push(`server: ${e.message}`));
        const config = await (await fetch('http://localhost:3101/api/config')).json();
        assert.strictEqual(config.mode, 'server');
        assert.ok(config.ready, 'finds the datasets the wizard built');
        assert.ok(!JSON.stringify(config).includes(TOKEN), 'config never returns the token');
        await p3.goto('http://localhost:3101/');
        await p3.waitForSelector('#nav button.active');
        assert.ok((await p3.locator('.cta-bar').innerText()).includes('Live on your Luzmo account'));
        await p3.getByRole('button', { name: 'Take this with you ▾' }).click();
        await p3.getByRole('button', { name: /Copy share link/ }).waitFor();
        await p3.keyboard.press('Escape');
        await p3.mouse.click(5, 990);
        await p3.locator('#nav button', { hasText: 'Scheduled exports' }).click();
        await p3.locator('.table, .empty').first().waitFor();
        await p3.goto('http://localhost:3101/?setup');
        await p3.getByRole('button', { name: 'Set up Luzmo and open portal' }).click();
        await p3.waitForSelector('#portal', { timeout: 60000 });
        await p3.screenshot({ path: path.join(OUT, '08-deployed.png') });
        await p3.close();
      } finally {
        server.kill();
      }
    });

    await step('tracking events fired along the funnel', async () => {
      for (const e of ['wizard_started', 'luzmo_connected', 'brand_fetched', 'setup_started', 'setup_finished', 'portal_opened', 'tenant_switched', 'edit_opened', 'ai_question_asked', 'iq_missing', 'download', 'howto_opened', 'drill_through', 'activated']) assert.ok(events.includes(e), `event ${e}`);
    });

    const own = errors.filter((e) => !/luzmo|Failed to fetch|NetworkError|mf-manifest|Loading chunk|dynamically imported/i.test(e));
    assert.deepStrictEqual(own, [], `page errors: ${own.join(' | ')}`);
    console.log(`\nAll ${steps.length} end-to-end steps passed. Screenshots in test/output/`);
  } catch (err) {
    exitCode = 1;
    await page.screenshot({ path: path.join(OUT, 'failure.png'), fullPage: true }).catch(() => {});
    if (errors.length) console.log('Page errors:', errors.slice(0, 8));
  } finally {
    await browser.close();
    portal.kill();
    site.close();
    await mock.close();
    process.exit(exitCode);
  }
})();

// Reads one stored (uncompressed) file from a zip written by kit.js.
function execUnzip(zipFile, suffix) {
  const buf = fs.readFileSync(zipFile);
  let i = 0;
  while (i < buf.length - 30 && buf.readUInt32LE(i) === 0x04034b50) {
    const size = buf.readUInt32LE(i + 18);
    const nameLen = buf.readUInt16LE(i + 26);
    const name = buf.slice(i + 30, i + 30 + nameLen).toString();
    const start = i + 30 + nameLen;
    if (name.endsWith(suffix) && !name.endsWith(`.${suffix}`)) return buf.slice(start, start + size).toString();
    i = start + size;
  }
  throw new Error(`${suffix} not in zip`);
}
