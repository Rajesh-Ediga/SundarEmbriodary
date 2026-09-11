import { copyFile, cp, mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';

const source = resolve('client/dist/client/browser');
const destination = resolve('dist/business');
const expectedDestination = resolve('dist', 'business');

if (destination !== expectedDestination) throw new Error('Unexpected business output path');
await rm(destination, { recursive: true, force: true });
await mkdir(destination, { recursive: true });
await cp(source, destination, { recursive: true });
for (const route of ['login', 'dashboard']) {
  const routeDirectory = resolve(destination, route);
  await mkdir(routeDirectory, { recursive: true });
  await copyFile(resolve(destination, 'index.html'), resolve(routeDirectory, 'index.html'));
}
console.log('Business portal copied to dist/business.');
