/* Module 4.3 shared state (public/shared/state.js, schema v3) against Production
   Specification v1.5. Every test here executes the real state layer. */
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
const m43 = (p) => plain(p.S._state().modules['4-3']);
const ex = (p, id) => plain(p.S.m43.exploration(id));
const EXPLORATION_KEYS = ['directionId', 'judgment', 'reason', 'reasonSkipped', 'relatedEvidenceIds', 'whatMayBeNew', 'learningQuestions', 'savedAt'];
const MODULE_KEYS = ['lastSection', 'completedAt', 'reviewedWorkClues', 'reviewedEvidence', 'examinedDirectionIds', 'directionExplorations', 'decisionReached', 'undecided', 'undecidedNote', 'selectedDirectionIds'];
const LEGACY_GUARD = fileURLToPath(new URL('../fixtures/legacy/state-ee27fd0.js', import.meta.url));

describe('4.3 · migration, schema v3 and round trip', () => {
  test('M1 v1 and v2 data load as v3 with 4.1/4.2 equal to the golden snapshots; no 4.3 block is invented', () => {
    for (const [prof, g] of [[F.profileV1, 'profileV1.load.json'], [F.profileV2Full, 'profileV2Full.load.json']]) {
      const p = withProfile(prof);
      assert.deepEqual(plain(p.S._state()), goldenNow(g));
      assert.equal(m43(p), undefined);
    }
  });
  test('M2 a "4-3" key inside v2 data is never trusted (dropped by the migration)', () => {
    const p = withProfile(F.profileV2Tampered);
    assert.deepEqual(plain(p.S._state()), goldenNow('profileV2Tampered.load.json'));
    assert.equal(m43(p), undefined);
  });
  test('M3 first save after loading v2 writes schema 3 and keeps 4.1/4.2 exactly', () => {
    const p = withProfile(F.profileV2Full);
    p.S.m43.examine('dir-ndis');
    const s = p.stored();
    assert.equal(s.schemaVersion, 3);
    assert.deepEqual(s.modules['4-1'], goldenNow('profileV2Full.load.json').modules['4-1']);
    assert.deepEqual(s.modules['4-2'], goldenNow('profileV2Full.load.json').modules['4-2']);
    assert.deepEqual(s.workClues, goldenNow('profileV2Full.load.json').workClues);
  });
  test('M4 a valid v3 profile loads unchanged (normalization is idempotent)', () => {
    const p = withProfile(F.profileV3Full);
    assert.deepEqual(plain(p.S._state()), F.profileV3Full);
    p.S.m43.examine('dir-ndis');
    const again = withProfile(p.stored());
    assert.deepEqual(plain(again.S._state()), p.stored());
  });
  test('M5 Export → Restore in a fresh browser reproduces every 4.3 field', async () => {
    const a = withProfile(F.profileV3Full);
    a.S.exportProgress();
    const text = await a.downloadText(0);
    const b = JSON.parse(text);
    assert.equal(b.version, 3);
    assert.equal(b.data.schemaVersion, 3);
    const fresh = openPage({ page: 'state' });
    assert.equal(await fresh.restoreText(text), 'restored');
    const s = fresh.stored(); const want = plain(a.S._state());
    delete s._meta; delete want._meta;
    assert.deepEqual(s, want);
  });
  test('M6 wrappers v1–v3 restore; wrapper v4 and data schema 4 are rejected with state unchanged', async () => {
    const p = openPage({ page: 'state' });
    for (const b of [F.backups.v1, F.backups.v2, F.backups.v3]) assert.equal(p.S.validateBackup(b).ok, true);
    assert.equal(p.S.validateBackup(F.backups.futureWrapper).ok, false);
    assert.equal(p.S.validateBackup(F.backups.futureData).ok, false);
    const q = withProfile(F.profileV3Full); const before = q.raw();
    assert.equal(await q.restoreText(json(F.backups.futureData)), 'not-restored');
    assert.equal(q.raw(), before);
  });
  test('M7 Restore confirmation names Module 4.3', async () => {
    const p = openPage({ page: 'state', confirm: false });
    await p.restoreText(json(F.backups.v3));
    assert.match(p.dialogs.confirms[0], /\nModule 4\.3: complete\n/);
    const q = openPage({ page: 'state', confirm: false });
    await q.restoreText(json(F.backups.v2));
    assert.match(q.dialogs.confirms[0], /\nModule 4\.3: in progress or not started\n/);
  });
});

