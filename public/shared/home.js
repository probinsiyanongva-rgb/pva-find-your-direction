/* PVA Academy — Stage 4 home and Progress page: status lines, Continue button,
   Export / Restore / Clear. Reads the shared Stage 4 state only. */
(function () {
  'use strict';
  var S = window.PVAS4;
  if (!S) return;
  var root = document.body.getAttribute('data-root') || './';

  function status(id) {
    var m = S.module(id);
    if (m.completedAt) return 'complete';
    if (m.lastSection) return 'progress';
    if (id === '4-1') {
      var st = S._state();
      if (st.workClues.length || st.jobPostObservations.length || st.scenarioObservations.length) return 'progress';
    }
    if (id === '4-2' && m.experiences && m.experiences.length) return 'progress';
    return 'none';
  }
  function word(s) { return s === 'complete' ? 'complete' : s === 'progress' ? 'in progress' : 'not started yet'; }
  function stamp(elId, s) {
    var el = document.getElementById(elId);
    if (!el) return;
    el.textContent = s === 'complete' ? 'Complete' : s === 'progress' ? 'In progress' : 'Not started';
    el.className = 'stamp' + (s === 'complete' ? ' complete' : s === 'progress' ? ' progress' : '');
  }
  function render() {
    var s1 = status('4-1'), s2 = status('4-2');
    var n = S.clues().length;
    var sum = document.getElementById('homeSummary');
    if (sum) sum.textContent = 'Module 4.1 ' + word(s1) + ' · Module 4.2 ' + word(s2) + ' · ' + (n === 1 ? '1 Work Clue saved' : n + ' Work Clues saved');
    stamp('stamp41', s1);
    stamp('stamp42', s2);
    var btn = document.getElementById('continueBtn');
    if (btn) {
      /* Next step: continue whichever module is in progress (4.1 first), else start the next not-complete one. */
      var target, label;
      if (s1 === 'progress') { target = '4-1'; label = 'Continue Module 4.1'; }
      else if (s1 === 'none') { target = '4-1'; label = 'Start Module 4.1'; }
      else if (s2 === 'progress') { target = '4-2'; label = 'Continue Module 4.2'; }
      else if (s2 === 'none') { target = '4-2'; label = 'Start Module 4.2'; }
      else { target = '4-2'; label = 'Review Module 4.2'; }
      var m = S.module(target);
      btn.textContent = label;
      btn.href = root + target + '/' + (label.indexOf('Continue') === 0 && m.lastSection ? '#' + m.lastSection : '');
    }
  }
  S.wireTools({
    summary: function (st) {
      var m1 = st.modules['4-1'], m2 = st.modules['4-2'];
      return { workClues: st.workClues.length, module41Complete: !!(m1 && m1.completedAt), module42Complete: !!(m2 && m2.completedAt), experiences: m2 ? m2.experiences.length : 0, schemaVersion: st.schemaVersion };
    },
    afterRestore: render, afterClear: render
  });
  S.onChange(render);
  render();
})();
