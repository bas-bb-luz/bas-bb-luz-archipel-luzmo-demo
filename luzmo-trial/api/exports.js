// Scheduled email exports on the portal's dashboards, for the organisation that is viewing.
const { getCore, tenantOf, handler } = require('./_lib/luzmo');

module.exports = handler(async (body) => {
  const tenant = tenantOf(body.tenant);
  const core = await getCore();
  return { schedules: await core.listSchedules(tenant) };
});
