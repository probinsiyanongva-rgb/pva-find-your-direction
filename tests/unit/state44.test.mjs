/* Module 4.4 shared state (public/shared/state.js, schema v4) against Production
   Specification v1.0 (§6–§11, §17.1). Every test executes the real state layer. */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { openPage, plain, KEY } from '../helpers/env.mjs';
import { goldenNow } from '../helpers/golden.mjs';
import * as F from '../fixtures/fixtures.mjs';

const withProfile = (profile, extra = {}) => openPage({ page: 'state', storage: { [KEY]: JSON.stringify(profile) }, ...extra });
const json = (o) => JSON.stringify(o);
const map = (p) => plain(p.S.m44.map());
const LEGACY_GUARD = fileURLToPath(new URL('../fixtures/legacy/state-ee27fd0.js', import.meta.url));
const LEGACY_43 = fileURLToPath(new URL('../fixtures/legacy/state-de481a0.js', import.meta.url));
const MAP_KEYS = ['lastSection', 'completedAt', 'whereIAmNow', 'mapDirections', 'stillExploring', 'investigationStep'];
const EC = 'dir-ecommerce', CS = 'dir-customer-support', BK = 'dir-bookkeeping', AMZ = 'dir-amazon';

/* A v3 learner (4.1–4.3 done; ecommerce = Explore further, customer support = Not for me
   right now, bookkeeping = unsaved draft) who has not opened 4.4 yet. */
const v3 = () => withProfile(F.profileV3Full);
/* Everything outside the 4.4 map, for the immutability checks (D7). */
function sources(p) {
  const s = plain(p.S._state());
  const mods = { ...s.modules }; delete mods['4-4'];
  return { workClues: s.workClues, scenarioObservations: s.scenarioObservations, jobPostObservations: s.jobPostObservations, exploredDirections: s.exploredDirections, modules: mods };
}
const storedNoMeta = (p) => { const s = p.stored(); if (s) delete s._meta; return s; };
const withSaved = (ids, judgment = 'explore_further') => {
  const prof = JSON.parse(json(F.profileV3Full));
  ids.forEach((id) => prof.modules['4-3'].directionExplorations.push({ directionId: id, judgment, reason: '', reasonSkipped: false, relatedEvidenceIds: [], whatMayBeNew: '', learningQuestions: [], savedAt: '2026-10-20T02:30:00.000Z' }));
  return withProfile(prof);
};

