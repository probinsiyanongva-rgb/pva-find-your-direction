/* PVA Academy — Stage 4 home and Progress page: status line, Continue button,
   Export / Restore / Clear. Reads the shared Stage 4 state only. */
(function () {
  'use strict';
  var S = window.PVAS4;
  if (!S) return;
  var root = document.body.getAttribute('data-root') || './';

  function status41() {
    var m = S.module('4-1');
    if (m.completedAt) return 'complete';
    var st = S._state();
    if (m.lastSection || st.workClues.length || st.jobPostObservations.length || st.scenarioObservations.length) return 'progress';
    return 'none';
  }
  function render() {
    var s = status41();
    var n = S.clues().length;
    var clueText = n === 1 ? '1 Work Clue saved' : n + ' Work Clues saved';
    var sum = document.getElementById('homeSummary');
    if (sum) sum.textContent = s === 'complete' ? 'Module 4.1 complete · ' + clueText :
      s === 'progress' ? 'Module 4.1 in progress · ' + clueText : 'Module 4.1 not started yet';
    var stamp = document.getElementById('stamp41');
    if (stamp) {
      stamp.textContent = s === 'complete' ? 'Complete' : s === 'progress' ? 'In progress' : 'Not started';
      stamp.className = 'stamp' + (s === 'complete' ? ' complete' : s === 'progress' ? ' progress' : '');
    }
    var btn = document.getElementById('continueBtn');
    if (btn) {
      var m = S.module('4-1');
      btn.textContent = s === 'complete' ? 'Review Module 4.1' : s === 'progress' ? 'Continue Module 4.1' : 'Start Module 4.1';
      btn.href = root + '4-1/' + (s === 'progress' && m.lastSection ? '#' + m.lastSection : '');
    }
  }
  S.wireTools({
    summary: function (st) { var m = st.modules['4-1']; return { workClues: st.workClues.length, module41Complete: !!(m && m.completedAt), schemaVersion: st.schemaVersion }; },
    afterRestore: render, afterClear: render
  });
  S.onChange(render);
  render();
})();
