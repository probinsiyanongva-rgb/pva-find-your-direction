/* Stage 4 shared state (public/shared/state.js).
   BASELINE tests describe behaviour learners already rely on; they must pass on the
   unchanged code (33c4e04) and after any change.
   GUARD tests describe the Phase 0 data-protection guard; they are expected to FAIL on
   the unchanged code (that failure is the proof of the data-loss bug). */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { openPage, settle, plain, KEY } from '../helpers/env.mjs';
import * as F from '../fixtures/fixtures.mjs';

const golden = (name) => JSON.parse(readFileSync(new URL('../fixtures/golden/' + name, import.meta.url), 'utf8'));
const withProfile = (profile, extra = {}) => openPage({ page: 'state', storage: { [KEY]: JSON.stringify(profile) }, ...extra });
const withRaw = (raw, extra = {}) => openPage({ page: 'state', storage: { [KEY]: raw }, ...extra });
const json = (o) => JSON.stringify(o);

describe('BASELINE · loading and migration', () => {
  test('B1 v1 profile loads exactly as the unchanged code loaded it (golden)', () => {
    const p = withProfile(F.profileV1);
    assert.deepEqual(plain(p.S._state()), golden('profileV1.load.json'));
    assert.equal(p.S._state().schemaVersion, 2);
    assert.equal(p.errors.length, 0, p.errors.join('\n'));
  });
  test('B2 full v2 profile (4.1 + 4.2 complete) loads unchanged (golden)', () => {
    const p = withProfile(F.profileV2Full);
    assert.deepEqual(plain(p.S._state()), golden('profileV2Full.load.json'));
    assert.equal(p.bannerVisible(), false);
  });
  test('B3 tampered v2 profile: invalid records dropped field by field, valid data kept (golden)', () => {
    const p = withProfile(F.profileV2Tampered);
    assert.deepEqual(plain(p.S._state()), golden('profileV2Tampered.load.json'));
  });
  test('B4 empty storage starts fresh with no banner; first save writes schema v2', () => {
    const p = openPage({ page: 'state' });
    assert.equal(p.raw(), null);
    assert.equal(p.bannerVisible(), false);
    p.S.markExplored('dir-ndis');
    assert.equal(p.stored().schemaVersion, 2);
    assert.deepEqual(p.stored().exploredDirections, ['dir-ndis']);
  });
});

describe('BASELINE · saving keeps existing learner data', () => {
  test('B5 saving a v2 profile keeps 4.1 and 4.2 exactly, adds only the change', () => {
    const p = withProfile(F.profileV2Full);
    p.S.markExplored('dir-ndis');
    const s = p.stored();
    const g = golden('profileV2Full.load.json');
    assert.deepEqual(s.modules, g.modules);
    assert.deepEqual(s.workClues, g.workClues);
    assert.deepEqual(s.exploredDirections, [...g.exploredDirections, 'dir-ndis']);
    assert.match(s._meta.updatedAt, /^\d{4}-\d\d-\d\dT/);
    assert.match(p.$('[data-save-state]').textContent, /^Saved in this browser/);
  });
  test('B6 saving a v1 profile writes v2 with 4.1 untouched', () => {
    const p = withProfile(F.profileV1);
    p.S.markExplored('dir-ndis');
    const s = p.stored();
    assert.equal(s.schemaVersion, 2);
    assert.deepEqual(s.modules['4-1'], F.profileV1.modules['4-1']);
    assert.equal(s.workClues.length, F.profileV1.workClues.length);
  });
  test('B7 Work Clues: one clue per source, the only reaction store', () => {
    const p = openPage({ page: 'state' });
    p.S.setReaction('direction', 'dir-amazon', 'explore');
    p.S.setReaction('direction', 'dir-amazon', 'unsure');
    p.S.setNote('direction', 'dir-amazon', 'hmm');
    assert.deepEqual(p.stored().workClues.map((c) => [c.id, c.reaction, c.note]), [['direction:dir-amazon', 'unsure', 'hmm']]);
    p.S.removeClue('direction', 'dir-amazon');
    assert.equal(p.stored().workClues.length, 0);
  });
});

