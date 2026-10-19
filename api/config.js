// Public config for the portal: prospect spec, Luzmo hosts and the ids found in Luzmo. No secrets.
const { P, env, getCore, handler, visibleNames } = require('./_lib/luzmo');

module.exports = handler(async () => {
  const e = env();
  const configured = !!(e.key && e.token);
  let state = null;
  let ready = false;
  let luzmoError = null;
  if (configured) {
    try {
      const core = await getCore({ fresh: true });
      state = core.state;
      ready = core.ready();
    } catch (err) {
      luzmoError = err.message;
    }
  }
  const missing = [!e.key && 'LUZMO_API_KEY', !e.token && 'LUZMO_API_TOKEN'].filter(Boolean);
  return {
    prospect: P, apiHost: e.apiHost, appServer: e.appServer, configured, ready, state, setupProtected: !!process.env.SETUP_SECRET,
    missing, seenVariables: configured ? [] : visibleNames(), luzmoError
  };
});
