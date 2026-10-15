# PVA Academy — Stage 4: Find Your Direction · 4.1 v1.1 · 4.2 v1.1 · 4.3 v1.0 · 4.4 v1.0

Stage 4 of the PVA Beginner VA Journey. **One integrated Stage 4 course** that will hold
4.1–4.4. Only Module 4.1 (Understanding VA Work Directions) is built; 4.2–4.4 show as
"Coming later". Previous course: Understanding Client Work & Instructions
(`https://pva-client-work.probinsiyanongva.workers.dev/`).

No login. Progress is saved in the learner's browser only (`pva-stage4-progress`),
with Export / Restore / Clear. Expected URL: `https://pva-find-your-direction.probinsiyanongva.workers.dev/`

## Source of truth (locked)
- Learning content and copy: `docs/PVA_Module_4.1_Production_Specification_v1.1.md`
- Implementation requirements: `docs/PVA_Module_4.1_Build_Brief_v1.1.md`
- Learner-facing 4.1 copy is transcribed verbatim into `public/shared/m41-data.js` and `public/4-1/index.html`.
- The Stage 4 home page (`public/index.html`) is structural: its text reuses approved phrases (stage and module
  core questions, WORK → ME → MATCH → DIRECTION, standard storage warnings).

## Structure
```text
public/                    the only folder Cloudflare serves (see wrangler.jsonc)
  index.html               Stage 4 home: progress, modules 4.1–4.4, Export/Restore/Clear
  4-1/index.html           Module 4.1: one guided page, six sections, sidebar / mobile drawer
  progress/index.html      Progress & backup
  shared/course.css        unchanged copy of the Stage 2–3 course stylesheet
  shared/stage4.css        Stage 4 additions (shell, chips, reactions, Direction Cards)
  shared/state.js          window.PVAS4 — the shared Stage 4 state (all modules use it)
  shared/m41-data.js       4.1 content: patterns, job posts, scenarios, Direction Cards (stable IDs)
  shared/m41.js            4.1 interactions and completion
  shared/home.js           home / progress page status
```

## Stage 4 state (`pva-stage4-progress`)
```js
{
  schemaVersion: 1,
  workClues: [{ id, sourceType: "scenario"|"direction", sourceId, reaction: "explore"|"unsure"|"not_for_me", note, updatedAt }],
  scenarioObservations: [{ scenarioId, selectedPatterns: [], completed }],
  jobPostObservations: [{ postId, selected: [], completed }],          // approved addition (job-post activity)
  exploredDirections: [directionId],                                   // never used for completion or anything else
  modules: { "4-1": { lastSection, directionsReviewed, completedAt } }, // approved addition (module progress)
  _meta: { updatedAt }
}
```
- `workClues` is the only reaction store; one clue per source (`sourceType:sourceId`). Lists such as
  "directions I want to explore" are derived (`PVAS4.directionsWithReaction('explore')`), never stored.
- No `interestedDirections`, no `reflection`, no score, ranking or recommendation anywhere.
- **Adding 4.2–4.4:** add the module id to `MODULE_IDS` in `state.js`. If the data shape changes, bump
  `SCHEMA_VERSION` and add a step to `migrate()` so v1 exports still restore.
- Restore validates field by field (`normalize()`); unknown keys and invalid values are dropped, never applied.
  Clues for sources a module doesn't know are kept in state (forward compatibility) but not listed.

## Module 4.1 completion
Complete when **all four job posts** are done, **all five scenarios** are done, the learner pressed
**Continue** at the end of Explore VA Directions, and **at least one Work Clue** exists (any reaction).
Opening Direction Cards is never required. `completedAt` records the first time this was reached.

## Cloudflare deployment
Workers & Pages → Create → Import a repository → `pva-find-your-direction`.
```text
Build command: (blank)
Deploy command: npx wrangler deploy
```
Enable the `workers.dev` route under **Domains** if the dashboard shows "No URLs enabled".

## QA (v1.1)
Headless Chromium against the Build Brief §31 checklist: 78 functional/state checks, responsive checks at
390 / 820 / 1366 / 1600 px (no horizontal overflow), keyboard and drawer checks, and a verbatim content check of
all learner-facing lines of Production Specification v1.1. See `BUILD_REPORT.md`. See the build notes in the conversation record.


