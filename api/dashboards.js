// The portal's own dashboards: list, read, create and save. Writes are limited to demo dashboards.
const { getCore, tenantOf, handler } = require('./_lib/luzmo');

module.exports = handler(async (body) => {
  const tenant = tenantOf(body.tenant);
  const core = await getCore({ fresh: body.op === 'list' });
  switch (body.op) {
    case 'list':
      return { dashboards: core.visibleDashboards(tenant) };
    case 'get':
      return { items: await core.getItems(body.id) };
    case 'create': {
      const dashboard = await core.createDashboard(String(body.name || 'My dashboard').slice(0, 80), body.items || [], tenant);
      // The new dashboard is only reachable with a token that lists it.
      return { dashboard, token: await core.mintToken(tenant, 1), dashboards: core.visibleDashboards(tenant) };
    }
    case 'save':
      await core.saveItems(body.id, body.items || [], body.name);
      return { ok: true, dashboards: core.visibleDashboards(tenant) };
    default:
      throw Object.assign(new Error('Unknown operation'), { status: 400 });
  }
});