describe('4.3 · ROLLBACK safety (Phase 0 guard release ee27fd0 meets v3 data)', () => {
  test('RB1 the committed legacy copy matches the guard release state.js (line endings ignored)', () => {
    /* Git on Windows may check text files out with CRLF line endings; the code is the same.
       Hash the content with LF line endings, as committed (see .gitattributes). */
    const text = readFileSync(LEGACY_GUARD, 'utf8').replace(/\r\n/g, '\n');
    const sha = createHash('sha256').update(text, 'utf8').digest('hex');
    assert.equal(sha, '6e6b5ba2cd2178cfc92c399cd5037ddaa269926aed6732c1e818d2aea1a70c50');
  });
  test('RB2 guard-release code treats v3 progress as newer: kept byte-identical, Download saved data offered', async () => {
    const raw = json(F.profileV3Full);
    const p = openPage({ page: 'state', storage: { [KEY]: raw }, stateFile: LEGACY_GUARD });
    assert.equal(p.S.saveBlocked(), 'newer');
    p.S.markExplored('dir-ndis'); p.S.setReaction('direction', 'dir-amazon', 'explore'); p.S.addExperience('work');
    assert.equal(p.raw(), raw);
    p.$$('#storageBanner button').find((b) => /Download saved data/.test(b.textContent)).click();
    const b = JSON.parse(await p.downloadText(0));
    assert.deepEqual(b.data, F.profileV3Full);
    const back = openPage({ page: 'state' });
    assert.equal(back.S.validateBackup(b).ok, true, 'the v3 code can restore what the old guard downloaded');
  });
});

describe('4.3 · RESTORE INTEGRITY (gate): payload.summary is never used by Restore', () => {
  async function restoreWith(backup, summary) {
    const p = withProfile(F.profileV1);
    const b = JSON.parse(json(backup));
    if (summary === undefined) delete b.summary; else b.summary = summary;
    const r = await p.restoreText(json(b));
    const s = p.stored(); delete s._meta;
    return { r, state: s, msg: p.dialogs.confirms[0] };
  }
  for (const [name, backup] of [['v3 backup with 4.3 data', F.backups.v3], ['v2 backup', F.backups.v2]]) {
    test(`RI ${name}: missing, altered, null, text and misleading summaries restore identically`, async () => {
      const base = await restoreWith(backup, (await (async () => { const p = withProfile(backup.data); return plain(p.S.SUMMARY(p.S._state())); })()));
      assert.equal(base.r, 'restored');
      for (const v of [undefined, { totally: 'wrong' }, null, 'junk', 42, [], { workClues: 999, module41Complete: false, module42Complete: false, module43Complete: true, experiences: 0, schemaVersion: 9 }]) {
        const x = await restoreWith(backup, v);
        assert.equal(x.r, 'restored', 'restored with summary ' + JSON.stringify(v));
        assert.deepEqual(x.state, base.state, 'same restored state for summary ' + JSON.stringify(v));
        assert.equal(x.msg, base.msg, 'same confirmation message for summary ' + JSON.stringify(v));
      }
    });
  }
});

