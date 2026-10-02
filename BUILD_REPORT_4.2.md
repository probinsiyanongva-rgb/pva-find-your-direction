# Stage 4 · Module 4.2 — Build & QA Report (v1.0 build + v1.1 content finalization)

**Build date:** 3 Oct 2026 · **Branch:** `module-4-2` (not merged, not deployed)
**Sources:** `PVA_Module_4.2_Build_Brief_v1.0.md` (implementation); `PVA_Module_4.2_Design_Brief_v0.3_LOCKED_FINAL.md` (design authority, supplied for the v1.1 content pass).
**Owner decisions applied (3 Oct):**
- task prompts and reference content are drafted by Claude for approval;
- the capability question is triggered by a content flag (prompted tasks) or a learner tick (own-words tasks), and is never inferred from text;
- the build ships on a branch and is merged only after approval.

## 1. Files changed
| File | Change |
|---|---|
| `public/shared/state.js` | Schema v2: migration v1→v2, per-module validation (`normalize41`, `normalize42`), 4.2 experience/task API, cascade delete, Restore summary includes 4.2, backup wrapper v2 (v1 accepted) |
| `public/shared/m42-data.js` | **New.** Patterns, evidence answers and definitions, sources (Build Brief verbatim); task prompts with reference tags and explanations (**DRAFT**) |
| `public/shared/m42.js` | **New.** 4.2 guided flow: six sections, snapshot, Work Clues handoff, completion, drawer |
| `public/4-2/index.html` | **New.** 4.2 page in the same Stage 4 shell |
| `public/shared/stage4.css` | 4.2 component styles (same tokens) |
| `public/shared/home.js` | Status for 4.1 and 4.2; Continue button goes to the right module |
| `public/index.html` | 4.2 listed as live with status stamp; footer versions |
| `public/progress/index.html` | Footer versions |
| `public/4-1/index.html` | Sidebar links to 4.2; wrap-up "NEXT" now links to 4.2 (4.1 copy unchanged) |
| `README.md`, `BUILD_REPORT_4.2.md` | Docs |

## 2. Schema / migration
- `schemaVersion` 1 → 2. `migrate()` bumps v1 to v2 without altering any 4.1 field. Versions above 2 are rejected.
- `modules` entries are validated per module:
  - `4-1` keeps `{lastSection, directionsReviewed, completedAt}`;
  - `4-2` is `{lastSection, snapshotReached, completedAt, experiences[]}`.
- Tasks: `{id, label, promptId|null, patternTags[], evidence|null, note}`.
  - Evidence is one of four named strings.
  - Pattern IDs must be one of the five.
  - A task with invalid evidence, a non-string evidence value or an unknown pattern ID is dropped, never converted.
  - An experience with an unknown source is dropped.
- Not stored: counts, totals, scores, profiles, transfer or development notes, tool flags or answers.
- **Naming adaptation (Build Brief §4 allows it):**
  - `completed: boolean` → `completedAt: timestamp|null` (kept once set), matching 4.1;
  - added `lastSection` and `snapshotReached`, needed for completion condition 5.
- Backup wrapper `version` 2. Wrappers 1 and 2 are accepted; newer ones are rejected.

## 3. QA results
**4.1 regression:** 78/78. One fixture updated: the "newer schema" test file now uses version 3, since version 2 is now current.

**4.2 scenarios:** 47/47.

| Scenario | Result |
|---|---|
| A — BPO: 4 tasks, mixed evidence, multiple tags; Parts 1/2/3 correct; persists after reload; no counts or derived keys | PASS |
| B — Fresh graduate: school source, only some-exposure / not-done-yet answers, completes; no separate low-experience mode | PASS |
| C — Family / small business prompts | PASS |
| D — Free text: no tags, no `promptId`, no reference button; learner can tag | PASS |
| E — Prompted: reference unavailable until a tag is chosen; shown afterwards without right/wrong; learner's choice unchanged | PASS |
| F — Tool: flagged prompt shows the question; free text shows it only after the learner ticks; nothing stored | PASS |
| G — Work Clues only in the final section, read-only; no sidebar clue panel in 4.2 | PASS |
| H — No Work Clues: empty state shown, non-blocking | PASS |
| I — Completion: not complete until all 5 conditions are met | PASS |
| J — Persistence: complete after task delete + reload, after edit, after deleting all experiences, after Restore | PASS |
| K — Migration: v1 state opens in 4.2 as v2; 4.1 data identical; `directionsReviewed` stays 4.1-only | PASS |
| L — Export/Restore: v2 export/restore; v1 backup restores; malformed, other-course, future-schema and future-wrapper files rejected with state unchanged; tampered records dropped, 4.1 kept | PASS |