describe('4.4 · constants, migration and schema v4', () => {
  test('V1 schema 4, backup 4, 4-4 module, limits', () => {
    const p = openPage({ page: 'state' });
    assert.equal(p.S.SCHEMA_VERSION, 4);
    assert.deepEqual(plain(p.S.LIMITS_44), { whereIAmNow: 300, nextStep: 300, investigationStep: 300, directions: 2 });
    p.S.m44.setWhereIAmNow('x');
    assert.equal(p.stored().schemaVersion, 4);
    assert.deepEqual(Object.keys(p.stored().modules['4-4']).sort(), [...MAP_KEYS].sort());
  });
  test('M1 a v3 profile loads with 4.1–4.3 equal to what the 4.3 release produces; no 4-4 created', () => {
    const now = withProfile(F.profileV3Full);
    const old = openPage({ page: 'state', storage: { [KEY]: json(F.profileV3Full) }, stateFile: LEGACY_43 });
    const a = plain(now.S._state()), b = plain(old.S._state());
    assert.equal(a.schemaVersion, 4); assert.equal(b.schemaVersion, 3);
    delete a.schemaVersion; delete b.schemaVersion;
    assert.deepEqual(a, b);
    assert.equal(now.S._state().modules['4-4'], undefined);
    assert.equal(now.raw(), json(F.profileV3Full), 'loading never writes');
  });
  test('M2 v1/v2 data still equal the golden snapshots (only schemaVersion moves)', () => {
    for (const [prof, g] of [[F.profileV1, 'profileV1.load.json'], [F.profileV2Full, 'profileV2Full.load.json'], [F.profileV2Tampered, 'profileV2Tampered.load.json']]) {
      assert.deepEqual(plain(withProfile(prof).S._state()), goldenNow(g));
    }
  });
  test('M3 a 4-4 key in v1, v2 or v3 data is dropped; a 4-3 key in v1/v2 is still dropped', () => {
    const bogus = { lastSection: 'map', mapDirections: [{ directionId: EC, nextStep: 'x' }], stillExploring: false, investigationStep: 'y' };
    for (const prof of [F.profileV1, F.profileV2Full, F.profileV3Full]) {
      const x = JSON.parse(json(prof)); x.modules['4-4'] = bogus;
      const p = withProfile(x);
      assert.equal(p.S._state().modules['4-4'], undefined, 'schema ' + prof.schemaVersion);
    }
    const t = withProfile(F.profileV2Tampered);
    assert.equal(t.S._state().modules['4-3'], undefined);
  });
  test('M4 schema-5 data is newer: kept byte-identical after every m44 call', () => {
    const p = openPage({ page: 'state', storage: { [KEY]: F.RAW.newer } });
    assert.equal(p.S.saveBlocked(), 'newer');
    p.S.m44.setWhereIAmNow('a'); p.S.m44.setStillExploring(true); p.S.m44.setInvestigationStep('b'); p.S.m44.addDirection(EC); p.S.m44.setNextStep(EC, 'c'); p.S.m44.removeDirection(EC, { confirmed: true });
    assert.equal(p.raw(), F.RAW.newer);
  });
  test('M5 v4 round trip: Export → Restore reproduces every field, including a hidden investigation step', async () => {
    const a = withProfile(F.profileV4Full);
    assert.deepEqual(plain(a.S._state()), F.profileV4Full, 'a valid v4 profile loads unchanged');
    a.S.exportProgress();
    const text = await a.downloadText(0);
    const b = JSON.parse(text);
    assert.equal(b.version, 4);
    const fresh = openPage({ page: 'state' });
    assert.equal(await fresh.restoreText(text), 'restored');
    const s = storedNoMeta(fresh), want = plain(a.S._state()); delete want._meta;
    assert.deepEqual(s, want);
    assert.equal(s.modules['4-4'].investigationStep, 'Compare two Direction Cards.');
  });
  test('M6 wrappers 1–4 accepted; wrapper 5 and schema-5 data rejected with the existing message', () => {
    const p = openPage({ page: 'state' });
    for (const b of [F.backups.v1, F.backups.v2, F.backups.v3, F.backups.v4]) assert.equal(p.S.validateBackup(b).ok, true);
    for (const b of [F.backups.futureWrapper, F.backups.futureData]) {
      const r = p.S.validateBackup(b);
      assert.equal(r.ok, false); assert.match(r.error, /newer version/);
    }
  });
});

describe('4.4 · normalize44 (R-DATA-3)', () => {
  const load44 = (m) => { const x = JSON.parse(json(F.profileV3Full)); x.schemaVersion = 4; x.modules['4-4'] = m; return map(withProfile(x)); };
  test('N1 invalid ids, duplicates and non-objects dropped; first two kept, in order', () => {
    const m = load44({ mapDirections: ['dir-amazon', null, { directionId: 'dir-nope', nextStep: 'a' }, { directionId: CS, nextStep: 'b' }, { directionId: CS, nextStep: 'dup' }, { directionId: AMZ, nextStep: 'c' }, { directionId: EC, nextStep: 'third' }] });
    assert.deepEqual(m.mapDirections, [{ directionId: CS, nextStep: 'b' }, { directionId: AMZ, nextStep: 'c' }]);
  });
  test('N2 directions and stillExploring both stored → directions stand, stillExploring false, investigation kept', () => {
    const m = load44({ mapDirections: [{ directionId: EC, nextStep: 'x' }], stillExploring: true, investigationStep: 'keep me' });
    assert.equal(m.stillExploring, false); assert.equal(m.investigationStep, 'keep me'); assert.equal(m.mapDirections.length, 1);
  });
  test('N3 text cleaned (line breaks → spaces) and capped at each limit', () => {
    const long = 'a'.repeat(400);
    const m = load44({ whereIAmNow: ' line\none ', investigationStep: long, mapDirections: [{ directionId: EC, nextStep: long + '\n' }] });
    assert.equal(m.whereIAmNow, 'line one');
    assert.equal(m.investigationStep.length, 300); assert.equal(m.mapDirections[0].nextStep.length, 300);
  });
  test('N4 a map direction without a saved 4.3 reflection is kept (BK is an unsaved draft; AMZ has none)', () => {
    const m = load44({ mapDirections: [{ directionId: BK, nextStep: 's' }, { directionId: AMZ, nextStep: '' }] });
    assert.deepEqual(m.mapDirections.map((d) => d.directionId), [BK, AMZ]);
  });
  test('N5 unknown keys dropped; missing fields defaulted; bad types ignored', () => {
    const m = load44({ score: 9, history: [1], completedAt: 7, lastSection: 'Not An Id', stillExploring: 'yes', mapDirections: 'x' });
    assert.deepEqual(m, { lastSection: null, completedAt: null, whereIAmNow: '', mapDirections: [], stillExploring: false, investigationStep: '' });
  });
});

