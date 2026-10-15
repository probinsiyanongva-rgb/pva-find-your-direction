/* Module 4.3 page (public/4-3/index.html + m43.js) against Production Specification
   v1.5 §8, driven through the page's own controls in jsdom. Layout at real widths is
   covered by the Playwright suite. */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { openPage, plain, settle, KEY } from '../helpers/env.mjs';
import * as F from '../fixtures/fixtures.mjs';

const seed = (profile) => ({ [KEY]: JSON.stringify(profile) });
const CANONICAL = ['dir-general-admin', 'dir-customer-support', 'dir-ecommerce', 'dir-amazon', 'dir-bookkeeping', 'dir-social-content',
  'dir-executive-assistant', 'dir-real-estate', 'dir-lead-generation', 'dir-technical', 'dir-ndis'];
const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
/* Text as a reader sees it: words from separate elements are separated by a space
   (jsdom's textContent glues adjacent elements together, e.g. "regularlyCOMMUNICATE"). */
function words(node) {
  if (!node) return '';
  const out = [], walker = node.ownerDocument.createTreeWalker(node, 4 /* SHOW_TEXT */);
  for (let t = walker.nextNode(); t; t = walker.nextNode()) out.push(t.nodeValue);
  return norm(out.join(' '));
}
const text = (p, sel) => words(p.$(sel));
const visible = (p) => p.$$('[data-section]').filter((s) => !s.hasAttribute('hidden')).map((s) => s.id);
function nav(p, key) { const a = p.document.createElement('a'); a.setAttribute('data-nav', key); a.href = '#' + key; p.document.body.appendChild(a); a.click(); a.remove(); }
function type(p, el, value) { el.value = value; el.dispatchEvent(new p.window.Event('input', { bubbles: true })); el.dispatchEvent(new p.window.FocusEvent('blur')); }
function choose(p, input) { p.check(input); }
const m43 = (p) => plain(p.S._state().modules['4-3']);
const ex = (p, id) => plain(p.S.m43.exploration(id));
function examine(p, id) { nav(p, 'examine-' + id); assert.deepEqual(visible(p), ['examine']); }
function judge(p, id, j) { choose(p, p.$(`input[name="judgment-${id}"][value="${j}"]`)); }
function save(p) { p.click('#saveReflection'); }

describe('4.3 · journey', () => {
  test('J1 a new learner with no Work Clues and no 4.2 evidence completes honestly by staying undecided', async () => {
    const p = openPage({ page: '4-3' });
    assert.deepEqual(p.errors, []);
    assert.equal(text(p, '#startTitle'), 'Exploring Possible Directions');
    p.click('a[data-nav="clues"].btn');
    assert.equal(text(p, '#clueList'), "You don't have Work Clues saved from 4.1 yet. You can still explore directions here.");
    assert.equal(text(p, '#cluesContinue'), 'Continue without Work Clues');
    p.click('#cluesContinue');
    assert.equal(text(p, '#taskList'), "You don't have experience records saved from 4.2 yet. You can still examine the directions and note what you would like to learn.");
    assert.equal(text(p, '#evidenceContinue'), 'Continue without task evidence');
    p.click('#evidenceContinue');
    assert.deepEqual(visible(p), ['directions']);
    p.click('#pick-dir-ndis a[data-nav]');
    judge(p, 'dir-ndis', 'unsure');
    choose(p, p.$('#skip-dir-ndis'));
    save(p);
    nav(p, 'decision');
    choose(p, p.$('#undecided'));
    nav(p, 'finish');
    assert.match(text(p, '#finishSummary'), /I’m not choosing a direction yet\. I want to keep exploring before I decide\./);
    p.click('#finishBtn');
    assert.deepEqual(p.errors, []);
    assert.match(m43(p).completedAt, /^\d{4}-/);
    const box = text(p, '#completionStatus');
    assert.match(box, /Module 4\.3 complete/);
    assert.ok(box.includes("You've looked at the work. You've looked at what you've actually done. Now you've put those two views side by side."));
    assert.ok(box.includes("Next, we'll turn the directions you're exploring into a practical next step."));
    const next = p.$('#completionStatus .s4-next');
    assert.equal(next.getAttribute('aria-disabled'), 'true');
    assert.match(norm(next.textContent), /Continue to Module 4\.4.*Coming later/);
    assert.equal(p.$$('#completionStatus a[href*="4-4"]').length, 0, 'no link to 4.4 until it exists');
    assert.equal(text(p, '#moduleProgress'), 'Module 4.3 complete');
  });
  test('J2 opening Direction Cards alone never completes the module', () => {
    const p = openPage({ page: '4-3', storage: seed(F.profileV2Full) });
    for (const id of CANONICAL) nav(p, 'examine-' + id);
    nav(p, 'finish');
    p.click('#finishBtn');
    assert.equal(m43(p).completedAt, null);
    assert.match(text(p, '#finishMsg'), /still open/);
    assert.equal(p.$$('#completionStatus .s4-checklist li.ok').length, 1, 'only "examine a direction" is met');
  });
  test('J3 completion requires each of the seven criteria (Save and finish is explicit)', () => {
    const p = openPage({ page: '4-3', storage: seed(F.profileV2Full) });
    nav(p, 'clues'); p.click('#cluesContinue'); p.click('#evidenceContinue');
    examine(p, 'dir-amazon'); judge(p, 'dir-amazon', 'not_now'); save(p);
    nav(p, 'decision'); choose(p, p.$('#decisionPick input[value="dir-amazon"]'));
    nav(p, 'finish');
    assert.equal(m43(p).completedAt, null, 'not complete before Save and finish');
    p.click('#finishBtn');
    assert.equal(m43(p).completedAt, null, 'reason checkpoint (criterion 5) still open');
    assert.match(text(p, '#completionStatus'), /Not done yet: Add a reason, or choose/);
    examine(p, 'dir-amazon'); type(p, p.$('#reason-dir-amazon'), 'Curious about it');
    nav(p, 'finish'); p.click('#finishBtn');
    assert.match(m43(p).completedAt, /^\d{4}-/, 'a negative judgment is enough');
  });
  test('J4 completion persists after the learner later deletes 4.2 evidence', () => {
    const p = openPage({ page: '4-2', storage: seed(F.profileV3Full), hash: 'experience', confirm: true });
    p.$$('#experienceList button.s4-remove').forEach((b) => b.click());
    const q = p.reopen('4-3', { hash: 'finish' });
    assert.equal(m43(q).completedAt, F.profileV3Full.modules['4-3'].completedAt);
    assert.match(text(q, '#completionStatus'), /Module 4\.3 complete/);
  });
  test('J5 progress persists across a reload', () => {
    const p = openPage({ page: '4-3', storage: seed(F.profileV2Full) });
    examine(p, 'dir-amazon'); judge(p, 'dir-amazon', 'explore_further'); type(p, p.$('#reason-dir-amazon'), 'Because');
    const q = p.reopen('4-3');
    assert.deepEqual(visible(q), ['examine'], 'reopens where the learner was');
    assert.equal(q.$('input[name="judgment-dir-amazon"][value="explore_further"]').checked, true);
    assert.equal(q.$('#reason-dir-amazon').value, 'Because');
  });
});