describe('4.3 · D16 reason switching (state layer)', () => {
  const fresh = () => withProfile(F.profileV2Full);
  test('D16-1 typing a reason while "no reason yet" is chosen saves the reason and clears the flag', () => {
    const p = fresh();
    assert.equal(p.S.m43.skipReason('dir-amazon'), 'skipped');
    p.S.m43.setReason('dir-amazon', 'It looks interesting');
    assert.deepEqual([ex(p, 'dir-amazon').reason, ex(p, 'dir-amazon').reasonSkipped], ['It looks interesting', false]);
  });
  test('D16-2 choosing "no reason yet" with an empty field sets the flag without asking', () => {
    const p = fresh();
    assert.equal(p.S.m43.skipReason('dir-amazon'), 'skipped');
    assert.equal(ex(p, 'dir-amazon').reasonSkipped, true);
  });
  test('D16-3 with a reason written, skipping needs confirmation; unconfirmed leaves the reason byte-identical', () => {
    const p = fresh();
    p.S.m43.setReason('dir-amazon', 'My reason');
    const before = p.raw();
    assert.equal(p.S.m43.skipReason('dir-amazon'), 'needs-confirm');
    assert.equal(p.raw(), before);
    assert.equal(p.S.m43.skipReason('dir-amazon', { confirmed: true }), 'skipped');
    assert.deepEqual([ex(p, 'dir-amazon').reason, ex(p, 'dir-amazon').reasonSkipped], ['', true]);
  });
  test('D16-4 blank-space text is never a reason; both answers are never active, across reload and Export/Restore', async () => {
    const p = fresh();
    p.S.m43.skipReason('dir-amazon');
    p.S.m43.setReason('dir-amazon', '   \n\t ');
    assert.deepEqual([ex(p, 'dir-amazon').reason, ex(p, 'dir-amazon').reasonSkipped], ['', true]);
    p.S.m43.setReason('dir-amazon', 'Real');
    p.S.m43.skipReason('dir-amazon', { confirmed: true });
    p.S.m43.setReason('dir-amazon', 'Again');
    const check = (st) => st.modules['4-3'].directionExplorations.forEach((x) => assert.ok(!(x.reason && x.reasonSkipped)));
    check(p.stored());
    check(plain(p.reopen('state').S._state()));
    p.S.exportProgress();
    const q = openPage({ page: 'state' });
    await q.restoreText(await p.downloadText(0));
    check(q.stored());
  });
  test('D16-5 emptying the field leaves neither answer active and an existing completion is kept', () => {
    const p = withProfile(F.profileV3Full);
    p.S.m43.setReason('dir-ecommerce', '');
    assert.deepEqual([ex(p, 'dir-ecommerce').reason, ex(p, 'dir-ecommerce').reasonSkipped], ['', false]);
    assert.equal(m43(p).completedAt, F.profileV3Full.modules['4-3'].completedAt);
  });
  test('D16 unskipReason clears only the flag', () => {
    const p = fresh();
    p.S.m43.skipReason('dir-amazon'); p.S.m43.unskipReason('dir-amazon');
    assert.deepEqual([ex(p, 'dir-amazon').reason, ex(p, 'dir-amazon').reasonSkipped], ['', false]);
  });
});

describe('4.3 · D16 four-case normalization (load and restore)', () => {
  const rec = (reason, reasonSkipped) => {
    const prof = JSON.parse(json(F.profileV3Full));
    Object.assign(prof.modules['4-3'].directionExplorations[0], { reason, reasonSkipped });
    if (reasonSkipped === undefined) delete prof.modules['4-3'].directionExplorations[0].reasonSkipped;
    return prof;
  };
  const cases = [
    ['N1 real text + skip → keep cleaned text, flag off', rec('  Real reason  ', true), ['Real reason', false]],
    ['N2 blank-space text + skip → no reason, skip stands', rec('   ', true), ['', true]],
    ['N3a blank + no skip → neither', rec('', false), ['', false]],
    ['N3b blank-space + missing flag → neither', rec(' \n ', undefined), ['', false]],
    ['N4a real text + no skip → unchanged', rec('Real reason', false), ['Real reason', false]],
    ['N4b real text + missing flag → unchanged', rec('Real reason', undefined), ['Real reason', false]]
  ];
  for (const [name, prof, want] of cases) {
    test(name + ' (load)', () => {
      const x = ex(withProfile(prof), 'dir-ecommerce');
      assert.deepEqual([x.reason, x.reasonSkipped], want);
    });
    test(name + ' (restore)', async () => {
      const p = openPage({ page: 'state' });
      assert.equal(await p.restoreText(json({ ...F.backups.v3, data: prof })), 'restored');
      const x = p.stored().modules['4-3'].directionExplorations[0];
      assert.deepEqual([x.reason, x.reasonSkipped], want);
    });
  }
  test('N5 standard cleaning: trimmed, control characters including line breaks become spaces, capped at 300', () => {
    const p = withProfile(F.profileV2Full);
    p.S.m43.setReason('dir-amazon', '  line one\nline two\u0007end  ');
    assert.equal(ex(p, 'dir-amazon').reason, 'line one line two end');
    p.S.m43.setReason('dir-amazon', 'x'.repeat(400));
    assert.equal(ex(p, 'dir-amazon').reason.length, 300);
  });
});

