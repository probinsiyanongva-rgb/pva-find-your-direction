/* Module 4.4 page (public/4-4/index.html + m44.js) against Production Specification v1.0
   §3–§7, §12–§15 and §17.2, driven through the page's own controls in jsdom. Real-browser
   layout, dialogs and print are covered by the Playwright suite (E15–E23). */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { openPage, plain, settle, KEY, PUBLIC } from '../helpers/env.mjs';
import * as F from '../fixtures/fixtures.mjs';
import path from 'node:path';

const seed = (profile) => ({ [KEY]: JSON.stringify(profile) });
const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
function words(node) {
  if (!node) return '';
  const out = [], walker = node.ownerDocument.createTreeWalker(node, 4 /* SHOW_TEXT */);
  for (let t = walker.nextNode(); t; t = walker.nextNode()) out.push(t.nodeValue);
  return norm(out.join(' '));
}
const text = (p, sel) => words(p.$(sel));
const visible = (p) => p.$$('[data-section]').filter((s) => !s.hasAttribute('hidden')).map((s) => s.id);
function nav(p, key) { const a = p.document.createElement('a'); a.setAttribute('data-nav', key); a.href = '#' + key; p.document.body.appendChild(a); a.click(); a.remove(); }
const inputOnly = (p, el, value) => { el.value = value; el.dispatchEvent(new p.window.Event('input', { bubbles: true })); };
const blur = (p, el) => el.dispatchEvent(new p.window.FocusEvent('blur'));
function type(p, el, value) { inputOnly(p, el, value); blur(p, el); }
const m44 = (p) => plain(p.S._state().modules['4-4']);
const noMeta = (raw) => { const s = JSON.parse(raw); delete s._meta; return s; };
const EC = 'dir-ecommerce', CS = 'dir-customer-support', BK = 'dir-bookkeeping', AMZ = 'dir-amazon';
const CANONICAL = ['dir-general-admin', 'dir-customer-support', 'dir-ecommerce', 'dir-amazon', 'dir-bookkeeping', 'dir-social-content',
  'dir-executive-assistant', 'dir-real-estate', 'dir-lead-generation', 'dir-technical', 'dir-ndis'];
const M44_SRC = readFileSync(path.join(PUBLIC, 'shared', 'm44.js'), 'utf8');

/* v3 learner plus extra saved reflections (for the two-direction limit). */
function profileWith(extra = [], judgment = 'explore_further') {
  const prof = JSON.parse(JSON.stringify(F.profileV3Full));
  extra.forEach((id) => prof.modules['4-3'].directionExplorations.push({ directionId: id, judgment, reason: '', reasonSkipped: false, relatedEvidenceIds: [], whatMayBeNew: '', learningQuestions: [], savedAt: '2026-10-20T02:30:00.000Z' }));
  return prof;
}
const open = (profile, extra = {}) => openPage({ page: '4-4', storage: profile ? seed(profile) : undefined, ...extra });
function toChoose(p) { nav(p, 'choose'); assert.deepEqual(visible(p), ['choose']); }
function addDir(p, id) { p.click(`[data-add="${id}"]`); }
function toSteps(p) { nav(p, 'steps'); assert.deepEqual(visible(p), ['steps']); }
function toMap(p) { nav(p, 'map'); assert.deepEqual(visible(p), ['map']); }
const stepBox = (p, id) => p.$(`textarea[data-step="${id}"]`);
const ideaBtn = (p, id, i) => p.$(`[data-step-dir="${id}"] [data-idea="${i}"]`);
const IDEA0 = 'Read three real job posts for this direction and write down the tasks that appear more than once.';

