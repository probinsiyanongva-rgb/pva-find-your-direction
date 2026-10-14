/* Page-level regression tests: the real HTML + scripts of the hub, Progress page,
   Module 4.1 and Module 4.2, driven through their own controls in jsdom.
   BASELINE tests must pass before and after Phase 0. The GUARD tests at the end are
   expected to FAIL on the unchanged code. jsdom does not do layout, so responsive and
   visual checks live in the Playwright suite (tests/e2e). */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { openPage, settle, plain, KEY } from '../helpers/env.mjs';
import * as F from '../fixtures/fixtures.mjs';

const CANONICAL = ['dir-general-admin', 'dir-customer-support', 'dir-ecommerce', 'dir-amazon', 'dir-bookkeeping', 'dir-social-content',
  'dir-executive-assistant', 'dir-real-estate', 'dir-lead-generation', 'dir-technical', 'dir-ndis'];
const seed = (profile) => ({ [KEY]: JSON.stringify(profile) });
const noErrors = (p) => assert.deepEqual(p.errors, []);
const text = (p, sel) => (p.$(sel) ? p.$(sel).textContent.replace(/\s+/g, ' ').trim() : null);

describe('BASELINE · Stage 4 hub and Progress page', () => {
  test('P1 hub, new learner: nothing started, Start Module 4.1, 4.3/4.4 coming later', () => {
    const p = openPage({ page: 'index' });
    noErrors(p);
    assert.equal(text(p, '#stamp41'), 'Not started');
    assert.equal(text(p, '#stamp42'), 'Not started');
    assert.equal(text(p, '#continueBtn'), 'Start Module 4.1');
    assert.equal(p.$('#continueBtn').getAttribute('href'), './4-1/');
    assert.equal(p.$$('li.later').length, 2);
    assert.equal(text(p, '#homeSummary'), 'Module 4.1 not started yet · Module 4.2 not started yet · 0 Work Clues saved');
    assert.equal(p.raw(), null, 'opening the hub saves nothing');
  });
  test('P2 hub, 4.1 and 4.2 complete: both Complete, Review Module 4.2', () => {
    const p = openPage({ page: 'index', storage: seed(F.profileV2Full) });
    noErrors(p);
    assert.equal(text(p, '#stamp41'), 'Complete');
    assert.equal(text(p, '#stamp42'), 'Complete');
    assert.equal(text(p, '#continueBtn'), 'Review Module 4.2');
    assert.equal(text(p, '#homeSummary'), 'Module 4.1 complete · Module 4.2 complete · 4 Work Clues saved');
  });
  test('P3 Progress page, 4.1 complete only (v1 data): Start Module 4.2', () => {
    const p = openPage({ page: 'progress', storage: seed(F.profileV1) });
    noErrors(p);
    assert.equal(text(p, '#homeSummary'), 'Module 4.1 complete · Module 4.2 not started yet · 4 Work Clues saved');
    assert.equal(text(p, '#continueBtn'), 'Start Module 4.2');
    assert.equal(p.$('#continueBtn').getAttribute('href'), '../4-2/');
  });
  test('P4 hub Export button downloads a backup', async () => {
    const p = openPage({ page: 'index', storage: seed(F.profileV2Full) });
    p.click('[data-export]');
    const b = JSON.parse(await p.downloadText(0));
    assert.equal(b.format, F.BACKUP_FORMAT);
    assert.deepEqual(b.summary, { workClues: 4, module41Complete: true, module42Complete: true, experiences: 2, schemaVersion: F.EXPECTED.schema });
  });
});

