// Public config for the portal: prospect spec, Luzmo hosts and the ids found in Luzmo. No secrets.
const { P, env, getCore, handler } = require('./_lib/luzmo');

module.exports = handler(async () => {
  const e = env();
  const configured = !!(e.key && e.token);
  let state = null;
  let ready = false;
  if (configured) {
    const core = await getCore({ fresh: true });
    state = core.state;
    ready = core.ready();
  }
  return { prospect: P, apiHost: e.apiHost, appServer: e.appServer, configured, ready, state, setupProtected: !!process.env.SETUP_SECRET };
});
