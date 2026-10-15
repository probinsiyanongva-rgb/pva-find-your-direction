/* PVA Academy — Stage 4 · Module 4.3: Exploring Possible Directions
   Production Specification v1.5. Same shell and routing pattern as 4.1/4.2.
   Rules enforced here (and in state.js):
   - no scoring, ranking, matching, recommendation or preselection anywhere;
   - Direction Cards come from PVA_M41.DIRECTIONS, always in its fixed order;
   - 4.2 tasks are listed in full, in 4.2's own order; the learner chooses;
   - Work Clues and 4.2 records are read only; all writes go through PVAS4.m43;
   - guidance prompts and learning-question examples are plain text, never stored;
   - a written reason is only removed after the learner confirms (D16);
   - learning questions are kept whatever the judgment. */
(function () {
  'use strict';

  var S = window.PVAS4, D41 = window.PVA_M41, D42 = window.PVA_M42, API = S && S.m43, MOD = '4-3';
  if (!S || !D41 || !D42 || !API) return;

  var SECTIONS = ['start', 'clues', 'evidence', 'directions', 'examine', 'decision', 'compare', 'finish'];
  var JUDGMENT_TEXT = {
    explore_further: ['Explore further', 'I can imagine investigating this kind of work.'],
    unsure: ['Not sure yet', 'I need more information or experience before I know.'],
    not_now: ['Not for me right now', 'I don’t want to prioritize this direction at the moment.']
  };
  var REACTION_GROUPS = [['explore', 'Want to explore'], ['unsure', 'Not sure yet'], ['not_for_me', 'Probably not for me']];
  var GUIDANCE = ['Something about the work interests me.', 'I have related experience.', 'I want to learn this kind of work.', 'I want to understand it better before deciding.', 'Other.'];
  var LQ_EXAMPLES = ['a knowledge area;', 'a tool or system;', 'a type of task;', 'a workflow;', 'a type of client environment;', 'hands-on practice.'];
  var COPY = {
    noClues: 'You don\'t have Work Clues saved from 4.1 yet. You can still explore directions here.',
    noTasks: 'You don\'t have experience records saved from 4.2 yet. You can still examine the directions and note what you would like to learn.',
    tasksPrompt: 'Which of your recorded tasks, if any, would you like to consider alongside this direction?',
    newPrompt: 'Look at the work and task examples above. Which parts have you not tried yet, or do you want to understand better?',
    judgmentQ: 'For now, how do you feel about exploring this direction further?',
    judgmentNote: 'This is a separate choice about this direction. It doesn\'t change the Work Clues you saved in 4.1.',
    reasonQ: 'Why am I considering this direction?',
    noReasonOption: 'I don’t have a reason to add yet',
    confirmRemove: 'This will remove the reason you wrote. Remove it?',
    lqPrompt: 'What would you need to learn or experience to understand this direction better?',
    saved: 'Saved. You can revisit or change this reflection later.',
    undecided: 'I’m not choosing a direction yet. I want to keep exploring before I decide.',
    noReason: 'No reason added yet', noTasksSel: 'No tasks selected', nothing: 'Nothing added yet',
    transition1: 'You\'ve looked at the work. You\'ve looked at what you\'ve actually done. Now you\'ve put those two views side by side.',
    transition2: 'Next, we\'ll turn the directions you\'re exploring into a practical next step.',
    names: 'You don’t need to enter names of employers, clients, schools, or family members.'
  };

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function el(tag, attrs, html) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { if (attrs[k] !== null && attrs[k] !== undefined) n.setAttribute(k, attrs[k]); });
    if (html !== undefined) n.innerHTML = html;
    return n;
  }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function byId(list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return null; }
  function debounced(input, save) {
    var timer;
    function flush() { clearTimeout(timer); save(input.value); }
    input.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(flush, 400); });
    input.addEventListener('blur', flush);
    return flush;
  }

  /* ---------- read-only views of state ---------- */
  function mod() { return S.module(MOD); }                       // never creates state
  function dirById(id) { return byId(D41.DIRECTIONS, id); }
  function exploration(id) { return API.exploration(id); }
  function isSaved(id) { return API.isSaved(exploration(id)); }
  function savedDirections() { return D41.DIRECTIONS.filter(function (d) { return isSaved(d.id); }); }   // canonical order
  function experiences() { return S.module('4-2').experiences || []; }
  function taskRows() { var out = []; experiences().forEach(function (x, i) { x.tasks.forEach(function (t) { out.push({ exp: x, index: i, task: t }); }); }); return out; }
  function sourceLabel(id) { var s = byId(D42.SOURCES, id); return s ? s.label : id; }
  function evidenceLabel(id) { var e = byId(D42.EVIDENCE, id); return e ? e.label : ''; }
  function patternName(id) { var p = byId(D42.PATTERNS, id); return p ? p.name : id; }
  function expTitle(x, i) { return 'Experience ' + (i + 1) + ': ' + sourceLabel(x.source); }
  function clueLabel(c) {
    var item = c.sourceType === 'scenario' ? byId(D41.SCENARIOS, c.sourceId) : byId(D41.DIRECTIONS, c.sourceId);
    return item ? (c.sourceType === 'scenario' ? item.title : item.name) : null;
  }
  function judgmentLabel(j) { return JUDGMENT_TEXT[j] ? JUDGMENT_TEXT[j][0] : ''; }

  /* ---------- completion (spec v1.5 Screen 6: seven criteria) ---------- */
  function conditions() {
    var m = mod(), xs = m.directionExplorations || [];
    var saved = xs.filter(function (x) { return API.isSaved(x); });
    return {
      clues: m.reviewedWorkClues === true,
      evidence: m.reviewedEvidence === true,
      examined: (m.examinedDirectionIds || []).length > 0,
      judged: saved.length > 0,
      reason: saved.some(function (x) { return !!x.reason || x.reasonSkipped === true; }),
      decision: m.decisionReached === true,
      chosen: (m.selectedDirectionIds || []).length > 0 || m.undecided === true
    };
  }
  function allMet(c) { return c.clues && c.evidence && c.examined && c.judged && c.reason && c.decision && c.chosen; }

  /* ---------- Screen 1: Work Clues (read-only) ---------- */
  function renderClues() {
    var host = $('#clueList'); host.innerHTML = '';
    var clues = S.clues().filter(function (c) { return clueLabel(c) !== null; });
    $('#cluesContinue').textContent = clues.length ? 'Continue →' : 'Continue without Work Clues';
    if (!clues.length) { host.appendChild(el('div', { 'class': 'card s4-empty' }, '<p>' + esc(COPY.noClues) + '</p>')); return; }
    REACTION_GROUPS.forEach(function (g) {
      var items = clues.filter(function (c) { return c.reaction === g[0]; });
      var sec = el('section', { 'class': 'card s4-group', 'aria-labelledby': 'clue-grp-' + g[0] });
      sec.appendChild(el('h3', { id: 'clue-grp-' + g[0], 'class': 's4-group-title' }, esc(g[1].toUpperCase())));
      if (!items.length) sec.appendChild(el('p', { 'class': 's4-none' }, 'Nothing here.'));
      else {
        var ul = el('ul', { 'class': 's4-snap-list' });
        items.forEach(function (c) {
          ul.appendChild(el('li', null, '<span class="s4-kind">' + (c.sourceType === 'scenario' ? 'Scenario' : 'Direction') + '</span> ' + esc(clueLabel(c)) +
            ' <span class="small">· Your reaction: ' + esc(g[1]) + '</span>' + (c.note ? '<br><span class="small">Your note: ' + esc(c.note) + '</span>' : '')));
        });
        sec.appendChild(ul);
      }
      host.appendChild(sec);
    });
  }

  /* ---------- Screen 2: what I have done (read-only, 4.2 order) ---------- */
  function renderEvidence() {
    var host = $('#taskList'); host.innerHTML = '';
    var rows = taskRows();
    $('#evidenceContinue').textContent = rows.length ? 'Continue →' : 'Continue without task evidence';
    if (!rows.length) { host.appendChild(el('div', { 'class': 'card s4-empty' }, '<p>' + esc(COPY.noTasks) + '</p>')); return; }
    experiences().forEach(function (x, i) {
      if (!x.tasks.length) return;
      var card = el('article', { 'class': 'card s4-exp' });
      card.appendChild(el('h3', { 'class': 's4-exp-title' }, esc(expTitle(x, i)) + (x.note ? ' <span class="small">— ' + esc(x.note) + '</span>' : '')));
      var ul = el('ul', { 'class': 's4-snap-list' });
      x.tasks.forEach(function (t) {
        ul.appendChild(el('li', null, esc(t.label) +
          (t.evidence ? ' <span class="s4-evtag">' + esc(evidenceLabel(t.evidence)) + '</span>' : ' <span class="small">No evidence answer yet</span>') +
          (t.patternTags.length ? '<ul class="s4-tags s4-tags-inline" aria-label="Work patterns you chose">' + t.patternTags.map(function (p) { return '<li>' + esc(patternName(p)) + '</li>'; }).join('') + '</ul>' : '') +
          (t.note ? '<br><span class="small">' + esc(t.note) + '</span>' : '')));
      });
      card.appendChild(ul);
      host.appendChild(card);
    });
  }

  /* ---------- Screen 3: the 11 directions, fixed order ---------- */
  function tags(list) { return '<ul class="s4-tags" aria-label="Work patterns commonly involved">' + list.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>'; }
  function renderDirections() {
    var host = $('#directionList'); host.innerHTML = '';
    D41.DIRECTIONS.forEach(function (d) {
      var card = el('article', { 'class': 'card s4-dir', id: 'pick-' + d.id, 'aria-labelledby': 'pick-' + d.id + '-t' });
      var x = exploration(d.id), status = API.isSaved(x) ? 'Reflection saved' : (mod().examinedDirectionIds.indexOf(d.id) >= 0 ? 'Started' : '');
      card.innerHTML = '<div class="s4-dir-head"><span class="s4-dir-num" aria-hidden="true">' + esc(d.num) + '</span>' +
        '<div class="s4-dir-headtext"><h3 id="pick-' + d.id + '-t">' + esc(d.name) + '</h3><p>' + esc(d.involves) + '</p>' +
        (status ? '<p class="small s43-status">' + esc(status) + '</p>' : '') + '</div></div>';
      var b = el('a', { 'class': 'btn secondary small-btn', href: '#examine-' + d.id, 'data-nav': 'examine-' + d.id, 'aria-label': 'Examine this direction: ' + d.name }, 'Examine this direction');
      card.appendChild(el('div', { 'class': 's4-actions' })).appendChild(b);
      host.appendChild(card);
    });
  }

  /* ---------- Screen 4: the connection view ---------- */
  /* Card markup and headings mirror 4.1's renderDirections() so the content-parity
     test can compare them field by field. Content comes only from PVA_M41.DIRECTIONS. */
  function cardHtml(d) {
    return '<div class="s4-dir-headtext">' +
      '<h4 class="s4-field">What does the work involve?</h4><p>' + esc(d.involves) + '</p>' +
      '<h4 class="s4-field">Work patterns commonly involved</h4>' + tags(d.patterns) +
      (d.patternsNote ? '<p class="small">' + esc(d.patternsNote) + '</p>' : '') + '</div>' +
      '<div class="s4-dir-details">' +
      '<h4 class="s4-field">Examples of tasks</h4><ul>' + d.tasks.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' +
      '<h4 class="s4-field">What kind of work environment?</h4><p>' + esc(d.environment) + '</p>' +
      '<h4 class="s4-field">What can be demanding about it?</h4><p>' + esc(d.demanding) + '</p>' +
      '<h4 class="s4-field">Typical path</h4><p class="s4-path"><strong>' + esc(d.path) + '</strong></p><p>' + esc(d.pathNote) + '</p>' +
      '<h4 class="s4-field">Useful skills</h4><p>' + esc(d.skills) + '</p>' +
      '<h4 class="s4-field">What would you need to learn?</h4><p>' + esc(d.learn) + '</p>' +
      (d.related ? '<p class="tip s4-related">' + d.related + '</p>' : '') + '</div>';
  }
  var flushers = [];
  function flushAll() { flushers.forEach(function (f) { f(); }); }
  function renderExamine(id) {
    flushAll(); flushers = [];
    var d = dirById(id), host = $('#examineBody');
    $('#s4Title').innerHTML = '<span class="s4-dir-num">' + esc(d.num) + '</span> <span class="s43-dirname">' + esc(d.name) + '</span>';
    host.innerHTML = '';

    // A. What this direction involves
    var a = el('section', { 'class': 'card s4-dir s43-part', 'aria-labelledby': 'partA' });
    a.appendChild(el('h3', { id: 'partA', 'class': 's4-group-title' }, 'A. What this direction involves'));
    var card = el('div', { 'class': 's43-card', 'data-direction': d.id }, cardHtml(d));
    a.appendChild(card);
    host.appendChild(a);

    // B. What I have done that I want to consider
    var b = el('section', { 'class': 'card s43-part', 'aria-labelledby': 'partB' });
    b.appendChild(el('h3', { id: 'partB', 'class': 's4-group-title' }, 'B. What I have done that I want to consider'));
    var rows = taskRows();
    if (!rows.length) b.appendChild(el('p', { 'class': 's4-empty' }, esc(COPY.noTasks)));
    else {
      var fs = el('fieldset', { 'class': 's4-pick', id: 'taskPick' });
      fs.appendChild(el('legend', null, esc(COPY.tasksPrompt)));
      var x0 = exploration(id), chosen = x0 ? x0.relatedEvidenceIds : [];
      rows.forEach(function (r) {
        var lab = el('label', { 'class': 'choice s43-task' });
        var cb = el('input', { type: 'checkbox', value: r.task.id });
        if (chosen.indexOf(r.task.id) >= 0) cb.checked = true;
        cb.addEventListener('change', function () { API.setEvidence(id, r.task.id, cb.checked); });
        lab.appendChild(cb);
        lab.appendChild(el('span', null, esc(r.task.label) + ' <span class="small">(' + esc(expTitle(r.exp, r.index)) + (r.task.evidence ? ' · ' + esc(evidenceLabel(r.task.evidence)) : '') + ')</span>'));
        fs.appendChild(lab);
      });
      b.appendChild(fs);
    }
    host.appendChild(b);

    // C. What may be new for me
    var c = el('section', { 'class': 'card s43-part', 'aria-labelledby': 'partC' });
    c.appendChild(el('h3', { id: 'partC', 'class': 's4-group-title' }, 'C. What may be new for me'));
    c.appendChild(el('label', { 'class': 'field-label', 'for': 'new-' + id }, esc(COPY.newPrompt) + ' <span class="small">(optional)</span>'));
    var newTa = el('textarea', { id: 'new-' + id, 'class': 'response s4-note', rows: '3', maxlength: String(S.LIMITS_43.whatMayBeNew) });
    newTa.value = (exploration(id) || {}).whatMayBeNew || '';
    flushers.push(debounced(newTa, function (v) { API.setWhatMayBeNew(id, v); }));
    c.appendChild(newTa);
    host.appendChild(c);

    // Judgment, reason, learning questions, save
    var j = el('section', { 'class': 'card s43-part', 'aria-labelledby': 'partJ' });
    j.appendChild(el('h3', { id: 'partJ', 'class': 's4-group-title' }, 'Your judgment'));
    var jfs = el('fieldset', { 'class': 's43-judgment' });
    jfs.appendChild(el('legend', null, esc(COPY.judgmentQ)));
    var row = el('div', { 'class': 's4-rx-row' });
    S.JUDGMENTS.forEach(function (v) {
      var lab = el('label', { 'class': 's4-rx' });
      var inp = el('input', { type: 'radio', name: 'judgment-' + id, value: v });
      if ((exploration(id) || {}).judgment === v) inp.checked = true;
      inp.addEventListener('change', function () { if (inp.checked) { API.setJudgment(id, v); renderQuestions(id); syncSave(id); } });
      lab.appendChild(inp);
      lab.appendChild(el('span', null, '<strong>' + esc(JUDGMENT_TEXT[v][0]) + '</strong> — ' + esc(JUDGMENT_TEXT[v][1])));
      row.appendChild(lab);
    });
    jfs.appendChild(row);
    j.appendChild(jfs);
    j.appendChild(el('p', { 'class': 'small s43-judgment-note' }, esc(COPY.judgmentNote)));
    j.appendChild(el('p', { 'class': 'small' }, 'The judgment describes your current reaction, not your ability or suitability.'));

    // Reason (D7, D16)
    var rWrap = el('div', { 'class': 's43-reason' });
    rWrap.appendChild(el('label', { 'class': 'field-label', 'for': 'reason-' + id }, esc(COPY.reasonQ) + ' <span class="small">(optional, a short note)</span>'));
    var ta = el('textarea', { id: 'reason-' + id, 'class': 'response s4-note', rows: '2', maxlength: String(S.LIMITS_43.reason), 'aria-describedby': 'guide-' + id });
    ta.value = (exploration(id) || {}).reason || '';
    rWrap.appendChild(ta);
    var guide = el('div', { 'class': 's43-guidance', id: 'guide-' + id });
    guide.appendChild(el('p', { 'class': 'small' }, 'For example:'));
    guide.appendChild(el('ul', { 'class': 'small' }, GUIDANCE.map(function (g) { return '<li>' + esc(g) + '</li>'; }).join('')));
    rWrap.appendChild(guide);
    var skipLab = el('label', { 'class': 'choice s43-skip' });
    var skip = el('input', { type: 'checkbox', id: 'skip-' + id });
    skipLab.appendChild(skip); skipLab.appendChild(el('span', null, esc(COPY.noReasonOption)));
    rWrap.appendChild(skipLab);
    rWrap.appendChild(el('p', { 'class': 'small' }, esc(COPY.names)));
    function syncSkip() { skip.checked = !!(exploration(id) || {}).reasonSkipped; }
    var flushReason = debounced(ta, function (v) { API.setReason(id, v); syncSkip(); });
    flushers.push(flushReason);
    skip.addEventListener('change', function () {
      if (skip.checked) {
        flushReason();                                   // what is in the field is what counts
        if (API.skipReason(id) === 'needs-confirm') {
          if (window.confirm(COPY.confirmRemove)) { API.skipReason(id, { confirmed: true }); ta.value = ''; }
          /* Cancel: the reason stays exactly as written and the option stays unselected */
        }
      } else API.unskipReason(id);
      syncSkip();
    });
    syncSkip();
    j.appendChild(rWrap);

    j.appendChild(el('div', { id: 'questions-' + id, 'class': 's43-questions' }));
    var saveRow = el('div', { 'class': 's4-actions s43-save' });
    var saveBtn = el('button', { type: 'button', 'class': 'btn', id: 'saveReflection' }, 'Save my reflection');
    saveRow.appendChild(saveBtn);
    j.appendChild(saveRow);
    j.appendChild(el('p', { 'class': 'small', id: 'saveHint' }, 'Choose how you feel about exploring this direction to save your reflection.'));
    var savedBox = el('div', { 'class': 'feedback info s43-saved', id: 'savedBox', role: 'status', 'aria-live': 'polite' });
    j.appendChild(savedBox);
    saveBtn.addEventListener('click', function () {
      flushAll();
      if (!API.saveReflection(id)) return;
      savedBox.innerHTML = '<p>' + esc(COPY.saved) + '</p><div class="s4-actions">' +
        '<a class="btn secondary small-btn" href="#directions" data-nav="directions">Examine another direction</a> ' +
        '<a class="btn secondary small-btn" href="#directions" data-nav="directions">Review my directions</a> ' +
        '<a class="btn small-btn" href="#decision" data-nav="decision">Continue to my provisional decision</a></div>';
      savedBox.classList.add('show');
    });
    host.appendChild(j);
    renderQuestions(id);
    syncSave(id);
  }
  function syncSave(id) {
    var has = !!(exploration(id) || {}).judgment;
    var btn = $('#saveReflection'), hint = $('#saveHint');
    if (btn) btn.disabled = !has;
    if (hint) hint.hidden = has;
  }
  /* Learning questions (decision 2): offered after Explore further / Not sure yet;
     kept, shown and editable whatever the judgment. */
  function renderQuestions(id) {
    var host = $('#questions-' + id); if (!host) return;
    host.innerHTML = '';
    var x = exploration(id) || { learningQuestions: [], judgment: null };
    var qs = x.learningQuestions, offer = x.judgment === 'explore_further' || x.judgment === 'unsure';
    if (!offer && !qs.length) return;
    host.appendChild(el('h4', { 'class': 's4-field' }, 'Learning questions <span class="small">(optional)</span>'));
    if (offer) {
      host.appendChild(el('p', { 'class': 's43-lq-prompt' }, '<strong>' + esc(COPY.lqPrompt) + '</strong>'));
      host.appendChild(el('p', { 'class': 'small' }, 'The answer can be:'));
      host.appendChild(el('ul', { 'class': 'small s43-lq-examples' }, LQ_EXAMPLES.map(function (e) { return '<li>' + esc(e) + '</li>'; }).join('')));
      host.appendChild(el('p', { 'class': 'small' }, 'You aren’t expected to know the complete learning path.'));
    } else {
      host.appendChild(el('p', { 'class': 'small' }, 'Your questions are kept here. You can still edit or remove them.'));
    }
    if (qs.length) {
      var ol = el('ol', { 'class': 's43-qlist' });
      qs.forEach(function (q, i) {
        var li = el('li');
        var qid = 'q-' + id + '-' + i;
        li.appendChild(el('label', { 'class': 'sr-only', 'for': qid }, 'Learning question ' + (i + 1)));
        var inp = el('input', { type: 'text', id: qid, 'class': 'response s4-own', maxlength: String(S.LIMITS_43.question), autocomplete: 'off' });
        inp.value = q;
        inp.addEventListener('change', function () {
          if (!API.updateQuestion(id, i, inp.value)) { inp.value = exploration(id).learningQuestions[i]; announce(host, 'To delete a question, use Remove.'); }
        });
        li.appendChild(inp);
        var rm = el('button', { type: 'button', 'class': 'btn subtle small-btn', 'aria-label': 'Remove learning question ' + (i + 1) }, 'Remove');
        rm.addEventListener('click', function () { API.removeQuestion(id, i); renderQuestions(id); });
        li.appendChild(rm);
        ol.appendChild(li);
      });
      host.appendChild(ol);
    }
    if (offer && qs.length < S.LIMITS_43.questions) {
      var addId = 'q-add-' + id;
      host.appendChild(el('label', { 'class': 'field-label', 'for': addId }, 'Add a question'));
      var r = el('div', { 'class': 's4-own-row' });
      var add = el('input', { type: 'text', id: addId, 'class': 'response s4-own', maxlength: String(S.LIMITS_43.question), autocomplete: 'off' });
      var btn = el('button', { type: 'button', 'class': 'btn secondary small-btn' }, 'Add question');
      function doAdd() { if (API.addQuestion(id, add.value)) { renderQuestions(id); var n = $('#' + addId); if (n) n.focus(); } }
      btn.addEventListener('click', doAdd);
      add.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); doAdd(); } });
      r.appendChild(add); r.appendChild(btn); host.appendChild(r);
    } else if (offer) host.appendChild(el('p', { 'class': 'small' }, 'You can keep up to ' + S.LIMITS_43.questions + ' questions for a direction.'));
    host.appendChild(el('p', { 'class': 'small s43-msg', role: 'status', 'aria-live': 'polite' }));
  }
  function announce(host, msg) { var m = $('.s43-msg', host); if (m) m.textContent = msg; }

  /* ---------- Screen 5: provisional decision ---------- */
  function renderDecision() {
    var host = $('#decisionBody'); host.innerHTML = '';
    var saved = savedDirections(), m = mod();
    if (!saved.length) {
      host.appendChild(el('div', { 'class': 'card s4-empty' }, '<p>Examine a direction and save a judgment for it before choosing what to explore next.</p><p><a href="#directions" data-nav="directions">Choose a direction</a></p>'));
      return;
    }
    API.setDecisionReached();
    var card = el('div', { 'class': 'card' });
    var fs = el('fieldset', { 'class': 's4-pick', id: 'decisionPick' });
    fs.appendChild(el('legend', null, 'Choose up to two directions to explore further'));
    var full = m.selectedDirectionIds.length >= S.LIMITS_43.selected;
    saved.forEach(function (d) {
      var lab = el('label', { 'class': 'choice s43-pickdir' });
      var cb = el('input', { type: 'checkbox', value: d.id });
      var on = m.selectedDirectionIds.indexOf(d.id) >= 0;
      cb.checked = on; if (full && !on) cb.disabled = true;
      cb.addEventListener('change', function () { API.setSelected(d.id, cb.checked); renderDecision(); renderStatus(); });
      lab.appendChild(cb);
      lab.appendChild(el('span', null, esc(d.name) + ' <span class="small">· Your judgment: ' + esc(judgmentLabel(exploration(d.id).judgment)) + '</span>'));
      fs.appendChild(lab);
    });
    if (full) fs.appendChild(el('p', { 'class': 'small' }, 'You can choose up to two. Untick one to choose a different direction.'));
    card.appendChild(fs);
    var ulab = el('label', { 'class': 'choice s43-undecided' });
    var ucb = el('input', { type: 'checkbox', id: 'undecided' });
    ucb.checked = m.undecided === true;
    ucb.addEventListener('change', function () { API.setUndecided(ucb.checked); renderDecision(); renderStatus(); });
    ulab.appendChild(ucb); ulab.appendChild(el('span', null, 'I’m still undecided'));
    card.appendChild(ulab);
    host.appendChild(card);
    var actions = el('div', { 'class': 's4-continue' });
    if (saved.length >= 2) actions.appendChild(el('a', { 'class': 'btn secondary', href: '#compare', 'data-nav': 'compare' }, 'Compare two directions'));
    actions.appendChild(el('a', { 'class': 'btn', href: '#finish', 'data-nav': 'finish' }, 'Continue to review and finish →'));
    host.appendChild(actions);
  }

  /* ---------- Screen 5A: optional comparison (learner-authored rows only) ---------- */
  var compareSel = [];                                            // transient, never stored
  function rowsFor(d) {
    var x = exploration(d.id), tasks = API.relatedTasks(d.id);
    function list(items) { return '<ul>' + items.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>'; }
    return [
      ['My current judgment', esc(judgmentLabel(x.judgment))],
      ['Why I am considering it', x.reason ? esc(x.reason) : esc(COPY.noReason)],
      ['Related experience I chose to consider', tasks.length ? list(tasks.map(function (r) { return r.task.label; })) : esc(COPY.noTasksSel)],
      ['What may be new for me', x.whatMayBeNew ? esc(x.whatMayBeNew) : esc(COPY.nothing)],
      ['What I want to learn', x.learningQuestions.length ? list(x.learningQuestions) : esc(COPY.nothing)]
    ];
  }
  function renderCompare() {
    var host = $('#compareBody'); host.innerHTML = '';
    var saved = savedDirections();
    compareSel = compareSel.filter(function (id) { return isSaved(id); });
    if (saved.length < 2) { host.appendChild(el('div', { 'class': 'card s4-empty' }, '<p>Save a judgment for at least two directions to compare them.</p><p><a href="#directions" data-nav="directions">Choose a direction</a></p>')); return; }
    var card = el('div', { 'class': 'card' });
    var fs = el('fieldset', { 'class': 's4-pick', id: 'comparePick' });
    fs.appendChild(el('legend', null, 'Choose two directions to compare'));
    saved.forEach(function (d) {
      var lab = el('label', { 'class': 'choice' });
      var cb = el('input', { type: 'checkbox', value: d.id });
      cb.checked = compareSel.indexOf(d.id) >= 0;
      if (compareSel.length >= 2 && !cb.checked) cb.disabled = true;
      cb.addEventListener('change', function () {
        if (cb.checked) { if (compareSel.length < 2) compareSel.push(d.id); } else compareSel = compareSel.filter(function (i) { return i !== d.id; });
        renderCompare();
      });
      lab.appendChild(cb); lab.appendChild(el('span', null, esc(d.name)));
      fs.appendChild(lab);
    });
    card.appendChild(fs);
    host.appendChild(card);
    if (compareSel.length !== 2) return;
    var pair = D41.DIRECTIONS.filter(function (d) { return compareSel.indexOf(d.id) >= 0; });   // canonical order, not click order
    var rows = pair.map(rowsFor);
    var link = function (d) { return '<a href="#examine-' + d.id + '" data-nav="examine-' + d.id + '">' + esc(d.name) + '</a>'; };
    var table = '<div class="s43-compare-table"><table><caption class="sr-only">What you recorded for ' + esc(pair[0].name) + ' and ' + esc(pair[1].name) + '</caption>' +
      '<thead><tr><th scope="col">What you recorded</th><th scope="col">' + link(pair[0]) + '</th><th scope="col">' + link(pair[1]) + '</th></tr></thead><tbody>' +
      rows[0].map(function (r, i) { return '<tr><th scope="row">' + esc(r[0]) + '</th><td>' + r[1] + '</td><td>' + rows[1][i][1] + '</td></tr>'; }).join('') + '</tbody></table></div>';
    var stacked = '<div class="s43-compare-stacked">' + pair.map(function (d, k) {
      return '<section class="card" aria-label="' + esc(d.name) + '"><h3>' + link(d) + '</h3><dl>' + rows[k].map(function (r) { return '<dt>' + esc(r[0]) + '</dt><dd>' + r[1] + '</dd>'; }).join('') + '</dl></section>';
    }).join('') + '</div>';
    host.appendChild(el('div', { 'class': 'card s43-compare', id: 'compareResult' }, table + stacked));
  }

  /* ---------- Screen 6: review and finish ---------- */
  function renderFinish() {
    flushAll();
    var host = $('#finishSummary'); host.innerHTML = '';
    var m = mod();
    var sel = D41.DIRECTIONS.filter(function (d) { return m.selectedDirectionIds.indexOf(d.id) >= 0; });
    if (sel.length) {
      sel.forEach(function (d) {
        var x = exploration(d.id), tasks = API.relatedTasks(d.id);
        var s = el('section', { 'class': 's43-summary', 'aria-labelledby': 'sum-' + d.id });
        s.appendChild(el('h3', { id: 'sum-' + d.id }, esc(d.name) + ' <a class="small" href="#examine-' + d.id + '" data-nav="examine-' + d.id + '">Edit</a>'));
        var dl = '<dl>' +
          '<dt>Why I am considering it</dt><dd>' + (x.reason ? esc(x.reason) : esc(COPY.noReason)) + '</dd>' +
          '<dt>Related experience I chose to consider</dt><dd>' + (tasks.length ? '<ul>' + tasks.map(function (r) { return '<li>' + esc(r.task.label) + '</li>'; }).join('') + '</ul>' : esc(COPY.noTasksSel)) + '</dd>' +
          '<dt>What may be new for me</dt><dd>' + (x.whatMayBeNew ? esc(x.whatMayBeNew) : esc(COPY.nothing)) + '</dd>' +
          (x.learningQuestions.length ? '<dt>What I want to learn</dt><dd><ul>' + x.learningQuestions.map(function (q) { return '<li>' + esc(q) + '</li>'; }).join('') + '</ul></dd>' : '') +
          '</dl>';
        s.insertAdjacentHTML('beforeend', dl);
        host.appendChild(s);
      });
    } else if (m.undecided) {
      host.appendChild(el('p', { 'class': 's43-undecided-text' }, esc(COPY.undecided)));
      host.appendChild(el('label', { 'class': 'field-label', 'for': 'undecidedNote' }, 'What information do you want next? <span class="small">(optional)</span>'));
      var ta = el('textarea', { id: 'undecidedNote', 'class': 'response s4-note', rows: '2', maxlength: String(S.LIMITS_43.undecidedNote) });
      ta.value = m.undecidedNote || '';
      flushers.push(debounced(ta, function (v) { API.setUndecidedNote(v); }));
      host.appendChild(ta);
    } else {
      host.appendChild(el('p', null, 'You haven’t made your provisional decision yet. <a href="#decision" data-nav="decision">Choose up to two directions, or choose to stay undecided</a>.'));
    }
    if (savedDirections().length >= 2) host.appendChild(el('p', null, '<a class="btn secondary small-btn" href="#compare" data-nav="compare">Compare two directions</a>'));
    renderCompletion();
  }
  function renderCompletion() {
    var box = $('#completionStatus'); if (!box) return;
    var m = mod(), c = conditions();
    if (m.completedAt) {
      box.innerHTML = '<div class="section-label">Module 4.3</div><h2>Module 4.3 complete</h2>' +
        '<p>Your reflections are saved in this browser (first completed ' + esc(new Date(m.completedAt).toLocaleDateString()) + '). You can keep editing them.</p>' +
        '<div class="s4-transition"><p><strong>' + esc(COPY.transition1) + '</strong></p><p><strong>' + esc(COPY.transition2) + '</strong></p></div>' +
        '<a class="s4-next s4-next-live" href="../4-4/"><span class="s4-next-label">Continue to Module 4.4 →</span></a>' +
        '<p><a href="#directions" data-nav="directions">Review my Module 4.3 reflections</a></p>' +
        '<p class="small">Use <strong>Export Progress</strong> to keep a backup file, especially if you might switch devices or browsers.</p>' +
        '<div class="progress-tools"><button class="btn subtle" type="button" data-export-inline>Export Progress</button></div>';
      $all('[data-export-inline]', box).forEach(function (b) { b.addEventListener('click', function () { S.exportProgress(); }); });
      return;
    }
    var rows = [
      [c.clues, 'Look over your Work Clues (with or without clues)', 'clues'],
      [c.evidence, 'Look over what you have done (with or without task records)', 'evidence'],
      [c.examined, 'Examine at least one direction', 'directions'],
      [c.judged, 'Save a judgment for at least one direction', 'directions'],
      [c.reason, 'Add a reason, or choose “I don’t have a reason to add yet”, for a direction you saved', 'directions'],
      [c.decision, 'Open your provisional decision', 'decision'],
      [c.chosen, 'Choose at least one direction, or choose “I’m still undecided”', 'decision']
    ];
    box.innerHTML = '<div class="section-label">Module 4.3</div><h2>To finish Module 4.3</h2><ul class="s4-checklist">' +
      rows.map(function (r) { return '<li class="' + (r[0] ? 'ok' : '') + '"><span class="s4-mark" aria-hidden="true">' + (r[0] ? '✓' : '○') + '</span><span class="sr-only">' + (r[0] ? 'Done: ' : 'Not done yet: ') + '</span>' + (r[0] ? esc(r[1]) : '<a href="#' + r[2] + '" data-nav="' + r[2] + '">' + esc(r[1]) + '</a>') + '</li>'; }).join('') +
      '</ul><p class="small">You don’t need a positive judgment, more than one direction, any minimum experience, or learning questions.</p>' +
      '<div class="s4-actions"><button class="btn gold" type="button" id="finishBtn">Save and finish Module 4.3</button></div>' +
      '<p class="small" id="finishMsg" role="status" aria-live="polite"></p>';
    $('#finishBtn').addEventListener('click', function () {
      flushAll();
      if (allMet(conditions())) { S.markModuleComplete(MOD); renderCompletion(); renderStatus(); var h = $('#completionStatus h2'); if (h) { h.setAttribute('tabindex', '-1'); h.focus(); } }
      else $('#finishMsg').textContent = 'Some steps above are still open. Each one links to where you can finish it.';
    });
  }

  /* ---------- status ---------- */
  function setStatus(key, done) { var n = $('[data-status="' + key + '"]'); if (n) { n.textContent = done ? '✓ Done' : ''; n.classList.toggle('done', !!done); } }
  function modWord(id) { var m = S.module(id); return m.completedAt ? 'Complete' : (m.lastSection ? 'In progress' : ''); }
  function renderStatus() {
    var c = conditions(), m = mod();
    setStatus('clues', c.clues); setStatus('evidence', c.evidence); setStatus('directions', c.examined && c.judged);
    setStatus('decision', c.decision && c.chosen); setStatus('finish', !!m.completedAt);
    $('#m41Status').textContent = modWord('4-1');
    $('#m42Status').textContent = modWord('4-2');
    $('#moduleProgress').textContent = m.completedAt ? 'Module 4.3 complete' : (m.lastSection ? 'In progress' : '');
  }

  /* ---------- routing (same pattern as 4.1/4.2; Screen 4 is #examine-<directionId>) ---------- */
  var current = null;
  function parse(id) {
    if (id && id.indexOf('examine-') === 0) { var d = id.slice(8); return dirById(d) ? { section: 'examine', dir: d, key: id } : { section: 'directions', key: 'directions' }; }
    if (SECTIONS.indexOf(id) >= 0 && id !== 'examine') return { section: id, key: id };
    return { section: 'start', key: 'start' };
  }
  var RENDER = { clues: renderClues, evidence: renderEvidence, directions: renderDirections, decision: renderDecision, compare: renderCompare, finish: renderFinish };
  function go(id, opts) {
    opts = opts || {};
    flushAll();
    var r = parse(id);
    if (r.section === 'examine') { API.examine(r.dir); renderExamine(r.dir); }
    else if (RENDER[r.section]) RENDER[r.section]();
    $all('[data-section]').forEach(function (s) { if (s.getAttribute('data-section') === r.section) s.removeAttribute('hidden'); else s.setAttribute('hidden', ''); });
    var navKey = r.section === 'examine' ? 'directions' : (r.section === 'compare' ? 'decision' : r.section);
    $all('#sectionNav a').forEach(function (a) { if (a.getAttribute('data-nav') === navKey) a.setAttribute('aria-current', 'step'); else a.removeAttribute('aria-current'); });
    if (history.replaceState && location.hash !== '#' + r.key) history.replaceState(null, '', '#' + r.key);
    current = r.key;
    S.setLastSection(MOD, r.key);
    closeDrawer(false);
    renderStatus();
    if (!opts.initial) {
      window.scrollTo(0, 0);
      var h = $('[data-section="' + r.section + '"] h1, [data-section="' + r.section + '"] h2');
      if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
    }
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-nav]');
    if (!a || a.tagName === 'BUTTON') return;
    e.preventDefault();
    go(a.getAttribute('data-nav'));
  });
  window.addEventListener('hashchange', function () { var id = location.hash.slice(1); if (id && id !== current) go(id); });

  $('#cluesContinue').addEventListener('click', function () { API.setReviewedWorkClues(); go('evidence'); });
  $('#evidenceContinue').addEventListener('click', function () { API.setReviewedEvidence(); go('directions'); });

  /* ---------- mobile drawer (same as 4.2) ---------- */
  var side = $('#s4Side'), backdrop = $('#s4Backdrop'), menuBtn = $('#menuBtn'), closeBtn = $('#sideClose');
  var mq = window.matchMedia('(max-width: 959px)');
  function openDrawer() { side.classList.add('open'); backdrop.classList.add('show'); document.body.classList.add('drawer-open'); menuBtn.setAttribute('aria-expanded', 'true'); closeBtn.focus(); }
  function closeDrawer(returnFocus) {
    if (!side.classList.contains('open')) return;
    side.classList.remove('open'); backdrop.classList.remove('show'); document.body.classList.remove('drawer-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    if (returnFocus) menuBtn.focus();
  }
  menuBtn.addEventListener('click', openDrawer);
  closeBtn.addEventListener('click', function () { closeDrawer(true); });
  backdrop.addEventListener('click', function () { closeDrawer(true); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && side.classList.contains('open')) closeDrawer(true); });
  (mq.addEventListener ? mq.addEventListener.bind(mq, 'change') : mq.addListener.bind(mq))(function () { closeDrawer(false); });

  /* ---------- init ---------- */
  S.onChange(renderStatus);
  S.wireTools();   // backup summary comes from the shared state layer
  var startAt = location.hash.slice(1);
  if (!startAt) startAt = mod().lastSection || 'start';
  go(startAt, { initial: true });
})();