describe('4.3 · limits (owner-approved)', () => {
  test('L1 what may be new ≤ 1000; question ≤ 140; ≤ 10 questions; undecided note ≤ 300', () => {
    const p = withProfile(F.profileV2Full);
    p.S.m43.setWhatMayBeNew('dir-amazon', 'w'.repeat(1200));
    assert.equal(ex(p, 'dir-amazon').whatMayBeNew.length, 1000);
    for (let i = 0; i < 10; i++) assert.equal(p.S.m43.addQuestion('dir-amazon', 'Q' + i + ' ' + 'q'.repeat(200)), true);
    assert.equal(p.S.m43.addQuestion('dir-amazon', 'eleventh'), false);
    assert.equal(ex(p, 'dir-amazon').learningQuestions.length, 10);
    assert.ok(ex(p, 'dir-amazon').learningQuestions.every((q) => q.length === 140));
    p.S.m43.setUndecidedNote('n'.repeat(500));
    assert.equal(m43(p).undecidedNote.length, 300);
  });
  test('L2 the same limits are enforced when loading or restoring stored data', () => {
    const prof = JSON.parse(json(F.profileV3Full));
    Object.assign(prof.modules['4-3'].directionExplorations[0], { reason: 'r'.repeat(999), whatMayBeNew: 'w'.repeat(5000), learningQuestions: Array.from({ length: 15 }, (_, i) => 'Q' + i + 'q'.repeat(300)).concat(['   ']) });
    prof.modules['4-3'].undecidedNote = 'n'.repeat(999);
    const x = ex(withProfile(prof), 'dir-ecommerce');
    assert.deepEqual([x.reason.length, x.whatMayBeNew.length, x.learningQuestions.length, x.learningQuestions[0].length], [300, 1000, 10, 140]);
    assert.equal(m43(withProfile(prof)).undecidedNote.length, 300);
  });
  test('L3 at most two directions selected; only saved explorations can be selected', () => {
    const p = withProfile(F.profileV2Full);
    for (const d of ['dir-amazon', 'dir-ndis', 'dir-technical']) { p.S.m43.setJudgment(d, 'unsure'); p.S.m43.saveReflection(d); }
    p.S.m43.setJudgment('dir-real-estate', 'unsure');                 // judged but not saved
    assert.equal(p.S.m43.setSelected('dir-real-estate', true), false);
    assert.equal(p.S.m43.setSelected('dir-amazon', true), true);
    assert.equal(p.S.m43.setSelected('dir-ndis', true), true);
    assert.equal(p.S.m43.setSelected('dir-technical', true), false);
    assert.deepEqual(m43(p).selectedDirectionIds, ['dir-amazon', 'dir-ndis']);
  });
  test('L4 a reflection cannot be saved without a judgment', () => {
    const p = withProfile(F.profileV2Full);
    p.S.m43.setReason('dir-amazon', 'text');
    assert.equal(p.S.m43.saveReflection('dir-amazon'), false);
    assert.equal(ex(p, 'dir-amazon').savedAt, null);
  });
});