describe('4.3 · bringing forward 4.1 and 4.2', () => {
  test('B1 Work Clues are shown as saved, grouped by reaction, read-only; nothing is converted into a recommendation', () => {
    const p = openPage({ page: '4-3', storage: seed(F.profileV2Full), hash: 'clues' });
    const t = text(p, '#clueList');
    assert.match(t, /WANT TO EXPLORE.*A Question About an Order.*Your reaction: Want to explore.*I liked helping people\..*E-commerce VA/);
    assert.match(t, /NOT SURE YET.*Bookkeeping \/ Accounting Support.*Need to know more\./);
    assert.match(t, /PROBABLY NOT FOR ME.*Social Media \/ Content Support/);
    assert.equal(p.$$('#clueList input, #clueList textarea, #clueList button, #clueList select').length, 0);
    assert.doesNotMatch(t, /recommend|best|match|score/i);
  });
  test('B2 4.2 tasks are shown with evidence, tags and notes in 4.2 order, read-only, with no counts', () => {
    const p = openPage({ page: '4-3', storage: seed(F.profileV2Full), hash: 'evidence' });
    const items = p.$$('#taskList li > ul.s4-tags').length;
    assert.ok(items >= 3);
    const order = p.$$('#taskList .s4-snap-list > li').map((li) => norm(li.firstChild.textContent));
    assert.deepEqual(order, ['Answered customer questions', 'Updated records in a system', 'Made a weekly summary sheet', 'Tracked household money', 'Posted products for our sari-sari store page']);
    assert.match(text(p, '#taskList'), /Answered customer questions I do this regularly COMMUNICATE.*Daily for two years/);
    assert.equal(p.$$('#taskList input, #taskList textarea, #taskList button').length, 0);
    assert.doesNotMatch(text(p, '#taskList'), /\b\d+ (tasks|of)\b|score|total/i);
  });
});

