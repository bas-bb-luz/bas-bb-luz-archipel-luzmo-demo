// Writes public/kit/sources.json: the server-side files of this project and the list of public
// files, so the browser can zip a starter kit. Runs as the Vercel build command and before `npm run dev`.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const pub = path.join(root, 'public');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? walk(path.join(dir, d.name)) : [path.join(dir, d.name)]));

const sourceFiles = [
  'package.json', 'vercel.json', '.env.example', 'README.md', 'dev-server.js', 'build-single.js', 'scripts/build-kit.js',
  ...walk(path.join(root, 'api')).map((f) => path.relative(root, f))
];
const sources = Object.fromEntries(sourceFiles.filter((f) => fs.existsSync(path.join(root, f))).map((f) => [f.split(path.sep).join('/'), read(f)]));
sources['.gitignore'] = 'node_modules/\n.env\n.env.*\n!.env.example\n.vercel/\ndist/\npublic/kit/\n';

const publicFiles = walk(pub)
  .map((f) => path.relative(pub, f).split(path.sep).join('/'))
  .filter((f) => !f.startsWith('kit/'))
  .sort();

fs.mkdirSync(path.join(pub, 'kit'), { recursive: true });
fs.writeFileSync(path.join(pub, 'kit', 'sources.json'), JSON.stringify({ builtAt: new Date().toISOString(), sources, public: publicFiles }));
console.log(`Wrote public/kit/sources.json (${Object.keys(sources).length} source files, ${publicFiles.length} public files)`);
