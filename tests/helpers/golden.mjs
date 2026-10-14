/* Golden snapshots were produced once from the unchanged Phase 0 state layer (33c4e04)
   and are never regenerated. When the schema version moves deliberately (EXPECTED.schema),
   the only permitted difference is the schemaVersion field itself. */
import { readFileSync } from 'node:fs';
import { EXPECTED } from '../fixtures/fixtures.mjs';

export const goldenRaw = (name) => JSON.parse(readFileSync(new URL('../fixtures/golden/' + name, import.meta.url), 'utf8'));
export function goldenNow(name) {
  const g = goldenRaw(name);
  if (g.schemaVersion !== 2) throw new Error('golden ' + name + ' is not the original schema-2 snapshot');
  return { ...g, schemaVersion: EXPECTED.schema };
}
