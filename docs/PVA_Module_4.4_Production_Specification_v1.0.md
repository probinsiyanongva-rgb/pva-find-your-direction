# PVA Beginner VA Journey — Stage 4
## Module 4.4 Production Specification v1.0

**Status:** DRAFT for owner review. Not approved. Implementation must not start until this specification is approved.
**Module:** 4.4 DIRECTION — "Build Your Direction Map"
**Design authority:** `docs/PVA_Module_4.4_Design_Brief_v0.3_APPROVED.md` (decisions D1–D26). This specification turns those decisions into behaviour and tests. It does not change them.
**Source inspected:** `main` at `de481a0` (4.3 v1.0, live since 15 Oct 2026). Every statement about existing behaviour cites the file it comes from. Section 16 lists the evidence for the points the brief left to verification.
**Branch:** `design-4-4` (documentation only).

### Conventions
- **MUST** = required; tested.
- **Final copy** = the exact learner-facing text to implement. It is the brief's DRAFT copy unless marked *new in spec*. The owner can change any line during review.
- Requirement IDs (`R-…`) are referenced by the tests in §17 and the traceability table in §19.

---

## 1. Scope

### 1.1 New files
| File | Purpose |
|---|---|
| `public/4-4/index.html` | The 4.4 page. Shell cloned from `public/4-3/index.html` (sidebar, mobile drawer, storage banner, Backup tools, footer). |
| `public/shared/m44.js` | 4.4 interactions. Reads other modules; writes only through `PVAS4.m44`, `PVAS4.setLastSection('4-4', …)` and `PVAS4.markModuleComplete('4-4')`. |
| `tests/unit/state44.test.mjs`, `tests/pages/m44.test.mjs` | New tests (§17). |
| `tests/fixtures/legacy/state-de481a0.js` | Byte copy of the 4.3 release `state.js`, for rollback tests (§11). |

### 1.2 Changed files
| File | Change | Limit |
|---|---|---|
| `public/shared/state.js` | Schema v4, backup v4, `normalize44`, migration step, `PVAS4.m44`, `LIMITS_44`, summary flag, Restore confirmation line | Nothing in 4.1–4.3 validation or APIs changes |
| `public/shared/home.js` | 4.4 status, stamp, summary line, Continue priority (§12.1) | — |
| `public/shared/m43.js` | Finish screen: "Continue to Module 4.4" becomes a live link (§12.3) | The only 4.3 change |
| `public/shared/stage4.css` | `.s44-*` rules and the map print layout, appended at the end | No existing rule changes |
| `public/index.html`, `public/progress/index.html` | 4.4 entry and stamp; footer; `?v=4.4.0` | — |
| `public/4-1/index.html`, `public/4-2/index.html`, `public/4-3/index.html` | Sidebar: 4.4 becomes a link; `?v=4.4.0` | No learning-activity change |
| Existing tests | Deliberate updates listed in §18 | Golden files unchanged |

**R-SCOPE-1** No change to 4.1, 4.2 or 4.3 learning activities, learner-facing copy (except the 4.3 finish link and the sidebars) or stored data.
**R-SCOPE-2** `public/shared/m41.js`, `m41-data.js`, `m42.js`, `m42-data.js` are not modified.

---

## 2. Page structure and routing

**R-PAGE-1** Same shell and routing pattern as 4.3 (`public/shared/m43.js`, `go()`): one page, sections shown by hash, `S.setLastSection('4-4', key)` on every section change, focus moved to the section heading, drawer closed.

**R-PAGE-2** Sections (ids are valid `isId` values, `public/shared/state.js`):

| Hash | Screen | Sidebar label |
|---|---|---|
| `#look-back` | 1 | 1 · Look Back |
| `#choose` | 2 | 2 · Choose What to Explore |
| `#steps` | 3 | 3 · My Next Step |
| `#map` | 4 | 4 · My Direction Map |

Unknown hashes go to `#look-back`. With no hash, the page opens at the saved `lastSection`, else `#look-back`.

**R-PAGE-3** Sidebar status marks (`data-status`, as in 4.3): Screen 2 "✓ Done" when the map is not Empty; Screen 3 "✓ Done" when the completion content condition (§7) holds; Screen 4 "✓ Done" when `completedAt` is set.

**R-PAGE-4** Page heading: eyebrow "MODULE 4.4", title "Build Your Direction Map". Footer: "Stage 4 · Module 4.4 v1.0". All local assets load with `?v=4.4.0`.

**R-PAGE-5** Leaving a section by any route flushes typed text (debounced saves, the 4.3 `debounced()` pattern: save 400 ms after typing and on blur). Exception: an unaccepted idea (§4) is never flushed.

---

## 3. Screens (final copy)

### 3.1 Screen 1 — Look Back (`#look-back`)

**Heading:** "Look back"
**Intro:** "Here's what you've worked through so far. You don't need to repeat any of it. In this module, you'll choose what goes on your map and decide on one next step."

**R-S1-1** Shows three count lines, each with a link (same tab):
| Line (final copy) | Count rule | Link |
|---|---|---|
| "Work Clues saved in Module 4.1: *n*" | Work Clues whose source is a known scenario or direction (same filter as 4.3 `clueLabel`, `public/shared/m43.js`) | "Revisit Module 4.1" → `../4-1/` |
| "Experiences recorded in Module 4.2: *e* · Tasks: *t*" | `modules['4-2'].experiences` and their tasks | "Revisit Module 4.2" → `../4-2/` |
| "Directions with a saved reflection in Module 4.3: *d*" | directions where `PVAS4.m43.isSaved` is true | "Revisit Module 4.3" → `../4-3/` |

Zero is shown as the number 0 with the same wording. No other judgment or styling.

**R-S1-2** Then the optional field:
- Label: "Where are you in your VA journey right now? (Optional)"
- Examples (plain text, not buttons): "I'm learning the basics." · "I've tried a few tasks for my family's online shop." · "I've done some admin work but never as a VA."
- Note: "Keep it about your VA journey. You don't need to share private details."
- Textarea, `maxlength` = `LIMITS_44.whereIAmNow`. Saved with `m44.setWhereIAmNow` (debounced).

**R-S1-3** Button "Continue →" goes to `#choose`. Nothing on Screen 1 blocks it.

### 3.2 Screen 2 — Choose What to Explore (`#choose`)

