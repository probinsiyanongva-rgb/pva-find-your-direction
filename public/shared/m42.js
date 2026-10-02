/* PVA Academy — Stage 4 · Module 4.2: Looking at Yourself as a VA
   EXPERIENCE → TASKS → EVIDENCE → WHAT THE WORK INVOLVED
   Guided flow on one page, same shell as 4.1. Data lives only in the shared
   Stage 4 state (modules["4-2"].experiences). Rules enforced here:
   - tasks exist only when the learner adds them; unpicked prompts are never stored;
   - evidence is a named answer, never a number, never compared or sorted;
   - pattern tags are only ever chosen by the learner; free text is never classified;
   - reference tags appear only after the learner has chosen, prompted tasks only;
   - no counts, totals or ordering by pattern; no direction names next to evidence;
   - Work Clues appear read-only in the final section only. */
(function () {
  'use strict';

  var S = window.PVAS4, D = window.PVA_M42, D41 = window.PVA_M41, MOD = '4-2';
  if (!S || !D) return;

  var SECTIONS = ['start', 'experience', 'tasks', 'evidence', 'involved', 'snapshot', 'handoff'];
  var PART1 = ['regularly', 'done_before'], PART3 = ['some_exposure', 'not_done_yet'];

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
  function sourceLabel(id) { var s = byId(D.SOURCES, id); return s ? s.label : id; }
  function patternName(id) { var p = byId(D.PATTERNS, id); return p ? p.name : id; }
  function evidenceLabel(id) { var e = byId(D.EVIDENCE, id); return e ? e.label : ''; }
  function exps() { return S.experiences(); }
  function allTasks() { var out = []; exps().forEach(function (x) { x.tasks.forEach(function (t) { out.push({ exp: x, task: t }); }); }); return out; }
  function expTitle(x, i) { return 'Experience ' + (i + 1) + ': ' + sourceLabel(x.source); }

  /* ---------- completion (Build Brief §12) ---------- */
  function conditions() {
    var xs = exps(), tasks = allTasks();
    return {
      experience: xs.length >= 1,
      task: tasks.length >= 1,
      evidence: tasks.length >= 1 && tasks.every(function (r) { return !!r.task.evidence; }),
      tag: tasks.some(function (r) { return r.task.patternTags.length > 0; }),
      snapshot: S.module(MOD).snapshotReached === true
    };
  }
  function allMet(c) { return c.experience && c.task && c.evidence && c.tag && c.snapshot; }

  /* ---------- Section 1: experiences ---------- */
  var pickedSource = null;
  function renderSourcePicker() {
    var host = $('#sourceList');
    host.innerHTML = '';
    D.SOURCES.forEach(function (s) {
      var lab = el('label', { 'class': 'choice s4-chip' });
      var inp = el('input', { type: 'radio', name: 'new-source', value: s.id });
      inp.addEventListener('change', function () { pickedSource = s.id; $('#addExperience').disabled = false; });
      lab.appendChild(inp); lab.appendChild(el('span', null, esc(s.label)));
      host.appendChild(lab);
    });
    $('#addExperience').addEventListener('click', function () {
      if (!pickedSource) return;
      var x = S.addExperience(pickedSource);
      pickedSource = null;
      $all('input[name=new-source]').forEach(function (i) { i.checked = false; });
      $('#addExperience').disabled = true;
      renderExperiences();
      if (x) { var h = $('#' + x.id + '-h'); if (h) { h.setAttribute('tabindex', '-1'); h.focus(); } }
    });
  }
  function renderExperiences() {
    var host = $('#experienceList');
    host.innerHTML = '';
    var xs = exps();
    if (!xs.length) {
      host.appendChild(el('div', { 'class': 'card s4-empty' }, '<p>No experiences added yet. Pick where an experience comes from, then add it. You can add more than one.</p>'));
      return;
    }
    xs.forEach(function (x, i) {
      var card = el('article', { 'class': 'card s4-exp', 'aria-labelledby': x.id + '-h' });
      card.appendChild(el('h3', { id: x.id + '-h', 'class': 's4-exp-title' }, esc(expTitle(x, i))));
      var srcId = x.id + '-src';
      card.appendChild(el('label', { 'class': 'field-label', 'for': srcId }, 'Where this experience comes from'));
      var sel = el('select', { id: srcId, 'class': 's4-select' });
      D.SOURCES.forEach(function (s) { var o = el('option', { value: s.id }, esc(s.label)); if (s.id === x.source) o.selected = true; sel.appendChild(o); });
      sel.addEventListener('change', function () { S.updateExperience(x.id, { source: sel.value }); var h = $('#' + x.id + '-h'); if (h) h.textContent = expTitle(S.findExperience(x.id), i); });
      card.appendChild(sel);
      var noteId = x.id + '-note';
      card.appendChild(el('label', { 'class': 'field-label', 'for': noteId }, 'A few words about what this experience was <span class="small">(optional, no names needed)</span>'));
      var ta = el('textarea', { id: noteId, 'class': 'response s4-note', rows: '2', maxlength: '300' });
      ta.value = x.note || '';
      wireDebounced(ta, function (v) { S.updateExperience(x.id, { note: v }); });
      card.appendChild(ta);
      var n = x.tasks.length;
      card.appendChild(el('p', { 'class': 'small' }, n ? n + (n === 1 ? ' task added' : ' tasks added') + ' (Section 2)' : 'No tasks added yet (Section 2).'));
      var del = el('button', { type: 'button', 'class': 'btn subtle small-btn s4-remove', 'aria-label': 'Delete ' + expTitle(x, i) + ' and its tasks' }, 'Delete this experience');
      del.addEventListener('click', function () {
        if (n && !confirm('Delete this experience and its ' + n + (n === 1 ? ' task' : ' tasks') + '? This cannot be undone.')) return;
        S.deleteExperience(x.id);
        renderExperiences();
      });
      card.appendChild(del);
      host.appendChild(card);
    });
  }

  /* ---------- Section 2: tasks ---------- */
  function renderTaskPicker() {
    var host = $('#taskPicker');
    host.innerHTML = '';
    var xs = exps();
    if (!xs.length) {
      host.appendChild(el('div', { 'class': 'card s4-empty' }, '<p>Add an experience in <a href="#experience" data-nav="experience">Section 1</a> first.</p>'));
      return;
    }
    xs.forEach(function (x, i) {
      var card = el('article', { 'class': 'card s4-exp', 'aria-labelledby': x.id + '-th' });
      card.appendChild(el('h3', { id: x.id + '-th', 'class': 's4-exp-title' }, esc(expTitle(x, i))));
      if (x.note) card.appendChild(el('p', { 'class': 'small' }, esc(x.note)));

      var prompts = D.PROMPTS_BY_SOURCE[x.source] || [];
      var chosen = {}; x.tasks.forEach(function (t) { if (t.promptId) chosen[t.promptId] = 1; });
      var ul = el('ul', { 'class': 's4-prompt-list', 'aria-label': 'Short list for ' + sourceLabel(x.source) });
      prompts.forEach(function (pid) {
        var p = D.PROMPTS[pid];
        var li = el('li');
        var b = el('button', { type: 'button', 'class': 's4-prompt' + (chosen[pid] ? ' added' : '') }, (chosen[pid] ? '✓ ' : '+ ') + esc(p.label));
        if (chosen[pid]) { b.disabled = true; b.setAttribute('aria-label', p.label + ' (added)'); }
        else b.setAttribute('aria-label', 'Add task: ' + p.label);
        b.addEventListener('click', function () { S.addTask(x.id, p.label, pid); renderTaskPicker(); focusSoon('#' + x.id + '-own'); });
        li.appendChild(b); ul.appendChild(li);
      });
      card.appendChild(ul);

      var ownId = x.id + '-own';
      card.appendChild(el('label', { 'class': 'field-label', 'for': ownId }, 'Or add a task in your own words'));
      var row = el('div', { 'class': 's4-own-row' });
      var inp = el('input', { type: 'text', id: ownId, 'class': 'response s4-own', maxlength: '140', autocomplete: 'off' });
      var add = el('button', { type: 'button', 'class': 'btn secondary small-btn' }, 'Add task');
      function addOwn() { var v = inp.value.trim(); if (!v) return; S.addTask(x.id, v, null); renderTaskPicker(); focusSoon('#' + ownId); }
      add.addEventListener('click', addOwn);
      inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); addOwn(); } });
      row.appendChild(inp); row.appendChild(add); card.appendChild(row);

      if (x.tasks.length) {
        card.appendChild(el('h4', { 'class': 's4-field' }, 'Tasks you chose to look at'));
        var tl = el('ul', { 'class': 's4-task-list' });
        x.tasks.forEach(function (t) {
          var li = el('li', { 'class': 's4-task-row' });
          li.appendChild(el('span', null, esc(t.label) + (t.promptId ? '' : ' <span class="s4-kind">Own words</span>')));
          var rm = el('button', { type: 'button', 'class': 'btn subtle small-btn', 'aria-label': 'Remove task: ' + t.label }, 'Remove');
          rm.addEventListener('click', function () { S.deleteTask(x.id, t.id); renderTaskPicker(); focusSoon('#' + ownId); });
          li.appendChild(rm); tl.appendChild(li);
        });
        card.appendChild(tl);
      }
      host.appendChild(card);
    });
  }

  /* ---------- Section 3: evidence ---------- */
  function renderEvidenceDefs() {
    var dl = $('#evidenceDefs');
    D.EVIDENCE.forEach(function (e) { dl.appendChild(el('dt', null, esc(e.label))); dl.appendChild(el('dd', null, esc(e.def))); });
  }
  function renderEvidence() {
    var host = $('#evidenceList');
    host.innerHTML = '';
    var rows = allTasks();
    if (!rows.length) { host.appendChild(el('div', { 'class': 'card s4-empty' }, '<p>Add at least one task in <a href="#tasks" data-nav="tasks">Section 2</a> first.</p>')); return; }
    exps().forEach(function (x, i) {
      if (!x.tasks.length) return;
      var card = el('article', { 'class': 'card s4-exp' });
      card.appendChild(el('h3', { 'class': 's4-exp-title' }, esc(expTitle(x, i))));
      x.tasks.forEach(function (t) {
        var fs = el('fieldset', { 'class': 's4-evq' });
        fs.appendChild(el('legend', null, esc(t.label)));
        var grid = el('div', { 'class': 's4-ev-options' });
        D.EVIDENCE.forEach(function (e) {
          var lab = el('label', { 'class': 'choice s4-ev' });
          var inp = el('input', { type: 'radio', name: 'ev-' + t.id, value: e.id });
          if (t.evidence === e.id) inp.checked = true;
          inp.addEventListener('change', function () { if (inp.checked) S.updateTask(x.id, t.id, { evidence: e.id }); });
          lab.appendChild(inp); lab.appendChild(el('span', null, esc(e.label)));
          grid.appendChild(lab);
        });
        fs.appendChild(grid);
        var det = el('details', { 'class': 's4-freq' });
        det.appendChild(el('summary', null, 'When did you do this, and how often? <span class="small">(optional)</span>'));
        var nid = t.id + '-freq';
        det.appendChild(el('label', { 'class': 'sr-only', 'for': nid }, 'When did you do this, and how often? (' + esc(t.label) + ')'));
        var ta = el('textarea', { id: nid, 'class': 'response s4-note', rows: '2', maxlength: '300' });
        ta.value = t.note || '';
        if (t.note) det.open = true;
        wireDebounced(ta, function (v) { S.updateTask(x.id, t.id, { note: v }); });
        det.appendChild(ta);
        fs.appendChild(det);
        card.appendChild(fs);
      });
      host.appendChild(card);
    });
  }

  /* ---------- Section 4: what the work involved ---------- */
  var toolTicks = {}; // transient UI only (Build Brief §9): never persisted
  function renderPatternRef() {
    var dl = $('#patternRef');
    D.PATTERNS.forEach(function (p) { dl.appendChild(el('dt', null, p.name)); dl.appendChild(el('dd', null, esc(p.def))); });
  }
  function renderInvolved() {
    var host = $('#involvedList');
    host.innerHTML = '';
    if (!allTasks().length) { host.appendChild(el('div', { 'class': 'card s4-empty' }, '<p>Add at least one task in <a href="#tasks" data-nav="tasks">Section 2</a> first.</p>')); return; }
    exps().forEach(function (x, i) {
      if (!x.tasks.length) return;
      var card = el('article', { 'class': 'card s4-exp' });
      card.appendChild(el('h3', { 'class': 's4-exp-title' }, esc(expTitle(x, i))));
      x.tasks.forEach(function (t) {
        var prompt = t.promptId ? D.PROMPTS[t.promptId] : null;
        var box = el('div', { 'class': 's4-involve' });
        var fs = el('fieldset', { 'class': 's4-pick' });
        fs.appendChild(el('legend', null, esc(t.label)));
        var grid = el('div', { 'class': 's4-chips s4-chips-patterns' });
        D.PATTERNS.forEach(function (p) {
          var lab = el('label', { 'class': 'choice s4-chip' });
          var cb = el('input', { type: 'checkbox', value: p.id });
          if (t.patternTags.indexOf(p.id) >= 0) cb.checked = true;
          lab.appendChild(cb); lab.appendChild(el('span', null, p.name));
          grid.appendChild(lab);
        });
        fs.appendChild(grid);
        box.appendChild(fs);

        var refWrap = null, refBtn = null;
        if (prompt) {
          refBtn = el('button', { type: 'button', 'class': 'btn subtle small-btn' }, 'Compare with a reference');
          refWrap = el('div', { 'class': 'feedback info s4-ref', 'aria-live': 'polite' });
          refBtn.addEventListener('click', function () {
            refWrap.innerHTML = '<p><span class="s4-kind">Reference</span> ' + prompt.ref.map(patternName).join(' · ') + '</p><p>' + esc(prompt.why) + '</p>' +
              '<p class="small">This is one way to see it. Your own experience of this task may have involved different work.</p>';
            refWrap.classList.add('show');
            refBtn.classList.add('hidden');
          });
          box.appendChild(el('div', { 'class': 's4-actions' })).appendChild(refBtn);
          box.appendChild(refWrap);
        }
        function syncRefBtn() { if (refBtn) refBtn.disabled = t.patternTags.length === 0; }
        grid.addEventListener('change', function () {
          var tags = $all('input:checked', grid).map(function (c) { return c.value; });
          S.updateTask(x.id, t.id, { patternTags: tags });
          t = S.findExperience(x.id).tasks.filter(function (z) { return z.id === t.id; })[0] || t;
          syncRefBtn();
        });
        syncRefBtn();

        var q = el('p', { 'class': 'tip s4-toolq' }, '<strong>Would this kind of task still make sense if the tool or system were different?</strong>');
        if (prompt) {
          if (prompt.tool) box.appendChild(q);
        } else {
          var tid = t.id + '-tool';
          var lab = el('label', { 'class': 'choice s4-tooltick', 'for': tid });
          var cb = el('input', { type: 'checkbox', id: tid });
          lab.appendChild(cb); lab.appendChild(el('span', null, 'This task uses a specific tool or system'));
          box.appendChild(lab);
          q.hidden = !toolTicks[t.id];
          cb.checked = !!toolTicks[t.id];
          cb.addEventListener('change', function () { toolTicks[t.id] = cb.checked; q.hidden = !cb.checked; });
          box.appendChild(q);
        }
        card.appendChild(box);
      });
      host.appendChild(card);
    });
  }

  /* ---------- Section 5: snapshot (derived view; nothing stored) ---------- */
  function renderSnapshot() {
    var host = $('#snapshotBody');
    host.innerHTML = '';
    var xs = exps();

    function partCard(title, id) {
      var c = el('section', { 'class': 'card s4-part', 'aria-labelledby': id });
      c.appendChild(el('h3', { id: id, 'class': 's4-group-title' }, esc(title)));
      return c;
    }
    // Part 1 — What I've done (regularly / done_before), grouped by experience in the learner's own order
    var p1 = partCard('1 · What I’ve done', 'part1');
    var any1 = false;
    xs.forEach(function (x, i) {
      var ts = x.tasks.filter(function (t) { return PART1.indexOf(t.evidence) >= 0; });
      if (!ts.length) return;
      any1 = true;
      p1.appendChild(el('h4', { 'class': 's4-snap-exp' }, esc(expTitle(x, i)) + (x.note ? ' <span class="small">— ' + esc(x.note) + '</span>' : '')));
      var ul = el('ul', { 'class': 's4-snap-list' });
      ts.forEach(function (t) { ul.appendChild(el('li', null, esc(t.label) + ' <span class="s4-evtag">' + esc(evidenceLabel(t.evidence)) + '</span>')); });
      p1.appendChild(ul);
    });
    if (!any1) p1.appendChild(el('p', { 'class': 's4-none' }, 'Nothing here yet.'));
    host.appendChild(p1);

    // Part 2 — What that work involved: interpretation of the same task records
    var p2 = partCard('2 · What that work involved', 'part2');
    var any2 = false;
    var ul2 = el('ul', { 'class': 's4-snap-list' });
    xs.forEach(function (x) {
      x.tasks.forEach(function (t) {
        any2 = true;
        ul2.appendChild(el('li', null, esc(t.label) + ' ' +
          (t.patternTags.length ? '<ul class="s4-tags s4-tags-inline" aria-label="What this task involved">' + t.patternTags.map(function (p) { return '<li>' + esc(patternName(p)) + '</li>'; }).join('') + '</ul>'
            : '<span class="small">No patterns chosen yet</span>')));
      });
    });
    if (any2) p2.appendChild(ul2); else p2.appendChild(el('p', { 'class': 's4-none' }, 'Nothing here yet.'));
    host.appendChild(p2);

    // Part 3 — What I haven't done yet or have only seen
    var p3 = partCard('3 · What I haven’t done yet or have only seen', 'part3');
    var any3 = false;
    var ul3 = el('ul', { 'class': 's4-snap-list' });
    xs.forEach(function (x, i) {
      x.tasks.filter(function (t) { return PART3.indexOf(t.evidence) >= 0; }).forEach(function (t) {
        any3 = true;
        ul3.appendChild(el('li', null, esc(t.label) + ' <span class="s4-evtag">' + esc(evidenceLabel(t.evidence)) + '</span>'));
      });
    });
    if (any3) p3.appendChild(ul3); else p3.appendChild(el('p', { 'class': 's4-none' }, 'Nothing here yet.'));
    host.appendChild(p3);

    var waiting = allTasks().filter(function (r) { return !r.task.evidence; }).length;
    if (waiting) host.appendChild(el('p', { 'class': 'callout' }, waiting === 1 ? 'One task still needs an evidence answer in <a href="#evidence" data-nav="evidence">Section 3</a>.' : waiting + ' tasks still need an evidence answer in <a href="#evidence" data-nav="evidence">Section 3</a>.'));
  }

  /* ---------- Work Clues handoff (read-only, end only) ---------- */
  var REACTION_LABELS = { explore: 'Want to explore', unsure: 'Not sure yet', not_for_me: 'Probably not for me' };
  function clueLabel(c) {
    if (!D41) return null;
    var list = c.sourceType === 'scenario' ? D41.SCENARIOS : D41.DIRECTIONS;
    var item = byId(list, c.sourceId);
    return item ? (c.sourceType === 'scenario' ? item.title : item.name) : null;
  }
  function renderHandoff() {
    var host = $('#clueHandoffBody');
    var clues = S.clues().filter(function (c) { return clueLabel(c) !== null; });
    if (!clues.length) {
      host.innerHTML = '<p><strong>You don’t have any Work Clues from 4.1 yet.</strong> You can add them in 4.1, but you can still continue here.</p>' +
        '<p><a href="../4-1/#work-clues">Open 4.1</a></p>';
      return;
    }
    host.innerHTML = '<p><strong>You also have these Work Clues from 4.1. You’ll bring them, and your evidence, into 4.3.</strong></p>' +
      ['explore', 'unsure', 'not_for_me'].map(function (r) {
        var items = clues.filter(function (c) { return c.reaction === r; });
        return '<h3 class="s4-group-title">' + esc(REACTION_LABELS[r].toUpperCase()) + '</h3>' +
          (items.length ? '<ul class="s4-snap-list">' + items.map(function (c) { return '<li>' + esc(clueLabel(c)) + '</li>'; }).join('') + '</ul>' : '<p class="s4-none">Nothing here.</p>');
      }).join('') +
      '<p class="small">These are read-only here. To change them, go to <a href="../4-1/#work-clues">4.1</a>.</p>';
  }

  /* ---------- status + completion ---------- */
  function setStatus(key, done) { var n = $('[data-status="' + key + '"]'); if (n) { n.textContent = done ? '✓ Done' : ''; n.classList.toggle('done', !!done); } }
  function renderStatus() {
    var c = conditions();
    setStatus('experience', c.experience);
    setStatus('tasks', c.task);
    setStatus('evidence', c.evidence);
    setStatus('involved', c.tag);
    setStatus('snapshot', c.snapshot);
    if (allMet(c)) S.markModuleComplete(MOD);
    var completedAt = S.module(MOD).completedAt;
    var m41 = S.module('4-1');
    $('#m41Status').textContent = m41.completedAt ? 'Complete' : (m41.lastSection ? 'In progress' : '');
    $('#moduleProgress').textContent = completedAt ? 'Module 4.2 complete' : [c.experience, c.task, c.evidence, c.tag, c.snapshot].filter(Boolean).length + ' of 5 steps done';

    var box = $('#completionStatus');
    if (completedAt) {
      box.innerHTML = '<div class="section-label">Module 4.2</div><h2>Module 4.2 complete</h2>' +
        '<p>Your evidence is saved in this browser (first completed ' + esc(new Date(completedAt).toLocaleDateString()) + '). You can keep editing it.</p>' +
        '<p class="small">Use <strong>Export Progress</strong> to keep a backup file, especially if you might switch devices or browsers.</p>' +
        '<div class="progress-tools"><button class="btn subtle" type="button" data-export-inline>Export Progress</button></div>';
      $all('[data-export-inline]', box).forEach(function (b) { b.addEventListener('click', function () { S.exportProgress(summary); }); });
    } else {
      var rows = [
        [c.experience, 'Add at least one experience', 'experience'],
        [c.task, 'Add at least one task for an experience', 'tasks'],
        [c.evidence, 'Give an evidence answer for every task', 'evidence'],
        [c.tag, 'Choose a pattern for at least one task', 'involved'],
        [c.snapshot, 'Open What I Bring to the Table', 'snapshot']
      ];
      box.innerHTML = '<div class="section-label">Module 4.2</div><h2>To finish Module 4.2</h2><ul class="s4-checklist">' +
        rows.map(function (r) { return '<li class="' + (r[0] ? 'ok' : '') + '"><span class="s4-mark" aria-hidden="true">' + (r[0] ? '✓' : '○') + '</span><span class="sr-only">' + (r[0] ? 'Done: ' : 'Not done yet: ') + '</span>' + (r[0] ? esc(r[1]) : '<a href="#' + r[2] + '" data-nav="' + r[2] + '">' + esc(r[1]) + '</a>') + '</li>'; }).join('') +
        '</ul><p class="small">Any background and any evidence answer counts, including “I have not done this yet”.</p>';
    }
  }
  function summary(st) {
    var m1 = st.modules['4-1'], m2 = st.modules['4-2'];
    return { workClues: st.workClues.length, module41Complete: !!(m1 && m1.completedAt), module42Complete: !!(m2 && m2.completedAt), experiences: m2 ? m2.experiences.length : 0, schemaVersion: st.schemaVersion };
  }

  /* ---------- helpers ---------- */
  function wireDebounced(ta, save) {
    var timer;
    ta.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(function () { save(ta.value); }, 500); });
    ta.addEventListener('blur', function () { clearTimeout(timer); save(ta.value); });
  }
  function focusSoon(sel) { setTimeout(function () { var n = $(sel); if (n) n.focus(); }, 0); }

  /* ---------- section routing (same pattern as 4.1) ---------- */
  var current = null;
  var RENDER = { experience: renderExperiences, tasks: renderTaskPicker, evidence: renderEvidence, involved: renderInvolved, snapshot: renderSnapshot, handoff: renderHandoff };
  function go(id, opts) {
    if (SECTIONS.indexOf(id) < 0) id = 'start';
    opts = opts || {};
    if (RENDER[id]) RENDER[id]();
    if (id === 'snapshot') S.setSnapshotReached();
    $all('[data-section]').forEach(function (s) { if (s.getAttribute('data-section') === id) s.removeAttribute('hidden'); else s.setAttribute('hidden', ''); });
    $all('#sectionNav a').forEach(function (a) { if (a.getAttribute('data-nav') === id) a.setAttribute('aria-current', 'step'); else a.removeAttribute('aria-current'); });
    if (history.replaceState && location.hash !== '#' + id) history.replaceState(null, '', '#' + id);
    current = id;
    S.setLastSection(MOD, id);
    closeDrawer(false);
    renderStatus();
    if (!opts.initial) {
      window.scrollTo(0, 0);
      var h = $('[data-section="' + id + '"] h1, [data-section="' + id + '"] h2');
      if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
    }
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-nav]');
    if (!a || a.tagName === 'BUTTON') return;
    e.preventDefault();
    go(a.getAttribute('data-nav'));
  });
  window.addEventListener('hashchange', function () { var id = location.hash.slice(1); if (id !== current && SECTIONS.indexOf(id) >= 0) go(id); });

  /* ---------- mobile drawer (same as 4.1) ---------- */
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
  renderSourcePicker();
  renderEvidenceDefs();
  renderPatternRef();
  S.onChange(renderStatus);
  S.wireTools({ summary: summary });
  var startAt = location.hash.slice(1);
  if (SECTIONS.indexOf(startAt) < 0) startAt = S.module(MOD).lastSection || 'start';
  go(startAt, { initial: true });
})();