describe('BASELINE · Module 4.1', () => {
  test('P5 renders 4 job posts, 5 scenarios and the 11 Direction Cards in canonical order', () => {
    const p = openPage({ page: '4-1' });
    noErrors(p);
    assert.equal(p.$$('#postList article.s4-post').length, 4);
    assert.equal(p.$$('#scenarioList article.s4-scenario').length, 5);
    assert.deepEqual(p.$$('#directionList article.s4-dir').map((a) => a.id), CANONICAL);
  });
  test('P6 a new learner completes 4.1 through the page controls, and it stays complete on reopen', () => {
    const p = openPage({ page: '4-1' });
    for (const post of p.$$('#postList article.s4-post')) {
      p.check(post.querySelector('input[type=checkbox]'));
      post.querySelector('.s4-actions button').click();
    }
    for (const scn of p.$$('#scenarioList article.s4-scenario')) {
      p.check(scn.querySelector('input[type=checkbox]'));
      scn.querySelector('.s4-actions button').click();
    }
    assert.notEqual(text(p, '#moduleProgress'), 'Module 4.1 complete', 'not complete before a Work Clue and Continue');
    p.check(p.$('#dir-bookkeeping fieldset.s4-reaction input[value=not_for_me]'));
    p.click('#directionsDone');
    noErrors(p);
    assert.equal(text(p, '#moduleProgress'), 'Module 4.1 complete');
    const s = p.stored();
    assert.equal(s.schemaVersion, F.EXPECTED.schema);
    assert.match(s.modules['4-1'].completedAt, /^\d{4}-/);
    assert.deepEqual(s.workClues.map((c) => [c.id, c.reaction]), [['direction:dir-bookkeeping', 'not_for_me']]);
    const again = p.reopen('4-1');
    assert.equal(text(again, '#moduleProgress'), 'Module 4.1 complete');
  });
  test('P7 opening a Direction Card records it as explored (never used for completion)', () => {
    const p = openPage({ page: '4-1' });
    p.$('#dir-amazon .s4-dir-toggle').click();
    assert.deepEqual(p.stored().exploredDirections, ['dir-amazon']);
    assert.equal(p.stored().modules['4-1'].completedAt, null);
  });
  test('P8 returning learner: saved reactions and the Work Clues review are shown', () => {
    const p = openPage({ page: '4-1', storage: seed(F.profileV2Full), hash: 'work-clues' });
    noErrors(p);
    assert.equal(p.$('#dir-ecommerce fieldset.s4-reaction input[value=explore]').checked, true);
    assert.equal(p.$$('#clueReview li.s4-clue').length, 4);
    assert.equal(text(p, '#moduleProgress'), 'Module 4.1 complete');
  });
});

describe('BASELINE · Module 4.2', () => {
  test('P9 a new learner completes 4.2 through the page controls', async () => {
    const p = openPage({ page: '4-2', storage: seed(F.profileV1) });
    noErrors(p);
    p.check(p.$('input[name=new-source][value=work]'));
    p.click('#addExperience');
    p.click('#sectionNav a[data-nav=tasks]');
    p.$('#taskPicker button.s4-prompt').click();
    const own = p.$('#taskPicker input.s4-own');
    own.value = 'Kept a shared sheet up to date';
    own.parentElement.querySelector('button').click();
    await settle();
    p.click('#sectionNav a[data-nav=evidence]');
    p.$$('#evidenceList fieldset.s4-evq').forEach((fs, i) => p.check(fs.querySelector(`input[value=${i ? 'not_done_yet' : 'regularly'}]`)));
    p.click('#sectionNav a[data-nav=involved]');
    assert.notEqual(text(p, '#moduleProgress'), 'Module 4.2 complete', 'not complete before a tag and the snapshot');
    p.check(p.$('#involvedList .s4-chips input[value=communicate]'));
    p.click('#sectionNav a[data-nav=snapshot]');
    noErrors(p);
    assert.equal(text(p, '#moduleProgress'), 'Module 4.2 complete');
    const m = p.stored().modules['4-2'];
    assert.equal(m.experiences.length, 1);
    assert.deepEqual(m.experiences[0].tasks.map((t) => [t.promptId, t.evidence, t.patternTags]),
      [['p-answered-questions', 'regularly', ['communicate']], [null, 'not_done_yet', []]]);
    assert.deepEqual(p.stored().modules['4-1'], F.profileV1.modules['4-1'], '4.1 untouched');
  });
  test('P10 handoff shows 4.1 Work Clues read-only, grouped by reaction', () => {
    const p = openPage({ page: '4-2', storage: seed(F.profileV2Full), hash: 'handoff' });
    noErrors(p);
    const body = text(p, '#clueHandoffBody');
    assert.match(body, /WANT TO EXPLORE.*E-commerce VA/);
    assert.match(body, /NOT SURE YET.*Bookkeeping/);
    assert.equal(p.$$('#clueHandoffBody input, #clueHandoffBody textarea, #clueHandoffBody button').length, 0, 'read-only');
  });
  test('P11 deleting an experience from the page (after confirming) removes it and its tasks; completion stays', () => {
    const p = openPage({ page: '4-2', storage: seed(F.profileV2Full), hash: 'experience', confirm: true });
    p.$$('#experienceList button.s4-remove')[1].click();
    assert.match(p.dialogs.confirms[0], /Delete this experience and its 2 tasks/);
    const m = p.stored().modules['4-2'];
    assert.deepEqual(m.experiences.map((x) => x.id), ['exp-aaa001']);
    assert.equal(m.completedAt, F.profileV2Full.modules['4-2'].completedAt);
  });
  test('P12 cancelling the delete keeps the experience', () => {
    const p = openPage({ page: '4-2', storage: seed(F.profileV2Full), hash: 'experience', confirm: false });
    p.$$('#experienceList button.s4-remove')[1].click();
    assert.equal(p.stored().modules['4-2'].experiences.length, 2);
  });
});