describe('4.3 · validation of stored data', () => {
  test('V1 unknown directions, duplicate explorations, invalid judgments and bad selections are cleaned without losing learner text', () => {
    const prof = JSON.parse(json(F.profileV3Full));
    const m = prof.modules['4-3'];
    m.directionExplorations.push({ directionId: 'dir-astrology', judgment: 'unsure', savedAt: 'x' });
    m.directionExplorations.push({ ...m.directionExplorations[0], reason: 'duplicate' });
    m.directionExplorations[1].judgment = 'love_it';
    m.examinedDirectionIds.push('dir-nope', 'dir-ecommerce');
    m.selectedDirectionIds = ['dir-ecommerce', 'dir-customer-support', 'dir-bookkeeping', 'dir-nope'];
    const s = m43(withProfile(prof));
    assert.deepEqual(s.directionExplorations.map((x) => x.directionId), ['dir-ecommerce', 'dir-customer-support', 'dir-bookkeeping']);
    assert.equal(s.directionExplorations[0].reason, 'I liked handling orders.');
    assert.equal(s.directionExplorations[1].judgment, null);
    assert.deepEqual(s.directionExplorations[1].learningQuestions, ['Kept from before']);
    assert.deepEqual(s.examinedDirectionIds, ['dir-ecommerce', 'dir-customer-support', 'dir-bookkeeping']);
    assert.deepEqual(s.selectedDirectionIds, ['dir-ecommerce'], 'only saved, judged explorations stay selected');
  });
  test('V2 undecided and a selection are never both active: the selection stands and the note is kept', () => {
    const prof = JSON.parse(json(F.profileV3Full));
    Object.assign(prof.modules['4-3'], { undecided: true, undecidedNote: 'Need more info' });
    const s = m43(withProfile(prof));
    assert.deepEqual([s.undecided, s.selectedDirectionIds, s.undecidedNote], [false, ['dir-ecommerce'], 'Need more info']);
  });
  test('V3 choosing undecided clears the selection; selecting a direction clears undecided', () => {
    const p = withProfile(F.profileV3Full);
    p.S.m43.setUndecided(true);
    assert.deepEqual([m43(p).undecided, m43(p).selectedDirectionIds], [true, []]);
    p.S.m43.setSelected('dir-ecommerce', true);
    assert.deepEqual([m43(p).undecided, m43(p).selectedDirectionIds], [false, ['dir-ecommerce']]);
  });
  test('V4 stored keys are exactly the specified fields (no category, score, count or profile fields)', () => {
    const p = withProfile(F.profileV3Full);
    p.S.m43.setReason('dir-ndis', 'x'); p.S.m43.skipReason('dir-ndis', { confirmed: true });
    const s = p.stored().modules['4-3'];
    assert.deepEqual(Object.keys(s).sort(), [...MODULE_KEYS].sort());
    s.directionExplorations.forEach((x) => assert.deepEqual(Object.keys(x).sort(), [...EXPLORATION_KEYS].sort()));
  });
});

describe('4.3 · references to 4.2 tasks', () => {
  test('T1 only existing 4.2 task IDs can be selected', () => {
    const p = withProfile(F.profileV2Full);
    assert.equal(p.S.m43.setEvidence('dir-amazon', 'task-nope', true), false);
    assert.equal(p.S.m43.setEvidence('dir-amazon', 'task-aaa001', true), true);
    assert.deepEqual(ex(p, 'dir-amazon').relatedEvidenceIds, ['task-aaa001']);
  });
  test('T2 deleting a 4.2 task hides it at once and drops the reference on the next load; the exploration stays', () => {
    const p = withProfile(F.profileV3Full);
    assert.deepEqual(plain(p.S.m43.relatedTasks('dir-ecommerce').map((r) => r.task.id)), ['task-aaa002', 'task-bbb002']);
    p.S.deleteTask('exp-aaa001', 'task-aaa002');
    assert.deepEqual(plain(p.S.m43.relatedTasks('dir-ecommerce').map((r) => r.task.id)), ['task-bbb002']);
    const q = p.reopen('state');
    assert.deepEqual(ex(q, 'dir-ecommerce').relatedEvidenceIds, ['task-bbb002']);
    assert.equal(ex(q, 'dir-ecommerce').reason, 'I liked handling orders.');
  });
  test('T3 deleting a whole experience removes its references the same way', () => {
    const p = withProfile(F.profileV3Full);
    p.S.deleteExperience('exp-bbb001');
    const q = p.reopen('state');
    assert.deepEqual(ex(q, 'dir-ecommerce').relatedEvidenceIds, ['task-aaa002']);
    assert.deepEqual(ex(q, 'dir-bookkeeping').relatedEvidenceIds, []);
  });
});

