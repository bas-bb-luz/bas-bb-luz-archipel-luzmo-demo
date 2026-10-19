// Scheduled dashboard exports for one organisation, read server-side with the API key.
const { getCore, tenantOf, handler } = require('./_lib/luzmo');

module.exports = handler(async (body) => {
  const tenant = tenantOf(body.tenant);
  const core = await getCore();
  return { schedules: await core.listSchedules(tenant) };
});
