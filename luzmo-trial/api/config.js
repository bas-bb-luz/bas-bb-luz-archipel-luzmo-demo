// Tells the browser which mode to run in. "wizard": no credentials or no portal.json on the server,
// so the trial wizard runs in the browser. "server": a deployed portal. Never returns secrets.
const { portal, env, getCore, handler, visibleNames } = require('./_lib/luzmo');

module.exports = handler(async () => {
  const e = env();
  const P = portal();
  const configured = !!(e.key && e.token);
  if (!configured || !P) {
    return { mode: 'wizard', portal: P, configured, hasPortal: !!P, missing: [!e.key && 'LUZMO_API_KEY', !e.token && 'LUZMO_API_TOKEN'].filter(Boolean), seenVariables: visibleNames() };
  }
  let state = null;
  let ready = false;
  let luzmoError = null;
  try {
    const core = await getCore({ fresh: true });
    state = core.state;
    ready = core.ready();
  } catch (err) {
    luzmoError = err.message;
  }
  return { mode: 'server', portal: P, apiHost: e.apiHost, appServer: e.appServer, configured, ready, state, setupProtected: !!process.env.SETUP_SECRET, luzmoError };
});