describe('BASELINE · 4.2 experiences and tasks', () => {
  test('B8 task IDs are unique across experiences', () => {
    const p = openPage({ page: 'state' });
    const a = p.S.addExperience('work'), b = p.S.addExperience('school');
    const t1 = p.S.addTask(a.id, 'Answered emails', null), t2 = p.S.addTask(b.id, 'Made slides', null);
    assert.notEqual(t1.id, t2.id);
    assert.equal(p.S.addTask(a.id, 'Answered customer questions', 'p-answered-questions').id, p.S.addTask(a.id, 'x', 'p-answered-questions').id, 'a prompt is added once per experience');
  });
  test('B9 deleting a task removes only that task; deleting an experience removes its tasks', () => {
    const p = withProfile(F.profileV2Full);
    p.S.deleteTask('exp-aaa001', 'task-aaa003');
    assert.deepEqual(p.stored().modules['4-2'].experiences[0].tasks.map((t) => t.id), ['task-aaa001', 'task-aaa002']);
    p.S.deleteExperience('exp-bbb001');
    assert.deepEqual(p.stored().modules['4-2'].experiences.map((x) => x.id), ['exp-aaa001']);
  });
  test('B10 module completion is kept after deleting all 4.2 data', () => {
    const p = withProfile(F.profileV2Full);
    p.S.deleteExperience('exp-aaa001');
    p.S.deleteExperience('exp-bbb001');
    const m = p.stored().modules['4-2'];
    assert.equal(m.experiences.length, 0);
    assert.equal(m.completedAt, F.profileV2Full.modules['4-2'].completedAt);
    assert.equal(p.stored().modules['4-1'].completedAt, F.profileV2Full.modules['4-1'].completedAt);
  });
});

describe('BASELINE · Export / Restore / Clear', () => {
  test('B11 v1 and v2 backups validate to the same data as the unchanged code (golden)', () => {
    const p = openPage({ page: 'state' });
    assert.deepEqual(plain(p.S.validateBackup(F.backups.v1).data), golden('backup-v1.restore.json'));
    assert.deepEqual(plain(p.S.validateBackup(F.backups.v2).data), golden('backup-v2.restore.json'));
  });
  test('B12 other-course, newer-wrapper, newer-data and empty backups are rejected with clear messages', () => {
    const p = openPage({ page: 'state' });
    const msg = (b) => plain(p.S.validateBackup(b));
    assert.deepEqual(msg(F.backups.otherCourse), { ok: false, error: 'Backups from other PVA courses cannot be restored here.' });
    assert.equal(msg(F.backups.futureWrapper).ok, false);
    assert.match(msg(F.backups.futureWrapper).error, /newer version/);
    assert.equal(msg(F.backups.futureData).ok, false);
    assert.match(msg(F.backups.futureData).error, /newer version/);
    assert.equal(msg(F.backups.missingData).ok, false);
    assert.equal(msg({ hello: 1 }).ok, false);
  });
  for (const [name, text] of Object.entries({ otherCourse: json(F.backups.otherCourse), futureWrapper: json(F.backups.futureWrapper), futureData: json(F.backups.futureData), notJson: F.backups.notJson })) {
    test(`B13 restoring a rejected file (${name}) changes nothing and asks nothing`, async () => {
      const p = withProfile(F.profileV2Full);
      const before = p.raw();
      assert.equal(await p.restoreText(text), 'not-restored');
      assert.equal(p.raw(), before);
      assert.equal(p.dialogs.confirms.length, 0);
      assert.equal(p.dialogs.alerts.length, 1);
    });
  }
  test('B14 restoring a valid backup asks first; Cancel keeps current progress', async () => {
    const p = withProfile(F.profileV1, { confirm: false });
    const before = p.raw();
    assert.equal(await p.restoreText(json(F.backups.v2)), 'not-restored');
    assert.equal(p.raw(), before);
    assert.match(p.dialogs.confirms[0], /Work Clues: 4/);
    assert.match(p.dialogs.confirms[0], /Module 4\.2: complete \(2 experiences\)/);
    assert.match(p.dialogs.confirms[0], /REPLACES the Stage 4 progress/);
  });
  test('B15 restoring a valid backup with OK replaces progress with the backup', async () => {
    const p = withProfile(F.profileV1);
    assert.equal(await p.restoreText(json(F.backups.v2)), 'restored');
    const s = p.stored();
    const g = golden('backup-v2.restore.json');
    assert.deepEqual(s.modules, g.modules);
    assert.deepEqual(s.workClues, g.workClues);
  });
  test('B16 export produces the documented backup format containing the current data', async () => {
    const p = withProfile(F.profileV2Full);
    p.S.exportProgress();
    assert.equal(p.downloads.length, 1);
    assert.match(p.downloads[0].filename, /^Find-Your-Direction-progress-backup-\d{4}-\d\d-\d\d\.json$/);
    const b = JSON.parse(await p.downloadText(0));
    assert.equal(b.format, F.BACKUP_FORMAT);
    assert.equal(b.version, 2);
    assert.equal(b.storageKey, KEY);
    assert.deepEqual(b.data.modules, golden('profileV2Full.load.json').modules);
    assert.equal(p.S.validateBackup(b).ok, true, 'an export restores');
  });
  test('B17 Clear asks first; Cancel keeps progress, OK removes it', () => {
    const keep = withProfile(F.profileV2Full, { confirm: false });
    keep.S.clearProgress(() => {});
    assert.notEqual(keep.raw(), null);
    const clear = withProfile(F.profileV2Full, { confirm: true });
    clear.S.clearProgress(() => {});
    assert.equal(clear.raw(), null);
    assert.match(clear.dialogs.confirms[0], /cannot be undone/);
  });
});