describe('4.4 · API rules (D3, D17)', () => {
  test('A1 addDirection refuses an unsaved reflection, an unknown id, a duplicate and a third direction', () => {
    const p = withSaved([AMZ]);
    assert.equal(p.S.m44.addDirection(BK), 'refused', 'unsaved draft');
    assert.equal(p.S.m44.addDirection('dir-ndis'), 'refused', 'no reflection');
    assert.equal(p.S.m44.addDirection('dir-nope'), 'refused');
    assert.equal(p.S.m44.addDirection(EC), 'added');
    assert.equal(p.S.m44.addDirection(EC), 'refused', 'duplicate');
    assert.equal(p.S.m44.addDirection(AMZ), 'added');
    assert.equal(p.S.m44.addDirection(CS), 'refused', 'third');
    assert.deepEqual(map(p).mapDirections.map((d) => d.directionId), [EC, AMZ]);
  });
  test('A2 a "Not for me right now" direction is added exactly like the others', () => {
    const p = v3();
    assert.equal(p.S.m43.exploration(CS).judgment, 'not_now');
    assert.equal(p.S.m44.addDirection(CS), 'added');
    assert.equal(p.S.m44.state(), 'directions');
  });
});

describe('4.4 · transitions T1–T13 (R-ST-3)', () => {
  test('T1 Empty → add: Directions with an empty step', () => {
    const p = v3(); assert.equal(p.S.m44.state(), 'empty');
    assert.equal(p.S.m44.addDirection(EC), 'added');
    assert.deepEqual(map(p).mapDirections, [{ directionId: EC, nextStep: '' }]);
  });
  test('T2 refused adds change nothing (storage byte-identical)', () => {
    const p = v3(); p.S.m44.addDirection(EC); const before = p.raw();
    for (const id of [BK, 'dir-ndis', 'dir-nope', EC]) assert.equal(p.S.m44.addDirection(id), 'refused');
    assert.equal(p.raw(), before);
  });
  test('T3 a second direction is appended in learner order', () => {
    const p = v3(); p.S.m44.addDirection(CS); p.S.m44.addDirection(EC);
    assert.deepEqual(map(p).mapDirections.map((d) => d.directionId), [CS, EC]);
  });
  test('T4 removing a direction with a written step needs confirmation; unconfirmed leaves storage byte-identical', () => {
    const p = v3(); p.S.m44.addDirection(EC); p.S.m44.setNextStep(EC, 'Read job posts'); const before = p.raw();
    assert.equal(p.S.m44.removeDirection(EC), 'needs-confirm');
    assert.equal(p.S.m44.removeDirection(EC, { confirmed: 'yes' }), 'needs-confirm', 'only confirmed === true counts');
    assert.equal(p.raw(), before);
    assert.equal(p.S.m44.removeDirection(EC, { confirmed: true }), 'removed');
    assert.equal(p.S.m44.state(), 'empty', 'removing the last direction leaves the map Empty');
  });
  test('T5 removing a direction without a written step (whitespace only) needs no confirmation', () => {
    const p = v3(); p.S.m44.addDirection(EC); p.S.m44.setNextStep(EC, '   ');
    assert.equal(p.S.m44.removeDirection(EC), 'removed');
  });
  test('T6 choosing still exploring with any written step needs confirmation; unconfirmed changes nothing', () => {
    const p = v3(); p.S.m44.addDirection(EC); p.S.m44.addDirection(CS); p.S.m44.setNextStep(CS, 'Ask a question'); const before = p.raw();
    assert.equal(p.S.m44.setStillExploring(true), 'needs-confirm');
    assert.equal(p.raw(), before);
    assert.equal(p.S.m44.setStillExploring(true, { confirmed: true }), 'exploring');
    assert.deepEqual([map(p).mapDirections, map(p).stillExploring], [[], true]);
  });
  test('T7 choosing still exploring with no written step needs no confirmation', () => {
    const p = v3(); p.S.m44.addDirection(EC);
    assert.equal(p.S.m44.setStillExploring(true), 'exploring');
  });
  test('T8 still exploring → add a direction keeps the investigation step byte-identical (and after reload, export/restore, and choosing again)', async () => {
    const p = v3(); p.S.m44.setStillExploring(true); p.S.m44.setInvestigationStep('Examine one more direction.');
    assert.equal(p.S.m44.addDirection(EC), 'added');
    assert.equal(map(p).stillExploring, false);
    assert.equal(map(p).investigationStep, 'Examine one more direction.');
    const q = p.reopen();
    assert.equal(map(q).investigationStep, 'Examine one more direction.');
    q.S.exportProgress(); const text = await q.downloadText(0);
    const r = openPage({ page: 'state' }); await r.restoreText(text);
    assert.equal(map(r).investigationStep, 'Examine one more direction.');
    r.S.m44.removeDirection(EC); r.S.m44.setStillExploring(true);
    assert.equal(map(r).investigationStep, 'Examine one more direction.', 'comes back when exploring again');
  });
  test('T9 unselecting still exploring leaves the map Empty and the step unchanged', () => {
    const p = v3(); p.S.m44.setStillExploring(true); p.S.m44.setInvestigationStep('Keep');
    assert.equal(p.S.m44.setStillExploring(false), 'empty');
    assert.deepEqual([p.S.m44.state(), map(p).investigationStep], ['empty', 'Keep']);
  });
  test('T10 Empty → still exploring shows the kept step', () => {
    const p = withProfile({ ...F.profileV4Full });   // Directions + kept step
    p.S.m44.removeDirection(EC, { confirmed: true });
    assert.equal(p.S.m44.setStillExploring(true), 'exploring');
    assert.equal(map(p).investigationStep, 'Compare two Direction Cards.');
  });
  test('T11 emptying the investigation field on purpose stores an empty step', () => {
    const p = v3(); p.S.m44.setStillExploring(true); p.S.m44.setInvestigationStep('x');
    assert.equal(p.S.m44.setInvestigationStep('  '), true);
    assert.equal(map(p).investigationStep, '');
  });
  test('T12 the hidden investigation step cannot be edited outside still exploring', () => {
    const p = withProfile(F.profileV4Full); const before = p.raw();
    assert.equal(p.S.m44.setInvestigationStep('changed'), false);
    p.S.m44.removeDirection(EC, { confirmed: true });
    assert.equal(p.S.m44.setInvestigationStep('changed'), false, 'Empty state');
    assert.equal(map(p).investigationStep, 'Compare two Direction Cards.');
    assert.notEqual(before, null);
  });
  test('T13 setNextStep for a direction not on the map changes nothing', () => {
    const p = v3(); const before = p.raw();
    assert.equal(p.S.m44.setNextStep(EC, 'x'), false);
    assert.equal(p.raw(), before);
  });
  test('T4b a removed direction comes back with an empty step (no hidden steps)', () => {
    const p = v3(); p.S.m44.addDirection(EC); p.S.m44.setNextStep(EC, 'Old step');
    p.S.m44.removeDirection(EC, { confirmed: true }); p.S.m44.addDirection(EC);
    assert.equal(map(p).mapDirections[0].nextStep, '');
    assert.equal(p.raw().includes('Old step'), false);
  });
});

