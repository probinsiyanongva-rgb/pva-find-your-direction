/* Stage 4 regression fixtures.
   Shapes follow public/shared/state.js at commit 33c4e04 (schema v2, backup wrapper v2).
   IDs are real IDs from m41-data.js / m42-data.js so the page tests can render them.
   Never edit a fixture to make a test pass: fixtures describe learner data that already
   exists in browsers, and the golden snapshots in ./golden were produced from them by the
   unchanged code (see tools/make-golden.mjs). */

export const STORAGE_KEY = 'pva-stage4-progress';

/* The schema and backup-wrapper versions the code under test is expected to use.
   Changing these is a deliberate, reviewed step (e.g. the 4.3 release moves both to 3).
   Golden files are never regenerated: tests compare against the golden output with only
   schemaVersion replaced by EXPECTED.schema (see goldenNow in helpers/golden.mjs). */
export const EXPECTED = { schema: 3, backup: 3 };
export const BACKUP_FORMAT = 'pva-stage4-progress-backup';

const POSTS = ['post-a', 'post-b', 'post-c', 'post-d'];
const SCENARIOS = ['scn-organizing-information', 'scn-customer-communication', 'scn-research-analysis', 'scn-creating-content', 'scn-keeping-process-running'];

const m41Complete = () => ({
  workClues: [
    { id: 'scenario:scn-customer-communication', sourceType: 'scenario', sourceId: 'scn-customer-communication', reaction: 'explore', note: 'I liked helping people.', updatedAt: '2026-10-01T02:00:00.000Z' },
    { id: 'direction:dir-ecommerce', sourceType: 'direction', sourceId: 'dir-ecommerce', reaction: 'explore', note: '', updatedAt: '2026-10-01T02:05:00.000Z' },
    { id: 'direction:dir-bookkeeping', sourceType: 'direction', sourceId: 'dir-bookkeeping', reaction: 'unsure', note: 'Need to know more.', updatedAt: '2026-10-01T02:06:00.000Z' },
    { id: 'direction:dir-social-content', sourceType: 'direction', sourceId: 'dir-social-content', reaction: 'not_for_me', note: '', updatedAt: '2026-10-01T02:07:00.000Z' }
  ],
  scenarioObservations: SCENARIOS.map((id, i) => ({ scenarioId: id, selectedPatterns: [['organize'], ['communicate'], ['research'], ['create'], ['operate', 'organize']][i], completed: true })),
  jobPostObservations: POSTS.map((id) => ({ postId: id, selected: ['obs-organizing', 'obs-communicating'], completed: true })),
  exploredDirections: ['dir-ecommerce', 'dir-amazon']
});

/* v1: 4.1 only (schema 1). */
export const profileV1 = {
  schemaVersion: 1,
  ...m41Complete(),
  modules: { '4-1': { lastSection: 'wrap-up', directionsReviewed: true, completedAt: '2026-10-01T02:10:00.000Z' } },
  _meta: { updatedAt: '2026-10-01T02:10:00.000Z' }
};

/* v2: 4.1 complete + 4.2 complete. 2 experiences, 5 tasks, prompted and own-words,
   every evidence answer used, tags chosen by the learner. */
export const profileV2Full = {
  schemaVersion: 2,
  ...m41Complete(),
  modules: {
    '4-1': { lastSection: 'wrap-up', directionsReviewed: true, completedAt: '2026-10-01T02:10:00.000Z' },
    '4-2': {
      lastSection: 'handoff', snapshotReached: true, completedAt: '2026-10-03T03:00:00.000Z',
      experiences: [
        { id: 'exp-aaa001', source: 'work', note: 'Customer service job', tasks: [
          { id: 'task-aaa001', label: 'Answered customer questions', promptId: 'p-answered-questions', patternTags: ['communicate'], evidence: 'regularly', note: 'Daily for two years' },
          { id: 'task-aaa002', label: 'Updated records in a system', promptId: 'p-updated-records-system', patternTags: ['organize', 'operate'], evidence: 'done_before', note: '' },
          { id: 'task-aaa003', label: 'Made a weekly summary sheet', promptId: null, patternTags: [], evidence: 'some_exposure', note: '' }
        ] },
        { id: 'exp-bbb001', source: 'family', note: '', tasks: [
          { id: 'task-bbb001', label: 'Tracked household money', promptId: 'p-tracked-household-money', patternTags: ['organize'], evidence: 'regularly', note: '' },
          { id: 'task-bbb002', label: 'Posted products for our sari-sari store page', promptId: null, patternTags: ['create', 'communicate'], evidence: 'not_done_yet', note: '' }
        ] }
      ]
    }
  },
  _meta: { updatedAt: '2026-10-03T03:00:00.000Z' }
};

/* v2 with records that normalize() must drop (existing convention), plus a
   modules["4-3"] block that today's code does not know. */
