/* Writes tests/fixtures/golden/*.json: what the shipped state.js does with each fixture.
   Run ONCE against unchanged code (Phase 0 baseline = commit 33c4e04) and commit the output.
   Later changes to state.js must reproduce these files exactly (unit tests "golden ...").
   Re-running this after changing state.js would hide regressions — don't, unless the owner
   has approved an intentional change to how existing data is read. */
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { openPage, PUBLIC } from '../helpers/env.mjs';
import * as F from '../fixtures/fixtures.mjs';

const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'fixtures', 'golden');
mkdirSync(OUT, { recursive: true });

const write = (name, obj) => writeFileSync(path.join(OUT, name), JSON.stringify(obj, null, 2) + '\n');

for (const [name, profile] of Object.entries({ profileV1: F.profileV1, profileV2Full: F.profileV2Full, profileV2Tampered: F.profileV2Tampered })) {
  const p = openPage({ page: 'state', storage: { [F.STORAGE_KEY]: JSON.stringify(profile) } });
  write(name + '.load.json', p.S._state());
  p.close();
}
for (const name of ['v1', 'v2']) {
  const p = openPage({ page: 'state' });
  const r = p.S.validateBackup(F.backups[name]);
  if (!r.ok) throw new Error('fixture backup ' + name + ' rejected: ' + r.error);
  write('backup-' + name + '.restore.json', r.data);
  p.close();
}

const stateJs = readFileSync(path.join(PUBLIC, 'shared', 'state.js'));
let commit = 'unknown';
try { commit = execSync('git rev-parse HEAD', { cwd: PUBLIC }).toString().trim(); } catch (e) {}
write('_generated-from.json', {
  note: 'Golden output of the unchanged Stage 4 state layer. Do not regenerate after changing state.js.',
  commit, stateJsSha256: createHash('sha256').update(stateJs).digest('hex'), generatedAt: new Date().toISOString()
});
console.log('golden files written to', OUT, 'from commit', commit);