describe('4.3 · directions, order and content parity', () => {
  test('O1 Screen 3 shows all 11 directions in the locked order for different learner profiles', () => {
    for (const prof of [null, F.profileV1, F.profileV2Full, F.profileV3Full]) {
      const p = openPage({ page: '4-3', storage: prof ? seed(prof) : {}, hash: 'directions' });
      assert.deepEqual(p.$$('#directionList article.s4-dir').map((a) => a.id.replace('pick-', '')), CANONICAL);
    }
  });
  test('O2 the copy states the order is fixed and not a ranking', () => {
    const p = openPage({ page: '4-3', hash: 'directions' });
    assert.equal(text(p, '#s3Title'), 'Which kind of work would you like to look at?');
    assert.match(text(p, '#directions'), /The order below is fixed and does not indicate a ranking\./);
  });
  /* Content parity: every learner-facing card field 4.3 shows equals 4.1's, for all 11. */
  function fieldsOf(container) {
    const out = [];
    for (const h of container.querySelectorAll('h4.s4-field')) {
      const parts = [];
      for (let n = h.nextElementSibling; n && !(n.matches && n.matches('h4.s4-field')); n = n.nextElementSibling) parts.push(norm(n.textContent));
      out.push([norm(h.textContent), parts.join(' | ')]);
    }
    return out;
  }
  test('P1 PARITY: every field of every Direction Card in 4.3 equals 4.1 (incl. PPC notes and Technical patternsNote)', () => {
    const p41 = openPage({ page: '4-1', hash: 'directions' });
    const p43 = openPage({ page: '4-3' });
    for (const id of CANONICAL) {
      const card41 = p41.$('#' + id);
      examine(p43, id);
      const card43 = p43.$('.s43-card');
      assert.equal(card43.getAttribute('data-direction'), id);
      assert.equal(norm(p43.$('#s4Title .s4-dir-num').textContent), norm(card41.querySelector('.s4-dir-num').textContent), id + ' number');
      assert.equal(norm(p43.$('#s4Title .s43-dirname').textContent), norm(card41.querySelector('h3').textContent), id + ' name');
      const f41 = fieldsOf(card41.querySelector('.s4-dir-headtext')).concat(fieldsOf(card41.querySelector('.s4-dir-details')));
      const f43 = fieldsOf(card43);
      assert.equal(f43.length, 8, id + ' has all eight fields');
      assert.deepEqual(f43, f41, id + ' fields');
      const head41 = words(card41.querySelector('.s4-dir-headtext')).replace(words(card41.querySelector('h3')), '').trim();
      assert.equal(words(card43), norm(head41 + ' ' + words(card41.querySelector('.s4-dir-details'))), id + ' full card text (nothing missing, altered or added)');
    }
    examine(p43, 'dir-amazon');
    assert.match(text(p43, '.s43-card'), /Related specialization:.*Amazon PPC/);
    examine(p43, 'dir-technical');
    assert.match(text(p43, '.s43-card'), /Some specialized work also involves CREATE or COMMUNICATE\./);
  });
  test('P2 4.3 does not reproduce 4.1 interactions and never writes Work Clues', () => {
    const p = openPage({ page: '4-3', storage: seed(F.profileV2Full) });
    const before = JSON.stringify(p.stored().workClues);
    examine(p, 'dir-ecommerce');
    assert.equal(p.$$('#examine .s4-reaction, #examine .s4-dir-toggle').length, 0);
    assert.doesNotMatch(text(p, '#examine'), /Would you want to explore this kind of work\?/);
    judge(p, 'dir-ecommerce', 'not_now'); save(p);
    assert.equal(JSON.stringify(p.stored().workClues), before);
  });
});