describe('BASELINE · storage unavailable', () => {
  test('B18 blocked site data: course still works in memory and shows the existing banner', () => {
    const p = openPage({ page: 'state', storageThrows: true });
    assert.equal(p.S.storageOK(), false);
    assert.equal(p.bannerVisible(), true);
    assert.match(p.bannerText(), /Progress can't be saved in this browser/);
    assert.doesNotThrow(() => { p.S.setReaction('direction', 'dir-amazon', 'explore'); p.S.addExperience('work'); });
    assert.equal(p.S.clues().length, 1);
  });
});

/* ------------------------------------------------------------------ */
/* GUARD (Phase 0). Expected to FAIL on the unchanged code 33c4e04.   */
/* ------------------------------------------------------------------ */
const UNREADABLE = {
  'newer schema (v3)': F.RAW.v3,
  'malformed JSON': F.RAW.malformed,
  'schemaVersion is a string': F.RAW.versionString,
  'schemaVersion 0': F.RAW.versionZero,
  'schemaVersion 2.5': F.RAW.versionFraction,
  'not an object': F.RAW.notAnObject
};

describe('GUARD · saved progress that cannot be read is never overwritten', () => {
  for (const [label, raw] of Object.entries(UNREADABLE)) {
    test(`G1 ${label}: stays byte-identical after the learner keeps working`, () => {
      const p = withRaw(raw);
      p.S.markExplored('dir-ecommerce');
      p.S.setReaction('direction', 'dir-amazon', 'explore');
      p.S.addExperience('work');
      p.S.setLastSection('4-1', 'patterns');
      assert.equal(p.raw(), raw);
    });
  }
  test('G2 the page says why saving is paused and offers "Download saved data"', () => {
    const p = withRaw(F.RAW.v3);
    assert.equal(p.bannerVisible(), true);
    assert.match(p.bannerText(), /newer version/i);
    const btn = p.$$('#storageBanner button').find((b) => /Download saved data/.test(b.textContent));
    assert.ok(btn, 'banner has a Download saved data button');
    p.S.markExplored('dir-ecommerce');
    assert.doesNotMatch(p.$('[data-save-state]').textContent, /^Saved in this browser/);
    assert.equal(p.S.saveBlocked(), 'newer');
  });
  test('G3 malformed data gets the "could not be read" wording', () => {
    const p = withRaw(F.RAW.malformed);
    assert.equal(p.S.saveBlocked(), 'unreadable');
    assert.match(p.bannerText(), /could not be read/i);
  });
  test('G4 "Download saved data" for newer data gives a backup a newer version can restore', async () => {
    const p = withRaw(F.RAW.v3);
    p.$$('#storageBanner button').find((b) => /Download saved data/.test(b.textContent)).click();
    assert.equal(p.downloads.length, 1);
    assert.match(p.downloads[0].filename, /^Find-Your-Direction-saved-data-\d{4}-\d\d-\d\d\.json$/);
    const b = JSON.parse(await p.downloadText(0));
    assert.equal(b.format, F.BACKUP_FORMAT);
    assert.ok(b.version <= 2, 'wrapper version this and later versions accept');
    assert.deepEqual(b.data, F.profileV3Future, 'saved data is carried exactly as stored');
    assert.equal(p.S.validateBackup(b).ok, false, 'this version still refuses to apply it');
  });
  test('G5 "Download saved data" for unreadable text keeps the exact stored text', async () => {
    const p = withRaw(F.RAW.malformed);
    p.$$('#storageBanner button').find((b) => /Download saved data/.test(b.textContent)).click();
    const b = JSON.parse(await p.downloadText(0));
    assert.equal(b.rawText, F.RAW.malformed);
    assert.equal(b.storageKey, KEY);
  });
  test('G6 another tab (or newer version) writes newer data mid-session: this tab stops saving instead of overwriting', () => {
    const p = withProfile(F.profileV2Full);
    p.S.markExplored('dir-ndis');
    assert.equal(p.stored().schemaVersion, 2, 'normal saving before the other tab writes');
    p.window.localStorage.setItem(KEY, F.RAW.v3);
    p.S.setReaction('direction', 'dir-amazon', 'unsure');
    assert.equal(p.raw(), F.RAW.v3);
    assert.equal(p.S.saveBlocked(), 'newer');
    assert.equal(p.bannerVisible(), true);
  });
  test('G7 Clear while blocked warns about the unreadable data; Cancel keeps it', () => {
    const p = withRaw(F.RAW.v3, { confirm: false });
    p.S.clearProgress(() => {});
    assert.equal(p.raw(), F.RAW.v3);
    assert.match(p.dialogs.confirms[0], /Download saved data/);
  });
  test('G8 Clear while blocked with OK removes it, lifts the guard, and saving resumes', () => {
    const p = withRaw(F.RAW.v3, { confirm: true });
    p.S.clearProgress(() => {});
    assert.equal(p.raw(), null);
    assert.equal(p.S.saveBlocked(), null);
    assert.equal(p.bannerVisible(), false);
    p.S.markExplored('dir-ndis');
    assert.equal(p.stored().schemaVersion, 2);
  });
  test('G9 Restore while blocked warns before replacing; Cancel keeps the unreadable data', async () => {
    const p = withRaw(F.RAW.v3, { confirm: false });
    assert.equal(await p.restoreText(json(F.backups.v2)), 'not-restored');
    assert.equal(p.raw(), F.RAW.v3);
    assert.match(p.dialogs.confirms[0], /Download saved data/);
  });
  test('G10 Restore while blocked with OK replaces it and saving resumes', async () => {
    const p = withRaw(F.RAW.v3, { confirm: true });
    assert.equal(await p.restoreText(json(F.backups.v2)), 'restored');
    assert.equal(p.stored().schemaVersion, 2);
    assert.equal(p.S.saveBlocked(), null);
    p.S.markExplored('dir-ndis');
    assert.ok(p.stored().exploredDirections.includes('dir-ndis'));
  });
  test('G11 a second tab opened later is also blocked and also leaves the data alone', () => {
    const a = withRaw(F.RAW.v3);
    const b = a.reopen('state');
    b.S.addExperience('family');
    assert.equal(b.raw(), F.RAW.v3);
  });
});
