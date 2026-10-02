/* PVA Academy — Stage 4 · Module 4.1: Understanding VA Work Directions
   Guided flow on one page. Learner-facing copy comes from m41-data.js and the
   page HTML (both transcribed from the locked Production Specification).
   No scoring, ranking or recommendation exists anywhere in this file. */
(function () {
  'use strict';

  var S = window.PVAS4, D = window.PVA_M41, MOD = '4-1';
  if (!S || !D) return;

  var SECTIONS = ['start', 'job-posts', 'patterns', 'directions', 'work-clues', 'wrap-up'];
  var REACTION_LABELS = { explore: 'Want to explore', unsure: 'Not sure yet', not_for_me: 'Probably not for me' };
  var GROUPS = [
    { reaction: 'explore', title: 'WANT TO EXPLORE', desc: 'Work or directions that caught your attention.' },
    { reaction: 'unsure', title: 'NOT SURE YET', desc: 'Work or directions you need more information or experience to judge.' },
    { reaction: 'not_for_me', title: 'PROBABLY NOT FOR ME', desc: 'Work you do not currently want to explore.' }
  ];

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
  function patternName(id) { var p = byId(D.PATTERNS, id); return p ? p.name : id; }
  function postOptionLabel(id) { var o = byId(D.POST_OPTIONS, id); return o ? o.label : id; }

  function sourceLabel(c) {
    if (c.sourceType === 'scenario') { var s = byId(D.SCENARIOS, c.sourceId); return s ? s.title : null; }
    var d = byId(D.DIRECTIONS, c.sourceId); return d ? d.name : null;
  }
  function sourceKind(c) { return c.sourceType === 'scenario' ? 'Scenario' : 'Direction'; }
  /* Only clues this module knows how to show (a restored backup from a later
     version could hold others; they are kept in state, just not listed here). */
  function knownClues() { return S.clues().filter(function (c) { return sourceLabel(c) !== null; }); }

  /* ---------- completion (Build Brief §22 + approved Directions rule) ---------- */
  function postsDone() { return D.POSTS.filter(function (p) { var o = S.getPost(p.id); return o && o.completed; }).length; }
  function scenariosDone() { return D.SCENARIOS.filter(function (s) { var o = S.getScenario(s.id); return o && o.completed; }).length; }
  function directionsReviewed() { return S.module(MOD).directionsReviewed === true; }
  function clueCount() { return knownClues().length; }
  function conditions() {
    return {
      posts: postsDone() === D.POSTS.length,
      scenarios: scenariosDone() === D.SCENARIOS.length,
      directions: directionsReviewed(),
      clue: clueCount() >= 1
    };
  }
  function isComplete() { var c = conditions(); return c.posts && c.scenarios && c.directions && c.clue; }

  /* ---------- reaction control (shared by scenarios, cards and review) ---------- */
  var rxSeq = 0;
  /* One learner-facing question everywhere (v1.1). `context` is read only by
     screen readers, so each control's name says which work it belongs to. */
  var RX_QUESTION = 'Would you want to explore this kind of work?';
  var RX_OPTIONAL = 'This reaction is optional.';
  function reactionControl(sourceType, sourceId, context, showNote) {
    var fs = el('fieldset', { 'class': 's4-reaction', 'data-rx-type': sourceType, 'data-rx-id': sourceId });
    fs.appendChild(el('legend', null, esc(RX_QUESTION) + (context ? '<span class="sr-only"> (' + esc(context) + ')</span>' : '')));
    var row = el('div', { 'class': 's4-rx-row' });
    var name = 'rx-' + sourceType + '-' + sourceId + '-' + (++rxSeq);
    S.REACTIONS.forEach(function (r) {
      var lab = el('label', { 'class': 's4-rx' });
      var inp = el('input', { type: 'radio', name: name, value: r });
      inp.addEventListener('change', function () { if (inp.checked) S.setReaction(sourceType, sourceId, r); });
      lab.appendChild(inp);
      lab.appendChild(el('span', null, esc(REACTION_LABELS[r])));
      row.appendChild(lab);
    });
    fs.appendChild(row);
    if (showNote) fs.appendChild(el('p', { 'class': 'small s4-rx-note' }, RX_OPTIONAL));
    syncReaction(fs);
    return fs;
  }
  function syncReaction(fs) {
    var c = S.getClue(fs.getAttribute('data-rx-type'), fs.getAttribute('data-rx-id'));
    $all('input[type=radio]', fs).forEach(function (i) { i.checked = !!c && c.reaction === i.value; });
  }

  /* ---------- Section 1: job posts ---------- */
  function renderPosts() {
    var host = $('#postList');
    D.POSTS.forEach(function (p) {
      var saved = S.getPost(p.id);
      var wrap = el('article', { 'class': 's4-post', id: p.id, 'aria-labelledby': p.id + '-t' });
      wrap.appendChild(el('div', { 'class': 's4-post-label' }, 'Post ' + p.letter));
      var doc = el('div', { 'class': 's4-jobpost' });
      doc.appendChild(el('h3', { id: p.id + '-t' }, esc(p.title)));
      doc.appendChild(el('p', null, esc(p.body)));
      wrap.appendChild(doc);

      var fs = el('fieldset', { 'class': 's4-pick' });
      fs.appendChild(el('legend', null, esc(p.ask)));
      fs.appendChild(el('p', { 'class': 'small s4-pick-hint' }, 'Select one or more.'));
      var grid = el('div', { 'class': 's4-chips' });
      D.POST_OPTIONS.forEach(function (o) {
        var lab = el('label', { 'class': 'choice s4-chip' });
        var cb = el('input', { type: 'checkbox', value: o.id });
        if (saved && saved.selected.indexOf(o.id) >= 0) cb.checked = true;
        lab.appendChild(cb); lab.appendChild(el('span', null, esc(o.label)));
        grid.appendChild(lab);
      });
      fs.appendChild(grid);
      wrap.appendChild(fs);

      var btn = el('button', { type: 'button', 'class': 'btn secondary small-btn' }, 'See what stands out');
      var fb = el('div', { 'class': 'feedback info', 'aria-live': 'polite' });
      wrap.appendChild(el('div', { 'class': 's4-actions' })).appendChild(btn);
      wrap.appendChild(fb);

      function selected() { return $all('input:checked', grid).map(function (i) { return i.value; }); }
      function reveal() {
        var sel = selected();
        fb.innerHTML = (sel.length ? '<p class="s4-yousaw"><span>You noticed:</span> ' + sel.map(function (id) { return esc(postOptionLabel(id)); }).join(' · ') + '</p>' : '') + '<p>' + p.feedback + '</p>';
        fb.classList.add('show');
        btn.classList.add('hidden'); // later changes update the feedback automatically
      }
      function refreshBtn() { btn.disabled = selected().length === 0; }
      grid.addEventListener('change', function () {
        var o = S.getPost(p.id);
        S.savePost(p.id, selected(), false);
        if (o && o.completed) reveal();
        refreshBtn();
      });
      btn.addEventListener('click', function () {
        if (!selected().length) return;
        S.savePost(p.id, selected(), true);
        reveal();
        refreshUI();
      });
      refreshBtn();
      if (saved && saved.completed) reveal();
      host.appendChild(wrap);
    });
  }

  /* ---------- Section 2: scenarios ---------- */
  function renderScenarios() {
    var host = $('#scenarioList');
    D.SCENARIOS.forEach(function (s) {
      var saved = S.getScenario(s.id);
      var card = el('article', { 'class': 'card s4-scenario', id: s.id, 'aria-labelledby': s.id + '-t' });
      card.appendChild(el('div', { 'class': 'section-label' }, 'Scenario ' + s.num));
      card.appendChild(el('h3', { id: s.id + '-t', 'class': 's4-scn-title' }, 'Scenario ' + s.num + ' — ' + esc(s.title)));
      card.appendChild(el('p', null, esc(s.body)));

      var fs = el('fieldset', { 'class': 's4-pick' });
      fs.appendChild(el('legend', null, 'What kind of work is happening here?'));
      fs.appendChild(el('p', { 'class': 'small s4-pick-hint' }, 'Possible patterns. You can select more than one.'));
      var grid = el('div', { 'class': 's4-chips s4-chips-patterns' });
      D.PATTERNS.forEach(function (pt) {
        var lab = el('label', { 'class': 'choice s4-chip' });
        var cb = el('input', { type: 'checkbox', value: pt.id });
        if (saved && saved.selectedPatterns.indexOf(pt.id) >= 0) cb.checked = true;
        lab.appendChild(cb); lab.appendChild(el('span', null, pt.name));
        grid.appendChild(lab);
      });
      fs.appendChild(grid);
      card.appendChild(fs);

      var btn = el('button', { type: 'button', 'class': 'btn secondary small-btn' }, 'Show the explanation');
      card.appendChild(el('div', { 'class': 's4-actions' })).appendChild(btn);
      var reveal = el('div', { 'class': 's4-reveal hidden', 'aria-live': 'polite' });
      card.appendChild(reveal);

      function selected() { return $all('input:checked', grid).map(function (i) { return i.value; }); }
      function show() {
        var sel = selected();
        reveal.innerHTML =
          (sel.length ? '<p class="s4-yousaw"><span>You noticed:</span> ' + sel.map(function (id) { return esc(patternName(id)); }).join(' · ') + '</p>' : '') +
          '<h4 class="s4-mainly">Mainly: ' + esc(s.mainly) + '</h4>' +
          '<p>' + esc(s.explanation) + '</p>' +
          '<p class="s4-thinkof"><strong>Think of ' + esc(s.thinkOf.name) + ' as:</strong></p>' +
          '<blockquote><p>' + esc(s.thinkOf.text) + '</p></blockquote>' +
          (s.extra || '');
        reveal.appendChild(reactionControl('scenario', s.id, 'Scenario ' + s.num + ': ' + s.title, true));
        reveal.classList.remove('hidden');
        btn.classList.add('hidden');
      }
      function refreshBtn() { btn.disabled = selected().length === 0; }
      grid.addEventListener('change', function () {
        var o = S.getScenario(s.id);
        S.saveScenario(s.id, selected(), false);
        if (o && o.completed) {
          var yousaw = $('.s4-yousaw', reveal);
          var sel = selected();
          if (yousaw) yousaw.innerHTML = '<span>You noticed:</span> ' + (sel.length ? sel.map(function (id) { return esc(patternName(id)); }).join(' · ') : '—');
        }
        refreshBtn();
      });
      btn.addEventListener('click', function () {
        if (!selected().length) return;
        S.saveScenario(s.id, selected(), true);
        show();
        refreshUI();
        var h = $('.s4-mainly', reveal); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
      });
      refreshBtn();
      if (saved && saved.completed) show();
      host.appendChild(card);
    });

    var dl = $('#patternRefList');
    D.PATTERNS.forEach(function (p) {
      dl.appendChild(el('dt', null, p.name));
      dl.appendChild(el('dd', null, esc(p.def)));
    });
  }

  /* ---------- Section 3: direction cards ---------- */
  function tags(list) {
    return '<ul class="s4-tags" aria-label="Work patterns commonly involved">' + list.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>';
  }
  function renderDirections() {
    var host = $('#directionList');
    D.DIRECTIONS.forEach(function (d) {
      var card = el('article', { 'class': 'card s4-dir', id: d.id, 'aria-labelledby': d.id + '-t' });
      var head = el('div', { 'class': 's4-dir-head' });
      head.innerHTML =
        '<span class="s4-dir-num" aria-hidden="true">' + esc(d.num) + '</span>' +
        '<div class="s4-dir-headtext"><h3 id="' + d.id + '-t">' + esc(d.name) + '</h3>' +
        '<h4 class="s4-field">What does the work involve?</h4><p>' + esc(d.involves) + '</p>' +
        '<h4 class="s4-field">Work patterns commonly involved</h4>' + tags(d.patterns) +
        (d.patternsNote ? '<p class="small">' + esc(d.patternsNote) + '</p>' : '') + '</div>';
      card.appendChild(head);

      var detailsId = d.id + '-details';
      var toggle = el('button', { type: 'button', 'class': 'btn subtle small-btn s4-dir-toggle', 'aria-expanded': 'false', 'aria-controls': detailsId }, 'Show tasks, demands and path');
      card.appendChild(toggle);
      var det = el('div', { 'class': 's4-dir-details', id: detailsId, hidden: '' });
      det.innerHTML =
        '<h4 class="s4-field">Examples of tasks</h4><ul>' + d.tasks.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' +
        '<h4 class="s4-field">What kind of work environment?</h4><p>' + esc(d.environment) + '</p>' +
        '<h4 class="s4-field">What can be demanding about it?</h4><p>' + esc(d.demanding) + '</p>' +
        '<h4 class="s4-field">Typical path</h4><p class="s4-path"><strong>' + esc(d.path) + '</strong></p><p>' + esc(d.pathNote) + '</p>' +
        '<h4 class="s4-field">Useful skills</h4><p>' + esc(d.skills) + '</p>' +
        '<h4 class="s4-field">What would you need to learn?</h4><p>' + esc(d.learn) + '</p>' +
        (d.related ? '<p class="tip s4-related">' + d.related + '</p>' : '');
      card.appendChild(det);
      toggle.addEventListener('click', function () {
        var open = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', open ? 'false' : 'true');
        toggle.textContent = open ? 'Show tasks, demands and path' : 'Hide details';
        if (open) det.setAttribute('hidden', ''); else { det.removeAttribute('hidden'); S.markExplored(d.id); }
      });
      card.appendChild(reactionControl('direction', d.id, d.name, true));
      host.appendChild(card);
    });

    $('#directionsDone').addEventListener('click', function () {
      S.setDirectionsReviewed(MOD);
      go('work-clues');
    });
  }

  /* ---------- Section 4: Work Clues review ---------- */
  var reviewSig = null;
  function signature() { return knownClues().map(function (c) { return c.id + '=' + c.reaction; }).sort().join('|'); }
  function renderReview(force) {
    var sig = signature();
    if (!force && sig === reviewSig) return;
    reviewSig = sig;
    var host = $('#clueReview');
    var active = document.activeElement && host.contains(document.activeElement) ? document.activeElement.id : null;
    host.innerHTML = '';
    var all = knownClues();
    if (!all.length) {
      host.appendChild(el('div', { 'class': 'card s4-empty' },
        '<p><strong>You haven’t saved any Work Clues yet.</strong></p><p>You can react to the work in <a href="#patterns" data-nav="patterns">Section 2</a> or to the directions in <a href="#directions" data-nav="directions">Section 3</a>. Any reaction counts, including “Probably not for me.”</p>'));
    }
    GROUPS.forEach(function (g) {
      var sec = el('section', { 'class': 'card s4-group s4-group-' + g.reaction, 'aria-labelledby': 'grp-' + g.reaction });
      sec.appendChild(el('h3', { id: 'grp-' + g.reaction, 'class': 's4-group-title' }, esc(g.title)));
      sec.appendChild(el('p', { 'class': 'small' }, esc(g.desc)));
      var items = all.filter(function (c) { return c.reaction === g.reaction; });
      if (!items.length) sec.appendChild(el('p', { 'class': 's4-none' }, 'Nothing here yet.'));
      var ul = el('ul', { 'class': 's4-clue-list' });
      items.forEach(function (c) {
        var li = el('li', { 'class': 's4-clue' });
        li.appendChild(el('p', { 'class': 's4-clue-name' }, '<span class="s4-kind">' + sourceKind(c) + '</span> ' + esc(sourceLabel(c))));
        li.appendChild(reactionControl(c.sourceType, c.sourceId, sourceLabel(c), false));
        var noteId = 'note-' + c.sourceType + '-' + c.sourceId;
        li.appendChild(el('label', { 'class': 'field-label', 'for': noteId }, 'Why did you react this way? <span class="small">(optional)</span>'));
        var ta = el('textarea', { 'class': 'response s4-note', id: noteId, rows: '2', maxlength: '1000' });
        ta.value = c.note || '';
        var timer;
        ta.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(function () { S.setNote(c.sourceType, c.sourceId, ta.value); }, 500); });
        ta.addEventListener('blur', function () { clearTimeout(timer); S.setNote(c.sourceType, c.sourceId, ta.value); });
        li.appendChild(ta);
        var rm = el('button', { type: 'button', 'class': 'btn subtle small-btn s4-remove' }, 'Remove this clue');
        rm.setAttribute('aria-label', 'Remove the Work Clue for ' + sourceLabel(c));
        rm.addEventListener('click', function () { S.removeClue(c.sourceType, c.sourceId); });
        li.appendChild(rm);
        ul.appendChild(li);
      });
      if (items.length) sec.appendChild(ul);
      host.appendChild(sec);
    });
    if (active) { var a = document.getElementById(active); if (a) a.focus(); }
  }

  /* ---------- sidebar Work Clues panel + synthesis lists ---------- */
  function renderPanel() {
    var body = $('#cluePanelBody');
    var all = knownClues();
    $all('[data-clue-count]').forEach(function (n) { n.textContent = String(all.length); });
    if (!all.length) { body.innerHTML = '<p class="small">No Work Clues yet. React to any scenario or direction to start collecting them.</p>'; }
    else {
      body.innerHTML = GROUPS.map(function (g) {
        var items = all.filter(function (c) { return c.reaction === g.reaction; });
        return '<div class="s4-pgroup"><h3>' + esc(REACTION_LABELS[g.reaction]) + ' <span class="small">(' + items.length + ')</span></h3>' +
          (items.length ? '<ul>' + items.map(function (c) { return '<li>' + esc(sourceLabel(c)) + '</li>'; }).join('') + '</ul>' : '') + '</div>';
      }).join('');
    }
    GROUPS.forEach(function (g) {
      var ul = $('[data-synth="' + g.reaction + '"]');
      if (!ul) return;
      var items = all.filter(function (c) { return c.reaction === g.reaction; });
      ul.innerHTML = items.length ? items.map(function (c) { return '<li>' + esc(sourceLabel(c)) + (c.note ? ' <span class="small">— ' + esc(c.note) + '</span>' : '') + '</li>'; }).join('') : '<li class="s4-none">Nothing here yet.</li>';
    });
  }

  /* ---------- status + completion ---------- */
  function setStatus(key, done, text) {
    var n = $('[data-status="' + key + '"]');
    if (!n) return;
    n.textContent = done ? '✓ Done' : (text || '');
    n.classList.toggle('done', !!done);
  }
  function renderStatus() {
    var c = conditions();
    setStatus('job-posts', c.posts, postsDone() + ' of ' + D.POSTS.length);
    setStatus('patterns', c.scenarios, scenariosDone() + ' of ' + D.SCENARIOS.length);
    setStatus('directions', c.directions, '');
    setStatus('work-clues', c.clue, '');
    $('#discoveryPanel').classList.toggle('hidden', !c.posts);
    $('#patternReference').classList.toggle('hidden', !c.scenarios);

    if (isComplete()) S.markModuleComplete(MOD);
    var completedAt = S.module(MOD).completedAt;
    var done = isComplete();
    $('#moduleProgress').textContent = done ? 'Module 4.1 complete' :
      [c.posts, c.scenarios, c.directions, c.clue].filter(Boolean).length + ' of 4 steps done';

    var box = $('#completionStatus');
    if (done) {
      box.innerHTML = '<div class="section-label">Module 4.1</div><h2>Module 4.1 complete</h2>' +
        '<p>Your Work Clues are saved in this browser' + (completedAt ? ' (first completed ' + esc(new Date(completedAt).toLocaleDateString()) + ')' : '') + '. They will carry into the next parts of Stage 4.</p>' +
        '<p class="small">Use <strong>Export Progress</strong> to keep a backup file, especially if you might switch devices or browsers.</p>' +
        '<div class="progress-tools"><button class="btn subtle" type="button" data-export>Export Progress</button></div>';
      $all('[data-export]', box).forEach(function (b) { b.addEventListener('click', function () { S.exportProgress(summary); }); });
    } else {
      var rows = [
        [c.posts, 'Section 1: look at all four job posts', 'job-posts'],
        [c.scenarios, 'Section 2: work through all five scenarios', 'patterns'],
        [c.directions, 'Section 3: look over the VA directions and continue', 'directions'],
        [c.clue, 'Save at least one Work Clue (any reaction counts)', 'work-clues']
      ];
      box.innerHTML = '<div class="section-label">Module 4.1</div><h2>To finish Module 4.1</h2><ul class="s4-checklist">' +
        rows.map(function (r) { return '<li class="' + (r[0] ? 'ok' : '') + '"><span class="s4-mark" aria-hidden="true">' + (r[0] ? '✓' : '○') + '</span><span class="sr-only">' + (r[0] ? 'Done: ' : 'Not done yet: ') + '</span>' + (r[0] ? esc(r[1]) : '<a href="#' + r[2] + '" data-nav="' + r[2] + '">' + esc(r[1]) + '</a>') + '</li>'; }).join('') +
        '</ul><p class="small">You don’t need to open every direction card or choose a direction.</p>';
    }
  }
  function summary(st) {
    var m = st.modules['4-1'];
    return { workClues: st.workClues.length, module41Complete: !!(m && m.completedAt), schemaVersion: st.schemaVersion };
  }

  function refreshUI() {
    renderStatus();
    renderPanel();
    renderReview(false);
    $all('.s4-reaction').forEach(syncReaction);
  }

  /* ---------- section routing ---------- */
  var current = null;
  function go(id, opts) {
    if (SECTIONS.indexOf(id) < 0) id = 'start';
    opts = opts || {};
    $all('[data-section]').forEach(function (s) { if (s.getAttribute('data-section') === id) s.removeAttribute('hidden'); else s.setAttribute('hidden', ''); });
    $all('#sectionNav a').forEach(function (a) { if (a.getAttribute('data-nav') === id) a.setAttribute('aria-current', 'step'); else a.removeAttribute('aria-current'); });
    if (current !== id && history.replaceState && location.hash !== '#' + id) history.replaceState(null, '', '#' + id);
    current = id;
    S.setLastSection(MOD, id);
    closeDrawer(false);
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

  /* ---------- mobile drawer ---------- */
  var side = $('#s4Side'), backdrop = $('#s4Backdrop'), menuBtn = $('#menuBtn'), cluesBtn = $('#cluesBtn'), closeBtn = $('#sideClose');
  var mq = window.matchMedia('(max-width: 959px)');
  var opener = null;
  function openDrawer(btn, focusPanel) {
    opener = btn;
    side.classList.add('open'); backdrop.classList.add('show'); document.body.classList.add('drawer-open');
    menuBtn.setAttribute('aria-expanded', 'true'); cluesBtn.setAttribute('aria-expanded', 'true');
    if (focusPanel) { var t = $('#cluePanelTitle'); t.setAttribute('tabindex', '-1'); t.scrollIntoView({ block: 'start' }); t.focus({ preventScroll: true }); }
    else closeBtn.focus();
  }
  function closeDrawer(returnFocus) {
    if (!side.classList.contains('open')) return;
    side.classList.remove('open'); backdrop.classList.remove('show'); document.body.classList.remove('drawer-open');
    menuBtn.setAttribute('aria-expanded', 'false'); cluesBtn.setAttribute('aria-expanded', 'false');
    if (returnFocus && opener) opener.focus();
  }
  menuBtn.addEventListener('click', function () { openDrawer(menuBtn, false); });
  cluesBtn.addEventListener('click', function () { openDrawer(cluesBtn, true); });
  closeBtn.addEventListener('click', function () { closeDrawer(true); });
  backdrop.addEventListener('click', function () { closeDrawer(true); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && side.classList.contains('open')) closeDrawer(true); });
  (mq.addEventListener ? mq.addEventListener.bind(mq, 'change') : mq.addListener.bind(mq))(function () { closeDrawer(false); });

  /* ---------- init ---------- */
  renderPosts();
  renderScenarios();
  renderDirections();
  renderReview(true);
  S.onChange(refreshUI);
  S.wireTools({ summary: summary });
  refreshUI();
  var startAt = location.hash.slice(1);
  if (SECTIONS.indexOf(startAt) < 0) startAt = S.module(MOD).lastSection || 'start';
  go(startAt, { initial: true });
})();
