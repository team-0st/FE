#!/usr/bin/env node
/**
 * Shrink `0st.ait` for Apps in Toss deploy.
 *
 * - Format is AITBUNDL (not a plain zip) — must rewrite via @apps-in-toss/ait-format.
 * - Console build fails if `*.js.map` entries are removed entirely.
 * - Replacing map bodies with a minimal sourcemap keeps names, cuts ~half the size.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { AppsInTossBundle } from '@apps-in-toss/ait-format';

const EMPTY_SOURCEMAP = new TextEncoder().encode(
    '{"version":3,"file":"","sources":[],"names":[],"mappings":""}',
);

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const aitPath = join(root, '0st.ait');

if (!existsSync(aitPath)) {
    console.error('strip-ait-sourcemaps: 0st.ait not found');
    process.exit(1);
}

const buf = new Uint8Array(readFileSync(aitPath));
if (!AppsInTossBundle.isAIT(buf)) {
    console.error('strip-ait-sourcemaps: not an AITBUNDL file');
    process.exit(1);
}

const reader = AppsInTossBundle.reader(buf);
const entries = reader.listEntries();
if (entries.length === 0) {
    console.error('strip-ait-sourcemaps: empty bundle');
    process.exit(1);
}

const meta = reader.metadata;
const writer = AppsInTossBundle.writer({
    appName: reader.appName,
    deploymentId: AppsInTossBundle.generateUUID7(),
});

writer.setMetadata({
    isGame: meta?.isGame ?? false,
    platform: meta?.platform,
    runtimeVersion: meta?.runtimeVersion || undefined,
    sdkVersion: meta?.sdkVersion || undefined,
    packageJson: meta?.packageJson,
    extra: meta?.extra,
    bundleFiles: entries,
});

for (const perm of reader.permissions) {
    writer.addPermission(perm.name, perm.access);
}

let total = 0;
let shrunkMaps = 0;
for (const name of entries) {
    let data;
    if (name.endsWith('.map')) {
        data = EMPTY_SOURCEMAP;
        shrunkMaps += 1;
    } else {
        data = await reader.readEntry(name);
    }
    writer.addFile(name, data);
    total += data.byteLength;
}

const out = await writer.toBuffer();
writeFileSync(aitPath, out);

console.log(
    `entries=${entries.length} shrunk_maps=${shrunkMaps} uncompressed_mb=${(total / 1024 / 1024).toFixed(1)} file_mb=${(out.byteLength / 1024 / 1024).toFixed(1)}`,
);
for (const name of entries) {
    console.log(`  ${name}${name.endsWith('.map') ? ' (minimal)' : ''}`);
}