## Module 4.2 — Looking at Yourself as a VA (v1.1)
- Page: `public/4-2/index.html`; logic `public/shared/m42.js`; content `public/shared/m42-data.js`
  (task prompts, reference tags and explanations are **DRAFT pending owner approval**).
- Sources: `PVA_Module_4.2_Design_Brief_v0.3_LOCKED_FINAL.md` (design) and `PVA_Module_4.2_Build_Brief_v1.0.md` (implementation).
- State: schema v2. `modules["4-2"] = { lastSection, snapshotReached, completedAt, experiences: [{ id, source, note,
  tasks: [{ id, label, promptId|null, patternTags[], evidence|null, note }] }] }`. Evidence values are the named strings
  `regularly | done_before | some_exposure | not_done_yet`. Nothing derived is stored.
- Migration: v1 data and v1 backups load and restore unchanged (4.1 fields untouched). Backup wrapper version 2;
  versions 1–2 accepted, newer rejected. Invalid 4.2 records are dropped field by field; valid 4.1 data is kept.
- Completion (`completedAt`, kept once set): ≥1 experience, ≥1 task, every task has evidence, ≥1 learner-chosen
  pattern tag, snapshot reached.
- Work Clues appear in 4.2 only in the final section, read-only (no sidebar clue panel in 4.2).

## Data-protection guard (Phase 0)
`public/shared/state.js` never writes over saved progress it cannot read: a newer `schemaVersion`,
malformed JSON, an invalid version, or an empty value. Instead, the page keeps working in memory, stops saving,
and turns the storage banner into **"Saved progress needs attention."** with a **Download saved data**
button. Export hands over the protected data. Clear and Restore warn before replacing it. The same check
runs before every save, so a tab left open when another tab or a newer version saves newer data stops
instead of overwriting it. `PVAS4.saveBlocked()` returns `'newer'`, `'unreadable'` or `null`.
Before the guard, opening 4.1 or 4.2 with newer data replaced it with an empty profile
(proven in `tests/results/01-baseline-before-guard.txt`).

## Rollback policy (owner decision, Phase 0)
1. **Deploy the guard release before any schema v3 release.** The guard must already be live when learners
   first receive newer data, or a rollback can still erase their progress.
2. **The guard release is the oldest version that may be redeployed.** Never redeploy `33c4e04` or anything
   older once a newer schema has shipped: that code replaces newer saved progress with an empty profile.
3. **GUARD RELEASE: `ee27fd0b46afa8872d65045175a60ab84a4d50b4` (merge of `phase-0-guard` into `main`), deployed 14 Oct 2026.** Its app code is identical to the owner-verified `7aa9165`. Live `state.js` was confirmed to contain the guard after deployment. Do not redeploy anything older than this commit once a newer schema has shipped.
4. Every later release must keep the guard and pass the full test suite, including the golden tests for
   existing v1/v2 data.

## Tests
```text
cd tests
npm install                 # jsdom + Playwright library (no browsers downloaded)
npm test                    # unit (state.js) + page tests (hub, Progress, 4.1–4.4) in jsdom
npx playwright install chromium && npm run test:e2e   # real-browser suite: layout, keyboard, downloads
```
- `tests/` is outside `public/` (never deployed) and has its own `package.json` (the repo root has none,
  so the Cloudflare build is unchanged). Requires Node 22.12+.
- `tests/fixtures/golden/` holds what the unchanged state layer (`33c4e04`) produced for existing learner
  data. **Do not regenerate it** to make a change pass; a golden failure means existing data would be read
  differently.
- Recorded runs are in `tests/results/`.

## Module 4.3 — Exploring Possible Directions (v1.0)
- Page: `public/4-3/index.html`; logic `public/shared/m43.js`; styles appended to `stage4.css` (`.s43-*`).
- Source of truth: `docs/PVA_Module_4.3_Production_Specification_v1.5.md` (approved), with the locked
  `docs/PVA_Module_4.3_Design_Brief_v0.3_LOCKED.md` as design authority. Build record: `BUILD_REPORT_4.3.md`.