export const profileV2Tampered = {
  schemaVersion: 2,
  workClues: [
    { sourceType: 'direction', sourceId: 'dir-amazon', reaction: 'explore', note: 'ok' },
    { sourceType: 'direction', sourceId: 'dir-amazon', reaction: 'unsure', note: 'duplicate, dropped' },
    { sourceType: 'direction', sourceId: 'dir-ndis', reaction: 'love_it', note: 'bad reaction, dropped' },
    { sourceType: 'job', sourceId: 'post-a', reaction: 'explore', note: 'bad source type, dropped' }
  ],
  scenarioObservations: [{ scenarioId: 'scn-creating-content', selectedPatterns: ['create', 'BAD ID'], completed: true }],
  jobPostObservations: [],
  exploredDirections: ['dir-amazon', 'dir-amazon', 'Not An Id'],
  score: 97,
  modules: {
    '4-1': { lastSection: 'directions', directionsReviewed: 'yes', completedAt: null, extra: 1 },
    '4-2': {
      lastSection: 'evidence', snapshotReached: false, completedAt: null,
      experiences: [
        { id: 'exp-ccc001', source: 'work', note: 'ok', tasks: [
          { id: 'task-ccc001', label: 'Kept', promptId: null, patternTags: ['organize'], evidence: 'done_before', note: '' },
          { id: 'task-ccc002', label: 'Bad evidence', promptId: null, patternTags: [], evidence: 3, note: '' },
          { id: 'task-ccc003', label: 'Bad tag', promptId: null, patternTags: ['leadership'], evidence: null, note: '' },
          { id: 'task-ccc004', label: '', promptId: null, patternTags: [], evidence: null, note: 'empty label' }
        ] },
        { id: 'exp-ccc002', source: 'school', note: '', tasks: [
          { id: 'task-ccc001', label: 'Duplicate task id across experiences', promptId: null, patternTags: [], evidence: null, note: '' }
        ] },
        { id: 'exp-ccc003', source: 'astrology', note: 'bad source, dropped', tasks: [] }
      ]
    },
    '4-3': { explorations: [{ directionId: 'dir-amazon', relatedTaskIds: ['task-ccc001'] }] }
  },
  _meta: { updatedAt: '2026-10-05T00:00:00.000Z' }
};

/* v3: 4.1 + 4.2 complete and 4.3 in a realistic state (spec v1.5). Two saved explorations,
   one draft, one direction selected; learner text includes questions and a skipped reason. */
export const m43Full = () => ({
  lastSection: 'finish', completedAt: '2026-10-20T03:00:00.000Z',
  reviewedWorkClues: true, reviewedEvidence: true,
  examinedDirectionIds: ['dir-ecommerce', 'dir-customer-support', 'dir-bookkeeping'],
  directionExplorations: [
    { directionId: 'dir-ecommerce', judgment: 'explore_further', reason: 'I liked handling orders.', reasonSkipped: false,
      relatedEvidenceIds: ['task-aaa002', 'task-bbb002'], whatMayBeNew: 'Inventory tools.', learningQuestions: ['What store platforms are common?', 'How are returns handled?'], savedAt: '2026-10-20T02:00:00.000Z' },
    { directionId: 'dir-customer-support', judgment: 'not_now', reason: '', reasonSkipped: true,
      relatedEvidenceIds: [], whatMayBeNew: '', learningQuestions: ['Kept from before'], savedAt: '2026-10-20T02:10:00.000Z' },
    { directionId: 'dir-bookkeeping', judgment: null, reason: '', reasonSkipped: false,
      relatedEvidenceIds: ['task-bbb001'], whatMayBeNew: 'Draft note', learningQuestions: [], savedAt: null }
  ],
  decisionReached: true, undecided: false, undecidedNote: '', selectedDirectionIds: ['dir-ecommerce']
});
export const profileV3Full = {
  schemaVersion: 3,
  ...m41Complete(),
  modules: {
    '4-1': profileV2Full.modules['4-1'],
    '4-2': profileV2Full.modules['4-2'],
    '4-3': m43Full()
  },
  _meta: { updatedAt: '2026-10-20T03:00:00.000Z' }
};

/* Saved data from a version NEWER than any released code (shape is illustrative; only the
   version matters). Uses schema 4 so it stays "newer" after the 4.3 release (schema 3). */
export const profileNewer = {
  schemaVersion: 4,
  ...m41Complete(),
  modules: {
    '4-1': { lastSection: 'wrap-up', directionsReviewed: true, completedAt: '2026-10-01T02:10:00.000Z' },
    '4-2': profileV2Full.modules['4-2'],
    '4-3': { completedAt: null, explorations: [{ directionId: 'dir-ecommerce', judgment: 'explore', relatedTaskIds: ['task-aaa002'] }], selectedDirectionIds: ['dir-ecommerce'] }
  },
  _meta: { updatedAt: '2026-11-01T00:00:00.000Z' }
};

/* Raw strings as they could sit in localStorage. Byte-exact; used by the overwrite tests. */
export const RAW = {
  newer: JSON.stringify(profileNewer),
  malformed: '{"schemaVersion":2,"workClues":[{"sourceType":"direction"',
  versionString: JSON.stringify({ ...profileV2Full, schemaVersion: '2' }),
  versionZero: JSON.stringify({ ...profileV2Full, schemaVersion: 0 }),
  versionFraction: JSON.stringify({ ...profileV2Full, schemaVersion: 2.5 }),
  notAnObject: '"just a string"'
};

const wrap = (version, data, extra = {}) => ({
  format: BACKUP_FORMAT, version, course: 'PVA Academy — Stage 4: Find Your Direction', storageKey: STORAGE_KEY,
  exportedAt: '2026-10-10T00:00:00.000Z', note: 'fixture', summary: {}, data, ...extra
});

export const backups = {
  v1: wrap(1, profileV1),
  v2: wrap(2, profileV2Full),
  v3: wrap(3, profileV3Full),
  otherCourse: { ...wrap(2, profileV2Full), format: 'pva-email-management-progress-backup' },
  futureWrapper: wrap(4, profileV2Full),
  futureData: wrap(2, profileNewer),
  missingData: wrap(2, undefined),
  notJson: '{ this is not json'
};
