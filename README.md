# PVA Academy — Stage 4: Find Your Direction · v1.0 (Module 4.1)

Stage 4 of the PVA Beginner VA Journey. **One integrated Stage 4 course** that will hold
4.1–4.4. Only Module 4.1 (Understanding VA Work Directions) is built; 4.2–4.4 show as
"Coming later". Previous course: Understanding Client Work & Instructions
(`https://pva-client-work.probinsiyanongva.workers.dev/`).

No login. Progress is saved in the learner's browser only (`pva-stage4-progress`),
with Export / Restore / Clear. Expected URL: `https://pva-find-your-direction.probinsiyanongva.workers.dev/`

## Source of truth (locked)
- Learning content and copy: `PVA_Module_4.1_Production_Specification_v1.md`
- Implementation requirements: `PVA_Module_4.1_Build_Brief_v1.md`
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

## QA (v1.0)
Headless Chromium against the Build Brief §31 checklist: 63 functional/state checks, responsive checks at
390 / 820 / 1366 / 1600 px (no horizontal overflow), keyboard and drawer checks, and a verbatim content check of
all 388 learner-facing lines of the Production Specification. See the build notes in the conversation record.