describe('4.3 · connection view', () => {
  test('C1 every 4.2 task is listed in 4.2 order and none is preselected; none, one or several can be chosen', () => {
    const p = openPage({ page: '4-3', storage: seed(F.profileV2Full) });
    examine(p, 'dir-amazon');
    const boxes = p.$$('#taskPick input[type=checkbox]');
    assert.deepEqual(boxes.map((b) => b.value), ['task-aaa001', 'task-aaa002', 'task-aaa003', 'task-bbb001', 'task-bbb002']);
    assert.ok(boxes.every((b) => !b.checked));
    assert.equal(text(p, '#taskPick legend'), 'Which of your recorded tasks, if any, would you like to consider alongside this direction?');
    choose(p, boxes[1]); choose(p, boxes[4]);
    assert.deepEqual(ex(p, 'dir-amazon').relatedEvidenceIds, ['task-aaa002', 'task-bbb002']);
    boxes[1].checked = false; boxes[1].dispatchEvent(new p.window.Event('change', { bubbles: true }));
    assert.deepEqual(ex(p, 'dir-amazon').relatedEvidenceIds, ['task-bbb002']);
    examine(p, 'dir-ndis');
    assert.ok(p.$$('#taskPick input').every((b) => !b.checked), 'selection is scoped to its direction');
  });
  test('C2 judgment options, the D15 line and "What may be new for me" are as specified', () => {
    const p = openPage({ page: '4-3', storage: seed(F.profileV2Full) });
    examine(p, 'dir-amazon');
    assert.deepEqual(p.$$('input[name="judgment-dir-amazon"]').map((i) => i.value), ['explore_further', 'unsure', 'not_now']);
    assert.deepEqual(p.$$('.s43-judgment .s4-rx').map((l) => norm(l.textContent)), [
      'Explore further — I can imagine investigating this kind of work.',
      'Not sure yet — I need more information or experience before I know.',
      'Not for me right now — I don’t want to prioritize this direction at the moment.']);
    assert.ok(p.$$('input[name="judgment-dir-amazon"]').every((i) => !i.checked), 'no judgment preselected');
    assert.equal(text(p, '.s43-judgment-note'), "This is a separate choice about this direction. It doesn't change the Work Clues you saved in 4.1.");
    assert.match(text(p, '#examine'), /C\. What may be new for me Look at the work and task examples above\. Which parts have you not tried yet, or do you want to understand better\?/);
    type(p, p.$('#new-dir-amazon'), 'Seller Central');
    assert.equal(ex(p, 'dir-amazon').whatMayBeNew, 'Seller Central');
  });
  test('C3 reason prompt and guidance: plain non-interactive text, never stored', () => {
    const p = openPage({ page: '4-3', storage: seed(F.profileV2Full) });
    examine(p, 'dir-amazon');
    assert.match(text(p, 'label[for="reason-dir-amazon"]'), /^Why am I considering this direction\?/);
    const g = p.$('#guide-dir-amazon');
    assert.deepEqual(p.$$('#guide-dir-amazon li').map((li) => norm(li.textContent)), ['Something about the work interests me.', 'I have related experience.', 'I want to learn this kind of work.', 'I want to understand it better before deciding.', 'Other.']);
    assert.equal(g.querySelectorAll('input, button, select, textarea, a, [role=button], [tabindex]').length, 0);
    const before = p.raw();
    p.$$('#guide-dir-amazon li').forEach((li) => li.click());
    assert.equal(p.raw(), before, 'clicking a guidance prompt changes nothing');
    judge(p, 'dir-amazon', 'unsure'); save(p);
    assert.deepEqual(Object.keys(ex(p, 'dir-amazon')).sort(), ['directionId', 'judgment', 'learningQuestions', 'reason', 'reasonSkipped', 'relatedEvidenceIds', 'savedAt', 'whatMayBeNew']);
  });
  test('C4 Save my reflection needs a judgment, then confirms quietly and offers the three next steps', () => {
    const p = openPage({ page: '4-3', storage: seed(F.profileV2Full) });
    examine(p, 'dir-amazon');
    assert.equal(p.$('#saveReflection').disabled, true);
    judge(p, 'dir-amazon', 'explore_further');
    assert.equal(p.$('#saveReflection').disabled, false);
    save(p);
    assert.match(ex(p, 'dir-amazon').savedAt, /^\d{4}-/);
    assert.equal(norm(p.$('#savedBox p').textContent), 'Saved. You can revisit or change this reflection later.');
    assert.deepEqual(p.$$('#savedBox a').map((a) => norm(a.textContent)), ['Examine another direction', 'Review my directions', 'Continue to my provisional decision']);
  });
});

