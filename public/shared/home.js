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
    if (id === '4-3' && m.directionExplorations && m.directionExplorations.length) return 'progress';
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
    var s1 = status('4-1'), s2 = status('4-2'), s3 = status('4-3');
    var n = S.clues().length;
    var sum = document.getElementById('homeSummary');
    if (sum) sum.textContent = 'Module 4.1 ' + word(s1) + ' · Module 4.2 ' + word(s2) + ' · Module 4.3 ' + word(s3) + ' · ' + (n === 1 ? '1 Work Clue saved' : n + ' Work Clues saved');
    stamp('stamp41', s1);
    stamp('stamp42', s2);
    stamp('stamp43', s3);
    var btn = document.getElementById('continueBtn');
    if (btn) {
      /* Next step: continue whichever module is in progress (4.1 first), else start the next not-complete one. */
      var target, label;
      if (s1 === 'progress') { target = '4-1'; label = 'Continue Module 4.1'; }
      else if (s1 === 'none') { target = '4-1'; label = 'Start Module 4.1'; }
      else if (s2 === 'progress') { target = '4-2'; label = 'Continue Module 4.2'; }
      else if (s2 === 'none') { target = '4-2'; label = 'Start Module 4.2'; }
      else if (s3 === 'progress') { target = '4-3'; label = 'Continue Module 4.3'; }
      else if (s3 === 'none') { target = '4-3'; label = 'Start Module 4.3'; }
      else { target = '4-3'; label = 'Review Module 4.3'; }   // 4.4 is not built yet
      var m = S.module(target);
      btn.textContent = label;
      btn.href = root + target + '/' + (label.indexOf('Continue') === 0 && m.lastSection ? '#' + m.lastSection : '');
    }
  }
  S.wireTools({ afterRestore: render, afterClear: render });   // backup summary comes from the shared state layer
  S.onChange(render);
  render();
})();