describe('4.3 · learning questions and source records', () => {
  test('Q1 questions are kept when the judgment changes to Not for me right now; editing to blank is refused; removal is explicit', () => {
    const p = withProfile(F.profileV2Full);
    p.S.m43.setJudgment('dir-amazon', 'explore_further');
    p.S.m43.addQuestion('dir-amazon', 'What is Seller Central?');
    p.S.m43.setJudgment('dir-amazon', 'not_now');
    assert.deepEqual(ex(p, 'dir-amazon').learningQuestions, ['What is Seller Central?']);
    assert.equal(p.S.m43.updateQuestion('dir-amazon', 0, '   '), false);
    assert.deepEqual(ex(p, 'dir-amazon').learningQuestions, ['What is Seller Central?']);
    assert.equal(p.S.m43.removeQuestion('dir-amazon', 0), true);
    assert.deepEqual(ex(p, 'dir-amazon').learningQuestions, []);
  });
  test('S1 no 4.3 operation changes 4.1 Work Clues, observations or 4.2 records', () => {
    const p = withProfile(F.profileV2Full);
    const before = p.stored();
    const api = p.S.m43;
    api.setReviewedWorkClues(); api.setReviewedEvidence(); api.examine('dir-amazon'); api.setJudgment('dir-amazon', 'explore_further');
    api.setReason('dir-amazon', 'r'); api.skipReason('dir-amazon', { confirmed: true }); api.setEvidence('dir-amazon', 'task-aaa001', true);
    api.setWhatMayBeNew('dir-amazon', 'w'); api.addQuestion('dir-amazon', 'q'); api.saveReflection('dir-amazon'); api.setDecisionReached();
    api.setSelected('dir-amazon', true); api.setUndecided(true); api.setUndecidedNote('n');
    const after = p.stored();
    for (const k of ['workClues', 'scenarioObservations', 'jobPostObservations', 'exploredDirections']) assert.deepEqual(after[k], before[k], k);
    assert.deepEqual(after.modules['4-1'], before.modules['4-1']);
    assert.deepEqual(after.modules['4-2'], before.modules['4-2']);
  });
  test('S2 DIRECTION_IDS in state.js equals the canonical 4.1 Direction Card order', () => {
    const w = {}; new Function('window', readFileSync(new URL('../../public/shared/m41-data.js', import.meta.url), 'utf8'))(w);
    const p = openPage({ page: 'state' });
    assert.deepEqual(plain(p.S.DIRECTION_IDS), w.PVA_M41.DIRECTIONS.map((d) => d.id));
  });
});

describe('4.3 · shared backup summary', () => {
  test('SU1 the combined summary has exactly the six specified fields; 4.3 adds only module43Complete', () => {
    const p = withProfile(F.profileV3Full);
    assert.deepEqual(plain(p.S.SUMMARY(p.S._state())), { workClues: 4, module41Complete: true, module42Complete: true, module43Complete: true, experiences: 2, schemaVersion: 3 });
  });
  test('SU2 exportProgress() without a page function uses the shared summary', async () => {
    const p = withProfile(F.profileV3Full);
    p.S.exportProgress();
    assert.deepEqual(JSON.parse(await p.downloadText(0)).summary, plain(p.S.SUMMARY(p.S._state())));
  });
});