describe('4.4 · completion (R-COMP)', () => {
  test('C1 Directions: every map direction needs a written step', () => {
    const p = v3(); p.S.m44.addDirection(EC); p.S.m44.addDirection(CS);
    assert.equal(p.S.m44.completionMet(), false);
    p.S.m44.setNextStep(EC, 'a'); assert.equal(p.S.m44.completionMet(), false);
    p.S.m44.setNextStep(CS, 'b'); assert.equal(p.S.m44.completionMet(), true);
  });
  test('C2 Still exploring: a written investigation step; Empty never completes', () => {
    const p = v3(); assert.equal(p.S.m44.completionMet(), false);
    p.S.m44.setStillExploring(true); assert.equal(p.S.m44.completionMet(), false);
    p.S.m44.setInvestigationStep('Look at two cards'); assert.equal(p.S.m44.completionMet(), true);
  });
  test('C3 no 4.1 clues, no 4.2 records and no 4.3 data never block the still-exploring route', () => {
    const p = openPage({ page: 'state' });
    p.S.m44.setStillExploring(true); p.S.m44.setInvestigationStep('Examine one more direction.');
    assert.equal(p.S.m44.completionMet(), true);
    p.S.markModuleComplete('4-4');
    assert.ok(p.stored().modules['4-4'].completedAt);
  });
  test('C4 completedAt is kept after the map is made Empty', () => {
    const p = withProfile(F.profileV4Full); const at = map(p).completedAt;
    p.S.m44.removeDirection(EC, { confirmed: true });
    p.S.markModuleComplete('4-4');
    assert.equal(map(p).completedAt, at);
  });
});