**Heading:** "Choose what to explore"
**Intro:** "Which directions do you want to explore next? Add one or two to your map—or keep exploring for now. Both are complete answers."

**R-S2-1 · What you chose in Module 4.3** (reference only; never changes the map):
- if 4.3 has selected directions: "In Module 4.3 you chose: *name*, *name*." (locked card order);
- else if 4.3 `undecided`: "In Module 4.3 you chose to keep exploring.";
- else: "You didn't make a choice in Module 4.3."

**R-S2-2 · Directions you've examined.** One row per direction with a saved 4.3 reflection, in `PVA_M41.DIRECTIONS` order. Each row: card number, name, and "Your judgment in Module 4.3: *label*" using the live 4.3 labels "Explore further" / "Not sure yet" / "Not for me right now" (`JUDGMENT_TEXT`, `public/shared/m43.js`). The judgment is plain text: same class and colour for every value. No grouping, sorting, highlighting, badges or icons by judgment.

**R-S2-3 · Row actions.**
- Not on the map: button "Add to my map" (`m44.addDirection`).
- On the map: text "On my map" and button "Remove from my map" (`m44.removeDirection`, §6).
- When two directions are on the map, every other "Add to my map" is disabled and this line shows under the list: "You can add up to two. Remove one to add a different direction."
- **Nothing is pre-added**, including directions chosen in 4.3 (D2).
- "Not for me right now" rows behave exactly like the others (D17).

**R-S2-4 · Still exploring.** Below the list, a card with the heading "Right now, I'm still exploring" and the line "Choose this if you want to keep exploring before you put a direction on your map." Button: "Choose this" (when not chosen) / text "Chosen" and button "Unselect" (when chosen). The button uses the **same CSS class and size** as "Add to my map" (D-equal weight, §14).

**R-S2-5** Link: "Examine another direction in Module 4.3" → `../4-3/#directions`.

**R-S2-6 · Empty state** (no saved 4.3 reflections): replaces the list with "You haven't saved a reflection on any direction in Module 4.3 yet. You can examine one now, or keep exploring." The 4.3 link and the still-exploring card stay.

**R-S2-7** "Continue →" to `#steps` is enabled when the map is not Empty; otherwise disabled, with the hint "Add a direction or choose to keep exploring to continue."

### 3.3 Screen 3 — My Next Step (`#steps`)

**Heading:** "Decide on your next step"
**Intro:** "Pick one small step you can do in the next few days, for free, without signing up for anything or contacting a client."

**R-S3-1 · Directions state.** For each map direction, in map order:
- heading: card number and name;
- if the 4.3 reflection has learning questions: "Your questions from Module 4.3:" and the list (read-only);
- textarea labelled "My next exploration step", `maxlength` = `LIMITS_44.nextStep`, saved with `m44.setNextStep` (debounced);
- "Ideas you can use" with the four ideas below, each followed by a "Use this idea" button (§4):
  1. "Read three real job posts for this direction and write down the tasks that appear more than once."
  2. "Pick one task from the Direction Card that I haven't done and find a free explanation of how it's done."
  3. "Find out what one tool named on the Direction Card is used for."
  4. "(Optional) Ask someone who does this kind of work one question about their usual day." — rendered with "(Optional)" visible; the copied text omits "(Optional) ". *Copy detail new in spec.*
- if `investigationStep` is not empty: "Your step for deciding is kept. It will come back if you choose to keep exploring again."

**R-S3-2 · Still-exploring state.** One textarea labelled "My next step to help me decide", `maxlength` = `LIMITS_44.investigationStep`, saved with `m44.setInvestigationStep` (debounced). Ideas, each with "Use this idea":
  1. "Examine one more direction in Module 4.3." followed by a link "Open Module 4.3" → `../4-3/#directions`.
  2. "Read the Direction Cards for two directions and note how the daily work differs."
  3. "Read a few real job posts for two directions and note which tasks repeat in each."

**R-S3-3 · Empty state.** "Choose what to explore first." with a link to `#choose`.

**R-S3-4 · Excluded content.** No idea or copy mentions applying, profiles, resumes, cover letters, paid courses or tools, practice projects, portfolios or contacting clients (checked by test W2).

**R-S3-5 · Continue.** "Continue to my map →" is enabled when every visible step field's **current value** (after `cleanText`) is non-empty; otherwise disabled with the hint "Write a step for each direction to continue." (still exploring: "Write your step to continue."). Pressing it commits every field (§4.4) and goes to `#map`. "← Back to choosing" links to `#choose`.

### 3.4 Screen 4 — My Direction Map (`#map`)

