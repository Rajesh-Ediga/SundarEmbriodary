import { access, readFile } from 'node:fs/promises';
const required = ['dist/index.html','dist/styles.css','dist/config.js','dist/demo-data.js','dist/app.js','dist/manifest.webmanifest','dist/sw.js','dist/assets/emerald-saree.png'];
await Promise.all(required.map(file => access(file)));
const html = await readFile('dist/index.html','utf8');
if (!html.includes('Sundar Embroidery Works')) throw new Error('Brand content missing from demo build');
console.log('Sundar demo build verified.');