describe('4.4 · SOURCE-RECORD IMMUTABILITY (D7)', () => {
  test('IM1 every m44 call, refused or confirmed, leaves 4.1–4.3 and the top-level records deep-equal', () => {
    const p = withProfile(F.profileV4Full); const before = sources(p);
    const A = p.S.m44;
    A.setWhereIAmNow('x'); A.setNextStep(EC, 'y'); A.addDirection(CS); A.addDirection(BK); A.addDirection(AMZ);
    A.removeDirection(CS); A.removeDirection(EC); A.removeDirection(EC, { confirmed: true }); A.setStillExploring(true);
    A.setStillExploring(true, { confirmed: true }); A.setInvestigationStep('z'); A.setStillExploring(false); A.addDirection(EC);
    A.setNextStep(EC, 'q'); A.setStillExploring(true); A.setStillExploring(true, { confirmed: true }); A.completionMet(); A.map(); A.state(); A.hasWrittenStep(EC);
    p.S.markModuleComplete('4-4'); p.S.setLastSection('4-4', 'map');
    assert.deepEqual(sources(p), before);
    assert.deepEqual(sources(p.reopen()), before, 'after a reload too');
  });
  test('IM2 on a profile without 4.2/4.3, m44 calls never create them', () => {
    const p = withProfile(F.profileV1);
    p.S.m44.addDirection(EC); p.S.m44.setStillExploring(true); p.S.m44.setInvestigationStep('a'); p.S.m44.setWhereIAmNow('b'); p.S.m44.map();
    const s = p.stored();
    assert.equal(s.modules['4-2'], undefined); assert.equal(s.modules['4-3'], undefined);
    assert.deepEqual(Object.keys(s.modules).sort(), ['4-1', '4-4']);
  });
});

describe('4.4 · backup, summary and Restore (R-BK)', () => {
  test('SU1 summary adds module44Complete; Restore ignores a misleading summary', async () => {
    const p = withProfile(F.profileV4Full);
    assert.deepEqual(plain(p.S.SUMMARY(p.S._state())), { workClues: 4, module41Complete: true, module42Complete: true, module43Complete: true, module44Complete: true, experiences: 2, schemaVersion: 4 });
    const b = JSON.parse(json(F.backups.v4)); b.summary = { module44Complete: false, workClues: 0 };
    const q = openPage({ page: 'state' }); assert.equal(await q.restoreText(json(b)), 'restored');
    assert.ok(q.stored().modules['4-4'].completedAt);
  });
  test('BK1 the Restore confirmation names Module 4.4 and says the map is replaced', async () => {
    const p = openPage({ page: 'state', confirm: false });
    await p.restoreText(json(F.backups.v4));
    assert.match(p.dialogs.confirms[0], /\nModule 4\.3: complete\nModule 4\.4: complete\n/);
    assert.match(p.dialogs.confirms[0], /currently saved in this browser, including your Direction Map\./);
    const q = openPage({ page: 'state', confirm: false });
    await q.restoreText(json(F.backups.v3));
    assert.match(q.dialogs.confirms[0], /\nModule 4\.4: in progress or not started\n/);
  });
  test('BK2 restoring a v3 backup over a map: Cancel keeps storage byte-identical; OK removes the map', async () => {
    const no = withProfile(F.profileV4Full, { confirm: false }); const before = no.raw();
    assert.equal(await no.restoreText(json(F.backups.v3)), 'not-restored');
    assert.equal(no.raw(), before);
    const yes = withProfile(F.profileV4Full, { confirm: true });
    assert.equal(await yes.restoreText(json(F.backups.v3)), 'restored');
    assert.equal(yes.stored().modules['4-4'], undefined);
  });
  test('BK3 a hidden investigation step survives Export → Restore in the Directions state', async () => {
    const a = withProfile(F.profileV4Full); a.S.exportProgress();
    const r = openPage({ page: 'state' }); await r.restoreText(await a.downloadText(0));
    assert.deepEqual([r.S.m44.state(), map(r).investigationStep], ['directions', 'Compare two Direction Cards.']);
  });
  test('BK4 Clear removes the map with everything else (unchanged behaviour)', () => {
    const p = withProfile(F.profileV4Full, { confirm: true });
    p.S.clearProgress(() => {});
    assert.equal(p.raw(), null);
    assert.equal(p.S.m44.state(), 'empty');
  });
});