describe('4.3 · D16 in the page', () => {
  const confirmMsg = 'This will remove the reason you wrote. Remove it?';
  test('U1 rule 2: with an empty field, choosing "I don’t have a reason to add yet" asks nothing', () => {
    const p = openPage({ page: '4-3', storage: seed(F.profileV2Full) });
    examine(p, 'dir-amazon');
    choose(p, p.$('#skip-dir-amazon'));
    assert.equal(p.dialogs.confirms.length, 0);
    assert.equal(ex(p, 'dir-amazon').reasonSkipped, true);
    assert.equal(norm(p.$('.s43-skip').textContent), 'I don’t have a reason to add yet');
  });
  test('U2 rule 3 Cancel: the written reason stays byte-identical and the option stays unselected', () => {
    const p = openPage({ page: '4-3', storage: seed(F.profileV2Full), confirm: false });
    examine(p, 'dir-amazon');
    type(p, p.$('#reason-dir-amazon'), 'My own reason');
    const strip = (o) => { delete o._meta; return o; };
    const before = strip(p.stored());
    choose(p, p.$('#skip-dir-amazon'));
    assert.deepEqual(p.dialogs.confirms, [confirmMsg]);
    assert.equal(p.$('#skip-dir-amazon').checked, false);
    assert.equal(p.$('#reason-dir-amazon').value, 'My own reason');
    assert.equal(ex(p, 'dir-amazon').reason, 'My own reason', 'stored reason byte-identical');
    assert.equal(ex(p, 'dir-amazon').reasonSkipped, false);
    assert.deepEqual(strip(p.stored()), before, 'nothing else stored changed (only the save time may move)');
  });
  test('U3 rule 3 OK: the reason is removed and the option is set', () => {
    const p = openPage({ page: '4-3', storage: seed(F.profileV2Full), confirm: true });
    examine(p, 'dir-amazon');
    type(p, p.$('#reason-dir-amazon'), 'My own reason');
    choose(p, p.$('#skip-dir-amazon'));
    assert.deepEqual(p.dialogs.confirms, [confirmMsg]);
    assert.equal(p.$('#reason-dir-amazon').value, '');
    assert.deepEqual([ex(p, 'dir-amazon').reason, ex(p, 'dir-amazon').reasonSkipped], ['', true]);
  });
  test('U4 rule 3 also counts text typed but not yet saved (no silent loss)', () => {
    const p = openPage({ page: '4-3', storage: seed(F.profileV2Full), confirm: false });
    examine(p, 'dir-amazon');
    p.$('#reason-dir-amazon').value = 'Typed just now';   // no input/blur yet
    choose(p, p.$('#skip-dir-amazon'));
    assert.deepEqual(p.dialogs.confirms, [confirmMsg]);
    assert.equal(ex(p, 'dir-amazon').reason, 'Typed just now');
  });
  test('U5 rule 1: typing a reason while the option is set turns the option off', () => {
    const p = openPage({ page: '4-3', storage: seed(F.profileV2Full) });
    examine(p, 'dir-amazon');
    choose(p, p.$('#skip-dir-amazon'));
    type(p, p.$('#reason-dir-amazon'), 'Changed my mind');
    assert.equal(p.$('#skip-dir-amazon').checked, false);
    assert.deepEqual([ex(p, 'dir-amazon').reason, ex(p, 'dir-amazon').reasonSkipped], ['Changed my mind', false]);
  });
  test('U6 rules 4–5: blank space is not a reason; emptying the field leaves neither answer', () => {
    const p = openPage({ page: '4-3', storage: seed(F.profileV2Full) });
    examine(p, 'dir-amazon');
    type(p, p.$('#reason-dir-amazon'), '    ');
    assert.deepEqual([ex(p, 'dir-amazon').reason, ex(p, 'dir-amazon').reasonSkipped], ['', false]);
    type(p, p.$('#reason-dir-amazon'), 'Real');
    type(p, p.$('#reason-dir-amazon'), '');
    assert.deepEqual([ex(p, 'dir-amazon').reason, ex(p, 'dir-amazon').reasonSkipped], ['', false]);
  });
});

describe('4.3 · learning questions in the page', () => {
  test('LQ1 offered only after Explore further or Not sure yet, with the brief’s prompt and examples', () => {
    const p = openPage({ page: '4-3', storage: seed(F.profileV2Full) });
    examine(p, 'dir-amazon');
    assert.equal(text(p, '#questions-dir-amazon'), '', 'nothing before a judgment');
    judge(p, 'dir-amazon', 'not_now');
    assert.equal(text(p, '#questions-dir-amazon'), '', 'not offered for Not for me right now');
    for (const j of ['explore_further', 'unsure']) {
      judge(p, 'dir-amazon', j);
      assert.equal(text(p, '.s43-lq-prompt'), 'What would you need to learn or experience to understand this direction better?');
      assert.deepEqual(p.$$('.s43-lq-examples li').map((li) => norm(li.textContent)), ['a knowledge area;', 'a tool or system;', 'a type of task;', 'a workflow;', 'a type of client environment;', 'hands-on practice.']);
      assert.equal(p.$$('.s43-lq-examples input, .s43-lq-examples button').length, 0);
    }
  });
  test('LQ2 questions stay displayed and editable after switching to Not for me right now; blank edits are refused; removal is explicit', () => {
    const p = openPage({ page: '4-3', storage: seed(F.profileV2Full) });
    examine(p, 'dir-amazon');
    judge(p, 'dir-amazon', 'explore_further');
    const add = p.$('#q-add-dir-amazon'); add.value = 'What is Seller Central?'; add.parentElement.querySelector('button').click();
    judge(p, 'dir-amazon', 'not_now');
    assert.equal(p.$('#q-dir-amazon-0').value, 'What is Seller Central?');
    assert.equal(p.$('#q-add-dir-amazon'), null, 'no new questions offered for Not for me right now');
    const q = p.$('#q-dir-amazon-0'); q.value = '  '; q.dispatchEvent(new p.window.Event('change', { bubbles: true }));
    assert.equal(q.value, 'What is Seller Central?');
    assert.deepEqual(ex(p, 'dir-amazon').learningQuestions, ['What is Seller Central?']);
    p.$('#questions-dir-amazon ol button').click();
    assert.deepEqual(ex(p, 'dir-amazon').learningQuestions, []);
  });
  test('LQ3 the add field stops at ten questions', () => {
    const p = openPage({ page: '4-3', storage: seed(F.profileV2Full) });
    examine(p, 'dir-amazon'); judge(p, 'dir-amazon', 'unsure');
    for (let i = 0; i < 10; i++) { const a = p.$('#q-add-dir-amazon'); a.value = 'Question ' + i; a.parentElement.querySelector('button').click(); }
    assert.equal(p.$('#q-add-dir-amazon'), null);
    assert.match(text(p, '#questions-dir-amazon'), /You can keep up to 10 questions for a direction\./);
  });
});

