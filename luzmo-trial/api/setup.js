// Loads the portal into Luzmo in short steps, so each call fits in a serverless function.
// The rows come from the seeded generator, so portal.json alone is enough. Protected by SETUP_SECRET.
const Gen = require('../public/generator.js');
const { portal, getCore, handler } = require('./_lib/luzmo');

let data = null;

module.exports = handler(async (body, req) => {
  const secret = process.env.SETUP_SECRET;
  if (secret && req.headers['x-setup-secret'] !== secret) throw Object.assign(new Error('Wrong setup password'), { status: 401 });
  const P = portal();
  if (!P) throw Object.assign(new Error('Add portal.json to the project first'), { status: 409 });
  if (!data || body.step === 'start') data = Gen.generateData(P);
  const lines = [];
  const log = (msg, kind = '') => lines.push({ msg, kind });
  const core = await getCore({ fresh: body.step === 'start', log });
  const keys = Object.keys(P.datasets);
  let next = null;
  switch (body.step) {
    case 'start':
      log('Connected to Luzmo', 'ok');
      next = { step: 'theme' };
      break;
    case 'theme':
      await core.setupTheme();
      next = { step: 'data', key: keys[0], offset: 0 };
      break;
    case 'data': {
      const offset = await core.setupDataChunk(body.key, data[body.key], body.offset || 0);
      next = offset === null ? { step: 'columns', key: body.key } : { step: 'data', key: body.key, offset };
      break;
    }
    case 'columns': {
      await core.setupColumns(body.key);
      const after = keys[keys.indexOf(body.key) + 1];
      next = after ? { step: 'data', key: after, offset: 0 } : { step: 'dashboards' };
      break;
    }
    case 'dashboards':
      await core.setupDashboards();
      break;
    default:
      throw Object.assign(new Error('Unknown setup step'), { status: 400 });
  }
  return { lines, next, state: core.state };
});
