/* PVA Academy — Stage 4: Find Your Direction
   Shared, browser-only state for ALL of Stage 4 (4.1 now; 4.2–4.4 later).

   Same architecture as the Stage 2–3 courses (one localStorage key, one
   namespace, Export / Restore / Clear), adapted to the Stage 4 profile
   required by the 4.1 Build Brief:

     stage4Profile = {
       schemaVersion: 1,
       workClues: [{ id, sourceType, sourceId, reaction, note, updatedAt }],   // the ONLY reaction store
       scenarioObservations: [{ scenarioId, selectedPatterns[], completed }],
       jobPostObservations:  [{ postId, selected[], completed }],             // approved addition
       exploredDirections: [directionId],                                     // never feeds completion
       modules: { "4-1": { lastSection, directionsReviewed, completedAt } },  // approved addition
       _meta: { updatedAt }
     }

   Deliberately NOT stored: interestedDirections (derive from workClues),
   reflection, any score, ranking or recommendation.
   Nothing is sent to a server or account. */
(function () {
  'use strict';

  var STORAGE_KEY = 'pva-stage4-progress';
  var BACKUP_FORMAT = 'pva-stage4-progress-backup';
  var BACKUP_VERSION = 1;
  var SCHEMA_VERSION = 1;
  var COURSE_NAME = 'PVA Academy — Stage 4: Find Your Direction';

  var SOURCE_TYPES = ['scenario', 'direction'];
  var REACTIONS = ['explore', 'unsure', 'not_for_me'];
  var MODULE_IDS = ['4-1'];            // 4-2, 4-3, 4-4 are added here when built
  var ID_RE = /^[a-z0-9][a-z0-9-]{0,63}$/;
  var NOTE_MAX = 1000;

  var storageOK = true;
  var state = fresh();
  var listeners = [];

  function fresh() {
    return {
      schemaVersion: SCHEMA_VERSION,
      workClues: [],
      scenarioObservations: [],
      jobPostObservations: [],
      exploredDirections: [],
      modules: {},
      _meta: { updatedAt: null }
    };
  }

  function isObj(v) { return v !== null && typeof v === 'object' && !Array.isArray(v); }
  function isId(v) { return typeof v === 'string' && ID_RE.test(v); }
  function strOrNull(v) { return typeof v === 'string' && v.length <= 64 ? v : null; }
  function idList(arr, max) {
    if (!Array.isArray(arr)) return [];
    var seen = {}, out = [];
    arr.forEach(function (v) { if (isId(v) && !seen[v] && out.length < (max || 200)) { seen[v] = 1; out.push(v); } });
    return out;
  }

  /* Validates and rebuilds a profile field by field. Anything unexpected is
     dropped, never applied as-is. Used for both localStorage and Restore. */
  function normalize(raw) {
    var out = fresh();
    if (!isObj(raw)) return out;

    if (Array.isArray(raw.workClues)) {
      var seenClue = {};
      raw.workClues.forEach(function (c) {
        if (!isObj(c) || SOURCE_TYPES.indexOf(c.sourceType) < 0 || !isId(c.sourceId) || REACTIONS.indexOf(c.reaction) < 0) return;
        var id = c.sourceType + ':' + c.sourceId;
        if (seenClue[id]) return;
        seenClue[id] = 1;
        out.workClues.push({
          id: id, sourceType: c.sourceType, sourceId: c.sourceId, reaction: c.reaction,
          note: typeof c.note === 'string' ? c.note.slice(0, NOTE_MAX) : '',
          updatedAt: strOrNull(c.updatedAt)
        });
      });
    }
    function observations(list, idKey, selKey) {
      if (!Array.isArray(list)) return [];
      var seen = {}, res = [];
      list.forEach(function (o) {
        if (!isObj(o) || !isId(o[idKey]) || seen[o[idKey]]) return;
        seen[o[idKey]] = 1;
        var n = {}; n[idKey] = o[idKey]; n[selKey] = idList(o[selKey], 10); n.completed = o.completed === true;
        res.push(n);
      });
      return res;
    }
    out.scenarioObservations = observations(raw.scenarioObservations, 'scenarioId', 'selectedPatterns');
    out.jobPostObservations = observations(raw.jobPostObservations, 'postId', 'selected');
    out.exploredDirections = idList(raw.exploredDirections);

    if (isObj(raw.modules)) {
      MODULE_IDS.forEach(function (m) {
        var e = raw.modules[m];
        if (!isObj(e)) return;
        out.modules[m] = {
          lastSection: isId(e.lastSection) ? e.lastSection : null,
          directionsReviewed: e.directionsReviewed === true,
          completedAt: strOrNull(e.completedAt)
        };
      });
    }
    if (isObj(raw._meta)) out._meta.updatedAt = strOrNull(raw._meta.updatedAt);
    return out;
  }

  /* Future schema versions add a migration step here (v1 → v2 …). */
  function migrate(raw) {
    if (!isObj(raw)) return null;
    var v = raw.schemaVersion;
    if (typeof v !== 'number' || v < 1 || v > SCHEMA_VERSION || Math.floor(v) !== v) return null;
    return raw;
  }

  function showBanner(msg) {
    var b = document.getElementById('storageBanner');
    if (!b) return;
    var t = document.getElementById('storageBannerText');
    if (t && msg) t.textContent = msg;
    b.classList.remove('hidden');
  }

  function load() {
    try {
      var probe = '__pva_s4_probe__';
      localStorage.setItem(probe, '1');
      localStorage.removeItem(probe);
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = null;
        try { parsed = migrate(JSON.parse(raw)); } catch (e) { parsed = null; }
        if (parsed) state = normalize(parsed);
        else showBanner('Your saved Stage 4 progress could not be read, so this page started fresh. Check your browser storage settings if this keeps happening.');
      }
    } catch (e) {
      storageOK = false;
      state = fresh();
      showBanner();
    }
  }

  function stampTime() { return new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }); }

  function persist() {
    state._meta.updatedAt = new Date().toISOString();
    var ok = false;
    if (storageOK) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        ok = true;
        document.querySelectorAll('[data-save-state]').forEach(function (el) { el.textContent = 'Saved in this browser · ' + stampTime(); });
      } catch (e) {
        storageOK = false;
        showBanner('Your browser stopped this course from saving progress. You can continue, but your Work Clues may not remain after you close or refresh this page.');
      }
    } else { showBanner(); }
    listeners.forEach(function (fn) { try { fn(); } catch (e) {} });
    return ok;
  }

  /* ---------- module state ---------- */
  function mod(id) {
    if (!state.modules[id]) state.modules[id] = { lastSection: null, directionsReviewed: false, completedAt: null };
    return state.modules[id];
  }
  function setLastSection(moduleId, sectionId) { mod(moduleId).lastSection = sectionId; persist(); }
  function setDirectionsReviewed(moduleId) { if (!mod(moduleId).directionsReviewed) { mod(moduleId).directionsReviewed = true; persist(); } }
  function markModuleComplete(moduleId) { var m = mod(moduleId); if (!m.completedAt) { m.completedAt = new Date().toISOString(); persist(); } }

  /* ---------- observations ---------- */
  function findObs(list, key, id) { for (var i = 0; i < list.length; i++) if (list[i][key] === id) return list[i]; return null; }
  function getScenario(id) { return findObs(state.scenarioObservations, 'scenarioId', id); }
  function saveScenario(id, patterns, completed) {
    var o = getScenario(id);
    if (!o) { o = { scenarioId: id, selectedPatterns: [], completed: false }; state.scenarioObservations.push(o); }
    o.selectedPatterns = idList(patterns, 10);
    if (completed) o.completed = true;
    persist();
  }
  function getPost(id) { return findObs(state.jobPostObservations, 'postId', id); }
  function savePost(id, selected, completed) {
    var o = getPost(id);
    if (!o) { o = { postId: id, selected: [], completed: false }; state.jobPostObservations.push(o); }
    o.selected = idList(selected, 10);
    if (completed) o.completed = true;
    persist();
  }
  function markExplored(dirId) {
    if (isId(dirId) && state.exploredDirections.indexOf(dirId) < 0) { state.exploredDirections.push(dirId); persist(); }
  }

  /* ---------- Work Clues (single source of truth) ---------- */
  function getClue(sourceType, sourceId) {
    var id = sourceType + ':' + sourceId;
    for (var i = 0; i < state.workClues.length; i++) if (state.workClues[i].id === id) return state.workClues[i];
    return null;
  }
  function setReaction(sourceType, sourceId, reaction) {
    if (SOURCE_TYPES.indexOf(sourceType) < 0 || !isId(sourceId) || REACTIONS.indexOf(reaction) < 0) return;
    var c = getClue(sourceType, sourceId);
    if (!c) { c = { id: sourceType + ':' + sourceId, sourceType: sourceType, sourceId: sourceId, reaction: reaction, note: '', updatedAt: null }; state.workClues.push(c); }
    c.reaction = reaction;
    c.updatedAt = new Date().toISOString();
    persist();
  }
  function setNote(sourceType, sourceId, note) {
    var c = getClue(sourceType, sourceId);
    if (!c) return;
    c.note = String(note || '').slice(0, NOTE_MAX);
    c.updatedAt = new Date().toISOString();
    persist();
  }
  function removeClue(sourceType, sourceId) {
    var id = sourceType + ':' + sourceId;
    state.workClues = state.workClues.filter(function (c) { return c.id !== id; });
    persist();
  }
  function clues() { return state.workClues.slice(); }
  /* Derived on demand, never stored (Build Brief §6.1). */
  function directionsWithReaction(reaction) {
    return state.workClues.filter(function (c) { return c.sourceType === 'direction' && c.reaction === reaction; }).map(function (c) { return c.sourceId; });
  }

  /* ---------- export / restore / clear ---------- */
  function exportProgress(summaryFn) {
    var payload = {
      format: BACKUP_FORMAT, version: BACKUP_VERSION, course: COURSE_NAME, storageKey: STORAGE_KEY,
      exportedAt: new Date().toISOString(),
      note: 'Progress backup for PVA Academy Stage 4: Find Your Direction only. Restore it on the Stage 4 home page, Progress page, or inside a module to bring your Work Clues back in this or another browser.',
      summary: summaryFn ? summaryFn(state) : { workClues: state.workClues.length },
      data: state
    };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'Find-Your-Direction-progress-backup-' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1500);
  }

  /* Pure check used by Restore (and by QA). Returns {ok, error} or {ok, data}. */
  function validateBackup(payload) {
    if (!isObj(payload) || typeof payload.format !== 'string') return { ok: false, error: 'This file is not a Stage 4: Find Your Direction progress backup.' };
    if (payload.format !== BACKUP_FORMAT) return { ok: false, error: 'Backups from other PVA courses cannot be restored here.' };
    if (typeof payload.version !== 'number' || payload.version > BACKUP_VERSION) return { ok: false, error: 'This backup was made by a newer version of the course and cannot be restored here.' };
    var migrated = migrate(payload.data);
    if (!migrated) return { ok: false, error: 'This backup is missing its Stage 4 data, or was made by a newer version of the course, so it cannot be restored here.' };
    return { ok: true, data: normalize(migrated) };
  }

  function restoreFromFile(file, done) {
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      var payload;
      try { payload = JSON.parse(reader.result); }
      catch (e) { alert('This file is not a valid progress backup (it is not JSON).'); return; }
      var check = validateBackup(payload);
      if (!check.ok) { alert(check.error); return; }
      var r = check.data;
      var when = payload.exportedAt ? new Date(payload.exportedAt).toLocaleString() : 'unknown date';
      var msg = 'Restore this backup?\n\nExported: ' + when +
        '\nWork Clues: ' + r.workClues.length +
        '\nModule 4.1: ' + (r.modules['4-1'] && r.modules['4-1'].completedAt ? 'complete' : 'in progress or not started') +
        '\n\nRestoring REPLACES the Stage 4 progress currently saved in this browser.\n\nPress OK to replace and restore, or Cancel.';
      if (!confirm(msg)) return;
      state = r;
      persist();
      if (done) done();
    };
    reader.readAsText(file);
  }

  function clearProgress(done) {
    if (!confirm('Clear all saved Stage 4: Find Your Direction progress in this browser, including your Work Clues? This cannot be undone. Other PVA courses are not affected.')) return;
    state = fresh();
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) { storageOK = false; showBanner(); }
    listeners.forEach(function (fn) { try { fn(); } catch (e) {} });
    if (done) done();
  }

  /* Wires the standard Export / Restore / Clear buttons if present on the page. */
  function wireTools(opts) {
    opts = opts || {};
    var ex = document.querySelectorAll('[data-export]');
    var re = document.querySelectorAll('[data-restore]');
    var cl = document.querySelectorAll('[data-clear]');
    var file = document.getElementById('restoreFile');
    ex.forEach(function (b) { b.addEventListener('click', function () { exportProgress(opts.summary); }); });
    re.forEach(function (b) { b.addEventListener('click', function () { if (file) { file.value = ''; file.click(); } }); });
    if (file) file.addEventListener('change', function () { restoreFromFile(file.files[0], opts.afterRestore || function () { location.reload(); }); });
    cl.forEach(function (b) { b.addEventListener('click', function () { clearProgress(opts.afterClear || function () { location.reload(); }); }); });
  }

  load();

  window.PVAS4 = {
    STORAGE_KEY: STORAGE_KEY, SCHEMA_VERSION: SCHEMA_VERSION, REACTIONS: REACTIONS,
    storageOK: function () { return storageOK; },
    onChange: function (fn) { listeners.push(fn); },
    module: function (id) { return state.modules[id] || { lastSection: null, directionsReviewed: false, completedAt: null }; },
    setLastSection: setLastSection, setDirectionsReviewed: setDirectionsReviewed, markModuleComplete: markModuleComplete,
    getScenario: getScenario, saveScenario: saveScenario, getPost: getPost, savePost: savePost,
    markExplored: markExplored, explored: function () { return state.exploredDirections.slice(); },
    getClue: getClue, setReaction: setReaction, setNote: setNote, removeClue: removeClue, clues: clues,
    directionsWithReaction: directionsWithReaction,
    exportProgress: exportProgress, validateBackup: validateBackup, restoreFromFile: restoreFromFile, clearProgress: clearProgress,
    wireTools: wireTools,
    _state: function () { return state; }
  };
})();
