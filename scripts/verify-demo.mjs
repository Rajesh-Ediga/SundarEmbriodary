import { access, readFile } from 'node:fs/promises';
const required=['dist/index.html','dist/styles.css','dist/gallery.css','dist/config.js','dist/demo-data.js','dist/app.js','dist/manifest.webmanifest','dist/sw.js','dist/assets/emerald-saree.png','dist/assets/saree-gallery.webp','dist/assets/blouse-gallery.webp','dist/assets/bridal-gallery.webp','dist/assets/tshirt-gallery.webp','dist/assets/uniform-gallery.webp','dist/assets/cap-gallery.webp','dist/assets/bag-gallery.webp'];
await Promise.all(required.map(file=>access(file)));
const html=await readFile('dist/index.html','utf8');
if(!html.includes('Sundar Embroidery Works'))throw new Error('Brand content missing from demo build');
console.log('Sundar demo build verified.');