describe('4.4 · page load and Screen 1', () => {
  test('J1 loads with no errors; four sections; opens at Look back, then at the saved section', () => {
    const p = open(F.profileV3Full);
    assert.deepEqual(p.errors, []);
    assert.deepEqual(p.$$('[data-section]').map((s) => s.id), ['look-back', 'choose', 'steps', 'map']);
    assert.deepEqual(visible(p), ['look-back']);
    assert.equal(text(p, '#moduleTitle'), 'Build Your Direction Map');
    toChoose(p);
    assert.deepEqual(visible(p.reopen()), ['choose'], 'reopens at lastSection');
    assert.deepEqual(visible(open(F.profileV3Full, { hash: 'nonsense' })), ['look-back'], 'unknown hash');
    assert.match(text(p, 'footer'), /Stage 4 · Module 4\.4 v1\.0/);
  });
  test('L1 counts and links (Work Clues use the same known-source filter as 4.3); zeros shown plainly', () => {
    const prof = JSON.parse(JSON.stringify(F.profileV3Full));
    prof.workClues.push({ id: 'scenario:scn-unknown', sourceType: 'scenario', sourceId: 'scn-unknown', reaction: 'explore', note: '', updatedAt: null });
    const p = open(prof);
    assert.equal(text(p, '#lookBackCounts'), 'Work Clues saved in Module 4.1: 4 · Revisit Module 4.1 Experiences recorded in Module 4.2: 2 · Tasks: 5 · Revisit Module 4.2 Directions with a saved reflection in Module 4.3: 2 · Revisit Module 4.3');
    assert.deepEqual(p.$$('#lookBackCounts a').map((a) => a.getAttribute('href')), ['../4-1/', '../4-2/', '../4-3/']);
    const e = open(null);
    assert.equal(text(e, '#lookBackCounts'), 'Work Clues saved in Module 4.1: 0 · Revisit Module 4.1 Experiences recorded in Module 4.2: 0 · Tasks: 0 · Revisit Module 4.2 Directions with a saved reflection in Module 4.3: 0 · Revisit Module 4.3');
  });
  test('L2 "Where I am now" is optional, saved as typed (debounced and on blur), cleaned and capped; opening the page never erases it', async () => {
    const p = open(F.profileV4Full);                         // opens at its saved section (map)
    nav(p, 'look-back');
    assert.equal(p.$('#whereNow').value, "I'm learning the basics.");
    assert.equal(m44(p).whereIAmNow, "I'm learning the basics.", 'opening the page did not erase it');
    assert.equal(p.$('#whereNow').getAttribute('maxlength'), '300');
    inputOnly(p, p.$('#whereNow'), 'Learning\nthe basics');
    await settle(450);
    assert.equal(m44(p).whereIAmNow, 'Learning the basics');
    type(p, p.$('#whereNow'), 'x'.repeat(320));
    assert.equal(m44(p).whereIAmNow.length, 300);
    assert.match(text(p, '#look-back'), /Where are you in your VA journey right now\? \(Optional\)/);
    assert.match(text(p, '#look-back'), /Keep it about your VA journey\. You don't need to share private details\./);
    const n = open(F.profileV3Full); nav(n, 'map');
    assert.equal(n.$('#mapWhere'), null, 'omitted when empty');
  });
});

describe('4.4 · Screen 2: choose what to explore', () => {
  test('CH1 only saved reflections, in locked card order, with plain judgment labels', () => {
    const p = open(profileWith([AMZ, 'dir-general-admin'], 'unsure')); toChoose(p);
    const ids = p.$$('#chooseList [data-dir]').map((li) => li.getAttribute('data-dir'));
    assert.deepEqual(ids, CANONICAL.filter((id) => ids.includes(id)), 'locked order');
    assert.deepEqual(ids, ['dir-general-admin', CS, EC, AMZ], 'bookkeeping is an unsaved draft');
    const labels = p.$$('#chooseList .s44-judgment').map((s) => words(s));
    assert.deepEqual(labels, ['Your judgment in Module 4.3: Not sure yet', 'Your judgment in Module 4.3: Not for me right now', 'Your judgment in Module 4.3: Explore further', 'Your judgment in Module 4.3: Not sure yet']);
    const classes = new Set(p.$$('#chooseList .s44-judgment').map((s) => s.className));
    assert.equal(classes.size, 1, 'same class for every judgment');
  });
  test('CH2 nothing is pre-added even though 4.3 chose a direction; the 4.3 reference line in all three variants', () => {
    const p = open(F.profileV3Full); toChoose(p);
    assert.equal(text(p, '#choice43'), 'In Module 4.3 you chose: E-commerce VA.');
    assert.deepEqual(m44(p).mapDirections, []);
    assert.equal(p.$$('[data-remove]').length, 0);
    const u = JSON.parse(JSON.stringify(F.profileV3Full)); u.modules['4-3'].selectedDirectionIds = []; u.modules['4-3'].undecided = true;
    const q = open(u); toChoose(q);
    assert.equal(text(q, '#choice43'), 'In Module 4.3 you chose to keep exploring.');
    const r = open(F.profileV2Full); toChoose(r);
    assert.equal(text(r, '#choice43'), "You didn't make a choice in Module 4.3.");
  });
  test('CH3 no saved reflections: empty state, 4.3 link and still-exploring card; Continue disabled with hint', () => {
    const p = open(F.profileV2Full); toChoose(p);
    assert.equal(text(p, '#chooseEmpty'), "You haven't saved a reflection on any direction in Module 4.3 yet. You can examine one now, or keep exploring.");
    assert.equal(p.$('#examineAnother').getAttribute('href'), '../4-3/#directions');
    assert.ok(p.$('#exploreChoose'));
    assert.equal(p.$('#chooseContinue').disabled, true);
    assert.equal(text(p, '#chooseHint'), 'Add a direction or choose to keep exploring to continue.');
  });
  test('CH4 two on the map → other Add buttons disabled with the hint; "Not for me right now" adds like any other', () => {
    const p = open(profileWith([AMZ])); toChoose(p);
    addDir(p, CS); addDir(p, EC);
    assert.deepEqual(m44(p).mapDirections.map((d) => d.directionId), [CS, EC]);
    assert.equal(p.$(`[data-add="${AMZ}"]`).disabled, true);
    assert.equal(text(p, '#fullHint'), 'You can add up to two. Remove one to add a different direction.');
    assert.equal(p.$('#chooseContinue').disabled, false);
  });
  test('CH5 "Choose this" (still exploring) uses the same button classes as "Add to my map"', () => {
    const p = open(F.profileV3Full); toChoose(p);
    assert.equal(p.$('#exploreChoose').className, p.$(`[data-add="${EC}"]`).className);
    assert.equal(text(p, '#exploringCard h3'), "Right now, I'm still exploring");
  });
});

describe('4.4 · transitions through the page (window.confirm stubbed)', () => {
  function withStep(answer) {
    const p = open(F.profileV3Full, { confirm: answer }); toChoose(p); addDir(p, EC); addDir(p, CS);
    toSteps(p); type(p, stepBox(p, EC), 'Read three job posts'); toChoose(p);
    return p;
  }
  test('TR1 T4 Cancel: correct dialog text; storage byte-identical; screen unchanged', () => {
    const p = withStep(false); const before = p.raw();
    p.click(`[data-remove="${EC}"]`);
    assert.equal(p.dialogs.confirms[0], 'This will remove the next step you wrote for E-commerce VA from your map. Your Module 4.3 reflection stays as it is. Remove it?');
    assert.equal(p.raw(), before);
    assert.ok(p.$(`[data-remove="${EC}"]`), 'still on the map');
  });
  test('TR2 T4 OK removes the direction and its step only', () => {
    const p = withStep(true);
    p.click(`[data-remove="${EC}"]`);
    assert.deepEqual(m44(p).mapDirections, [{ directionId: CS, nextStep: '' }]);
  });
  test('TR3 T5 a direction without a written step is removed with no dialog', () => {
    const p = withStep(false);
    p.click(`[data-remove="${CS}"]`);
    assert.equal(p.dialogs.confirms.length, 0);
    assert.deepEqual(m44(p).mapDirections.map((d) => d.directionId), [EC]);
  });
  test('TR4 T6 Cancel: correct dialog text; storage byte-identical', () => {
    const p = withStep(false); const before = p.raw();
    p.click('#exploreChoose');
    assert.equal(p.dialogs.confirms[0], 'Choosing to keep exploring will remove your directions and the next steps you wrote for them from your map. Your Module 4.3 reflections stay as they are. Continue?');
    assert.equal(p.raw(), before);
  });
  test('TR5 T6 OK: directions and steps removed; still exploring', () => {
    const p = withStep(true);
    p.click('#exploreChoose');
    assert.deepEqual([m44(p).mapDirections, m44(p).stillExploring], [[], true]);
  });
  test('TR6 T7 no written step: still exploring with no dialog', () => {
    const p = open(F.profileV3Full, { confirm: false }); toChoose(p); addDir(p, EC);
    p.click('#exploreChoose');
    assert.equal(p.dialogs.confirms.length, 0);
    assert.equal(m44(p).stillExploring, true);
  });
  test('TR7 T8 still exploring → add keeps the investigation step and Screen 3 says so; T9/T10 bring it back', () => {
    const p = open(F.profileV3Full, { confirm: false }); toChoose(p); p.click('#exploreChoose');
    toSteps(p); type(p, p.$('#investigationStep'), 'Examine one more direction.');
    toChoose(p); addDir(p, EC);
    assert.equal(p.dialogs.confirms.length, 0, 'nothing is lost, so no dialog');
    assert.equal(m44(p).investigationStep, 'Examine one more direction.');
    toSteps(p);
    assert.equal(text(p, '#keptNote'), 'Your step for deciding is kept. It will come back if you choose to keep exploring again.');
    toChoose(p); p.click(`[data-remove="${EC}"]`); p.click('#exploreChoose');
    toSteps(p);
    assert.equal(p.$('#investigationStep').value, 'Examine one more direction.');
    toChoose(p); p.click('#exploreUnselect');
    assert.equal(p.S.m44.state(), 'empty');
    assert.equal(m44(p).investigationStep, 'Examine one more direction.');
  });
  test('TR8 the map never shows the hidden investigation step in the Directions state', () => {
    const p = open(F.profileV4Full); toMap(p);
    assert.equal(text(p, '#mapView').includes('Compare two Direction Cards.'), false);
  });
  test('TR9 typed-but-not-yet-saved step text counts as written (flushed before the removal check)', () => {
    const p = open(F.profileV3Full, { confirm: false }); toChoose(p); addDir(p, EC); toSteps(p);
    inputOnly(p, stepBox(p, EC), 'Typed just now');             // no blur, debounce not elapsed
    toChoose(p);
    p.click(`[data-remove="${EC}"]`);
    assert.equal(p.dialogs.confirms.length, 1);
    assert.equal(m44(p).mapDirections[0].nextStep, 'Typed just now');
  });
});

describe('4.4 · Use this idea (save semantics, spec §4)', () => {
  function onSteps(extra = {}) { const p = open(F.profileV3Full, extra); toChoose(p); addDir(p, EC); toSteps(p); return p; }
  test('U1 empty field: copied, focused, announced; storage unchanged', () => {
    const p = onSteps(); const before = p.raw();
    p.click(ideaBtn(p, EC, 0));
    assert.equal(stepBox(p, EC).value, IDEA0);
    assert.equal(p.document.activeElement, stepBox(p, EC));
    assert.equal(text(p, `[data-step-dir="${EC}"] .s44-idea-status`), 'Idea copied. Edit it, or press Continue to my map to keep it as your step.');
    assert.equal(p.raw(), before);
    assert.equal(p.dialogs.confirms.length, 0);
  });
  test('U2 field with the learner\'s text: asks first; Cancel leaves field and storage unchanged', () => {
    const p = onSteps({ confirm: false }); type(p, stepBox(p, EC), 'My own step'); const before = p.raw();
    p.click(ideaBtn(p, EC, 1));
    assert.equal(p.dialogs.confirms[0], 'Replace what you wrote with this idea?');
    assert.equal(stepBox(p, EC).value, 'My own step');
    assert.equal(p.raw(), before);
  });
  test('U3 OK replaces the field only; the stored step stays the learner\'s until accepted', () => {
    const p = onSteps({ confirm: true }); type(p, stepBox(p, EC), 'My own step');
    p.click(ideaBtn(p, EC, 1));
    assert.notEqual(stepBox(p, EC).value, 'My own step');
    assert.equal(m44(p).mapDirections[0].nextStep, 'My own step');
  });
  test('U4 blur with a pending idea does not save', async () => {
    const p = onSteps(); p.click(ideaBtn(p, EC, 0)); const before = p.raw();
    blur(p, stepBox(p, EC)); await settle(450);
    assert.equal(p.raw(), before);
  });
  test('U5 editing the copied text saves the edited text', async () => {
    const p = onSteps(); p.click(ideaBtn(p, EC, 2));
    inputOnly(p, stepBox(p, EC), stepBox(p, EC).value + ' (VA tools)');
    await settle(450);
    assert.equal(m44(p).mapDirections[0].nextStep, 'Find out what one tool named on the Direction Card is used for. (VA tools)');
  });
  test('U6 "Continue to my map" commits a pending idea and passes the gate', () => {
    const p = onSteps(); p.click(ideaBtn(p, EC, 0));
    assert.equal(p.$('#stepsContinue').disabled, false);
    p.click('#stepsContinue');
    assert.deepEqual(visible(p), ['map']);
    assert.equal(m44(p).mapDirections[0].nextStep, IDEA0);
  });
  test('U7 leaving Screen 3 another way drops the pending idea and keeps the previously saved text', () => {
    const p = onSteps({ confirm: true }); type(p, stepBox(p, EC), 'Saved before');
    p.click(ideaBtn(p, EC, 0));
    p.click('#sectionNav a[data-nav="choose"]');
    assert.equal(m44(p).mapDirections[0].nextStep, 'Saved before');
    toSteps(p);
    assert.equal(stepBox(p, EC).value, 'Saved before');
    const q = onSteps(); q.click(ideaBtn(q, EC, 0)); nav(q, 'map');
    assert.equal(m44(q).mapDirections[0].nextStep, '', 'an empty field stays empty');
  });
  test('U8 the button never completes the module or navigates; the "ask someone" idea shows (Optional) and copies without it', () => {
    const p = onSteps();
    for (let i = 0; i < 4; i++) p.click(ideaBtn(p, EC, i));
    assert.deepEqual(visible(p), ['steps']);
    assert.equal(m44(p).completedAt, null);
    assert.match(words(ideaBtn(p, EC, 3).parentNode), /^\(Optional\) Ask someone/);
    assert.equal(stepBox(p, EC).value, 'Ask someone who does this kind of work one question about their usual day.');
    assert.equal(p.dialogs.confirms.length, 0, 'replacing an unaccepted idea does not ask');
  });
  test('U9 still exploring: investigation ideas, with the 4.3 link on the first', () => {
    const p = open(F.profileV3Full); toChoose(p); p.click('#exploreChoose'); toSteps(p);
    assert.deepEqual(p.$$('.s44-idea-list li > span:first-child').map((s) => words(s)), ['Examine one more direction in Module 4.3.', 'Read the Direction Cards for two directions and note how the daily work differs.', 'Read a few real job posts for two directions and note which tasks repeat in each.']);
    assert.equal(p.$('.s44-idea-list a').getAttribute('href'), '../4-3/#directions');
  });
  test('S3a the Continue gate follows the fields\' current values, with the hint', () => {
    const p = open(F.profileV3Full); toChoose(p); addDir(p, EC); addDir(p, CS); toSteps(p);
    assert.equal(p.$('#stepsContinue').disabled, true);
    assert.equal(text(p, '#stepsHint'), 'Write a step for each direction to continue.');
    inputOnly(p, stepBox(p, EC), 'a');
    assert.equal(p.$('#stepsContinue').disabled, true);
    inputOnly(p, stepBox(p, CS), '   ');
    assert.equal(p.$('#stepsContinue').disabled, true, 'whitespace is not a step');
    inputOnly(p, stepBox(p, CS), 'b');
    assert.equal(p.$('#stepsContinue').disabled, false);
    const q = open(null); toChoose(q); q.click('#exploreChoose'); toSteps(q);
    assert.equal(text(q, '#stepsHint'), 'Write your step to continue.');
    const e = open(null); toSteps(e);
    assert.match(text(e, '#stepsEmpty'), /Choose what to explore first\./);
  });
});

describe('4.4 · the map (built from current records)', () => {
  test('MP1 every row for a direction, from the current 4.1–4.3 records, with screen-only links', () => {
    const p = open(F.profileV4Full); toMap(p);
    const sec = p.$(`[data-map-dir="${EC}"]`);
    const t = words(sec);
    assert.match(t, /^03 · E-commerce VA/);
    assert.match(t, /My reaction in Module 4\.1 Want to explore/);
    assert.match(t, /My judgment in Module 4\.3 Explore further/);
    assert.match(t, /Why I'm considering it I liked handling orders\./);
    assert.match(t, /Experiences and tasks I can draw on Updated records in a system · Experience 1: .+ · I have done this before/);
    assert.match(t, /Posted products for our sari-sari store page · Experience 2: .+ · /);
    assert.match(t, /What may be new for me Inventory tools\./);
    assert.match(t, /Questions I want answered What store platforms are common\? How are returns handled\?/);
    assert.match(t, /My next exploration step Read three job posts for e-commerce VAs\./);
    assert.match(text(p, '#mapView'), /^MY VA DIRECTION MAP Printed on .+ This map shows where my thinking is right now\. It is not a permanent career decision\. I can change it at any time\. Where I am now: I'm learning the basics\./);
    const links = p.$$(`[data-map-dir="${EC}"] .s44-screen-only a`).map((a) => a.getAttribute('href'));
    assert.deepEqual(links, ['../4-1/', '../4-3/#examine-dir-ecommerce']);
  });
  test('MP2 editing a 4.3 reflection, a 4.2 task and a 4.1 reaction shows on the next render; 4.4 data unchanged', () => {
    const p = open(F.profileV4Full); toMap(p); const before = m44(p);
    p.S.m43.setReason(EC, 'Now I want to learn returns.');
    p.S.updateTask('exp-aaa001', 'task-aaa002', { evidence: 'regularly' });
    p.S.setReaction('direction', EC, 'unsure');
    nav(p, 'choose'); toMap(p);
    const t = words(p.$(`[data-map-dir="${EC}"]`));
    assert.match(t, /Why I'm considering it Now I want to learn returns\./);
    assert.match(t, /Updated records in a system · Experience 1: .+ · I do this regularly/);
    assert.match(t, /My reaction in Module 4\.1 Not sure yet/);
    const after = m44(p); delete after.lastSection; delete before.lastSection;
    assert.deepEqual(after, before);
  });
  test('MP3 placeholders for every missing item (MD3, MD4, MD6, MD7, MD8, MD9)', () => {
    const prof = JSON.parse(JSON.stringify(F.profileV4Full));
    prof.modules['4-2'].experiences[0].tasks[1].evidence = null;                         // linked task, no evidence answer
    prof.modules['4-4'].mapDirections = [{ directionId: CS, nextStep: '' }, { directionId: BK, nextStep: 'x' }];   // CS: not_now, skipped reason, no tasks; BK: unsaved
    prof.workClues = prof.workClues.filter((c) => c.sourceId !== BK);
    const p = open(prof); toMap(p);
    const cs = words(p.$(`[data-map-dir="${CS}"]`)), bk = words(p.$(`[data-map-dir="${BK}"]`));
    assert.match(cs, /My reaction in Module 4\.1 No reaction saved in Module 4\.1\./);
    assert.match(cs, /My judgment in Module 4\.3 Not for me right now/);
    assert.match(cs, /Why I'm considering it No reason added yet/);
    assert.match(cs, /Experiences and tasks I can draw on No tasks linked yet\. Edit in Module 4\.3/);
    assert.match(cs, /What may be new for me Nothing added yet/);
    assert.match(cs, /My next exploration step No next step written yet/);
    assert.match(bk, /My judgment in Module 4\.3 No judgment saved in Module 4\.3\./, 'MD8: stays on the map');
    const q = JSON.parse(JSON.stringify(F.profileV4Full)); q.modules['4-4'].mapDirections = [{ directionId: 'dir-ndis', nextStep: '' }];
    const r = open(q); toMap(r);
    assert.match(words(r.$('[data-map-dir="dir-ndis"]')), /No judgment saved in Module 4\.3\. Why I'm considering it No reason added yet/, 'MD9: no 4.3 record at all');
    const md4 = open(F.profileV4Full); md4.S.updateTask('exp-aaa001', 'task-aaa002', { evidence: null }); toMap(md4);
    assert.match(words(md4.$(`[data-map-dir="${EC}"]`)), /Updated records in a system · Experience 1: .+ · No evidence answer yet/);
  });
  test('MP4 still-exploring map and Empty map', () => {
    const u = JSON.parse(JSON.stringify(F.profileV4Full));
    u.modules['4-3'].undecidedNote = 'I want to see job posts.';
    u.modules['4-4'].mapDirections = []; u.modules['4-4'].stillExploring = true;
    const p = open(u); toMap(p);
    assert.match(text(p, '#mapView'), /Right now, I'm still exploring\. My note from Module 4\.3: I want to see job posts\. Directions I've looked at so far Customer Support VA — Module 4\.3: Not for me right now · Module 4\.1: no reaction saved E-commerce VA — Module 4\.3: Explore further · Module 4\.1: Want to explore My next step to help me decide: Compare two Direction Cards\./);
    const none = open(null); toChoose(none); none.click('#exploreChoose'); toMap(none);
    assert.match(text(none, '#mapView'), /You haven't saved a reflection on any direction yet\. My next step to help me decide: No step written yet/);
    const e = open(null); toMap(e);
    assert.match(text(e, '#mapEmpty'), /^Nothing on your map yet\./);
  });
  test('MP5 scenario Work Clues and unlinked tasks never appear on the map', () => {
    const p = open(F.profileV4Full); toMap(p);
    const t = text(p, '#mapView');
    assert.equal(t.includes('I liked helping people.'), false, 'scenario clue note');
    for (const label of ['Answered customer questions', 'Made a weekly summary sheet', 'Tracked household money']) assert.equal(t.includes(label), false, label);
  });
  test('MP6 learner text is inserted as text, never as markup', () => {
    const p = open(F.profileV3Full); p.S.m44.addDirection(EC); p.S.m44.setNextStep(EC, '<img src=x onerror=alert(1)>'); toMap(p);
    assert.equal(p.$$('#mapView img').length, 0);
    assert.match(text(p, '#mapView'), /<img src=x onerror=alert\(1\)>/);
  });
});

describe('4.4 · completion', () => {
  test('F1 Save is gated by the content condition, with the three messages; completes on both routes', () => {
    const e = open(null); toMap(e); e.click('#saveMapBtn');
    assert.match(text(e, '#saveMsg'), /^To finish, choose what to explore first\./);
    const d = open(F.profileV3Full); toChoose(d); addDir(d, EC); toMap(d); d.click('#saveMapBtn');
    assert.match(text(d, '#saveMsg'), /^To finish, add a next step for each direction on your map\./);
    assert.equal(m44(d).completedAt, null);
    toSteps(d); type(d, stepBox(d, EC), 'Read posts'); toMap(d); d.click('#saveMapBtn');
    assert.match(m44(d).completedAt, /^\d{4}-/);
    const x = open(null); toChoose(x); x.click('#exploreChoose'); toMap(x); x.click('#saveMapBtn');
    assert.match(text(x, '#saveMsg'), /^To finish, write your step to help you decide\./);
    toSteps(x); type(x, x.$('#investigationStep'), 'Examine one more direction.'); toMap(x); x.click('#saveMapBtn');
    assert.match(m44(x).completedAt, /^\d{4}-/, 'no 4.1–4.3 data needed (MD1, MD3, C3)');
  });
  test('F2 after completion: panel, map still editable, completedAt never changes, no certificate', async () => {
    const p = open(F.profileV4Full); toMap(p); const at = m44(p).completedAt;
    assert.match(text(p, '#completionStatus'), /Module 4\.4 complete Your map is saved in this browser \(first completed .+\)\. You can keep changing it\./);
    p.click('#saveMapBtn');
    toChoose(p); p.click(`[data-remove="${EC}"]`); toMap(p); p.click('#saveMapBtn');
    assert.equal(m44(p).completedAt, at);
    assert.match(text(p, '#mapEmpty'), /^Nothing on your map yet\./);
    assert.equal(/certificate|badge/i.test(text(p, 'main')), false);
    p.$('[data-export-inline]').click();
    assert.equal(p.downloads.length, 1);
    assert.equal(JSON.parse(await p.downloadText(0)).summary.module44Complete, true);
  });
});

describe('4.4 · wording and write scans', () => {
  test('W1 m44.js writes only through PVAS4.m44, setLastSection and markModuleComplete for 4-4; no ranking words', () => {
    const forbidden = ['setReaction', 'setNote', 'removeClue', 'saveScenario', 'savePost', 'markExplored', 'setDirectionsReviewed', 'addExperience', 'updateExperience', 'deleteExperience', 'addTask', 'updateTask', 'deleteTask', 'setSnapshotReached',
      'setJudgment', 'setReason', 'skipReason', 'unskipReason', 'setEvidence', 'setWhatMayBeNew', 'addQuestion', 'updateQuestion', 'removeQuestion', 'saveReflection', 'setSelected', 'setUndecided', 'setUndecidedNote', 'examine(', 'setReviewed', 'setDecisionReached', 'localStorage'];
    for (const f of forbidden) assert.equal(M44_SRC.includes(f), false, f);
    assert.deepEqual([...M44_SRC.matchAll(/S\.setLastSection\(([^,]+),/g)].map((m) => m[1]), ['MOD']);
    assert.deepEqual([...M44_SRC.matchAll(/S\.markModuleComplete\(([^)]+)\)/g)].map((m) => m[1]), ['MOD']);
    const code = M44_SRC.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    assert.equal(/\b(score|rank|ranking|best|match|recommend|suitab|ready for)\w*/i.test(code.replace(/matchMedia|\.closest|textContent/g, '')), false);
  });
  test('W2 no idea or 4.4 copy mentions applications, profiles, resumes, portfolios, clients or paying', () => {
    const p = open(F.profileV3Full); toChoose(p); addDir(p, EC); toSteps(p);
    let all = text(p, 'main');
    const x = open(F.profileV3Full); toChoose(x); x.click('#exploreChoose'); toSteps(x);
    all += ' ' + text(x, '#steps');
    all = all.replaceAll('without signing up for anything or contacting a client', '');
    for (const w of ['apply', 'application', 'profile', 'resume', 'résumé', 'CV ', 'cover letter', 'portfolio', 'client', 'buy', 'paid', 'fee']) assert.equal(all.toLowerCase().includes(w.toLowerCase()), false, w);
  });
  test('W3 the 4.1 reaction and 4.3 judgment labels equal the live modules\' wording', () => {
    const m41 = readFileSync(path.join(PUBLIC, 'shared', 'm41.js'), 'utf8'), m43 = readFileSync(path.join(PUBLIC, 'shared', 'm43.js'), 'utf8');
    assert.ok(m41.includes("var REACTION_LABELS = { explore: 'Want to explore', unsure: 'Not sure yet', not_for_me: 'Probably not for me' };"));
    assert.ok(M44_SRC.includes("var REACTION_LABEL = { explore: 'Want to explore', unsure: 'Not sure yet', not_for_me: 'Probably not for me' };"));
    for (const l of ["explore_further: ['Explore further'", "unsure: ['Not sure yet'", "not_now: ['Not for me right now'"]) assert.ok(m43.includes(l), l);
    assert.ok(M44_SRC.includes("var JUDGMENT_LABEL = { explore_further: 'Explore further', unsure: 'Not sure yet', not_now: 'Not for me right now' };"));
  });
});

describe('4.4 · navigation and hub priority (R1/D25)', () => {
  const hub = (prof) => openPage({ page: 'index', storage: prof ? seed(prof) : undefined });
  const btn = (p) => [text(p, '#continueBtn'), p.$('#continueBtn').getAttribute('href')];
  const set = (base, fn) => { const x = JSON.parse(JSON.stringify(base)); x.schemaVersion = 4; fn(x); return x; };
  test('NV1 the Continue matrix', () => {
    assert.deepEqual(btn(hub(null)), ['Start Module 4.1', './4-1/']);
    assert.deepEqual(btn(hub(F.profileV3Full)), ['Start Module 4.4', './4-4/']);
    assert.deepEqual(btn(hub(set(F.profileV3Full, (x) => { x.modules['4-4'] = { lastSection: 'steps' }; }))), ['Continue Module 4.4', './4-4/#steps']);
    assert.deepEqual(btn(hub(F.profileV4Full)), ['Review my Direction Map', './4-4/#map']);
    const only44 = { schemaVersion: 4, workClues: [], scenarioObservations: [], jobPostObservations: [], exploredDirections: [], modules: { '4-4': { completedAt: '2026-10-25T00:00:00.000Z', stillExploring: true, investigationStep: 'x' } } };
    assert.deepEqual(btn(hub(only44)), ['Start Module 4.1', './4-1/'], '4.4 complete, 4.1 not started: earliest unfinished wins');
    const h = hub(only44);
    assert.equal(text(h, '#stamp44'), 'Complete');
    assert.equal(h.$('a[href="4-4/"]').textContent, 'Build Your Direction Map', 'the map stays reachable from the module list');
    assert.deepEqual(btn(hub(set(F.profileV4Full, (x) => { x.modules['4-2'].completedAt = null; x.modules['4-2'].lastSection = 'tasks'; }))), ['Continue Module 4.2', './4-2/#tasks']);
    const pr = openPage({ page: 'progress', storage: seed(F.profileV4Full) });
    assert.deepEqual(btn(pr), ['Review my Direction Map', '../4-4/#map']);
  });
  test('NV2 4.4 status counts any saved 4.4 progress without lastSection; an empty block is Not started', () => {
    for (const m of [{ mapDirections: [{ directionId: EC, nextStep: '' }] }, { stillExploring: true }, { investigationStep: 'a' }, { whereIAmNow: 'b' }]) {
      const h = hub(set(F.profileV3Full, (x) => { x.modules['4-4'] = m; }));
      assert.equal(text(h, '#stamp44'), 'In progress', JSON.stringify(m));
      assert.deepEqual(btn(h), ['Continue Module 4.4', './4-4/']);
    }
    assert.equal(text(hub(set(F.profileV3Full, (x) => { x.modules['4-4'] = {}; })), '#stamp44'), 'Not started');
    assert.match(text(hub(F.profileV4Full), '#homeSummary'), /Module 4\.4 complete · 4 Work Clues saved$/);
  });
  test('NV3 every Stage 4 sidebar links to 4.4; nothing is Coming later; the 4.4 page shows 4.1–4.3 status', () => {
    for (const page of ['4-1', '4-2', '4-3']) {
      const p = openPage({ page });
      assert.equal(p.$$('.s4-modules a[href="../4-4/"]').length, 1, page);
      assert.equal(p.$$('li.later').length, 0, page);
    }
    const p = open(F.profileV3Full);
    assert.deepEqual(['#m41Status', '#m42Status', '#m43Status'].map((s) => text(p, s)), ['Complete', 'Complete', 'Complete']);
    assert.match(p.$('.s4-modules li.current').textContent, /4\.4 Build Your Direction Map/);
  });
  test('NV4 the 4.3 finish screen links to 4.4', () => {
    const p = openPage({ page: '4-3', storage: seed(F.profileV3Full), hash: 'finish' });
    assert.equal(p.$('#completionStatus a.s4-next').getAttribute('href'), '../4-4/');
  });
  test('PR1 Print calls window.print and fills the print date; screen-only parts are marked', () => {
    const p = open(F.profileV4Full); let printed = 0; p.window.print = () => { printed++; };
    toMap(p); p.$('#mapPrintDate').textContent = '';
    p.click('#printMapBtn');
    assert.equal(printed, 1);
    assert.match(text(p, '#mapPrintDate'), /^Printed on \S+/);
    assert.ok(p.$('#mapPrintDate').classList.contains('s44-print-only'));
    for (const sel of ['#completionStatus', '#mapActions', '#stage5']) assert.ok(p.$(sel).classList.contains('s44-screen-only'), sel);
    assert.match(text(p, '#mapActions'), /To keep a PDF, choose 'Save as PDF' in the print window\. If you change your map later, print it again to get an updated copy\./);
    assert.match(text(p, '#stage5'), /Your map shows what you want to explore next—not what you're already ready for\. In Stage 5, PRACTICE & PROVE, you'll try the work itself\. Stage 5 · PRACTICE & PROVE Coming later/);
    assert.equal(p.$$('#stage5 a').length, 0);
  });
});

describe('4.4 · guard and missing data on the page', () => {
  test('G1 opening 4.4 with newer saved data never overwrites it, through a full journey', () => {
    const p = openPage({ page: '4-4', storage: { [KEY]: F.RAW.newer } });
    assert.ok(p.bannerVisible());
    toChoose(p); p.click('#exploreChoose'); toSteps(p); type(p, p.$('#investigationStep'), 'x'); toMap(p); p.click('#saveMapBtn');
    assert.equal(p.raw(), F.RAW.newer);
  });
  test('MD10 storage unavailable: the page works in memory with the banner', () => {
    const p = openPage({ page: '4-4', storageThrows: true });
    assert.ok(p.bannerVisible());
    toChoose(p); p.click('#exploreChoose');
    assert.equal(p.S.m44.state(), 'exploring');
  });
  test('MD5 a linked task deleted in 4.2 disappears from the map at once', () => {
    const p = open(F.profileV4Full); p.S.deleteTask('exp-bbb001', 'task-bbb002'); toMap(p);
    assert.equal(text(p, '#mapView').includes('Posted products'), false);
  });
  test('IMP the page never changes 4.1–4.3 data across a whole journey with every transition', () => {
    const p = open(F.profileV4Full, { confirm: true });
    const src = () => { const s = plain(p.S._state()); delete s.modules['4-4']; delete s._meta; return s; };
    const before = src();
    nav(p, 'look-back'); type(p, p.$('#whereNow'), 'New'); toChoose(p); addDir(p, CS); p.click(`[data-remove="${EC}"]`);
    p.click('#exploreChoose'); toSteps(p); p.click('.s44-use-idea'); p.click('#stepsContinue'); p.click('#saveMapBtn');
    toChoose(p); addDir(p, EC); toSteps(p); type(p, stepBox(p, EC), 's'); toMap(p); p.click('#printMapBtn');
    assert.deepEqual(src(), before);
  });
});
