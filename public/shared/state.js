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
       modules: {
         "4-1": { lastSection, directionsReviewed, completedAt },
         "4-2": { lastSection, snapshotReached, completedAt,                  // schema v2
                  experiences: [{ id, source, note,
                    tasks: [{ id, label, promptId|null, patternTags[], evidence|null, note }] }] },
         "4-3": { lastSection, completedAt, reviewedWorkClues, reviewedEvidence,  // schema v3
                  examinedDirectionIds[], decisionReached, undecided, undecidedNote,
                  selectedDirectionIds[],                                     // 0–2, the only store of the choice
                  directionExplorations: [{ directionId, judgment|null, reason, reasonSkipped,
                    relatedEvidenceIds[], whatMayBeNew, learningQuestions[], savedAt }] }
       },
       _meta: { updatedAt }
     }

   Schema history: v1 = 4.1 only. v2 = adds modules["4-2"]. v3 = adds
   modules["4-3"] (Production Specification v1.5). Older data and backups
   migrate unchanged (4.1/4.2 fields are never altered); a "4-3" key found in
   v1/v2 data cannot be genuine 4.3 data and is dropped by the migration.
   4.3 stores only learner choices and learner text: it references 4.2 tasks
   by ID (relatedEvidenceIds) and never copies Work Clues or tasks. Judgments
   (explore_further / unsure / not_now) are separate from Work Clue reactions.

   Deliberately NOT stored: interestedDirections (derive from workClues),
   reflection, any score, ranking, recommendation, pattern counts/totals,
   capability profiles, transfer notes or development needs.
   4.2 evidence is a named string, never a number; pattern tags are only ever
   set by the learner.
   Nothing is sent to a server or account.

   DATA-PROTECTION GUARD (Phase 0). Saved progress this version cannot read
   (a newer schema, malformed JSON, an invalid version) is NEVER written over:
   the page keeps working in memory, stops saving, shows the storage banner
   with "Download saved data", and asks before Clear or Restore replaces it.
   The same check runs before every save, so a tab that is still open when
   another tab (or a newer version of the course) saves newer data stops
   instead of overwriting it. This guard release is the oldest version that
   may be redeployed once any newer schema has shipped (see README). */