/* ---------------- GUARD (expected to FAIL on 33c4e04) ---------------- */
describe('GUARD · every page leaves newer saved data alone', () => {
  for (const page of ['index', 'progress', '4-1', '4-2']) {
    test(`P13 ${page}: opening the page with newer saved data does not overwrite it, and offers Download saved data`, () => {
      const p = openPage({ page, storage: { [KEY]: F.RAW.newer } });
      noErrors(p);
      assert.equal(p.raw(), F.RAW.newer, 'unchanged right after opening');
      assert.equal(p.bannerVisible(), true);
      assert.ok(p.$$('#storageBanner button').some((b) => /Download saved data/.test(b.textContent)));
    });
  }
  test('P14 4.1: working through the page while blocked still never overwrites the newer data', () => {
    const p = openPage({ page: '4-1', storage: { [KEY]: F.RAW.newer } });
    const post = p.$('#postList article.s4-post');
    p.check(post.querySelector('input[type=checkbox]'));
    post.querySelector('.s4-actions button').click();
    p.check(p.$('#dir-amazon fieldset.s4-reaction input[value=explore]'));
    assert.equal(p.raw(), F.RAW.newer);
  });
  for (const page of ['index', 'progress', '4-1', '4-2']) {
    test(`P16 ${page}: an empty-string saved value is kept on open, with the could-not-be-read message and Download saved data`, () => {
      const p = openPage({ page, storage: { [KEY]: '' } });
      noErrors(p);
      assert.equal(p.raw(), '', 'unchanged right after opening');
      assert.equal(p.bannerVisible(), true);
      assert.match(p.bannerText(), /could not be read/i);
      assert.ok(p.$$('#storageBanner button').some((b) => /Download saved data/.test(b.textContent)));
    });
  }
  test('P17 4.1: working through the page with an empty-string saved value never overwrites it', () => {
    const p = openPage({ page: '4-1', storage: { [KEY]: '' } });
    p.check(p.$('#dir-amazon fieldset.s4-reaction input[value=explore]'));
    p.$('#dir-ndis .s4-dir-toggle').click();
    assert.equal(p.raw(), '');
  });
  test('P15 4.2: adding an experience while blocked never overwrites the newer data', () => {
    const p = openPage({ page: '4-2', storage: { [KEY]: F.RAW.newer } });
    p.check(p.$('input[name=new-source][value=family]'));
    p.click('#addExperience');
    assert.equal(p.raw(), F.RAW.newer);
  });
});
