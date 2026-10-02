# Stage 4 · Module 4.2 v1.0 — Build & QA Report

**Build date:** 3 Oct 2026 · **Branch:** `module-4-2` (not merged, not deployed)
**Sources:** `PVA_Module_4.2_Build_Brief_v1.0.md`, build prompt. `PVA_Module_4.2_Design_Brief_v0.3_LOCKED.md` was referenced but not supplied.
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
   - tool flags (3 prompts);
   - the reference footnote ("This is one way to see it…");
   - UI labels such as "Add this experience", "Compare with a reference", "This task uses a specific tool or system", "No patterns chosen yet" and the completion checklist lines.
3. **Design Brief v0.3 LOCKED not supplied.** Built from Build Brief v1.0 only. If v0.3 differs (for example, transition copy to 4.3), the build may need an update.
4. **Transition copy.** No 4.2 → 4.3 transition text beyond the Work Clues handoff line. The "NEXT: 4.3 … Coming later" marker is implementation wording.
5. **Capability question** is display-only. No answer is collected, per §9 "prefer not to persist".
