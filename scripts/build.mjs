import { build, context } from 'esbuild';
import { mkdir, cp } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isWatch = process.argv.includes('--watch');

const outdir = resolve(__dirname, '../static/dist');
const srcDir = resolve(__dirname, '../static/src');

await mkdir(outdir, { recursive: true });

const options = {
	entryPoints: [resolve(srcDir, 'index.tsx')],
	bundle: true,
	format: 'iife',
	platform: 'browser',
	outdir,
	loader: { '.png': 'file', '.svg': 'file' },
	minify: !isWatch,
	sourcemap: isWatch,
};

if (isWatch) {
	const ctx = await context(options);
	await ctx.watch();
	// Initial copy of index.html
	await cp(resolve(srcDir, 'index.html'), resolve(outdir, 'index.html'));
	console.log('Watching for changes...');
} else {
	await build(options);
	await cp(resolve(srcDir, 'index.html'), resolve(outdir, 'index.html'));
}
