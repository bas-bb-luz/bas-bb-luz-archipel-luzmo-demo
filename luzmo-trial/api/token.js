// Mints a short-lived embed token for one organisation. The tenant filter is set here, server-side.
const { getCore, tenantOf, handler } = require('./_lib/luzmo');

module.exports = handler(async (body) => {
  const tenant = tenantOf(body.tenant);
  const core = await getCore();
  if (!core.ready()) throw Object.assign(new Error('The portal is not set up in Luzmo yet'), { status: 409 });
  return { token: await core.mintToken(tenant, 1), state: core.state };
});