**Also checked:**
- Unpicked prompts are never stored.
- Cascade delete leaves no orphan data.
- Evidence controls carry named values only and look identical.
- Boundary scan: no forbidden phrasing in 4.2 sections, and no VA direction names (direction names appear only in the read-only Work Clues list, as 4.1 clue labels).
- Home and 4.1 link to 4.2.
- No JavaScript errors.

**Responsive:** no horizontal overflow at 390 / 820 / 1366 / 1600 px in all seven 4.2 sections.

**Accessibility:**
- the mobile drawer opens, Esc closes it, and focus returns;
- the whole flow works keyboard-only (source → add → prompt → evidence);
- focus outline is visible;
- no unnamed buttons or unlabeled inputs;
- radios and checkboxes sit inside fieldsets;
- evidence touch targets are at least 44 px.

## 4. Issues / notes
1. **Work Clues access in 4.2.** Brief §15 ("reuse existing Work Clues access") conflicts with §11 ("at the end only"). Resolved in favour of §11, the locked learning rule: 4.2 has no sidebar clue panel, and clues appear only in the final section.
2. **Draft content needs approval.** These are not from a locked spec:
   - the task prompts (6–8 per source);
   - reference tags and one-line explanations;
   - tool flags (4 prompts in v1.0; 5 after the v1.1 content pass, see below);
   - the reference footnote ("This is one way to see it…");
   - UI labels such as "Add this experience", "Compare with a reference", "This task uses a specific tool or system", "No patterns chosen yet" and the completion checklist lines.
3. **Design Brief v0.3 LOCKED:** supplied for the v1.1 pass. Differences found and applied are listed below.
4. **Transition copy:** replaced in v1.1 with the locked v0.3 §26 copy.
5. **Capability question** is display-only. No answer is collected, per §9 "prefer not to persist".


---

# v1.1 — Content finalization pass (3 Oct 2026)

**Authority:** Design Brief v0.3 LOCKED FINAL (design), Build Brief v1.0 (implementation). Branch `module-4-2`, not merged, not deployed.

## 1. Files changed in v1.1
| File | Change |
|---|---|
| `public/shared/m42-data.js` | Prompt wording and references (details below); provenance header updated |
| `public/shared/m42.js` | Tool question now appears only after the learner has tagged the task (v0.3 §8). Logic otherwise unchanged |
| `public/4-2/index.html` | Locked 4.2 → 4.3 transition copy and progression; footer 4.2 v1.1 |
| `public/shared/stage4.css` | 3 lines for the transition progression list |
| `public/index.html`, `public/progress/index.html` | Footer "4.2 v1.1" |
| `BUILD_REPORT_4.2.md`, `README.md` | Docs |

**Unchanged (verified by `git diff`):**
- `state.js` (schema v2, migration, per-module progress, cascade delete, completion persistence, Export/Restore);
- `m41.js`, `m41-data.js` and the 4.1 page;
- `home.js` and Stage 4 navigation.

## 2. Exact content changes
**Transition (v0.3 §26, verbatim).** "You’ve looked at the work. Now you’ve looked at what you’ve actually done." / "Next, we’ll put those two views side by side and explore which directions are worth investigating more closely." / 4.1 = What is the work? · 4.2 = What have I actually done? · 4.3 = Where do those two views connect? · 4.4 = What will I explore next? The "NEXT: 4.3 … Coming later" marker is kept.

**Tool question timing.** Shown only after at least one tag is chosen on that task, for a flagged prompt or an own-words task the learner ticked. Still display-only; nothing stored.

**Reference explanations.** All 51 rewritten to the pattern "This task involves X because …", describing the task, never the learner.

