// Loads the demo into Luzmo in short steps, so each call fits in a serverless function.
// Protected by SETUP_SECRET when that variable is set.
const { P, getCore, handler } = require('./_lib/luzmo');

const DATA = Object.fromEntries(Object.keys(P.datasets).map((k) => [k, require(`../data/${k}.json`)]));

module.exports = handler(async (body, req) => {
  const secret = process.env.SETUP_SECRET;
  if (secret && req.headers['x-setup-secret'] !== secret) throw Object.assign(new Error('Wrong setup password'), { status: 401 });
  const lines = [];
  const log = (msg, kind = '') => lines.push({ msg, kind });
  const core = await getCore({ fresh: body.step === 'start', log });
  let next = null;
  switch (body.step) {
    case 'start':
      log(`Connected to Luzmo`, 'ok');
      next = { step: 'theme' };
      break;
    case 'theme':
      await core.setupTheme();
      next = { step: 'data', key: Object.keys(P.datasets)[0], offset: 0 };
      break;
    case 'data': {
      const offset = await core.setupDataChunk(body.key, DATA[body.key], body.offset || 0);
      next = offset === null ? { step: 'columns', key: body.key } : { step: 'data', key: body.key, offset };
      break;
    }
    case 'columns': {
      await core.setupColumns(body.key);
      const keys = Object.keys(P.datasets);
      const after = keys[keys.indexOf(body.key) + 1];
      next = after ? { step: 'data', key: after, offset: 0 } : { step: 'dashboards' };
      break;
    }
    case 'dashboards':
      await core.setupDashboards();
      next = null;
      break;
    default:
      throw Object.assign(new Error('Unknown setup step'), { status: 400 });
  }
  return { lines, next, state: core.state };
});
