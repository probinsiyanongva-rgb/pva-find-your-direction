/* PVA Academy — Stage 4 · Module 4.4: Build Your Direction Map
   Production Specification v1.0. Same shell and routing pattern as 4.3.
   Rules enforced here (and in state.js):
   - the map is rebuilt from the CURRENT 4.1–4.3 records every time it is shown;
   - 4.1–4.3 are read only; every write goes through PVAS4.m44 (plus lastSection and
     completion for module 4-4);
   - nothing is pre-added, suggested, ranked or highlighted; judgments are plain text;
   - a written next step is only discarded after the learner confirms (§6);
   - "Use this idea" never saves by itself: a copied idea is kept only when the learner
     edits it or presses "Continue to my map" (§4). */
(function () {
  'use strict';

  var S = window.PVAS4, D41 = window.PVA_M41, D42 = window.PVA_M42, API = S && S.m44, R43 = S && S.m43, MOD = '4-4';
  if (!S || !D41 || !D42 || !API || !R43) return;

  var SECTIONS = ['look-back', 'choose', 'steps', 'map'];
  /* Same wording as the live modules: 4.3 JUDGMENT_TEXT (m43.js) and 4.1 REACTION_LABELS (m41.js). */
  var JUDGMENT_LABEL = { explore_further: 'Explore further', unsure: 'Not sure yet', not_now: 'Not for me right now' };
  var REACTION_LABEL = { explore: 'Want to explore', unsure: 'Not sure yet', not_for_me: 'Probably not for me' };
  var IDEAS_DIRECTION = [
    { text: 'Read three real job posts for this direction and write down the tasks that appear more than once.' },
    { text: 'Pick one task from the Direction Card that I haven\'t done and find a free explanation of how it\'s done.' },
    { text: 'Find out what one tool named on the Direction Card is used for.' },
    { text: 'Ask someone who does this kind of work one question about their usual day.', optional: true }
  ];
  var IDEAS_EXPLORING = [
    { text: 'Examine one more direction in Module 4.3.', link: true },
    { text: 'Read the Direction Cards for two directions and note how the daily work differs.' },
    { text: 'Read a few real job posts for two directions and note which tasks repeat in each.' }
  ];
  var COPY = {
    confirmRemove: function (name) { return 'This will remove the next step you wrote for ' + name + ' from your map. Your Module 4.3 reflection stays as it is. Remove it?'; },
    confirmExploring: 'Choosing to keep exploring will remove your directions and the next steps you wrote for them from your map. Your Module 4.3 reflections stay as they are. Continue?',
    confirmReplace: 'Replace what you wrote with this idea?',
    ideaCopied: 'Idea copied. Edit it, or press Continue to my map to keep it as your step.',
    kept: 'Your step for deciding is kept. It will come back if you choose to keep exploring again.',
    reminder: 'This map shows where my thinking is right now. It is not a permanent career decision. I can change it at any time.'
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
  function clean(v) { return String(v || '').replace(/[\u0000-\u001f]/g, ' ').trim(); }

  /* ---------- read-only views ---------- */
  function mod() { return S.module(MOD); }                       // never creates state
  function mapData() { return API.map(); }
  function dirById(id) { return byId(D41.DIRECTIONS, id); }
  function exploration(id) { return R43.exploration(id); }
  function isSaved(id) { return R43.isSaved(exploration(id)); }
  function savedDirections() { return D41.DIRECTIONS.filter(function (d) { return isSaved(d.id); }); }   // canonical order
  function experiences() { return S.module('4-2').experiences || []; }
  function knownClues() {
    return S.clues().filter(function (c) { return c.sourceType === 'scenario' ? !!byId(D41.SCENARIOS, c.sourceId) : !!byId(D41.DIRECTIONS, c.sourceId); });
  }
  function sourceLabel(id) { var s = byId(D42.SOURCES, id); return s ? s.label : id; }
  function evidenceLabel(id) { var e = byId(D42.EVIDENCE, id); return e ? e.label : ''; }
  function expIndex(exp) { return experiences().indexOf(exp); }
  function judgmentText(id) { var x = exploration(id); return x && x.judgment && JUDGMENT_LABEL[x.judgment] ? JUDGMENT_LABEL[x.judgment] : null; }
  function dirLabel(d) { return d.num + ' · ' + d.name; }

  /* ---------- step fields: debounced saving plus the pending-idea rule (§4) ---------- */
  var fields = [];                                              // fields on the current Screen 3 render
  function stepField(textarea, save, status) {
    var f = { input: textarea, pending: false, dirty: false, timer: null };
    /* Only text the learner typed is flushed; an unaccepted idea never is. Nothing is written
       when nothing changed, so a Cancel elsewhere leaves storage byte-identical. */
    f.flush = function () { clearTimeout(f.timer); if (f.dirty && !f.pending) { f.dirty = false; save(textarea.value); } };
    f.commit = function () { clearTimeout(f.timer); if (f.dirty || f.pending) save(textarea.value); f.dirty = false; f.pending = false; };
    textarea.addEventListener('input', function () {
      f.pending = false; f.dirty = true;                        // the learner changed it: it is theirs now
      if (status) status.textContent = '';
      clearTimeout(f.timer); f.timer = setTimeout(f.flush, 400);
      syncStepsGate();
    });
    textarea.addEventListener('blur', f.flush);
    f.useIdea = function (text) {
      if (clean(textarea.value) && !f.pending && !window.confirm(COPY.confirmReplace)) return;   // Cancel: nothing changes
      clearTimeout(f.timer);
      textarea.value = text;
      f.pending = true;
      textarea.focus();
      if (status) status.textContent = COPY.ideaCopied;
      syncStepsGate();
    };
    fields.push(f);
    return f;
  }
  function flushAll() { fields.forEach(function (f) { f.flush(); }); }
  function textField(textarea, save) {                           // plain debounced field (Where I am now)
    var timer, dirty = false;                                   // only text the learner typed is ever saved
    function flush() { clearTimeout(timer); if (dirty) { dirty = false; save(textarea.value); } }
    textarea.addEventListener('input', function () { dirty = true; clearTimeout(timer); timer = setTimeout(flush, 400); });
    textarea.addEventListener('blur', flush);
    return flush;
  }

  /* ---------- Screen 1: Look back (counts and links only) ---------- */
  var flushWhere = function () {};
  function renderLookBack() {
    var tasks = 0; experiences().forEach(function (x) { tasks += x.tasks.length; });
    $('#lookBackCounts').innerHTML =
      '<li>Work Clues saved in Module 4.1: <strong>' + knownClues().length + '</strong> · <a href="../4-1/">Revisit Module 4.1</a></li>' +
      '<li>Experiences recorded in Module 4.2: <strong>' + experiences().length + '</strong> · Tasks: <strong>' + tasks + '</strong> · <a href="../4-2/">Revisit Module 4.2</a></li>' +
      '<li>Directions with a saved reflection in Module 4.3: <strong>' + savedDirections().length + '</strong> · <a href="../4-3/">Revisit Module 4.3</a></li>';
    var ta = $('#whereNow');
    ta.setAttribute('maxlength', String(S.LIMITS_44.whereIAmNow));
    ta.value = mapData().whereIAmNow;
  }

  /* ---------- Screen 2: choose what to explore ---------- */
  function renderChoose() {
    flushAll();
    var m43 = S.module('4-3'), m = mapData(), st = API.state();
    var sel = D41.DIRECTIONS.filter(function (d) { return (m43.selectedDirectionIds || []).indexOf(d.id) >= 0; });
    $('#choice43').textContent = sel.length ? 'In Module 4.3 you chose: ' + sel.map(function (d) { return d.name; }).join(', ') + '.' :
      (m43.undecided ? 'In Module 4.3 you chose to keep exploring.' : 'You didn\'t make a choice in Module 4.3.');
    var host = $('#chooseBody'); host.innerHTML = '';
    var saved = savedDirections();
    var onMap = m.mapDirections.map(function (x) { return x.directionId; });
    var full = onMap.length >= S.LIMITS_44.directions;
    if (!saved.length) {
      host.appendChild(el('div', { 'class': 'card s4-empty', id: 'chooseEmpty' }, '<p>You haven\'t saved a reflection on any direction in Module 4.3 yet. You can examine one now, or keep exploring.</p>'));
    } else {
      var list = el('div', { 'class': 'card' });
      list.appendChild(el('h3', { 'class': 's4-group-title' }, 'Directions you\'ve examined'));
      var ul = el('ul', { 'class': 's44-choose-list', id: 'chooseList' });
      saved.forEach(function (d) {
        var li = el('li', { 'class': 's44-choose-row', 'data-dir': d.id });
        li.appendChild(el('div', { 'class': 's44-choose-text' }, '<span class="s4-dir-num" aria-hidden="true">' + esc(d.num) + '</span> <strong>' + esc(d.name) + '</strong>' +
          '<br><span class="small s44-judgment">Your judgment in Module 4.3: ' + esc(judgmentText(d.id) || '') + '</span>'));
        var act = el('div', { 'class': 's44-choose-act' });
        if (onMap.indexOf(d.id) >= 0) {
          act.appendChild(el('span', { 'class': 's44-onmap' }, 'On my map'));
          var rm = el('button', { type: 'button', 'class': 'btn secondary small-btn', 'data-remove': d.id, 'aria-label': 'Remove from my map: ' + d.name }, 'Remove from my map');
          rm.addEventListener('click', function () { removeDirection(d); });
          act.appendChild(rm);
        } else {
          var add = el('button', { type: 'button', 'class': 'btn small-btn s44-choice-btn', 'data-add': d.id, 'aria-label': 'Add to my map: ' + d.name }, 'Add to my map');
          if (full) add.disabled = true;
          add.addEventListener('click', function () { flushAll(); API.addDirection(d.id); renderChoose(); renderStatus(); });
          act.appendChild(add);
        }
        li.appendChild(act);
        ul.appendChild(li);
      });
      list.appendChild(ul);
      if (full) list.appendChild(el('p', { 'class': 'small', id: 'fullHint' }, 'You can add up to two. Remove one to add a different direction.'));
      host.appendChild(list);
    }
    var ex = el('div', { 'class': 'card s44-exploring', id: 'exploringCard' });
    ex.appendChild(el('h3', { 'class': 's4-group-title' }, 'Right now, I\'m still exploring'));
    ex.appendChild(el('p', null, 'Choose this if you want to keep exploring before you put a direction on your map.'));
    var row = el('div', { 'class': 's44-choose-act' });
    if (st === 'exploring') {
      row.appendChild(el('span', { 'class': 's44-onmap' }, 'Chosen'));
      var un = el('button', { type: 'button', 'class': 'btn secondary small-btn', id: 'exploreUnselect' }, 'Unselect');
      un.addEventListener('click', function () { API.setStillExploring(false); renderChoose(); renderStatus(); });
      row.appendChild(un);
    } else {
      var ch = el('button', { type: 'button', 'class': 'btn small-btn s44-choice-btn', id: 'exploreChoose' }, 'Choose this');
      ch.addEventListener('click', chooseExploring);
      row.appendChild(ch);
    }
    ex.appendChild(row);
    host.appendChild(ex);
    host.appendChild(el('p', null, '<a href="../4-3/#directions" id="examineAnother">Examine another direction in Module 4.3</a>'));
    var cont = $('#chooseContinue'), empty = st === 'empty';
    cont.disabled = empty;
    $('#chooseHint').textContent = empty ? 'Add a direction or choose to keep exploring to continue.' : '';
  }
  function removeDirection(d) {
    flushAll();
    var r = API.removeDirection(d.id);
    if (r === 'needs-confirm') {
      if (!window.confirm(COPY.confirmRemove(d.name))) return;   // Cancel: nothing changes
      API.removeDirection(d.id, { confirmed: true });
    }
    renderChoose(); renderStatus();
  }
  function chooseExploring() {
    flushAll();
    var r = API.setStillExploring(true);
    if (r === 'needs-confirm') {
      if (!window.confirm(COPY.confirmExploring)) return;        // Cancel: nothing changes
      API.setStillExploring(true, { confirmed: true });
    }
    renderChoose(); renderStatus();
  }

  /* ---------- Screen 3: next steps ---------- */
  function ideaList(f, ideas, idBase) {
    var box = el('div', { 'class': 's44-ideas' });
    box.appendChild(el('p', { 'class': 'small' }, '<strong>Ideas you can use</strong>'));
    var ul = el('ul', { 'class': 's44-idea-list' });
    ideas.forEach(function (idea, i) {
      var tid = idBase + '-idea-' + i;
      var li = el('li');
      li.appendChild(el('span', { id: tid }, (idea.optional ? '<em>(Optional)</em> ' : '') + esc(idea.text)));
      if (idea.link) li.appendChild(el('span', null, ' <a href="../4-3/#directions">Open Module 4.3</a>'));
      var b = el('button', { type: 'button', 'class': 'btn subtle small-btn s44-use-idea', 'data-idea': String(i), 'aria-describedby': tid }, 'Use this idea');
      b.addEventListener('click', function () { f.useIdea(idea.text); });
      li.appendChild(b);
      ul.appendChild(li);
    });
    box.appendChild(ul);
    return box;
  }
  function renderSteps() {
    fields = [];
    var host = $('#stepsBody'); host.innerHTML = '';
    var m = mapData(), st = API.state();
    if (st === 'empty') {
      host.appendChild(el('div', { 'class': 'card s4-empty', id: 'stepsEmpty' }, '<p>Choose what to explore first. <a href="#choose" data-nav="choose">Choose what to explore</a></p>'));
    } else if (st === 'directions') {
      m.mapDirections.forEach(function (md) {
        var d = dirById(md.directionId); if (!d) return;
        var x = exploration(d.id), base = 'step-' + d.id;
        var card = el('section', { 'class': 'card s44-step', 'data-step-dir': d.id, 'aria-labelledby': base + '-t' });
        card.appendChild(el('h3', { id: base + '-t' }, '<span class="s4-dir-num">' + esc(d.num) + '</span> ' + esc(d.name)));
        if (x && x.learningQuestions && x.learningQuestions.length) {
          card.appendChild(el('p', { 'class': 'small' }, 'Your questions from Module 4.3:'));
          card.appendChild(el('ul', { 'class': 'small' }, x.learningQuestions.map(function (q) { return '<li>' + esc(q) + '</li>'; }).join('')));
        }
        card.appendChild(el('label', { 'class': 'field-label', 'for': base }, 'My next exploration step'));
        var ta = el('textarea', { id: base, 'class': 'response s4-note', rows: '2', maxlength: String(S.LIMITS_44.nextStep), 'data-step': d.id });
        ta.value = md.nextStep;
        card.appendChild(ta);
        var status = el('p', { 'class': 'small s44-idea-status', role: 'status', 'aria-live': 'polite' });
        card.appendChild(status);
        var f = stepField(ta, function (v) { API.setNextStep(d.id, v); }, status);
        card.appendChild(ideaList(f, IDEAS_DIRECTION, base));
        host.appendChild(card);
      });
      if (clean(m.investigationStep)) host.appendChild(el('p', { 'class': 'small', id: 'keptNote' }, esc(COPY.kept)));
    } else {
      var card2 = el('section', { 'class': 'card s44-step', 'aria-labelledby': 'invest-t' });
      card2.appendChild(el('h3', { id: 'invest-t' }, 'Right now, I\'m still exploring'));
      card2.appendChild(el('label', { 'class': 'field-label', 'for': 'investigationStep' }, 'My next step to help me decide'));
      var ta2 = el('textarea', { id: 'investigationStep', 'class': 'response s4-note', rows: '2', maxlength: String(S.LIMITS_44.investigationStep) });
      ta2.value = m.investigationStep;
      card2.appendChild(ta2);
      var status2 = el('p', { 'class': 'small s44-idea-status', role: 'status', 'aria-live': 'polite' });
      card2.appendChild(status2);
      var f2 = stepField(ta2, function (v) { API.setInvestigationStep(v); }, status2);
      card2.appendChild(ideaList(f2, IDEAS_EXPLORING, 'invest'));
      host.appendChild(card2);
    }
    syncStepsGate();
  }
  function syncStepsGate() {
    var btn = $('#stepsContinue'); if (!btn) return;
    var st = API.state();
    var ok = st !== 'empty' && fields.length > 0 && fields.every(function (f) { return !!clean(f.input.value); });
    btn.disabled = !ok;
    $('#stepsHint').textContent = ok ? '' : (st === 'exploring' ? 'Write your step to continue.' : st === 'directions' ? 'Write a step for each direction to continue.' : '');
  }
  $('#stepsContinue').addEventListener('click', function () {
    fields.forEach(function (f) { f.commit(); });             // accepts any copied idea (§4)
    if (API.completionMet()) go('map'); else syncStepsGate();
  });

  /* ---------- Screen 4: the map (built from current records) ---------- */
  function row(label, value) { return '<dt>' + esc(label) + '</dt><dd>' + value + '</dd>'; }
  function screenOnly(html) { return ' <span class="s44-screen-only">' + html + '</span>'; }
  function directionSection(md) {
    var d = dirById(md.directionId); if (!d) return '';
    var x = exploration(d.id), clue = S.getClue('direction', d.id), tasks = R43.relatedTasks(d.id), j = judgmentText(d.id);
    var reaction = clue && REACTION_LABEL[clue.reaction] ?
      esc(REACTION_LABEL[clue.reaction]) + (clue.note ? '<br><span class="small">Your note: ' + esc(clue.note) + '</span>' : '') : 'No reaction saved in Module 4.1.';
    var taskHtml = tasks.length ? '<ul>' + tasks.map(function (r) {
      return '<li>' + esc(r.task.label) + ' <span class="small">· Experience ' + (expIndex(r.experience) + 1) + ': ' + esc(sourceLabel(r.experience.source)) + ' · ' +
        esc(r.task.evidence ? evidenceLabel(r.task.evidence) : 'No evidence answer yet') + '</span></li>';
    }).join('') + '</ul>' : 'No tasks linked yet.' + screenOnly('<a href="../4-3/#examine-' + d.id + '">Edit in Module 4.3</a>');
    var qs = x && x.learningQuestions && x.learningQuestions.length ? row('Questions I want answered', '<ul>' + x.learningQuestions.map(function (q) { return '<li>' + esc(q) + '</li>'; }).join('') + '</ul>') : '';
    return '<section class="s44-map-dir" data-map-dir="' + d.id + '"><h3>' + esc(dirLabel(d)) + '</h3><dl>' +
      row('My reaction in Module 4.1', reaction + screenOnly('<a href="../4-1/">Revisit Module 4.1</a>')) +
      row('My judgment in Module 4.3', j ? esc(j) : 'No judgment saved in Module 4.3.') +
      row('Why I\'m considering it', x && x.reason ? esc(x.reason) : 'No reason added yet') +
      row('Experiences and tasks I can draw on', taskHtml) +
      row('What may be new for me', x && x.whatMayBeNew ? esc(x.whatMayBeNew) : 'Nothing added yet') +
      qs +
      row('My next exploration step', clean(md.nextStep) ? esc(md.nextStep) : 'No next step written yet') +
      '</dl><p class="s44-screen-only"><a href="../4-3/#examine-' + d.id + '">Edit my reflection in Module 4.3</a></p></section>';
  }
  function printDate() { var n = $('#mapPrintDate'); if (n) n.textContent = 'Printed on ' + new Date().toLocaleDateString(); }
  function renderMap() {
    flushAll();
    var m = mapData(), st = API.state(), m43 = S.module('4-3');
    var html = '<div class="s44-map-head"><p class="s44-map-title">MY VA DIRECTION MAP</p><p class="s44-print-only" id="mapPrintDate"></p>' +
      '<p class="s44-reminder" id="mapReminder">' + esc(COPY.reminder) + '</p>' +
      (clean(m.whereIAmNow) ? '<p id="mapWhere"><strong>Where I am now:</strong> ' + esc(m.whereIAmNow) + '</p>' : '') + '</div>';
    if (st === 'directions') {
      html += m.mapDirections.map(directionSection).join('');
    } else if (st === 'exploring') {
      var looked = savedDirections();
      html += '<section class="s44-map-exploring"><h3>Right now, I\'m still exploring.</h3>' +
        (clean(m43.undecidedNote) ? '<p><strong>My note from Module 4.3:</strong> ' + esc(m43.undecidedNote) + '</p>' : '') +
        '<h4>Directions I\'ve looked at so far</h4>' +
        (looked.length ? '<ul id="lookedList">' + looked.map(function (d) {
          var c = S.getClue('direction', d.id);
          return '<li>' + esc(d.name) + ' — Module 4.3: ' + esc(judgmentText(d.id) || '') + ' · Module 4.1: ' + esc(c && REACTION_LABEL[c.reaction] ? REACTION_LABEL[c.reaction] : 'no reaction saved') + '</li>';
        }).join('') + '</ul>' : '<p>You haven\'t saved a reflection on any direction yet.</p>') +
        '<p><strong>My next step to help me decide:</strong> ' + (clean(m.investigationStep) ? esc(m.investigationStep) : 'No step written yet') + '</p></section>';
    } else {
      html += '<p id="mapEmpty">Nothing on your map yet.' + screenOnly('<a href="#choose" data-nav="choose">Choose what to explore</a>') + '</p>';
    }
    $('#mapView').innerHTML = html;
    printDate();
    renderCompletion();
  }
  function renderCompletion() {
    var box = $('#completionStatus'), m = mod();
    if (m.completedAt) {
      box.innerHTML = '<div class="section-label">Module 4.4</div><h2>Module 4.4 complete</h2>' +
        '<p>Your map is saved in this browser (first completed ' + esc(new Date(m.completedAt).toLocaleDateString()) + '). You can keep changing it.</p>' +
        '<div class="s4-actions"><button class="btn secondary" type="button" data-print-inline>Print my map</button></div>' +
        '<p class="small">Use <strong>Export Progress</strong> to keep a backup file, especially if you might switch devices or browsers.</p>' +
        '<div class="progress-tools"><button class="btn subtle" type="button" data-export-inline>Export Progress</button></div>';
      $all('[data-export-inline]', box).forEach(function (b) { b.addEventListener('click', function () { S.exportProgress(); }); });
      $all('[data-print-inline]', box).forEach(function (b) { b.addEventListener('click', doPrint); });
      box.hidden = false;
    } else { box.innerHTML = ''; box.hidden = true; }
  }
  function doPrint() { printDate(); window.print(); }
  $('#printMapBtn').addEventListener('click', doPrint);
  window.addEventListener('beforeprint', printDate);
  $('#saveMapBtn').addEventListener('click', function () {
    flushAll();
    var msg = $('#saveMsg'), st = API.state();
    if (API.completionMet()) {
      S.markModuleComplete(MOD);                                // completedAt is kept once set (state.js)
      msg.textContent = '';
      renderCompletion(); renderStatus();
      var h = $('#completionStatus h2'); if (h) { h.setAttribute('tabindex', '-1'); h.focus(); }
      return;
    }
    msg.innerHTML = st === 'directions' ? 'To finish, add a next step for each direction on your map. <a href="#steps" data-nav="steps">Add my steps</a>' :
      st === 'exploring' ? 'To finish, write your step to help you decide. <a href="#steps" data-nav="steps">Write my step</a>' :
        'To finish, choose what to explore first. <a href="#choose" data-nav="choose">Choose what to explore</a>';
  });

  /* ---------- status ---------- */
  function setStatus(key, done) { var n = $('[data-status="' + key + '"]'); if (n) { n.textContent = done ? '✓ Done' : ''; n.classList.toggle('done', !!done); } }
  function modWord(id) { var m = S.module(id); return m.completedAt ? 'Complete' : (m.lastSection ? 'In progress' : ''); }
  function renderStatus() {
    var m = mod();
    setStatus('choose', API.state() !== 'empty');
    setStatus('steps', API.completionMet());
    setStatus('map', !!m.completedAt);
    $('#m41Status').textContent = modWord('4-1');
    $('#m42Status').textContent = modWord('4-2');
    $('#m43Status').textContent = modWord('4-3');
    $('#moduleProgress').textContent = m.completedAt ? 'Module 4.4 complete' : (m.lastSection ? 'In progress' : '');
  }

  /* ---------- routing (same pattern as 4.1–4.3) ---------- */
  var current = null;
  var RENDER = { 'look-back': renderLookBack, choose: renderChoose, steps: renderSteps, map: renderMap };
  function go(id, opts) {
    opts = opts || {};
    flushWhere(); flushAll();                                   // typed text is saved; unaccepted ideas are not (§4)
    var key = SECTIONS.indexOf(id) >= 0 ? id : 'look-back';
    RENDER[key]();
    $all('[data-section]').forEach(function (s) { if (s.getAttribute('data-section') === key) s.removeAttribute('hidden'); else s.setAttribute('hidden', ''); });
    $all('#sectionNav a').forEach(function (a) { if (a.getAttribute('data-nav') === key) a.setAttribute('aria-current', 'step'); else a.removeAttribute('aria-current'); });
    if (history.replaceState && location.hash !== '#' + key) history.replaceState(null, '', '#' + key);
    current = key;
    S.setLastSection(MOD, key);
    closeDrawer(false);
    renderStatus();
    if (!opts.initial) {
      window.scrollTo(0, 0);
      var h = $('[data-section="' + key + '"] h1, [data-section="' + key + '"] h2');
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
  $('#chooseContinue').addEventListener('click', function () { if (API.state() !== 'empty') go('steps'); });
  flushWhere = textField($('#whereNow'), function (v) { API.setWhereIAmNow(v); });

  /* ---------- mobile drawer (same as 4.3) ---------- */
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
  if (!startAt) startAt = mod().lastSection || 'look-back';
  go(startAt, { initial: true });
})();