**Prompt changes** (all other prompt labels unchanged):
| Source | Before | After | Reason |
|---|---|---|---|
| Freelance | Delivered work to a client by a deadline (ref OPERATE) | **Kept track of my projects and deadlines** (ref ORGANIZE) | The OPERATE reference didn't fit the locked definition ("inside tools or systems") |
| Family | Dealt with suppliers (ref COMMUNICATE + OPERATE) | Dealt with suppliers (ref **COMMUNICATE** only) | Same: a supplier relationship isn't necessarily a process run inside a system |
| Previous VA | Ran a recurring task in a client’s system | **Handled a recurring task inside a client’s system** | Plainer wording |
| Other | Kept a regular routine running for others (ref OPERATE) | **Kept a shared sheet or app up to date for a group** (ref OPERATE + ORGANIZE, tool-flagged) | A household routine isn't OPERATE by the locked definition; a shared sheet or app is, and it is a natural place for the tool question |

**Tool-flagged prompts: now 5.** The v1.0 report said 3; the v1.0 code actually had 4. The five are:
- Updated records in a system;
- Updated product details in an online store;
- Managed a client’s inbox;
- Handled a recurring task inside a client’s system;
- Kept a shared sheet or app up to date for a group (new).

**Prompts per source** (51 in total):
- Work 8;
- Business 7;
- School 7;
- Freelance 6;
- Community 6;
- Family 6;
- Previous VA 6;
- Other 5.

**Reviewed and kept as is:** "Encoded or updated records" ("encoded" is common Philippine office English) and "Escalated issues" (familiar to BPO learners).

## 3. Locked architecture: not changed
These are unchanged:
- the model EXPERIENCE → TASKS → EVIDENCE → WHAT THE WORK INVOLVED;
- learner-chosen tags;
- references shown only after the learner's choice, and only for prompted tasks;
- no tags on free text;
- unpicked prompts never stored;
- the four named evidence answers;
- no levels, scores, counts or profiles;
- no Need to Build section;
- no direction names next to the learner's evidence;
- Work Clues end-only and read-only, with the empty state;
- the three-part snapshot;
- the completion rule and its persistence;
- cascade deletion;
- the personal-data rule;
- the Skills Finder kept out of 4.2.

No new sections, activities, state concepts or visual language were added.

## 4. Focused regression (v1.1)
- **4.2 suite:** 57/57 (the 47 earlier checks plus 10 content checks).
- **4.1 regression:** 78/78.
- **Responsive:** 390 / 820 / 1366 / 1600 px, no overflow.
- **Keyboard and accessibility:** pass.

| Item | Result |
|---|---|
| A. No direction names connected to evidence | PASS |
| B. No scoring, ranking, matching or recommendation language | PASS |
| C. No pattern counts or totals | PASS |
| D. No evidence numbers, meters or bars; all options look identical | PASS |
| E. No "Yes / Some / Need Practice" wording | PASS |
| F–H. The four evidence definitions appear verbatim (v0.3 §9) | PASS |
| I. "I have not done this yet" is valid and completes | PASS |
| J. No automatic tags on free text | PASS |
| K. Unpicked prompts never stored | PASS |
| L. Completion requires a learner-made tag | PASS |
| M. Completion persists after edits and deletions | PASS |
| N. Cascade deletion | PASS |
| O. Work Clues independent of evidence, end-only, read-only | PASS |
| P. No names, "where" or "for whom" requested | PASS |
| Q. Locked transition copy | PASS |
| R. No Skills Finder in 4.2 | PASS |
| Every reference uses "This task involves X because"; no identity or suitability language | PASS |
| No Skills Finder task wording reused | PASS |

## 5. Open items for owner approval
1. **All 51 task prompts and reference explanations.** This is the remaining approval gate before merging.
2. **The four prompt changes above.**
3. **Implementation wording not in either brief:**
   - Section 1: "Where does this experience come from?", "Add this experience", and "A few words about what this experience was (optional, no names needed)";
   - Section 2: "Add only the tasks you want to look at. You can pick from the short list or write your own." and "Or add a task in your own words";
   - Section 4: "Choose the pattern or patterns you see in each task.", "Compare with a reference", the footnote "This is one way to see it. Your own experience of this task may have involved different work.", and "This task uses a specific tool or system";
   - the snapshot note "This is your own working view, not a résumé…";
   - the completion checklist lines.
4. **v0.3 §22 vs §16.** §22 still lists "Work Clues access" among the patterns to reuse, which contradicts §16 and the owner's instruction. The build follows §16 (end-only). Suggest editing §22 in the brief when convenient.
