import { build } from 'esbuild';
import { cp } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const outdir = resolve(__dirname, '../static/dist');
const srcDir = resolve(__dirname, '../static/src');

const adminOutdir = resolve(__dirname, '../static/admin-dist');
const adminSrcDir = resolve(__dirname, '../static/admin-src');

const options = {
  entryPoints: [resolve(srcDir, 'index.tsx')],
  bundle: true,
  format: 'iife',
  platform: 'browser',
  outdir,
  loader: { '.png': 'file', '.svg': 'file', '.json': 'json' },
  minify: true,
};

const adminOptions = {
  entryPoints: [resolve(adminSrcDir, 'index.tsx')],
  bundle: true,
  format: 'iife',
  platform: 'browser',
  outdir: adminOutdir,
  loader: { '.png': 'file', '.svg': 'file', '.json': 'json', '.css': 'css' },
  minify: true,
};

// Build both apps
await build(options);
await build(adminOptions);

// Copy HTML files
await cp(resolve(srcDir, 'index.html'), resolve(outdir, 'index.html'));
await cp(resolve(adminSrcDir, 'index.html'), resolve(adminOutdir, 'index.html'));

console.log('Built both apps and copied HTML files');