**Heading:** "My Direction Map"
**R-S4-1** Shows the map (§5) inside `#mapView`, built from current records on every render.
**R-S4-2** Provisional reminder, always visible on screen and in print: "This map shows where my thinking is right now. It is not a permanent career decision. I can change it at any time."
**R-S4-3 · Actions:**
- "Save my Direction Map" (`#saveMapBtn`) — §7;
- "Print my map" (`#printMapBtn`) — calls `window.print()` (§13);
- hint: "Your choices are saved as you go. Press Save my Direction Map to finish Module 4.4." *(new in spec)*;
- edit links (screen only): "Change my directions" → `#choose`; "Change my steps" → `#steps`; "Edit where I am now" → `#look-back`.
**R-S4-4 · Stage 5.** "Your map shows what you want to explore next—not what you're already ready for. In Stage 5, PRACTICE & PROVE, you'll try the work itself." Then a non-link block "Stage 5 · PRACTICE & PROVE" with the stamp "Coming later" (same markup pattern as 4.3's disabled `.s4-next`, `public/shared/m43.js`).

---

## 4. "Use this idea" — save semantics (D23)

**R-IDEA-1** Pressing the button never writes state. It only changes the field on screen.

**R-IDEA-2** Each step field has an in-memory flag `pendingIdea` (page memory only; never stored, never exported).

**R-IDEA-3 · Pressing "Use this idea":**
1. If the field's current value (after `cleanText`) is non-empty **and** `pendingIdea` is false, ask with `window.confirm("Replace what you wrote with this idea?")`. Cancel: nothing changes (field text, stored text and focus stay as they were).
2. Otherwise (empty field, OK, or the field holds an unaccepted idea): set the field to the idea text, set `pendingIdea = true`, move focus to the field, and announce in the field's `aria-live` status line: "Idea copied. Edit it, or press Continue to my map to keep it as your step."

**R-IDEA-4 · Accepting.** An unaccepted idea becomes the learner's step only when:
- the learner changes the field (any `input` event): `pendingIdea = false` and the normal debounced save runs; or
- the learner presses "Continue to my map": every pending field is committed through the m44 setter, then the normal gate (R-S3-5) applies.

**R-IDEA-5 · Not accepting.** While `pendingIdea` is true, blur does not save. Leaving Screen 3 any other way (sidebar, back link, hash change, reload) does not save the idea; when Screen 3 is shown again the field shows the stored value. The learner's previously stored text is therefore never lost by pressing "Use this idea".

**R-IDEA-6** The button never presses Continue, never presses Save my Direction Map, and never completes the module. Learners can ignore every idea and type their own text.

**R-IDEA-7** Each button is a `<button type="button">` with `aria-describedby` pointing at its idea text.

---

## 5. The map (what is shown and printed)

**R-MAP-1** The map is rebuilt from the current records each time Screen 4 is rendered or printed. Nothing from 4.1–4.3 is copied into 4.4 data.

**R-MAP-2 · Header.** "MY VA DIRECTION MAP", the provisional reminder (R-S4-2), and "Where I am now: *text*" if `whereIAmNow` is not empty (omitted when empty).

**R-MAP-3 · Directions state**, one section per map direction in map order:

| Heading (final copy) | Source | Placeholder |
|---|---|---|
| *num* · *name* | `PVA_M41.DIRECTIONS` | — |
| "My reaction in Module 4.1" | `PVAS4.getClue('direction', id)`: reaction label from 4.1 ("Want to explore" / "Not sure yet" / "Probably not for me", `REACTION_LABELS`, `public/shared/m41.js`) and "Your note: …" if any. Screen only: link "Revisit Module 4.1" → `../4-1/` | "No reaction saved in Module 4.1." |
| "My judgment in Module 4.3" | 4.3 judgment label (R-S2-2), plain text | "No judgment saved in Module 4.3." |
| "Why I'm considering it" | 4.3 `reason` | "No reason added yet" |
| "Experiences and tasks I can draw on" | `PVAS4.m43.relatedTasks(id)`: task label · "Experience *n*: *source label*" · evidence label from `PVA_M42.EVIDENCE` or "No evidence answer yet" (same parts as 4.3, `public/shared/m43.js` line 205) | "No tasks linked yet." Screen only: link "Edit in Module 4.3" → `../4-3/#examine-<id>` |
| "What may be new for me" | 4.3 `whatMayBeNew` | "Nothing added yet" |
| "Questions I want answered" | 4.3 `learningQuestions` | section omitted when none |
| "My next exploration step" | 4.4 `nextStep` | "No next step written yet" |

Screen only, after each direction: "Edit my reflection in Module 4.3" → `../4-3/#examine-<id>`.

**R-MAP-4 · Still-exploring state:**
- "Right now, I'm still exploring."
- "My note from Module 4.3: *text*" if the 4.3 `undecidedNote` is not empty (omitted otherwise).
- "Directions I've looked at so far": every direction with a saved 4.3 reflection, locked order; each line "*name* — Module 4.3: *judgment label* · Module 4.1: *reaction label or 'no reaction saved'*". Placeholder: "You haven't saved a reflection on any direction yet."
- "My next step to help me decide: *investigationStep*" or "No step written yet".

**R-MAP-5 · Empty state:** "Nothing on your map yet." and (screen only) a link "Choose what to explore" → `#choose`.

**R-MAP-6 · Never shown:** scenario Work Clues (D26); any 4.2 task not linked in 4.3 for that direction (D14); the hidden investigation step while in Directions state; counts, totals, scores or ordering by anything but map order.

**R-MAP-7** Learner text is inserted as text (escaped), as in 4.3 (`esc()`).

**R-MAP-8 · Current records.** After the learner edits a 4.3 reflection, a 4.2 task or a 4.1 reaction, the next render of the map shows the edited content, while `mapDirections`, `nextStep`, `stillExploring`, `investigationStep` and `whereIAmNow` are unchanged.

---

## 6. Map states and transitions (normative)

**R-ST-1** The map is in exactly one state, derived from stored data:
- **Empty**: `mapDirections` is empty and `stillExploring` is false;
- **Directions**: `mapDirections` has 1–2 entries (then `stillExploring` is false);
- **Still exploring**: `stillExploring` is true (then `mapDirections` is empty).

`investigationStep` is stored independently of the state.

**R-ST-2** "Written" means `cleanText(value)` is non-empty. Before any transition is evaluated, typed text is flushed (R-PAGE-5); unaccepted ideas are not (R-IDEA-5).

**R-ST-3 · Transition table.** API results are the return values of §9. "Confirm" uses `window.confirm` with the exact text shown. **Cancel always leaves stored data byte-identical (excluding `_meta.updatedAt`, which Cancel must not change either because no save happens) and the screen unchanged.**

| # | From | Action | Condition | Result |
|---|---|---|---|---|
| T1 | Empty | Add direction *d* | *d* has a saved 4.3 reflection | Directions; *d* appended with `nextStep: ''`. `'added'` |
| T2 | any | Add direction *d* | *d* has no saved 4.3 reflection, is already on the map, is not a known id, or 2 are on the map | No change. `'refused'` |
| T3 | Directions (1) | Add a second direction | saved reflection | Appended. `'added'` |
| T4 | Directions | Remove *d* | *d*'s step written | Confirm: "This will remove the next step you wrote for *[direction name]* from your map. Your Module 4.3 reflection stays as it is. Remove it?" OK: *d* and its step removed (`'removed'`). Cancel: no change. API without `confirmed:true`: `'needs-confirm'`, no change |
| T5 | Directions | Remove *d* | *d*'s step not written | Removed, no dialog. `'removed'` |
| T6 | Directions | Choose still exploring | any step written | Confirm: "Choosing to keep exploring will remove your directions and the next steps you wrote for them from your map. Your Module 4.3 reflections stay as they are. Continue?" OK: `mapDirections = []`, `stillExploring = true` (`'exploring'`). Cancel: no change. API without confirmation: `'needs-confirm'` |
| T7 | Directions | Choose still exploring | no step written | `mapDirections = []`, `stillExploring = true`, no dialog. `'exploring'` |
| T8 | Still exploring | Add direction *d* | saved reflection | `stillExploring = false`, *d* appended. `investigationStep` **unchanged**. No dialog. `'added'` |
| T9 | Still exploring | Unselect | — | Empty. `investigationStep` unchanged. `'empty'` |
| T10 | Empty | Choose still exploring | — | Still exploring; field shows the kept `investigationStep`. `'exploring'` |
| T11 | Still exploring | Edit or empty the investigation field | — | Saved as typed; emptying it on purpose stores `''` (the only way it is removed in 4.4) |
| T12 | Directions or Empty | `setInvestigationStep` | not still exploring | No change. `false` (the hidden text cannot be edited) |
| T13 | not on map | `setNextStep(d, …)` | — | No change. `false` |

Removing the last direction (T4/T5) leaves the map Empty.

**R-ST-4** A removed direction's step is discarded after confirmation; re-adding it starts with an empty step.

**R-ST-5** The D21 fallback (confirm before discarding the investigation step) is **not used**, because T8 keeps the text and it survives Export, Restore and reload (R-DATA-4, tests T8 and BK3).

---

## 7. Completion

**R-COMP-1 · Content condition** (`m44.completionMet()`):
- Directions state and every map direction's `nextStep` is written; or
- Still-exploring state and `investigationStep` is written.

**R-COMP-2** "Save my Direction Map" (Screen 4 only) calls `S.markModuleComplete('4-4')` only when the content condition holds. Otherwise it shows, in an `aria-live` line: "To finish, add a next step for each direction on your map." (Directions), "To finish, write your step to help you decide." (Still exploring), or "To finish, choose what to explore first." (Empty), each with a link to the right screen.

**R-COMP-3 · Not required:** 4.1–4.3 completion; `whereIAmNow`; Work Clues; 4.2 tasks or linked tasks; two directions. Missing 4.2 records never block completion.

**R-COMP-4** `completedAt` is kept once set (existing `markModuleComplete`, `public/shared/state.js`). Later edits never clear it, including an Empty map.

**R-COMP-5 · After completion** Screen 4 shows, above the map: "Module 4.4 complete", "Your map is saved in this browser (first completed *date*). You can keep changing it.", the "Print my map" button, and "Use Export Progress to keep a backup file, especially if you might switch devices or browsers." with an "Export Progress" button (same pattern as 4.3's completion panel). The Save button remains and is harmless (it does not change `completedAt`).

**R-COMP-6** No certificate, badge, score or submission anywhere.

---

## 8. Data model and validation

### 8.1 Shape (`modules["4-4"]`)
```js
{
  lastSection: string|null,        // isId
  completedAt: string|null,        // strOrNull
  whereIAmNow: string,             // cleanText, ≤ LIMITS_44.whereIAmNow
  mapDirections: [{ directionId, nextStep }],   // 0–2, unique, DIRECTION_IDS only, learner order
  stillExploring: boolean,
  investigationStep: string        // cleanText, ≤ LIMITS_44.investigationStep; kept in every state
}
```
`defaultModule('4-4')` returns `{ lastSection: null, completedAt: null, whereIAmNow: '', mapDirections: [], stillExploring: false, investigationStep: '' }`.

**R-DATA-1 · Limits** `LIMITS_44 = { whereIAmNow: 300, nextStep: 300, investigationStep: 300, directions: 2 }`. *Proposed in spec* to match 4.3's reason and undecided-note limits; owner to confirm (§20).

**R-DATA-2** All text uses the existing `cleanText()` (control characters including line breaks become spaces, trimmed, capped), as every Stage 4 text field does (`public/shared/state.js`).

### 8.2 `normalize44(raw)` — runs after `normalize43`
**R-DATA-3**
1. `lastSection`, `completedAt`: as other modules.
2. `whereIAmNow`, `investigationStep`: `cleanText` with limits.
3. `mapDirections`: keep entries that are objects with a `directionId` in `DIRECTION_IDS`; first occurrence wins for duplicates; at most 2 (first two kept); `nextStep` cleaned. **A direction is kept whether or not it has a saved 4.3 reflection** (the map's own choices never change because of other records, D7/§13.5 of the brief).
4. `stillExploring = raw.stillExploring === true && mapDirections.length === 0` (if both are stored, the directions stand; same rule as 4.3's `undecided`, `normalize43`).
5. `investigationStep` is kept in every case.
6. Unknown keys are dropped.

**R-DATA-4** `investigationStep` is part of the saved profile, so it is included in Export and restored by Restore unchanged.

**R-DATA-5** `normalize()` adds `if (isObj(raw.modules['4-4'])) out.modules['4-4'] = normalize44(raw.modules['4-4']);` after the 4.3 line. `MODULE_IDS` becomes `['4-1','4-2','4-3','4-4']`.

**R-DATA-6** Loading or restoring never creates `modules['4-4']` when it is absent (same as 4.3; `S.module()` returns a default without creating, `public/shared/state.js`).

---

## 9. State API `PVAS4.m44`

All writes call `persist()` (so the Phase 0 guard applies to every write). None of these functions reads or writes `workClues`, `scenarioObservations`, `jobPostObservations`, `exploredDirections`, or `modules['4-1'|'4-2'|'4-3']` except to **read** them.

| Function | Behaviour / returns |
|---|---|
| `state()` | Read-only: `'empty' \| 'directions' \| 'exploring'` |
| `addDirection(id)` | T1–T3, T8. `'added'` or `'refused'`. Requires `PVAS4.m43.isSaved(exploration(id))` |
| `removeDirection(id, opts)` | T4–T5. `'removed'`, `'needs-confirm'` (written step and no `{confirmed:true}`), or `'refused'` (not on map) |
| `setStillExploring(on, opts)` | `on=true`: T6, T7, T10 → `'exploring'` or `'needs-confirm'`. `on=false`: T9 → `'empty'` (no-op `'empty'` if not exploring) |
| `setNextStep(id, text)` | `true` if *id* is on the map; `false` otherwise (T13) |
| `setInvestigationStep(text)` | `true` only when still exploring; else `false` (T12) |
| `setWhereIAmNow(text)` | `true` |
| `completionMet()` | R-COMP-1, read-only |
| `hasWrittenStep(id)` | read-only helper used by the page to decide on a dialog |

**R-API-1** `opts.confirmed === true` is the only way a written step is discarded (same pattern as 4.3 `skipReason`, `public/shared/state.js`).
**R-API-2** `PVAS4.LIMITS_44` is exposed. `PVAS4.m44` writes nothing when called with invalid input.

---

## 10. Schema v4, migration, backup, restore

**R-MIG-1** `SCHEMA_VERSION = 4`, `BACKUP_VERSION = 4`. Wrappers 1–4 are accepted; 5+ rejected with the existing "newer version" message (`validateBackup`).

**R-MIG-2 · `migrate()`** keeps the existing step and adds one:
```text
if (v < 3) { drop modules['4-3']; v = 3 }   // unchanged
if (v < 4) { drop modules['4-4']; v = 4 }   // new: no release before 4.4 ever wrote "4-4"
```
Nothing in 4.1–4.3 data changes meaning. Versions above 4 return `null` (guard: "newer").

**R-MIG-3** v1, v2 and v3 data and backups load and restore with every 4.1–4.3 field identical to what the 4.3 release produces, apart from `schemaVersion` (golden-equivalence tests, `tests/helpers/golden.mjs`).

**R-BK-1 · Export** unchanged in format; `version: 4`; `data` is the whole profile including `modules['4-4']`; `summary` from `summaryOf`.

**R-BK-2 · Summary** `summaryOf` adds `module44Complete: !!(m['4-4'] && m['4-4'].completedAt)`. Still informational only; Restore never reads it (existing rule).

**R-BK-3 · Restore confirmation** adds the line `Module 4.4: complete` / `Module 4.4: in progress or not started` after the 4.3 line, and the sentence becomes: "Restoring REPLACES the Stage 4 progress currently saved in this browser, including your Direction Map." *(wording new in spec)*.

**R-BK-4** Restoring a v1–v3 backup after 4.4 is in use removes the current map (Restore replaces everything, existing behaviour `restoreFromFile`). The confirmation (R-BK-3) is the protection; no merge is attempted.

**R-BK-5 · Clear** unchanged: removes everything, including the map (`clearProgress`).

---

## 11. Release safety under the Phase 0 guard

**R-REL-1** The guard code paths (`classify`, `block`, `storedChangedToUnreadable`, `downloadSavedData`, `persist`) are unchanged apart from the version constants.

**R-REL-2 · Newer data in 4.4.** Schema 5+ data is protected on the 4.4 page exactly as today: read-only, banner, Download saved data, every `m44` call writes nothing.

**R-REL-3 · Rollback to the 4.3 release (`de481a0`).** Its `state.js` treats schema 4 as newer (`classify`: `v > SCHEMA_VERSION`, with `SCHEMA_VERSION = 3`), so 4.4 progress is kept byte-identical and downloadable. Its download wraps the data with backup version 3; the 4.4 code accepts that wrapper and restores the schema-4 data. Tested with a committed byte copy `tests/fixtures/legacy/state-de481a0.js`, sha256 of the LF content `71a0a3aa88ce1437f17affab68434ec92fa3ec939ecdc1cae773764ae47c28cc` (computed from `git show de481a0:public/shared/state.js`, which has no CR characters).

**R-REL-4 · Rollback to the guard release (`ee27fd0`)** also treats schema 4 as newer (its `SCHEMA_VERSION` is 2). Existing RB1/RB2 are extended to v4 data.

**R-REL-5** The oldest version that may ever be redeployed stays `ee27fd0`. README's release checklist gains: "After 4.4 ships, `de481a0` (4.3) and `ee27fd0` are both safe rollback targets; nothing older than `ee27fd0`."

---

## 12. Navigation

### 12.1 Hub Continue priority (D25)
**R-NAV-1** `status('4-4')` in `public/shared/home.js`: `complete` if `completedAt`; `progress` if `lastSection`, any `mapDirections`, `stillExploring`, non-empty `investigationStep` or non-empty `whereIAmNow`; else `none`. (Same lesson as the 4.3 status fix: any saved 4.4 progress counts, not only `lastSection`.)

**R-NAV-2** Continue button, first matching row wins (existing rule extended; `public/shared/home.js`):

| Condition | Label | Link |
|---|---|---|
| 4.1 progress | Continue Module 4.1 | `4-1/#lastSection` |
| 4.1 none | Start Module 4.1 | `4-1/` |
| 4.2 progress / none | Continue / Start Module 4.2 | as today |
| 4.3 progress / none | Continue / Start Module 4.3 | as today |
| 4.4 progress | Continue Module 4.4 | `4-4/#lastSection` |
| 4.4 none | Start Module 4.4 | `4-4/` |
| all four complete | **Review my Direction Map** | `4-4/#map` |

The previous final label "Review Module 4.3" is removed.

**R-NAV-3** The hub module list shows 4.4 as a link (`4-4/`) with stamp `#stamp44` (Not started / In progress / Complete), always — so the map is reachable whatever Continue says (D25). The summary line becomes "Module 4.1 … · Module 4.2 … · Module 4.3 … · Module 4.4 … · *n* Work Clues saved".

### 12.2 Sidebars
**R-NAV-4** On the 4.1, 4.2 and 4.3 pages, the 4.4 sidebar item becomes `<a class="s4-mod-link" href="../4-4/">4.4 Build Your Direction Map</a>` (no status text; same as how 4.3 was added to the 4.1/4.2 sidebars). No `li.later` remains in any Stage 4 sidebar or hub list.

**R-NAV-5** The 4.4 page sidebar links to 4.1, 4.2 and 4.3 with their status words (as 4.3 does, `renderStatus` in `public/shared/m43.js`).

### 12.3 4.3 finish screen
**R-NAV-6** In `public/shared/m43.js` `renderCompletion`, the disabled `<div class="s4-next" aria-disabled="true">…Coming later…</div>` becomes `<a class="s4-next s4-next-live" href="../4-4/"><span class="s4-next-label">Continue to Module 4.4 →</span></a>` (same pattern as 4.2's live NEXT link). Nothing else in `m43.js` changes.

### 12.4 Progress page and versions
**R-NAV-7** `public/progress/index.html` uses `home.js`, so it gets R-NAV-1/2/3 automatically; footer becomes "… · 4.1 v1.1 · 4.2 v1.1 · 4.3 v1.0 · 4.4 v1.0" (hub footer likewise).
**R-NAV-8** Every local script and stylesheet on all six pages uses `?v=4.4.0`.

---

## 13. Print

**R-PR-1** "Print my map" calls `window.print()`. Nothing is generated or uploaded.

**R-PR-2 · Print CSS** (appended to `stage4.css`, inside `@media print`): only `#mapView` and its print header are visible. Hidden: sidebar, drawer button, storage banner (unless the guard is active — see R-PR-5), Backup tools, every screen except the map, edit links, buttons, the Stage 5 block, and all elements marked `.s44-screen-only`.

**R-PR-3** Printed content: "MY VA DIRECTION MAP", the provisional reminder, the full map (§5), and "Printed on *date*" (`toLocaleDateString()`, set when Screen 4 renders and again on the `beforeprint` event). The print says: "To keep a PDF, choose 'Save as PDF' in the print window." — shown on screen next to the Print button and **not** printed. *(Placement new in spec.)*

**R-PR-4 · Readable in black and white:** in print, map text is dark on white; no information depends on colour; headings are distinguished by weight and size; no backgrounds needed to read.

**R-PR-5** If the guard is active (saving paused), the print still shows the map from the in-memory state; no extra print banner is required.

**R-PR-6** No "map last saved" date is stored (brief §12 left this to the spec: **decided not to add a field**). Printed copies are snapshots; the on-screen copy beside the button says: "If you change your map later, print it again to get an updated copy."

---

## 14. Accessibility and responsiveness

**R-A11Y-1** Keyboard operable throughout; visible focus; semantic `<button>` and `<a>`; every textarea has a `<label>`; native `window.confirm` dialogs (as 4.3).
**R-A11Y-2** "Right now, I'm still exploring" and "Add to my map" use the same button class and size; judgments are plain text with no colour, icon or warning style.
**R-A11Y-3** Status messages (idea copied, completion messages) use `aria-live="polite"`.
**R-A11Y-4** No horizontal page scroll at 390, 820, 1366 and 1600 px on all four screens; the 960 px drawer behaviour matches 4.3.
**R-A11Y-5** No progress bar, badge or wording implying readiness, suitability or skill level.

---

## 15. Missing data (all MUST)

| Situation | Behaviour | Test |
|---|---|---|
| No `modules['4-3']` at all | Screen 2 empty state; still exploring available; map still-exploring list placeholder | MD1 |
| 4.3 not complete | Page works; saved reflections can be added | MD2 |
| No 4.2 data, or a direction with no linked tasks | "No tasks linked yet."; completion unaffected | MD3 |
| Linked task without evidence | "No evidence answer yet" | MD4 |
| Linked task deleted in 4.2 | Not shown (read-time filter `relatedTasks`; removed on next load by `normalize43`) | MD5 |
| No Work Clue for a map direction | "No reaction saved in Module 4.1." | MD6 |
| Reason skipped in 4.3 | "No reason added yet" | MD7 |
| Map direction whose reflection is not saved (restored/altered data) | Stays on the map with its step; "No judgment saved in Module 4.3."; removable; cannot be re-added (T2) | MD8 |
| Map direction with no 4.3 exploration record at all | Same placeholders as above | MD9 |
| Storage unavailable | Existing banner; page works in memory | MD10 |

---

## 16. Source evidence for points the brief left open

| Question | Evidence (file, location) | Conclusion used |
|---|---|---|
| Can the 4.3 page clear a judgment or unsave a reflection? | `m43.js` judgment radios call `API.setJudgment(id, v)` only with a value; `saveReflection` only sets `savedAt`; nothing clears it. `state.js` `setJudgment` accepts `null` but no page calls it. | Only restored/altered data can produce MD8; handled, not prevented. |
| How 4.3 saves text | `m43.js` `debounced()`: 400 ms after `input`, and on `blur`. | 4.4 reuses it; "Use this idea" adds `pendingIdea` so a programmatic copy is never saved by blur (§4). |
| What Restore replaces | `state.js` `restoreFromFile`: `state = r; persist()` after one `confirm`. | Full replacement; confirmation text extended (R-BK-3). |
| Unknown module keys | `state.js` `normalize()` only copies `4-1`…`4-3`. | Schema v4 required (§10). |
| Older releases and v4 data | `de481a0` and `ee27fd0` `classify()`: `v > SCHEMA_VERSION` → `'newer'`. | Both protect v4 progress (§11). |
| 4.1 reaction labels and direction clue keys | `m41.js` `REACTION_LABELS`; `state.js` `getClue(sourceType, sourceId)` with id `direction:<dirId>`. | Map row "My reaction in Module 4.1" (R-MAP-3). |
| Work Clue notes may contain line breaks | `state.js` `setNote` stores `String(note).slice(0, NOTE_MAX)` (not `cleanText`). | Map shows them escaped as text; no change to 4.1 data. |
| Existing 4.4 label | `public/index.html` and sidebars: "Build Your Direction Map". | Module name kept; map title "My VA Direction Map". |
| Print rules today | `course.css` `@media print` hides only generic course chrome. | New print layout in `stage4.css` (§13). |
| Can Playwright check print? | Playwright 1.64 `page.emulateMedia({ media: 'print' })` and `page.pdf()` (headless Chromium). | E20–E21 (§17.3); plus a manual print check. |

---

## 17. Acceptance tests

All Node tests run with `npm test`; real-browser tests with `npm run test:e2e`. Golden files stay unchanged.

### 17.1 `tests/unit/state44.test.mjs` (new)
| ID | Checks |
|---|---|
| V1 | `SCHEMA_VERSION === 4`; backup version 4; `MODULE_IDS` includes `4-4`; `LIMITS_44` values |
| M1 | A v3 profile (`profileV3Full`) loads with 4.1–4.3 deep-equal to the 4.3 release output; no `4-4` created |
| M2 | v1/v2 golden equivalence still passes (existing B tests with `EXPECTED` 4) |
| M3 | A `4-4` key inside v1, v2 or v3 data is dropped; a `4-3` key in v1/v2 is still dropped |
| M4 | Schema-5 data: `saveBlocked() === 'newer'`, storage byte-identical after every `m44` call |
| M5 | v4 round trip: export → validate → identical profile |
| M6 | Wrappers 1–4 accepted; 5 rejected with the existing message |
| N1 | Invalid direction ids, duplicates, non-objects dropped; first two kept |
| N2 | Both `mapDirections` and `stillExploring` stored → directions stand, `stillExploring` false, `investigationStep` kept |
| N3 | Text fields cleaned and capped at each limit (line breaks → spaces) |
| N4 | A map direction without a saved 4.3 reflection is kept by `normalize44` |
| N5 | Unknown 4.4 keys dropped; missing fields defaulted |
| A1 | `addDirection` refuses: unsaved reflection, unknown id, duplicate, third direction |
| A2 | `addDirection` accepts a `not_now` direction exactly like the others |
| T1–T13 | Each row of the transition table (R-ST-3), including every `'needs-confirm'` path leaving storage byte-identical |
| T8 | Still exploring → add: `investigationStep` byte-identical; reload; export/restore; unselect/choose again shows it |
| C1–C4 | `completionMet()` for each state; missing 4.2/4.1 data never blocks; `completedAt` kept after making the map Empty |
| IM1 | **Immutability:** run every `m44` function in sequence (including refused and confirmed paths) on a full v4 profile; `workClues`, `scenarioObservations`, `jobPostObservations`, `exploredDirections`, `modules['4-1']`, `['4-2']`, `['4-3']` deep-equal before/after |
| IM2 | On a profile without `4-2`/`4-3`, `m44` calls never create them |
| SU1 | `summaryOf` includes `module44Complete`; Restore ignores a tampered summary |
| BK1 | Restore confirmation text contains the 4.4 line and "including your Direction Map" |
| BK2 | Restoring a v3 backup over a v4 profile with a map: map gone after OK; Cancel leaves storage byte-identical |
| BK3 | Export/Restore keeps a hidden `investigationStep` in Directions state |
| G1 | While blocked ('newer' or 'unreadable'), every `m44` write returns normally but storage is never written |
| RB1 | (existing) legacy `ee27fd0` copy hash |
| RB2b | `ee27fd0` code with v4 progress: newer, byte-identical, download offered, restorable by v4 |
| RB3 | Committed `state-de481a0.js` matches sha256 `71a0a3aa…28cc` (line endings ignored) |
| RB4 | `de481a0` code with v4 progress: newer, byte-identical, Download saved data wraps it as version 3, and v4 `validateBackup` restores it unchanged |

### 17.2 `tests/pages/m44.test.mjs` (new, jsdom)
| ID | Checks |
|---|---|
| J1 | Page loads with no errors; four sections; default `#look-back`; `lastSection` restored |
| L1 | Screen 1 counts and links, including zeros; scenario-clue filter matches 4.3 |
| L2 | "Where I am now" saves (debounced and on blur), capped at the limit, optional |
| CH1 | Screen 2 lists only saved reflections, in locked order, with plain judgment labels (same class for all three values) |
| CH2 | Nothing pre-added when 4.3 has selections; the 4.3 reference line in all three variants |
| CH3 | Empty state; 4.3 link and still-exploring card present |
| CH4 | Two on the map → other Add buttons disabled with the hint |
| CH5 | Still-exploring button has the same class as "Add to my map" |
| TR1–TR8 | Page-level transitions with `window.confirm` stubbed: T4/T6 OK and Cancel (Cancel: storage byte-identical, screen unchanged, correct dialog text), T5/T7 no dialog, T8 note on Screen 3 |
| TR9 | Typed-but-not-yet-saved step text counts as written (flush before the removal check) |
| U1 | Pressing "Use this idea" on an empty field: field filled, focus moved, status announced, **storage unchanged** |
| U2 | Field with learner text: confirm shown; Cancel leaves field and storage unchanged |
| U3 | OK replaces the field only; storage still holds the old text until accepted |
| U4 | Blur with a pending idea does not save |
| U5 | Typing after the copy saves the edited text |
| U6 | "Continue to my map" commits a pending idea and passes the gate |
| U7 | Leaving Screen 3 by the sidebar drops the pending idea; returning shows the stored text |
| U8 | The button never sets `completedAt` and never navigates |
| S3a | Continue gate uses current field values; disabled hint text |
| MP1 | Directions map shows every row of R-MAP-3 from the current records, including the 4.1 reaction and its link |
| MP2 | Edit a 4.3 reflection (via `PVAS4.m43`), re-render: map shows the new text; 4.4 data unchanged |
| MP3 | Placeholders for every missing item (§15 MD1–MD9) |
| MP4 | Still-exploring map (R-MAP-4) and Empty map (R-MAP-5) |
| MP5 | Scenario Work Clues and unlinked tasks never appear; hidden investigation step not shown in Directions state |
| F1 | Save gated by `completionMet()` with the three messages; completes in both routes |
| F2 | After completion: panel, editable map, `completedAt` unchanged by further edits or Save |
| W1 | Static scan of `m44.js`: no calls to `setReaction`, `setNote`, `removeClue`, `saveScenario`, `savePost`, `markExplored`, 4.2 writers, or any `PVAS4.m43` writer; no score/rank/match/best/recommend wording |
| W2 | No idea or copy contains: apply, application, profile, resume, CV, cover letter, portfolio, client, buy, paid, course fee (case-insensitive, with an allow-list for "contacting a client" in the intro sentence) |
| NV1 | Hub Continue matrix (R-NAV-2): every row, including 4.4 complete while 4.1 not started → "Start Module 4.1", and all complete → "Review my Direction Map" → `4-4/#map` |
| NV2 | Hub 4.4 entry is a link with `#stamp44`; status counts any saved 4.4 data without `lastSection` |
| NV3 | 4.1/4.2/4.3 sidebars link to 4.4; no `li.later` anywhere |
| NV4 | 4.3 finish screen links to `../4-4/` |
| PR1 | Print button calls `window.print` (stubbed); the print date element is filled; screen-only elements carry `.s44-screen-only` |

### 17.3 Playwright (real Chromium) — new
| ID | Checks |
|---|---|
| E15 | A learner with saved 4.3 reflections adds one direction, writes a step, saves; reload; hub says "Review my Direction Map" once 4.1–4.4 are complete; no console errors |
| E16 | A learner with no 4.2 data and no 4.3 reflections completes by still exploring |
| E17 | Real dialogs: T4 and T6 Cancel keep everything; OK removes; T8 keeps the investigation step |
| E18 | Keyboard only: Tab to "Use this idea", Enter, field focused, type, Continue |
| E19 | All four screens fit at 390 px (no horizontal scroll) and at 820/1366/1600 |
| E20 | `emulateMedia({ media: 'print' })`: only the map is visible; sidebar, buttons, edit links and Stage 5 block hidden; "Printed on" visible; map text computed colour is dark |
| E21 | `page.pdf()` produces a PDF of the map (saved as a test artifact for the owner to open); test asserts it is non-empty |
| E22 | Guard: schema-5 data in storage → 4.4 page shows the banner; working through 4.4 never writes |
| E23 | Every page requests assets with `?v=4.4.0` and all load (replaces E14's version) |

### 17.4 Owner manual checks (real browser)
1. Wording of all four screens, dialogs and the map.
2. Chrome print preview: map only, readable in black and white, sensible page breaks; "Save as PDF" works.
3. Phone width (390 px): Screen 2 list, Screen 3 ideas, the map.
4. Cancel/OK on both confirmations by hand.
5. Export → Clear → Restore brings the map back, including a hidden investigation step.

---

## 18. Deliberate updates to existing tests

| Test | Change | Why |
|---|---|---|
| `fixtures.mjs` `EXPECTED` | `{ schema: 4, backup: 4 }` | New schema; golden files unchanged |
| "Newer" fixtures (`profileNewer`, `RAW.newer`, `futureWrapper`, `futureData`) | Schema/wrapper 4 → 5 | v4 is now real |
| `pages.test.mjs` P1–P4 | 4.4 linked; summary line includes 4.4; summary shape includes `module44Complete`; final Continue label | R-NAV-2/3, R-BK-2 |
| `m43.test.mjs` J1 (its 4.4 finish-link assertions), N2, N3 | 4.4 is now a link; no `li.later` | R-NAV-4/6 |
| `harness.test.mjs` R1 | `RELEASE = '4.4.0'` | R-NAV-8 |
| `stage4.spec.mjs` E10, E14 | E10: 4.4 is a link; E14 superseded by E23 | R-NAV-6/8 |
| `state43` tests that assert schema 3 or wrapper 3 as current | Use `EXPECTED` | — |

No other existing test may be changed. A failure elsewhere is a defect, not a test to update.

---

## 19. Traceability

| Decision | Requirements | Tests |
|---|---|---|
| D1 show 4.3 reflections, link back | R-MAP-3, R-S3-1 | MP1, MP2 |
| D2 4.3 choices for reference; nothing pre-added | R-S2-1, R-S2-3 | CH2 |
| D3 only saved reflections can be added | R-S2-2, T1–T2, R-API | A1, CH1 |
| D4 tasks with evidence; no abilities field | R-MAP-3 | MP1, W1 |
| D5 exploration step only | R-S3-1/2/4 | W2 |
| D6 undecided path never a dead end | R-S2-4/6, R-S3-2, R-COMP-1 | E16, MD1, C1 |
| D7 never writes 4.1–4.3 | §9 preamble, R-MAP-1, R-DATA-3 | IM1, IM2, W1 |
| D8 no map history | R-ST-4, §8.1 | T4, N5 |
| D9 explicit completion; editable; no certificate | R-COMP-2…6 | F1, F2, C4 |
| D10/D21 confirm before discarding a written step | T4, T6, R-API-1 | T4, T6, TR1–TR9, E17 |
| D11/D20 printable map, Save as PDF mention | §13 | PR1, E20, E21, manual 2 |
| D12 "Where I am now" narrow and optional | R-S1-2, R-DATA-1 | L2 |
| D13 four screens | R-PAGE-2 | J1 |
| D14 only tasks linked in 4.3 | R-MAP-3, R-MAP-6 | MP1, MP5 |
| D15 4.4 exploring independent of 4.3 undecided | R-ST-1, R-S2-1 | CH2, IM1 |
| D16 every loss path covered | §6 | T1–T13 |
| D17 "Not for me right now" allowed, neutral | R-S2-2/3, R-A11Y-2 | A2, CH1 |
| D18 short Screen 1 | R-S1-1/2 | L1 |
| D19 map shows real content | §5 | MP1–MP5 |
| D22 investigation step kept | T8–T11, R-DATA-4, R-ST-5 | T8, BK3, E17 |
| D23 Use this idea; "ask someone" optional; no "when" field | §4, R-S3-1 | U1–U8, E18 |
| D24 hub label; Stage 5 open | R-NAV-2, R-S4-4 | NV1 |
| D25 hub priority; map always reachable | R-NAV-1…3 | NV1, NV2, E15 |
| D26 scenario clues off the map; 4.1 link | R-MAP-3, R-MAP-6 | MP1, MP5 |
| Schema v4 and migration | §10 | V1, M1–M6, N1–N5 |
| Backup / export / restore | R-BK-1…5 | M5, M6, SU1, BK1–BK3 |
| Release safety | §11 | G1, RB1, RB2b, RB3, RB4, E22 |
| Navigation | §12 | NV1–NV4, E15, E23 |
| Accessibility / responsive | §14 | CH5, E18, E19 |
| Missing data | §15 | MD1–MD10, MP3 |

---

## 20. Unresolved items

**Blockers:** none. Every behaviour above is either specified from source evidence (§16) or derived from an approved decision.

**Owner confirmations requested (not blockers; defaults shown):**
1. **Limits** of 300 characters for "Where I am now", each next step and the investigation step (R-DATA-1).
2. **"Use this idea" acceptance** (§4): copied text is kept only after the learner edits it or presses "Continue to my map"; leaving the field or the screen without doing either keeps their previously saved text. This is the strict reading of "must not save automatically".
3. **New copy** marked *new in spec*: the Screen 4 save hint, the Restore sentence "…including your Direction Map", the placement of the "Save as PDF" line (screen only), and the "(Optional)" handling of the "ask someone" idea.
4. **No stored "last saved" date** on the map; printed copies show the print date (R-PR-6).

**Not verifiable before implementation:** exact print pagination and appearance in Chrome's print preview (E20–E21 check structure; the owner's manual check 2 is the final word).

---

## 21. Release checklist (to be copied into README on release)
1. Owner runs `npm test` and `npm run test:e2e` locally; all pass.
2. Owner manual checks §17.4.
3. Merge to `main` (Cloudflare deploys).
4. After deploy, hard-reload and check in the console: `PVAS4.SCHEMA_VERSION === 4` and `typeof PVAS4.m44 === "object"`.
5. Rollback: `de481a0` and `ee27fd0` are both safe; never redeploy anything older than `ee27fd0`.