describe('4.4 · GUARD and ROLLBACK (R-REL)', () => {
  for (const raw of [F.RAW.newer, F.RAW.malformed, '']) {
    test('G1 while blocked (' + (raw === F.RAW.newer ? 'newer' : raw ? 'unreadable' : 'empty string') + '), m44 writes never reach storage', () => {
      const p = openPage({ page: 'state', storage: { [KEY]: raw } });
      assert.ok(p.S.saveBlocked());
      p.S.m44.setWhereIAmNow('a'); p.S.m44.setStillExploring(true); p.S.m44.setInvestigationStep('b'); p.S.markModuleComplete('4-4');
      assert.equal(p.raw(), raw);
    });
  }
  test('G2 another tab saving newer data stops this tab before it overwrites it', () => {
    const p = v3(); p.S.m44.setStillExploring(true);
    p.window.localStorage.setItem(KEY, F.RAW.newer);
    p.S.m44.setInvestigationStep('typed after the other tab saved');
    assert.equal(p.raw(), F.RAW.newer);
    assert.equal(p.S.saveBlocked(), 'newer');
  });
  test('RB1b the committed ee27fd0 copy is unchanged (hash, line endings ignored)', () => {
    const text = readFileSync(LEGACY_GUARD, 'utf8').replace(/\r\n/g, '\n');
    assert.equal(createHash('sha256').update(text, 'utf8').digest('hex'), '6e6b5ba2cd2178cfc92c399cd5037ddaa269926aed6732c1e818d2aea1a70c50');
  });
  test('RB2b guard-release code (ee27fd0) with v4 progress: newer, byte-identical, download offered, restorable by v4', async () => {
    const raw = json(F.profileV4Full);
    const p = openPage({ page: 'state', storage: { [KEY]: raw }, stateFile: LEGACY_GUARD });
    assert.equal(p.S.saveBlocked(), 'newer');
    p.S.markExplored('dir-ndis'); p.S.setReaction('direction', AMZ, 'explore'); p.S.addExperience('work');
    assert.equal(p.raw(), raw);
    p.$$('#storageBanner button').find((b) => /Download saved data/.test(b.textContent)).click();
    const b = JSON.parse(await p.downloadText(0));
    assert.deepEqual(b.data, F.profileV4Full);
    const back = openPage({ page: 'state' });
    assert.equal(await back.restoreText(json(b)), 'restored');
    const s = storedNoMeta(back), want = JSON.parse(raw); delete want._meta;
    assert.deepEqual(s, want);
  });
  test('RB3 the committed 4.3-release copy (de481a0) matches its hash (line endings ignored)', () => {
    const text = readFileSync(LEGACY_43, 'utf8').replace(/\r\n/g, '\n');
    assert.equal(createHash('sha256').update(text, 'utf8').digest('hex'), '71a0a3aa88ce1437f17affab68434ec92fa3ec939ecdc1cae773764ae47c28cc');
  });
  test('RB4 4.3-release code (de481a0) with v4 progress: newer, byte-identical, wraps it as backup 3, and v4 restores it unchanged', async () => {
    const raw = json(F.profileV4Full);
    const p = openPage({ page: 'state', storage: { [KEY]: raw }, stateFile: LEGACY_43 });
    assert.equal(p.S.SCHEMA_VERSION, 3);
    assert.equal(p.S.saveBlocked(), 'newer');
    p.S.m43.examine('dir-ndis'); p.S.m43.setJudgment(EC, 'unsure'); p.S.setReaction('direction', AMZ, 'explore'); p.S.addExperience('work');
    assert.equal(p.raw(), raw, 'never overwritten');
    p.$$('#storageBanner button').find((b) => /Download saved data/.test(b.textContent)).click();
    const b = JSON.parse(await p.downloadText(0));
    assert.equal(b.version, 3);
    assert.deepEqual(b.data, F.profileV4Full);
    const back = openPage({ page: 'state' });
    assert.equal(await back.restoreText(json(b)), 'restored');
    const s = storedNoMeta(back), want = JSON.parse(raw); delete want._meta;
    assert.deepEqual(s, want);
  });
});
