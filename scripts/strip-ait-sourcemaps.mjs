#!/usr/bin/env node
/**
 * Apps in Toss console rejects bundles over 100MB uncompressed.
 * `ait build` packs *.js.map (~half the size); strip them for upload.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const aitPath = join(root, '0st.ait');

if (!existsSync(aitPath)) {
    console.error('strip-ait-sourcemaps: 0st.ait not found');
    process.exit(1);
}

const result = spawnSync(
    'python3',
    [
        '-c',
        `
import zipfile
from pathlib import Path
src = Path(${JSON.stringify(aitPath)})
tmp = src.with_suffix('.ait.tmp')
kept = []
total = 0
with zipfile.ZipFile(src) as zin, zipfile.ZipFile(tmp, 'w', compression=zipfile.ZIP_DEFLATED) as zout:
    for info in zin.infolist():
        if info.filename.endswith('.map'):
            continue
        data = zin.read(info.filename)
        zout.writestr(info, data)
        total += len(data)
        kept.append(info.filename)
tmp.replace(src)
print(f'kept={len(kept)} uncompressed_mb={total/1024/1024:.1f} file_mb={src.stat().st_size/1024/1024:.1f}')
for name in kept:
    print(f'  {name}')
`,
    ],
    { encoding: 'utf8' },
);

if (result.status !== 0) {
    console.error(result.stderr || result.stdout || 'strip failed');
    process.exit(result.status ?? 1);
}
console.log(result.stdout.trim());
