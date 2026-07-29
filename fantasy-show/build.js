#!/usr/bin/env node
/* Inlines engine + episode data into a single self-contained HTML file.
   Usage: node build.js week01   →  dist/week01.html                     */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const ep = process.argv[2] || 'week01';

const read = p => readFileSync(join(root, p), 'utf8');
let html = read(`watch/${ep}.html`);

html = html.replace(
  /<link rel="stylesheet" href="\.\.\/engine\/show\.css">/,
  `<style>\n${read('engine/show.css')}\n</style>`
);
html = html.replace(
  new RegExp(`<script src="\\.\\./episodes/${ep}\\.js"></script>`),
  `<script>\n${read(`episodes/${ep}.js`)}\n</script>`
);
html = html.replace(
  /<script src="\.\.\/engine\/characters\.js"><\/script>/,
  `<script>\n${read('engine/characters.js')}\n</script>`
);
html = html.replace(
  /<script src="\.\.\/engine\/engine\.js"><\/script>/,
  `<script>\n${read('engine/engine.js')}\n</script>`
);

if (html.includes('src="../')) {
  console.error('build failed: un-inlined reference remains');
  process.exit(1);
}

mkdirSync(join(root, 'dist'), { recursive: true });
writeFileSync(join(root, `dist/${ep}.html`), html);
console.log(`built dist/${ep}.html (${(html.length / 1024).toFixed(1)} KB)`);