(function () {
  'use strict';

  var STORAGE_KEY = 'pva-stage4-progress';
  var BACKUP_FORMAT = 'pva-stage4-progress-backup';
  var BACKUP_VERSION = 3;          // backup wrapper; v1–v3 wrappers are accepted
  var SCHEMA_VERSION = 3;          // data schema; v1/v2 data is migrated on load/restore
  var COURSE_NAME = 'PVA Academy — Stage 4: Find Your Direction';

  var SOURCE_TYPES = ['scenario', 'direction'];
  var REACTIONS = ['explore', 'unsure', 'not_for_me'];
  var MODULE_IDS = ['4-1', '4-2', '4-3'];     // 4-4 is added here when built
  var PATTERN_IDS = ['organize', 'communicate', 'research', 'create', 'operate'];
  var EVIDENCE = ['regularly', 'done_before', 'some_exposure', 'not_done_yet'];   // named answers, NOT levels
  var EXP_SOURCES = ['work', 'business', 'school', 'freelance', 'community', 'family', 'previous-va', 'other'];
  var MAX_EXPERIENCES = 30, MAX_TASKS = 40, LABEL_MAX = 140, SHORT_NOTE_MAX = 300;
  var ID_RE = /^[a-z0-9][a-z0-9-]{0,63}$/;
  var NOTE_MAX = 1000;

  /* Module 4.3 (spec v1.5). DIRECTION_IDS must equal PVA_M41.DIRECTIONS in order
     (checked by a parity test); it is the locked, neutral display order. */
  var DIRECTION_IDS = ['dir-general-admin', 'dir-customer-support', 'dir-ecommerce', 'dir-amazon', 'dir-bookkeeping',
    'dir-social-content', 'dir-executive-assistant', 'dir-real-estate', 'dir-lead-generation', 'dir-technical', 'dir-ndis'];
  var JUDGMENTS = ['explore_further', 'unsure', 'not_now'];   // never written to workClues
  var LIMITS_43 = { reason: 300, whatMayBeNew: 1000, question: 140, questions: 10, undecidedNote: 300, selected: 2 };

  var storageOK = true;
  var state = fresh();
  var listeners = [];

  /* Guard state. blocked = { reason: 'newer'|'unreadable', raw: <exact stored text> }
     while saving is paused. lastSeenRaw = the stored text this tab last read or wrote,
     so a change made elsewhere is noticed before this tab saves over it. */
  var blocked = null;
  var lastSeenRaw = null;
  var GUARD = {
    heading: 'Saved progress needs attention.',
    newer: 'This browser has Stage 4 progress saved by a newer version of this course. To keep it safe, this page will not save over it, so changes you make here won’t be saved. Use Download saved data to keep a copy, then open the course again later.',
    unreadable: 'Your saved Stage 4 progress could not be read. To keep it safe, this page will not save over it, so changes you make here won’t be saved. Use Download saved data to keep a copy before you restore or clear progress.',
    button: 'Download saved data',
    saveState: 'Not saved — see the message at the top of this page.',
    replaceWarning: 'This browser also has Stage 4 progress that this version of the course can’t read. Restoring will permanently replace it. If you haven’t used “Download saved data” yet, press Cancel and download it first.',
    clear: 'This browser has Stage 4 progress that this version of the course can’t read. Clearing will permanently delete it. If you haven’t used “Download saved data” yet, press Cancel and download it first.\n\nDelete it and start fresh? Other PVA courses are not affected.'
  };

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
      if (isObj(raw.modules['4-1'])) out.modules['4-1'] = normalize41(raw.modules['4-1']);
      if (isObj(raw.modules['4-2'])) out.modules['4-2'] = normalize42(raw.modules['4-2']);
      /* after 4.2, so references to deleted or invalid 4.2 tasks are dropped */
      if (isObj(raw.modules['4-3'])) out.modules['4-3'] = normalize43(raw.modules['4-3'], out.modules['4-2']);
    }
    if (isObj(raw._meta)) out._meta.updatedAt = strOrNull(raw._meta.updatedAt);
    return out;
  }

  /* ---- per-module validation: each module validates only its own fields ---- */
  function normalize41(e) {
    return {
      lastSection: isId(e.lastSection) ? e.lastSection : null,
      directionsReviewed: e.directionsReviewed === true,
      completedAt: strOrNull(e.completedAt)
    };
  }
  function cleanText(v, max) { return typeof v === 'string' ? v.replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max) : ''; }
  /* A 4.2 task is kept only if every field is valid. Invalid evidence or an
     unknown pattern ID drops the task (never converted, never guessed). */
  function normalizeTask(t) {
    if (!isObj(t) || !isId(t.id)) return null;
    var label = cleanText(t.label, LABEL_MAX);
    if (!label) return null;
    if (t.promptId !== undefined && t.promptId !== null && !isId(t.promptId)) return null;
    if (t.evidence !== undefined && t.evidence !== null && EVIDENCE.indexOf(t.evidence) < 0) return null;
    var tags = [];
    if (t.patternTags !== undefined) {
      if (!Array.isArray(t.patternTags)) return null;
      for (var i = 0; i < t.patternTags.length; i++) {
        if (PATTERN_IDS.indexOf(t.patternTags[i]) < 0) return null;
        if (tags.indexOf(t.patternTags[i]) < 0) tags.push(t.patternTags[i]);
      }
    }
    return {
      id: t.id, label: label, promptId: isId(t.promptId) ? t.promptId : null,
      patternTags: tags, evidence: EVIDENCE.indexOf(t.evidence) >= 0 ? t.evidence : null,
      note: cleanText(t.note, SHORT_NOTE_MAX)
    };
  }
  function normalize42(e) {
    var out = {
      lastSection: isId(e.lastSection) ? e.lastSection : null,
      snapshotReached: e.snapshotReached === true,
      completedAt: strOrNull(e.completedAt),
      experiences: []
    };
    if (Array.isArray(e.experiences)) {
      var seenExp = {}, seenTask = {};
      e.experiences.forEach(function (x) {
        if (out.experiences.length >= MAX_EXPERIENCES) return;
        if (!isObj(x) || !isId(x.id) || seenExp[x.id] || EXP_SOURCES.indexOf(x.source) < 0) return;
        seenExp[x.id] = 1;
        var tasks = [];
        if (Array.isArray(x.tasks)) x.tasks.forEach(function (t) {
          if (tasks.length >= MAX_TASKS) return;
          var n = normalizeTask(t);
          if (n && !seenTask[n.id]) { seenTask[n.id] = 1; tasks.push(n); }
        });
        out.experiences.push({ id: x.id, source: x.source, note: cleanText(x.note, SHORT_NOTE_MAX), tasks: tasks });
      });
    }
    return out;
  }

  /* ---- 4.3 validation (spec v1.5 §4). Learner text is cleaned with cleanText()
     like every Stage 4 text field and is never otherwise discarded. ---- */
  function taskIdSet(m42) {
    var set = {};
    if (m42 && Array.isArray(m42.experiences)) m42.experiences.forEach(function (x) { x.tasks.forEach(function (t) { set[t.id] = 1; }); });
    return set;
  }
  /* D16 four-case table: real text wins (flag off); blank text never counts, so an
     explicit skip stands; otherwise neither answer is active. */
  function normalizeReason(rawReason, rawSkipped) {
    var r = cleanText(rawReason, LIMITS_43.reason);
    if (r) return { reason: r, reasonSkipped: false };
    return { reason: '', reasonSkipped: rawSkipped === true };
  }
  function normalizeQuestions(list) {
    var out = [];
    if (Array.isArray(list)) list.forEach(function (q) { var c = cleanText(q, LIMITS_43.question); if (c && out.length < LIMITS_43.questions) out.push(c); });
    return out;
  }
  function normalizeExploration(x, tasks) {
    if (!isObj(x) || DIRECTION_IDS.indexOf(x.directionId) < 0) return null;
    var rs = normalizeReason(x.reason, x.reasonSkipped);
    return {
      directionId: x.directionId,
      judgment: JUDGMENTS.indexOf(x.judgment) >= 0 ? x.judgment : null,   // invalid value dropped, text kept
      reason: rs.reason,
      reasonSkipped: rs.reasonSkipped,
      relatedEvidenceIds: idList(x.relatedEvidenceIds, MAX_EXPERIENCES * MAX_TASKS).filter(function (id) { return tasks[id] === 1; }),
      whatMayBeNew: cleanText(x.whatMayBeNew, LIMITS_43.whatMayBeNew),
      learningQuestions: normalizeQuestions(x.learningQuestions),
      savedAt: strOrNull(x.savedAt)
    };
  }
  function isSavedExploration(x) { return !!(x && x.judgment && x.savedAt); }
  function normalize43(e, m42) {
    var tasks = taskIdSet(m42);
    var out = defaultModule('4-3');
    out.lastSection = isId(e.lastSection) ? e.lastSection : null;
    out.completedAt = strOrNull(e.completedAt);
    out.reviewedWorkClues = e.reviewedWorkClues === true;
    out.reviewedEvidence = e.reviewedEvidence === true;
    out.examinedDirectionIds = idList(e.examinedDirectionIds, DIRECTION_IDS.length).filter(function (id) { return DIRECTION_IDS.indexOf(id) >= 0; });
    if (Array.isArray(e.directionExplorations)) {
      var seen = {};
      e.directionExplorations.forEach(function (x) {
        var n = normalizeExploration(x, tasks);
        if (n && !seen[n.directionId]) { seen[n.directionId] = 1; out.directionExplorations.push(n); }
      });
    }
    function saved(id) { for (var i = 0; i < out.directionExplorations.length; i++) if (out.directionExplorations[i].directionId === id) return isSavedExploration(out.directionExplorations[i]); return false; }
    out.decisionReached = e.decisionReached === true;
    out.selectedDirectionIds = idList(e.selectedDirectionIds, DIRECTION_IDS.length).filter(saved).slice(0, LIMITS_43.selected);
    out.undecided = e.undecided === true && out.selectedDirectionIds.length === 0;   // never both; the selection stands
    out.undecidedNote = cleanText(e.undecidedNote, LIMITS_43.undecidedNote);        // kept even if not undecided
    return out;
  }

  /* Schema migration. v1 (4.1 only) → v2 (adds modules["4-2"]) → v3 (adds
     modules["4-3"]): earlier fields never change meaning, so each step only bumps
     the version. Unknown or newer versions are rejected. */
  function migrate(raw) {
    if (!isObj(raw)) return null;
    var v = raw.schemaVersion;
    if (typeof v !== 'number' || v < 1 || v > SCHEMA_VERSION || Math.floor(v) !== v) return null;
    var m = {};
    Object.keys(raw).forEach(function (k) { m[k] = raw[k]; });
    if (v < 3) {
      /* v1 → v2 → v3: nothing in v1/v2 changes meaning. A "4-3" key in older data was
         never written by any release, so it is not trusted as 4.3 data. */
      if (isObj(m.modules) && m.modules['4-3'] !== undefined) {
        var mods = {};
        Object.keys(m.modules).forEach(function (k) { if (k !== '4-3') mods[k] = m.modules[k]; });
        m.modules = mods;
      }
      m.schemaVersion = 3;
    }
    return m;
  }

  function showBanner(msg) {
    var b = document.getElementById('storageBanner');
    if (!b) return;
    var t = document.getElementById('storageBannerText');
    if (t && msg) t.textContent = msg;
    b.classList.remove('hidden');
  }

  /* ---------- data-protection guard ---------- */
  /* Decides whether stored text is usable. Never throws. */
  function classify(raw) {
    var parsed;
    try { parsed = JSON.parse(raw); } catch (e) { return { reason: 'unreadable' }; }
    var m = migrate(parsed);
    if (m) return { data: m };
    var v = isObj(parsed) ? parsed.schemaVersion : null;
    if (typeof v === 'number' && Math.floor(v) === v && v > SCHEMA_VERSION) return { reason: 'newer' };
    return { reason: 'unreadable' };
  }
  function setSaveState(text) {
    document.querySelectorAll('[data-save-state]').forEach(function (el) { el.textContent = text; });
  }
  var bannerOriginal = null;
  function showGuard() {
    setSaveState(GUARD.saveState);
    var b = document.getElementById('storageBanner');
    if (!b) return;
    var head = b.querySelector('strong');
    var text = document.getElementById('storageBannerText');
    if (!bannerOriginal) bannerOriginal = { head: head ? head.textContent : null, text: text ? text.textContent : null };
    if (head) head.textContent = GUARD.heading;
    if (text) text.textContent = blocked.reason === 'newer' ? GUARD.newer : GUARD.unreadable;
    if (!b.querySelector('[data-download-saved]')) {
      var row = document.createElement('div');
      row.className = 'progress-tools';
      row.setAttribute('data-guard-actions', '');
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn subtle';
      btn.setAttribute('data-download-saved', '');
      btn.textContent = GUARD.button;
      btn.addEventListener('click', downloadSavedData);
      row.appendChild(btn);
      b.appendChild(row);
    }
    b.classList.remove('hidden');
  }
  function hideGuard() {
    var b = document.getElementById('storageBanner');
    if (!b) return;
    var row = b.querySelector('[data-guard-actions]');
    if (row) row.parentNode.removeChild(row);
    if (bannerOriginal) {
      var head = b.querySelector('strong'), text = document.getElementById('storageBannerText');
      if (head && bannerOriginal.head !== null) head.textContent = bannerOriginal.head;
      if (text && bannerOriginal.text !== null) text.textContent = bannerOriginal.text;
    }
    if (storageOK) b.classList.add('hidden');
  }
  function block(reason, raw) {
    blocked = { reason: reason, raw: raw };
    showGuard();
  }
  /* Before writing: if what is stored now is not what this tab last read or wrote,
     and this version cannot read it, stop instead of overwriting it. */
  function storedChangedToUnreadable() {
    var current;
    try { current = localStorage.getItem(STORAGE_KEY); } catch (e) { return false; }
    if (current === null || current === lastSeenRaw) return false;   // '' is unreadable data, not "nothing saved"
    var c = classify(current);
    if (c.data) return false;          // readable data from another tab: existing last-save-wins behaviour
    block(c.reason, current);
    return true;
  }
  /* Saves the protected text exactly as stored. JSON objects are wrapped in the
     normal backup format so a version that understands them can restore them. */
  function downloadSavedData() {
    if (!blocked) return;
    var parsed = null;
    try { parsed = JSON.parse(blocked.raw); } catch (e) {}
    var now = new Date().toISOString();
    var payload = isObj(parsed) ? {
      format: BACKUP_FORMAT, version: BACKUP_VERSION, course: COURSE_NAME, storageKey: STORAGE_KEY, exportedAt: now,
      note: 'Stage 4 progress that this version of the course could not use, kept exactly as it was saved. A version of the course that understands it can restore this file.',
      summary: { savedSchemaVersion: parsed.schemaVersion === undefined ? null : parsed.schemaVersion, readableByThisVersion: false },
      data: parsed
    } : {
      format: BACKUP_FORMAT + '-unreadable', course: COURSE_NAME, storageKey: STORAGE_KEY, exportedAt: now,
      note: 'Stage 4 progress text that could not be read, kept exactly as it was saved.',
      rawText: blocked.raw
    };
    downloadJson(payload, 'Find-Your-Direction-saved-data-' + now.slice(0, 10) + '.json');
  }

  function load() {
    try {
      var probe = '__pva_s4_probe__';
      localStorage.setItem(probe, '1');
      localStorage.removeItem(probe);
      var raw = localStorage.getItem(STORAGE_KEY);
      lastSeenRaw = raw;
      if (raw !== null) {              // the key exists: even '' is kept, never started fresh over
        var c = classify(raw);
        if (c.data) state = normalize(c.data);
        else block(c.reason, raw);   // keep it; never start fresh over it
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
    if (storageOK && (blocked || storedChangedToUnreadable())) {
      setSaveState(GUARD.saveState);      // guard: keep working in memory, never write
    } else if (storageOK) {
      try {
        var text = JSON.stringify(state);
        localStorage.setItem(STORAGE_KEY, text);   // the only write
        lastSeenRaw = text;                         // set only after the write succeeded
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
  function defaultModule(id) {
    if (id === '4-2') return { lastSection: null, snapshotReached: false, completedAt: null, experiences: [] };
    if (id === '4-3') return { lastSection: null, completedAt: null, reviewedWorkClues: false, reviewedEvidence: false,
      examinedDirectionIds: [], directionExplorations: [], decisionReached: false, undecided: false, undecidedNote: '', selectedDirectionIds: [] };
    return { lastSection: null, directionsReviewed: false, completedAt: null };
  }
  function mod(id) {
    if (!state.modules[id]) state.modules[id] = defaultModule(id);
    return state.modules[id];
  }
  function setLastSection(moduleId, sectionId) { mod(moduleId).lastSection = sectionId; persist(); }
  function setDirectionsReviewed(moduleId) { if (!mod(moduleId).directionsReviewed) { mod(moduleId).directionsReviewed = true; persist(); } }
  function markModuleComplete(moduleId) { var m = mod(moduleId); if (!m.completedAt) { m.completedAt = new Date().toISOString(); persist(); } }

  /* ---------- 4.2 experiences and tasks (one store: modules["4-2"].experiences) ---------- */
  function newId(prefix) { return prefix + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function experiences() { return mod('4-2').experiences; }
  function findExp(id) { var xs = experiences(); for (var i = 0; i < xs.length; i++) if (xs[i].id === id) return xs[i]; return null; }
  function findTask(exp, tid) { for (var i = 0; i < exp.tasks.length; i++) if (exp.tasks[i].id === tid) return exp.tasks[i]; return null; }
  function addExperience(source) {
    if (EXP_SOURCES.indexOf(source) < 0 || experiences().length >= MAX_EXPERIENCES) return null;
    var x = { id: newId('exp'), source: source, note: '', tasks: [] };
    experiences().push(x); persist(); return x;
  }
  function updateExperience(id, fields) {
    var x = findExp(id); if (!x) return;
    if (fields.source !== undefined && EXP_SOURCES.indexOf(fields.source) >= 0) x.source = fields.source;
    if (fields.note !== undefined) x.note = cleanText(fields.note, SHORT_NOTE_MAX);
    persist();
  }
  /* Cascade: deleting an experience removes its tasks, evidence and tags with it. */
  function deleteExperience(id) {
    var m = mod('4-2');
    m.experiences = m.experiences.filter(function (x) { return x.id !== id; });
    persist();
  }
  /* A task exists only when the learner deliberately adds it (prompt or own words). */
  function addTask(expId, label, promptId) {
    var x = findExp(expId); if (!x || x.tasks.length >= MAX_TASKS) return null;
    var clean = cleanText(label, LABEL_MAX); if (!clean) return null;
    if (promptId) {
      if (!isId(promptId)) return null;
      for (var i = 0; i < x.tasks.length; i++) if (x.tasks[i].promptId === promptId) return x.tasks[i];
    }
    var t = { id: newId('task'), label: clean, promptId: promptId || null, patternTags: [], evidence: null, note: '' };
    x.tasks.push(t); persist(); return t;
  }
  function updateTask(expId, taskId, fields) {
    var x = findExp(expId); if (!x) return; var t = findTask(x, taskId); if (!t) return;
    if (fields.label !== undefined && !t.promptId) { var l = cleanText(fields.label, LABEL_MAX); if (l) t.label = l; }
    if (fields.evidence !== undefined && (fields.evidence === null || EVIDENCE.indexOf(fields.evidence) >= 0)) t.evidence = fields.evidence;
    if (fields.patternTags !== undefined && Array.isArray(fields.patternTags)) {
      t.patternTags = PATTERN_IDS.filter(function (p) { return fields.patternTags.indexOf(p) >= 0; });
    }
    if (fields.note !== undefined) t.note = cleanText(fields.note, SHORT_NOTE_MAX);
    persist();
  }
  function deleteTask(expId, taskId) {
    var x = findExp(expId); if (!x) return;
    x.tasks = x.tasks.filter(function (t) { return t.id !== taskId; });
    persist();
  }
  function setSnapshotReached() { var m = mod('4-2'); if (!m.snapshotReached) { m.snapshotReached = true; persist(); } }

  /* ---------- 4.3 (spec v1.5). Only learner choices and learner text are stored;
     4.1 Work Clues and 4.2 tasks are read, never copied or changed. ---------- */
  function m43() { return mod('4-3'); }
  function currentTaskIds() { return taskIdSet(state.modules['4-2']); }   // read-only: never creates 4.2 state
  function findExploration(dirId) {
    var xs = state.modules['4-3'] ? state.modules['4-3'].directionExplorations : [];
    for (var i = 0; i < xs.length; i++) if (xs[i].directionId === dirId) return xs[i];
    return null;
  }
  function ensureExploration(dirId) {
    if (DIRECTION_IDS.indexOf(dirId) < 0) return null;
    var x = findExploration(dirId);
    if (!x) {
      x = { directionId: dirId, judgment: null, reason: '', reasonSkipped: false, relatedEvidenceIds: [], whatMayBeNew: '', learningQuestions: [], savedAt: null };
      m43().directionExplorations.push(x);
    }
    return x;
  }
  function flag43(name) { var m = m43(); if (!m[name]) { m[name] = true; persist(); } }
  function examineDirection(dirId) {
    if (DIRECTION_IDS.indexOf(dirId) < 0) return false;
    var m = m43();
    if (m.examinedDirectionIds.indexOf(dirId) < 0) { m.examinedDirectionIds.push(dirId); persist(); }
    return true;
  }
  function setJudgment(dirId, judgment) {
    if (judgment !== null && JUDGMENTS.indexOf(judgment) < 0) return false;
    var x = ensureExploration(dirId); if (!x) return false;
    x.judgment = judgment; persist(); return true;            // learning questions are never touched here
  }
  /* D16 rule 1 / 5: real text is saved and switches the skip flag off; blank text is not a reason. */
  function setReason(dirId, text) {
    var x = ensureExploration(dirId); if (!x) return false;
    var c = cleanText(text, LIMITS_43.reason);
    if (c) { x.reason = c; x.reasonSkipped = false; } else { x.reason = ''; }
    persist(); return true;
  }
  /* D16 rules 2–3: choosing "I don't have a reason to add yet". A written reason is only
     removed when the caller passes { confirmed: true } after asking the learner. */
  function skipReason(dirId, opts) {
    var x = ensureExploration(dirId); if (!x) return 'invalid';
    if (x.reason && !(opts && opts.confirmed === true)) return 'needs-confirm';
    x.reason = ''; x.reasonSkipped = true; persist(); return 'skipped';
  }
  function unskipReason(dirId) { var x = findExploration(dirId); if (x && x.reasonSkipped) { x.reasonSkipped = false; persist(); } }
  function setEvidence(dirId, taskId, on) {
    if (on && !currentTaskIds()[taskId]) return false;
    var x = ensureExploration(dirId); if (!x) return false;
    var i = x.relatedEvidenceIds.indexOf(taskId);
    if (on && i < 0) x.relatedEvidenceIds.push(taskId);
    if (!on && i >= 0) x.relatedEvidenceIds.splice(i, 1);
    persist(); return true;
  }
  function setWhatMayBeNew(dirId, text) { var x = ensureExploration(dirId); if (!x) return false; x.whatMayBeNew = cleanText(text, LIMITS_43.whatMayBeNew); persist(); return true; }
  function addQuestion(dirId, text) {
    var x = ensureExploration(dirId); if (!x) return false;
    var c = cleanText(text, LIMITS_43.question);
    if (!c || x.learningQuestions.length >= LIMITS_43.questions) return false;
    x.learningQuestions.push(c); persist(); return true;
  }
  /* Editing never deletes: blank text is refused. Only removeQuestion deletes. */
  function updateQuestion(dirId, index, text) {
    var x = findExploration(dirId); if (!x || index < 0 || index >= x.learningQuestions.length) return false;
    var c = cleanText(text, LIMITS_43.question); if (!c) return false;
    x.learningQuestions[index] = c; persist(); return true;
  }
  function removeQuestion(dirId, index) {
    var x = findExploration(dirId); if (!x || index < 0 || index >= x.learningQuestions.length) return false;
    x.learningQuestions.splice(index, 1); persist(); return true;
  }
  function saveReflection(dirId) {
    var x = findExploration(dirId); if (!x || !x.judgment) return false;
    x.savedAt = new Date().toISOString(); persist(); return true;
  }
  function setSelected(dirId, on) {
    var m = m43(), i = m.selectedDirectionIds.indexOf(dirId);
    if (on) {
      if (i >= 0) return true;
      if (!isSavedExploration(findExploration(dirId)) || m.selectedDirectionIds.length >= LIMITS_43.selected) return false;
      m.selectedDirectionIds.push(dirId); m.undecided = false;
    } else if (i >= 0) m.selectedDirectionIds.splice(i, 1);
    persist(); return true;
  }
  function setUndecided(on) { var m = m43(); m.undecided = !!on; if (on) m.selectedDirectionIds = []; persist(); }
  function setUndecidedNote(text) { m43().undecidedNote = cleanText(text, LIMITS_43.undecidedNote); persist(); }
  /* Current 4.2 tasks the learner chose for this direction, in 4.2's own order.
     Deleted tasks simply no longer appear (read-time filter; 4.2 deletion is unchanged). */
  function relatedTasks(dirId) {
    var x = findExploration(dirId), out = [], m42 = state.modules['4-2'];
    if (!x || !m42) return out;
    m42.experiences.forEach(function (e) { e.tasks.forEach(function (t) { if (x.relatedEvidenceIds.indexOf(t.id) >= 0) out.push({ experience: e, task: t }); }); });
    return out;
  }

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
  function downloadJson(payload, filename) {
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1500);
  }

  /* One combined, informational backup summary (spec v1.5 §4, decision 5). Restore never
     reads it. 4.3 contributes only a completion flag: no counts of directions,
     judgments or tasks, so the summary can never become a tally or profile. */
  function summaryOf(st) {
    var m = st.modules || {};
    return {
      workClues: st.workClues.length,
      module41Complete: !!(m['4-1'] && m['4-1'].completedAt),
      module42Complete: !!(m['4-2'] && m['4-2'].completedAt),
      module43Complete: !!(m['4-3'] && m['4-3'].completedAt),
      experiences: m['4-2'] ? m['4-2'].experiences.length : 0,
      schemaVersion: st.schemaVersion
    };
  }

  function exportProgress(summaryFn) {
    /* Guard: while saving is paused, the learner's real progress is the protected
       stored data, not this page's in-memory state, so that is what they get. */
    if (blocked) { downloadSavedData(); return; }
    var payload = {
      format: BACKUP_FORMAT, version: BACKUP_VERSION, course: COURSE_NAME, storageKey: STORAGE_KEY,
      exportedAt: new Date().toISOString(),
      note: 'Progress backup for PVA Academy Stage 4: Find Your Direction only. Restore it on the Stage 4 home page, Progress page, or inside a module to bring your Work Clues back in this or another browser.',
      summary: summaryFn ? summaryFn(state) : summaryOf(state),
      data: state
    };
    downloadJson(payload, 'Find-Your-Direction-progress-backup-' + new Date().toISOString().slice(0, 10) + '.json');
  }

  /* Pure check used by Restore (and by QA). Returns {ok, error} or {ok, data}. */
  function validateBackup(payload) {
    if (!isObj(payload) || typeof payload.format !== 'string') return { ok: false, error: 'This file is not a Stage 4: Find Your Direction progress backup.' };
    if (payload.format !== BACKUP_FORMAT) return { ok: false, error: 'Backups from other PVA courses cannot be restored here.' };
    if (typeof payload.version !== 'number' || payload.version < 1 || payload.version > BACKUP_VERSION) return { ok: false, error: 'This backup was made by a newer version of the course and cannot be restored here.' };
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
      if (!blocked && storageOK) storedChangedToUnreadable();
      var when = payload.exportedAt ? new Date(payload.exportedAt).toLocaleString() : 'unknown date';
      var msg = 'Restore this backup?\n\nExported: ' + when +
        '\nWork Clues: ' + r.workClues.length +
        '\nModule 4.1: ' + (r.modules['4-1'] && r.modules['4-1'].completedAt ? 'complete' : 'in progress or not started') +
        '\nModule 4.2: ' + (r.modules['4-2'] && r.modules['4-2'].completedAt ? 'complete' : 'in progress or not started') +
        ' (' + (r.modules['4-2'] ? r.modules['4-2'].experiences.length : 0) + ' experiences)' +
        '\nModule 4.3: ' + (r.modules['4-3'] && r.modules['4-3'].completedAt ? 'complete' : 'in progress or not started') +
        '\n\nRestoring REPLACES the Stage 4 progress currently saved in this browser.' +
        (blocked ? '\n\n' + GUARD.replaceWarning : '') +
        '\n\nPress OK to replace and restore, or Cancel.';
      if (!confirm(msg)) return;
      if (blocked) {
        /* The learner was warned and chose to replace the protected data. */
        blocked = null;
        try { lastSeenRaw = localStorage.getItem(STORAGE_KEY); } catch (e) {}
        hideGuard();
      }
      state = r;
      persist();
      if (done) done();
    };
    reader.readAsText(file);
  }

  function clearProgress(done) {
    if (!blocked && storageOK) storedChangedToUnreadable();
    if (!confirm(blocked ? GUARD.clear : 'Clear all saved Stage 4: Find Your Direction progress in this browser, including your Work Clues? This cannot be undone. Other PVA courses are not affected.')) return;
    state = fresh();
    if (blocked) { blocked = null; hideGuard(); }
    lastSeenRaw = null;
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
    PATTERN_IDS: PATTERN_IDS, EVIDENCE: EVIDENCE, EXP_SOURCES: EXP_SOURCES,
    storageOK: function () { return storageOK; },
    saveBlocked: function () { return blocked ? blocked.reason : null; },   // 'newer' | 'unreadable' | null
    downloadSavedData: downloadSavedData,
    SUMMARY: summaryOf,
    onChange: function (fn) { listeners.push(fn); },
    module: function (id) { return state.modules[id] || defaultModule(id); },
    setLastSection: setLastSection, setDirectionsReviewed: setDirectionsReviewed, markModuleComplete: markModuleComplete,
    experiences: function () { return experiences(); }, findExperience: findExp,
    addExperience: addExperience, updateExperience: updateExperience, deleteExperience: deleteExperience,
    addTask: addTask, updateTask: updateTask, deleteTask: deleteTask, setSnapshotReached: setSnapshotReached,
    getScenario: getScenario, saveScenario: saveScenario, getPost: getPost, savePost: savePost,
    markExplored: markExplored, explored: function () { return state.exploredDirections.slice(); },
    getClue: getClue, setReaction: setReaction, setNote: setNote, removeClue: removeClue, clues: clues,
    directionsWithReaction: directionsWithReaction,
    exportProgress: exportProgress, validateBackup: validateBackup, restoreFromFile: restoreFromFile, clearProgress: clearProgress,
    wireTools: wireTools,
    DIRECTION_IDS: DIRECTION_IDS.slice(), JUDGMENTS: JUDGMENTS.slice(), LIMITS_43: LIMITS_43,
    m43: {
      exploration: findExploration, isSaved: isSavedExploration, relatedTasks: relatedTasks,
      setReviewedWorkClues: function () { flag43('reviewedWorkClues'); },
      setReviewedEvidence: function () { flag43('reviewedEvidence'); },
      setDecisionReached: function () { flag43('decisionReached'); },
      examine: examineDirection, setJudgment: setJudgment,
      setReason: setReason, skipReason: skipReason, unskipReason: unskipReason,
      setEvidence: setEvidence, setWhatMayBeNew: setWhatMayBeNew,
      addQuestion: addQuestion, updateQuestion: updateQuestion, removeQuestion: removeQuestion,
      saveReflection: saveReflection, setSelected: setSelected, setUndecided: setUndecided, setUndecidedNote: setUndecidedNote
    },
    _state: function () { return state; }
  };
})();