describe('4.3 · provisional decision, comparison and review', () => {
  function threeSaved() {
    const p = openPage({ page: '4-3', storage: seed(F.profileV2Full) });
    for (const [id, j] of [['dir-ndis', 'explore_further'], ['dir-customer-support', 'unsure'], ['dir-bookkeeping', 'not_now']]) { examine(p, id); judge(p, id, j); save(p); }
    examine(p, 'dir-amazon'); judge(p, 'dir-amazon', 'explore_further');   // judged but not saved
    return p;
  }
  test('D1 only saved directions are listed, in the fixed order, none preselected; at most two', () => {
    const p = threeSaved();
    nav(p, 'decision');
    const boxes = p.$$('#decisionPick input');
    assert.deepEqual(boxes.map((b) => b.value), ['dir-customer-support', 'dir-bookkeeping', 'dir-ndis']);
    assert.ok(boxes.every((b) => !b.checked), 'Explore further directions are not auto-selected');
    choose(p, p.$('#decisionPick input[value="dir-ndis"]'));
    choose(p, p.$('#decisionPick input[value="dir-bookkeeping"]'));
    assert.equal(p.$('#decisionPick input[value="dir-customer-support"]').disabled, true);
    assert.deepEqual(m43(p).selectedDirectionIds, ['dir-ndis', 'dir-bookkeeping']);
    assert.equal(m43(p).decisionReached, true);
  });
  test('D2 "I’m still undecided" clears the selection; choosing a direction clears undecided', () => {
    const p = threeSaved();
    nav(p, 'decision');
    choose(p, p.$('#decisionPick input[value="dir-ndis"]'));
    choose(p, p.$('#undecided'));
    assert.deepEqual([m43(p).undecided, m43(p).selectedDirectionIds], [true, []]);
    assert.ok(p.$$('#decisionPick input').every((b) => !b.checked));
    choose(p, p.$('#decisionPick input[value="dir-ndis"]'));
    assert.deepEqual([m43(p).undecided, p.$('#undecided').checked], [false, false]);
  });
  test('D3 with nothing saved, the decision screen asks the learner to examine a direction first', () => {
    const p = openPage({ page: '4-3', storage: seed(F.profileV2Full), hash: 'decision' });
    assert.match(text(p, '#decisionBody'), /Examine a direction and save a judgment for it before choosing what to explore next\./);
    assert.equal(m43(p).decisionReached, false);
  });
  test('CM1 Compare is offered only with two or more saved directions; nothing preselected; columns in fixed order', () => {
    const one = openPage({ page: '4-3', storage: seed(F.profileV2Full) });
    examine(one, 'dir-ndis'); judge(one, 'dir-ndis', 'unsure'); save(one); nav(one, 'decision');
    assert.equal(one.$('#decisionBody a[data-nav="compare"]'), null);
    const p = threeSaved();
    nav(p, 'decision');
    assert.ok(p.$('#decisionBody a[data-nav="compare"]'));
    nav(p, 'compare');
    assert.ok(p.$$('#comparePick input').every((b) => !b.checked));
    assert.equal(p.$('#compareResult'), null);
    choose(p, p.$('#comparePick input[value="dir-ndis"]'));
    choose(p, p.$('#comparePick input[value="dir-customer-support"]'));
    assert.deepEqual(p.$$('#compareResult thead th a').map((a) => norm(a.textContent)), ['Customer Support VA', 'NDIS VA'], 'canonical order, not click order');
  });
  test('CM2 the comparison shows only the five learner-authored rows, with the specified empty states, in table and stacked forms', () => {
    const p = threeSaved();
    examine(p, 'dir-ndis'); type(p, p.$('#reason-dir-ndis'), 'I support my aunt’s care'); choose(p, p.$('#taskPick input[value="task-bbb001"]'));
    type(p, p.$('#new-dir-ndis'), 'NDIS rules'); const a = p.$('#q-add-dir-ndis'); a.value = 'What is a service agreement?'; a.parentElement.querySelector('button').click(); save(p);
    nav(p, 'compare');
    choose(p, p.$('#comparePick input[value="dir-ndis"]')); choose(p, p.$('#comparePick input[value="dir-bookkeeping"]'));
    const rows = p.$$('#compareResult tbody tr').map((tr) => [...tr.children].map((c) => norm(c.textContent)));
    assert.deepEqual(rows, [
      ['My current judgment', 'Not for me right now', 'Explore further'],
      ['Why I am considering it', 'No reason added yet', 'I support my aunt’s care'],
      ['Related experience I chose to consider', 'No tasks selected', 'Tracked household money'],
      ['What may be new for me', 'Nothing added yet', 'NDIS rules'],
      ['What I want to learn', 'Nothing added yet', 'What is a service agreement?']
    ]);
    const stacked = p.$$('#compareResult .s43-compare-stacked section').map((s) => [...s.querySelectorAll('dt')].map((d) => norm(d.textContent)));
    assert.deepEqual(stacked, [rows.map((r) => r[0]), rows.map((r) => r[0])], 'stacked blocks repeat the same row labels');
    const t = text(p, '#compareResult');
    assert.doesNotMatch(t, /What does the work involve|Work patterns commonly involved|score|rank|winner|recommend|%/i);
    const css = readFileSync(new URL('../../public/shared/stage4.css', import.meta.url), 'utf8');
    assert.match(css, /@media\(max-width:959px\)\{\s*\.s43-compare-table\{display:none\}\s*\.s43-compare-stacked\{display:block\}/, 'stacked under 960px');
  });
  test('F1 the review lists selected directions with reason or “No reason added yet”, tasks, what may be new and questions', () => {
    const p = openPage({ page: '4-3', storage: seed(F.profileV3Full), hash: 'finish' });
    const t = text(p, '#finishSummary');
    assert.equal(text(p, '#s6Title'), 'My Directions to Explore');
    assert.match(t, /E-commerce VA.*Why I am considering it I liked handling orders\..*Updated records in a system.*Posted products for our sari-sari store page.*What may be new for me Inventory tools\..*What I want to learn What store platforms are common\?/);
    assert.doesNotMatch(t, /Customer Support VA/, 'only selected directions');
  });
  test('F2 the 4.3 Export gives the shared summary', async () => {
    const p = openPage({ page: '4-3', storage: seed(F.profileV3Full) });
    p.click('.s4-tools [data-export]');
    const b = JSON.parse(await p.downloadText(0));
    assert.deepEqual(b.summary, { workClues: 4, module41Complete: true, module42Complete: true, module43Complete: true, module44Complete: false, experiences: 2, schemaVersion: F.EXPECTED.schema });   // module44Complete: deliberate 4.4 update
  });
});

describe('4.3 · guard and wording safety', () => {
  test('G1 opening 4.3 with newer saved data never overwrites it', () => {
    const p = openPage({ page: '4-3', storage: { [KEY]: F.RAW.newer } });
    assert.deepEqual(p.errors, []);
    examine(p, 'dir-amazon'); judge(p, 'dir-amazon', 'unsure');
    assert.equal(p.raw(), F.RAW.newer);
    assert.ok(p.$$('#storageBanner button').some((b) => /Download saved data/.test(b.textContent)));
  });
  test('G2 opening 4.3 with an empty-string saved value never overwrites it', () => {
    const p = openPage({ page: '4-3', storage: { [KEY]: '' } });
    examine(p, 'dir-amazon');
    assert.equal(p.raw(), '');
    assert.match(p.bannerText(), /could not be read/i);
  });
  test('W1 no scoring, ranking, matching or recommendation logic or wording in m43.js', () => {
    const src = readFileSync(new URL('../../public/shared/m43.js', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
      .replace(/window\.matchMedia\(/g, 'window.MEDIA_QUERY(');   // the browser API name is not matching logic
    assert.doesNotMatch(src, /score|rank|match|recommend|best fit|suited|qualified|percent|weight/i);
    assert.doesNotMatch(src, /\.sort\(/, 'nothing is re-ordered');
    /* Card patterns are used only to draw the card; the learner's task tags are only displayed,
       and never appear next to direction data. */
    const cardUses = src.split('\n').filter((l) => /\bd\.patterns\b(?!Note)/.test(l));
    assert.deepEqual(cardUses.map((l) => /tags\(d\.patterns\)/.test(l)), [true], 'd.patterns appears once, in the card renderer');
    const tagLines = src.split('\n').filter((l) => /patternTags/.test(l));
    assert.ok(tagLines.length >= 1);
    for (const l of tagLines) assert.doesNotMatch(l, /\bd\.|DIRECTIONS|directionId|indexOf|===|filter|some\(|every\(/, 'task tags are display-only: ' + l.trim().slice(0, 80));
  });
});

describe('4.3 · navigation (Step E)', () => {
  test('N1 hub: 4.3 complete → Review Module 4.3; in progress → Continue at the saved section', () => {
    const done = openPage({ page: 'index', storage: seed(F.profileV3Full) });
    assert.equal(text(done, '#stamp43'), 'Complete');
    assert.equal(text(done, '#continueBtn'), 'Review Module 4.3');
    assert.equal(text(done, '#homeSummary'), 'Module 4.1 complete · Module 4.2 complete · Module 4.3 complete · 4 Work Clues saved');
    const prof = JSON.parse(JSON.stringify(F.profileV3Full)); prof.modules['4-3'].completedAt = null; prof.modules['4-3'].lastSection = 'decision';
    const mid = openPage({ page: 'progress', storage: seed(prof) });
    assert.equal(text(mid, '#continueBtn'), 'Continue Module 4.3');
    assert.equal(mid.$('#continueBtn').getAttribute('href'), '../4-3/#decision');
  });
  test('N2 4.1 and 4.2 sidebars link to 4.3; only 4.4 is Coming later; 4.2’s NEXT links to 4.3', () => {
    for (const page of ['4-1', '4-2']) {
      const p = openPage({ page });
      assert.equal(p.$('.s4-modules a[href="../4-3/"]').textContent.replace(/\s+/g, ' ').trim(), '4.3 Exploring Possible Directions');
      assert.deepEqual(p.$$('.s4-modules li.later').map((li) => words(li)), ['4.4 Build Your Direction Map Coming later']);
    }
    const p = openPage({ page: '4-2', hash: 'handoff' });
    const next = p.$('#handoff a.s4-next');
    assert.equal(next.getAttribute('href'), '../4-3/');
    assert.match(next.textContent, /NEXT: 4\.3 EXPLORING POSSIBLE DIRECTIONS.*Open Module 4\.3/);
  });
  test('N3 the 4.3 page marks itself current and shows 4.4 as Coming later with no link', () => {
    const p = openPage({ page: '4-3', storage: seed(F.profileV2Full) });
    assert.match(p.$('.s4-modules li.current').textContent, /4\.3 Exploring Possible Directions/);
    assert.equal(p.$$('a[href*="4-4"]').length, 0);
    assert.equal(text(p, '#m41Status'), 'Complete');
    assert.equal(text(p, '#m42Status'), 'Complete');
  });
});

describe('4.3 · hub status for a learner who started 4.3 but has not examined a direction (correction)', () => {
  test('S1 reviewed Work Clues and evidence through the page, no direction yet → In progress, Continue at the saved section', () => {
    const p = openPage({ page: '4-3', storage: seed(F.profileV2Full) });
    p.click('a[data-nav="clues"].btn'); p.click('#cluesContinue'); p.click('#evidenceContinue');
    assert.deepEqual(m43(p).directionExplorations, []);
    assert.deepEqual(m43(p).examinedDirectionIds, []);
    for (const [page, base] of [['index', './'], ['progress', '../']]) {
      const h = p.reopen(page);
      assert.equal(text(h, '#homeSummary'), 'Module 4.1 complete · Module 4.2 complete · Module 4.3 in progress · 4 Work Clues saved');
      if (page === 'index') assert.equal(text(h, '#stamp43'), 'In progress');
      assert.equal(text(h, '#continueBtn'), 'Continue Module 4.3');
      assert.equal(h.$('#continueBtn').getAttribute('href'), base + '4-3/#directions');
    }
  });
  const savedProgress = (fields) => {
    const prof = JSON.parse(JSON.stringify(F.profileV2Full)); prof.schemaVersion = 3;
    prof.modules['4-3'] = { lastSection: null, reviewedWorkClues: false, reviewedEvidence: false, examinedDirectionIds: [], directionExplorations: [],
      decisionReached: false, undecided: false, undecidedNote: '', selectedDirectionIds: [], completedAt: null, ...fields };
    return prof;
  };
  for (const [label, fields] of [['Work Clues reviewed', { reviewedWorkClues: true }], ['evidence reviewed', { reviewedEvidence: true }],
    ['a direction examined', { examinedDirectionIds: ['dir-ndis'] }], ['undecided chosen', { undecided: true }]]) {
    test(`S2 saved 4.3 progress without a lastSection (${label}) → In progress, Continue Module 4.3`, () => {
      const h = openPage({ page: 'index', storage: seed(savedProgress(fields)) });
      assert.equal(text(h, '#stamp43'), 'In progress');
      assert.equal(text(h, '#continueBtn'), 'Continue Module 4.3');
      assert.equal(h.$('#continueBtn').getAttribute('href'), './4-3/');
    });
  }
  test('S3 an empty 4.3 block (nothing saved) is still Not started → Start Module 4.3', () => {
    const h = openPage({ page: 'index', storage: seed(savedProgress({})) });
    assert.equal(text(h, '#stamp43'), 'Not started');
    assert.equal(text(h, '#continueBtn'), 'Start Module 4.3');
  });
});