- State: **schema v3**, backup wrapper v3 (wrappers 1–3 accepted). `modules["4-3"] = { lastSection, completedAt,
  reviewedWorkClues, reviewedEvidence, examinedDirectionIds[], decisionReached, undecided, undecidedNote,
  selectedDirectionIds[] (0–2), directionExplorations: [{ directionId, judgment, reason, reasonSkipped,
  relatedEvidenceIds[], whatMayBeNew, learningQuestions[], savedAt }] }`. Judgments are `explore_further | unsure |
  not_now` and are never written to Work Clues. 4.2 tasks are referenced by ID only; references to deleted tasks are
  dropped on load and hidden at once. Limits: reason 300, what may be new 1000, question 140 (max 10 per
  direction), undecided note 300.
- All 4.3 writes go through `PVAS4.m43`. D16 (reason switching) is enforced there: a written reason is only removed
  with `{ confirmed: true }` after the learner confirms. Stored reasons are normalized by the spec's four-case table.
- One shared backup summary for every page (`summaryOf` in `state.js`); Restore never reads it.
- Migration: v1/v2 data and backups load unchanged; a `"4-3"` key in v1/v2 data is dropped (no release wrote it).
- Completion: explicit **Save and finish Module 4.3** once the seven spec criteria are met; kept once set.
- Assets load with `?v=4.3.0` (cache-busting). Bump it on every release that changes shared files.

## Module 4.4 — Build Your Direction Map (v1.0)
- Page: `public/4-4/index.html`; logic `public/shared/m44.js`; styles and the map's print layout appended to
  `stage4.css` (`.s44-*`).
- Source of truth: `docs/PVA_Module_4.4_Production_Specification_v1.0.md` (approved 15 Oct 2026), design authority
  `docs/PVA_Module_4.4_Design_Brief_v0.3_APPROVED.md`. Build record: `BUILD_REPORT_4.4.md`.
- State: **schema v4**, backup wrapper v4 (wrappers 1–4 accepted). `modules["4-4"] = { lastSection, completedAt,
  whereIAmNow, mapDirections: [{ directionId, nextStep }] (0–2, learner order), stillExploring, investigationStep }`.
  Limits 300 for each text. The investigation step is kept in every map state (spec §6, T8).
- The map is rebuilt from the CURRENT 4.1–4.3 records every time; 4.4 never writes 4.1–4.3 (tested).
- All 4.4 writes go through `PVAS4.m44`. A written next step is only discarded with `{ confirmed: true }`.
- "Use this idea" never saves by itself: a copied idea is kept only when edited or on "Continue to my map".
- Hub: earliest unfinished module first; **Review my Direction Map** once 4.1–4.4 are all complete.
- Assets load with `?v=4.4.0`.

## 4.4 release checklist (owner decisions)
1. Owner runs `npm test` (expect 262/262) and `npm run test:e2e` (expect 50 passed) locally. (Done 15 Oct 2026: 262/262 and 50 passed; manual checks including print preview passed.)
2. Owner manual checks (BUILD_REPORT_4.4 §7), including Chrome's real print preview and "Save as PDF".
3. Merge `design-4-4` to `main` (Cloudflare deploys).
4. After deploy: hard-reload and check `PVAS4.SCHEMA_VERSION === 4` and `typeof PVAS4.m44 === "object"`.
5. Rollback: the 4.3 release `de481a0` and the guard release `ee27fd0` both treat 4.4 progress as newer data
   (protected, read-only, downloadable, restorable by 4.4; tested in `tests/unit/state44.test.mjs` RB2b–RB4).
   Never redeploy anything older than `ee27fd0`.

## 4.3 release checklist (owner decisions)
1. The Phase 0 guard release `ee27fd0` must have been live long enough for returning learners to receive it
   (rollback policy). Under that guard, v3 progress is protected ("newer"), never overwritten.
2. Owner runs `npm test` and `npm run test:e2e` locally. (Done 15 Oct 2026: 168/168 and 37/37.)
3. Owner manual check on `localhost`, then merge `module-4-3` to `main` (Cloudflare deploys from `main`).
4. After deploy: hard-reload the live site and check `PVAS4.SCHEMA_VERSION === 3` and `typeof PVAS4.m43 === "object"`.
5. Once v3 is live, the oldest version that may be redeployed is still the guard release `ee27fd0`. Any release from
   `ee27fd0` up to (not including) the 4.3 merge treats 4.3 progress as newer data: protected and read-only, never
   lost (tested: `tests/unit/state43.test.mjs` RB1–RB2). Never redeploy anything older than `ee27fd0`.

