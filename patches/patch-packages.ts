/// <reference types="bun-types" />

import path from 'node:path';

console.log('running patch');

const boostOriginalFile = path.resolve(
  import.meta.dir,
  '../node_modules/react-native/third-party-podspecs/boost.podspec',
);

const boostUpdatedFile = path.resolve(
  import.meta.dir,
  './boost-update.podspec',
);

const boostPatch = path.resolve(import.meta.dir, './boost.patch');

const proc = Bun.spawnSync(['diff', boostOriginalFile, boostUpdatedFile]);

const result = await new Response(proc.stdout).text();

console.log(result);

if (result) {
  Bun.spawnSync(['patch', '-u', boostOriginalFile, '-i', boostPatch]);
}

console.log('patched finished');

process.exit(0);
