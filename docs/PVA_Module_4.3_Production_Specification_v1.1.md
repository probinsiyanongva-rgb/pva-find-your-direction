# PVA Beginner VA Journey — Stage 4
## Module 4.3 Production Specification v1.1
**Learner-facing title:** Exploring Possible Directions  
**Module identifier:** 4.3 MATCH (internal only)  
**Status:** Production specification v1.1 — owner decisions of 14 Oct 2026 applied. Implementation is NOT yet authorized (see §11).  
**Design authority:** `PVA_Module_4.3_Design_Brief_v0.3_LOCKED.md`  
**Previous modules:** 4.1 WORK; 4.2 ME  
**Next module:** 4.4 DIRECTION

## Change log — v1.1 (14 Oct 2026)

Owner decisions applied after the design-to-code reconciliation against `probinsiyanongva-rgb/pva-find-your-direction`. Nothing else in v1.0 was changed.

1. **Title.** The learner-facing title is **Exploring Possible Directions**. This matches the live hub and module sidebars. "Exploring Where Work and Experience Connect" is retired as a title.
2. **Side-by-side comparison retained** as an optional view (Brief §14). It is now specified in Screen 5A. It shows learner-authored content only. On narrow screens it stacks instead of using columns.
3. **OPERATE wording.** The existing 4.1 and 4.2 definitions stay unchanged. Any pattern definition shown in 4.3 reuses the 4.1 wording verbatim (rule 13).
4. **Data protection.** A guard release that never overwrites unreadable or newer saved progress is deployed before any schema v3 release. It is the oldest version that may be redeployed (§4).
5. **"Download saved data"** banner approved. It is shown only when saved progress cannot safely be read.

Brief §14's comparison rows included two rows of Direction Card content ("What the work involves" and "Work patterns commonly involved"). Under decision 2 those rows are not part of the comparison. The card stays one action away through **Examine this direction**.

---

## 1. Purpose and outcome

Module 4.3 helps learners consider where the work they explored in 4.1 and their own recorded experience in 4.2 connect.

By the end, a learner should be able to:
- inspect at least one VA direction using its actual work description;
- review their own Work Clues and recorded task evidence;
- deliberately choose which of their own tasks to consider beside a direction;
- record a personal judgment and a reason, including an honest “not sure yet”;
- choose zero, one, or two provisional directions for further exploration, or explicitly remain undecided;
- identify questions or learning they want to investigate before making a stronger decision.

A direction is an exploration choice, not a career identity, qualification, or employability claim.

## 2. Non-negotiable design rules

1. No scoring, ranking, weights, similarity calculations, recommendations, or “best match.”
2. No inferred connection between a Work Clue, a task, a pattern tag, and a direction.
3. The learner explicitly selects any 4.2 task they want to consider alongside a direction. Selection may be none, one, or several.
4. Direction cards appear in one fixed, neutral order, independent of learner data or prior selections.
5. Shared work-pattern tags may be displayed descriptively but must not calculate a connection.
6. Do not describe the learner as suited, naturally good, qualified, ready, or a strong match for a direction.
7. The learner may remain undecided and still complete the module honestly.
8. Do not require a minimum number of directions, positive reactions, evidence items, or pattern tags.
9. Missing Work Clues or 4.2 evidence must not block progress. Explain what is missing neutrally and let the learner continue.
10. Do not redesign 4.1 or 4.2 while implementing 4.3.
11. No paid tools, accounts, or external services are required.
12. Keep personal data minimal. Remind learners not to include employer, client, school, or family names in notes.
13. **Pattern definitions.** Where 4.3 shows a definition for a work pattern, it uses the 4.1 wording verbatim from the canonical 4.1 pattern list (`PVA_M41.PATTERNS` in `public/shared/m41-data.js`). It does not keep its own copy. For OPERATE this is: “Keeping a recurring business process running inside the tools and systems used by the business.” The 4.1 and 4.2 definitions are not changed as part of 4.3.

## 3. Learner journey and screen specification

### Screen 0 — Module entry

**Heading:** Exploring Possible Directions  
**Opening copy:**
“You’ve looked at different kinds of VA work. You’ve also looked at tasks you’ve actually done. Now let’s put those two views side by side—not to give you a score, but to help you decide what might be worth exploring next.”

Explain:
- there is no test result or automatic recommendation;
- the learner makes the decisions;
- they may change their mind;
- choosing “Not sure yet” is valid.

Primary action: **Start exploring**  
Secondary navigation: existing Stage 4 module navigation.

### Screen 1 — Bring forward my Work Clues

**Prompt:** “Before we compare directions with your experience, let’s remember what caught your attention when you looked at the work.”

Display existing `workClues` read-only, grouped by the learner’s saved reaction:
- Want to explore
- Not sure yet
- Probably not for me

For each clue, show the concrete work description, saved reaction, and optional note if present. Do not derive or summarize a pattern profile.

**Empty state:** “You haven’t saved any Work Clues yet. That’s okay. You can continue and use what you notice as you explore the directions below.” Action: **Continue without Work Clues**.

Progress flag: `reviewedWorkClues = true` when the learner reaches this screen and continues, whether clues exist or not.

### Screen 2 — Bring forward what I have done

**Prompt:** “Now let’s look at tasks you recorded. These are examples of what you’ve done—not a score of what you can or can’t do.”

Display actual 4.2 experience/task records in a concise read-only view. Each task shows:
- experience source/category;
- task label;
- selected evidence answer;
- learner-selected work-pattern tags, if any;
- optional note, if present.

Do not ask the learner to repeat 4.2. Do not tally, score, rank, group, or sort tasks by evidence answer or pattern. Use stable neutral ordering consistent with the existing 4.2 display.

**Empty state:** “You haven’t recorded task evidence in 4.2 yet. You can still explore the directions, but you’ll have less personal experience to compare for now.” Action: **Continue without task evidence**.

Progress flag: `reviewedEvidence = true` when the learner continues from this screen, whether records exist or not.

### Screen 3 — Choose a direction to examine

**Heading:** “Which kind of work would you like to look at?”  
**Copy:** “Choose any direction that you want to understand better. The order below is fixed and does not indicate a ranking.”

Show all canonical 4.1 Direction Cards in the exact established neutral order. Reuse their canonical content; do not rewrite or fork card data. Each card provides an **Examine this direction** action.

Opening a card is exploration activity, not completion by itself. Do not reorder cards based on Work Clues, evidence, pattern tags, previous selections, or stored state.

### Screen 4 — Direction connection view

For the selected direction, display three visually distinct sections.

**A. What this direction involves**  
Reuse the canonical Direction Card fields:
- direction name;
- what the work involves;
- task examples;
- patterns commonly involved;
- work environment;
- what can be demanding;
- typical starting point;
- useful skills;
- what would need to be learned.

Do not modify the canonical card content as part of 4.3.

**B. What I have done that I want to consider**  
Show the learner’s 4.2 tasks as a neutral list with checkboxes. No tasks are preselected. Prompt:
“Which of your recorded tasks, if any, would you like to consider alongside this direction?”

The learner may select none, one, or multiple tasks. Selection is deliberate, stored by stable task ID, and scoped to this direction. The system must not suggest which task to select.

If no task records exist, show the Screen 2 empty-state explanation and let the learner continue.

**C. What may be new for me**  
Prompt:
“Look at the work and task examples above. Which parts have you not tried yet, or do you want to understand better?”

The learner—not the system—identifies what is new. Provide an optional short reflection field and optional learning-question entries. Never automatically compare task labels to direction tasks, infer gaps, or label anything a deficiency.

Suggested prompt examples:
- “Which task here have I not tried?”
- “What tool or process would I need to learn about?”
- “What would I want to see or practise before deciding?”

**Direction judgment**
Ask: “For now, how do you feel about exploring this direction further?”
Options:
- **Want to explore** — “I can imagine investigating this kind of work.”
- **Not sure yet** — “I need more information or experience before I know.”
- **Probably not for me right now** — “I don’t want to prioritize this direction at the moment.”

Optional reason prompt:
“What makes you think that?”
Allow a short optional note. Also offer an explicit choice: **I don’t have a reason to add yet**. This choice is valid and satisfies the reason/uncertainty checkpoint.

The judgment describes the learner’s current reaction, not competence or suitability.

**Save action:** **Save my reflection**  
After saving, show a quiet confirmation: “Saved. You can revisit or change this reflection later.” Then offer:
- **Examine another direction**
- **Review my directions**
- **Continue to my provisional decision**

### Screen 5 — My provisional direction decision

**Heading:** “What would you like to explore next?”  
**Copy:** “You don’t have to settle on a specialization now. Based on what you’ve reviewed, choose up to two directions you want to investigate further—or leave yourself undecided for now.”

Show only directions the learner has deliberately examined and saved a judgment for. Present them in the same fixed canonical order, not by reaction or any other score.

Allow the learner to:
- select one direction;
- select two directions;
- select none and explicitly choose **I’m still undecided**.

Do not automatically select “Want to explore” directions. A learner may choose a direction despite uncertainty, or decline to prioritize a direction they previously wanted to explore. The choice belongs to the learner.

If no direction has been examined yet, ask the learner to examine and save a judgment for at least one direction before reaching this screen.

### Screen 5A — Optional: compare directions side by side

**Purpose:** let the learner look at what they themselves recorded for two directions at once. It is descriptive only. The learner makes the comparison.

**When available:** offer **Compare two directions** on Screen 5 and Screen 6 once the learner has saved a judgment for at least two directions. It is never required, and it does not count toward completion.

**Choosing what to compare:** the learner picks exactly two directions from those with a saved judgment. Nothing is preselected. Columns appear in the fixed canonical direction order, not in the order chosen and not by reaction.

**Rows.** These contain learner-authored content only, shown exactly as saved, with the same row order for both directions:

| Row label | Content (from the learner's saved exploration) | Empty state |
|---|---|---|
| My current judgment | The judgment label the learner chose | — (always present once saved) |
| Why I am considering it | The learner's reason | “No reason added yet” |
| Related experience I chose to consider | Labels of the 4.2 tasks the learner selected for this direction, resolved from the current 4.2 records | “No tasks selected” |
| What may be new for me | The learner's “what may be new” reflection | “Nothing added yet” |
| What I want to learn | The learner's learning questions | “Nothing added yet” |

Direction Card content (what the work involves, patterns, environment and so on) is **not** shown in the comparison. The direction name heads each column and links to **Examine this direction**.

**Must not appear:** a score, percentage, ranking, “winner”, recommendation, salary, demand, difficulty, any count or total, highlighted differences, or any system-written text about either direction.

**Layout:**
- **Wide screens:** a table with a row-header column and one column per direction.
- **Narrow screens** (the existing Stage 4 mobile breakpoint, under 960px): stacked. Direction A's block is shown in full first, then Direction B's, and each block repeats the same row labels as headings. No horizontal scrolling, and no multi-column table.
- Use semantic table markup (wide) or headings and lists (stacked). Do not rely on colour alone.

**State:** nothing new is stored. The comparison is a view of saved explorations. Which two directions are being compared is transient UI state.

### Screen 6 — Review and finish

Display a concise, editable summary titled **My Directions to Explore**.

For each direction selected for further exploration, show:
- direction name;
- learner’s stated reason, or “No reason added yet”;
- learner-selected related task references and their labels, if any;
- learner’s reflection on what may be new;
- learning questions, if any.

If the learner chose to remain undecided, show:
“I’m not choosing a direction yet. I want to keep exploring before I decide.”
Optionally let them add a short note about what information they want next.

**Completion action:** **Save and finish Module 4.3**

Completion is reached only after the learner has:
1. continued past the Work Clues review (with or without clues);
2. continued past the evidence review (with or without task records);
3. examined at least one named direction;
4. saved a judgment for at least one direction;
5. recorded a reason or explicitly chosen “I don’t have a reason to add yet” for that direction;
6. reached the provisional decision step;
7. selected at least one direction or explicitly chosen to remain undecided.

Do not require positive reactions, multiple directions, any minimum evidence, or learning questions. Completion persists after later edits or deletions, consistent with Stage 4 conventions.

On completion, show a summary of the saved contribution and an explicit transition:
“Next, in 4.4, you’ll turn what you’ve learned into a practical direction plan: what to explore, what to practise, and what to do next.”

Primary action: **Continue to Module 4.4**  
Secondary action: **Review my Module 4.3 reflections**

## 4. State and data requirements

The existing shared Stage 4 store remains the only source of truth. The exact property names below are conceptual and must be adapted to the live `state.js`/normalization conventions after inspection.

Conceptual module-specific fields:
- `modules["4-3"].completed`
- `modules["4-3"].reviewedWorkClues`
- `modules["4-3"].reviewedEvidence`
- `modules["4-3"].examinedDirectionIds` (stable IDs)
- `modules["4-3"].directionExplorations[]`
- `modules["4-3"].decisionReached`
- `modules["4-3"].undecided`
- `modules["4-3"].selectedDirectionIds[]` (0–2, selected explicitly)

Each `directionExplorations` record should minimally contain:
- stable `directionId`;
- learner-selected `reaction` (`want`, `unsure`, `not_now`);
- `reason` string, optional;
- explicit `reasonSkipped` boolean where used;
- `relatedEvidenceIds[]` containing only task IDs the learner deliberately selected;
- learner-authored `whatMayBeNew` string, optional;
- learner-authored `learningQuestions[]`, optional;
- saved/update metadata only if required by the existing architecture.

Do not duplicate Work Clues or 4.2 task records. Store references to source records. Never store computed match scores, pattern counts, inferred gaps, recommended directions, or a generated learner profile.

### Migration and validation
- **Prerequisite (owner decision, v1.1):** the Phase 0 data-protection guard must be deployed before any schema v3 release.
  - The guard never overwrites saved progress the running version cannot read. It offers **Download saved data** instead.
  - The guard release is the oldest version that may be redeployed after v3 ships.
  - The v3 implementation must keep the guard, so that a future v4 is protected the same way.
- Inspect the exact production schema and current `pva-stage4-progress` shape before coding.
- Increment the schema version only according to established Stage 4 migration conventions.
- Preserve all valid 4.1 and 4.2 data through migration.
- Existing backups remain restorable; new 4.3 data must round-trip through Export/Restore.
- Reject unsupported future schemas and malformed data safely, with a clear user-facing message and no silent data loss.
- Validate stable direction/task IDs against known canonical/source records.
- Cap selected directions at two; disallow duplicate IDs and invalid reaction values.
- Sanitize or length-limit free-text fields using existing application conventions.
- Keep data in the learner’s browser; no network submission or external analytics.

## 5. Navigation, visual design, accessibility

- Extend the existing Stage 4 application and visual language; do not create a microsite.
- Preserve the existing navigation, progress indicators, local persistence, Export/Restore, typography, design tokens, and responsive patterns.
- Mark current module and completed state accessibly.
- Use semantic headings, explicit labels, keyboard-operable controls, visible focus, and accessible status messages.
- On narrow screens, stack comparison areas in this order: direction work; learner-selected task evidence; what may be new; judgment.
- Keep selected task references visible in context so learners can understand what they selected.
- Do not rely on color alone to indicate reaction or selection.
- No unnecessary animation, gamification, celebratory scoring, or artificial completion meter.

## 6. Filipino-context content guardrails

Use concrete, familiar examples already present in the canonical Direction Cards and existing 4.1/4.2 content. Avoid assuming that learners have formal office experience, a degree, a paid tool, a client, or prior VA employment. Experience may come from personal responsibilities, community activities, informal work, or previous employment, as already defined in 4.2.

Do not ask for names of employers, clients, schools, family members, or private details. Keep notes focused on tasks and learning questions.

## 7. Explicit exclusions

4.3 must not teach or create:
- portfolio presentation;
- proposals, applications, or interviews;
- marketplace strategy or client positioning;
- job-readiness certification;
- earning-potential rankings;
- niche recommendations;
- personality types;
- “top three” or “best fit” results;
- automatic gap analysis;
- automatic task-to-direction matching;
- a new separate profile, store, or application.

Those boundaries preserve the distinction between exploration in Stage 4 and later practice/proof or market-entry work.

## 8. Acceptance test matrix

### Core learner journey
- [ ] New learner with no Work Clues and no 4.2 evidence can complete 4.3 honestly after examining a direction and explicitly remaining undecided.
- [ ] Learner with Work Clues sees the actual saved clues and reactions; none are converted into recommendations.
- [ ] Learner with 4.2 evidence sees actual tasks, evidence answers, and selected pattern tags without scores or totals.
- [ ] Direction cards remain in the same canonical order for different learner profiles.
- [ ] No task is preselected in the connection view.
- [ ] Learner can select none, one, or several tasks for a direction.
- [ ] Learner can record each of the three reactions; negative or uncertain reactions are not treated as failure.
- [ ] Learner can explicitly skip adding a reason and still satisfy the reason checkpoint.
- [ ] Learner can select one or two directions, or explicitly remain undecided.
- [ ] No direction is preselected in the final decision.
- [ ] Completion cannot be earned by opening cards alone.
- [ ] Completed status remains complete after editing or deleting evidence, per existing convention.

### Data integrity
- [ ] Existing 4.1 completion, Work Clues, and explored-direction records survive migration.
- [ ] Existing 4.2 experiences, tasks, evidence answers, and pattern tags survive migration.
- [ ] Existing 4.1/4.2 screens and interactions pass regression checks.
- [ ] 4.3 state persists after refresh and browser restart.
- [ ] Export then Restore reproduces the 4.3 reflections and selections.
- [ ] Legacy backup restore remains supported.
- [ ] Unsupported future schema and malformed backup are rejected safely.
- [ ] Deleting a source task does not leave an invalid/orphan evidence reference in 4.3; behavior follows existing deletion/normalization conventions.
- [ ] No duplicate Work Clue/task source records are created.
- [ ] No scoring, ranking, frequency count, similarity computation, or recommendation exists in code or UI.
- [ ] Opening any Stage 4 page with saved data from a newer schema leaves it byte-identical and shows **Download saved data** (guard regression).
- [ ] All Phase 0 baseline and golden tests in `tests/` still pass.

### Optional comparison (Screen 5A)
- [ ] Offered only once two or more directions have a saved judgment. Never required for completion.
- [ ] No direction is preselected for comparison. Columns follow the canonical order.
- [ ] Only the five learner-authored rows appear. No Direction Card content, counts, or system-written text.
- [ ] Empty rows show the specified empty-state text.
- [ ] At narrow widths the comparison stacks, with no horizontal scrolling.
- [ ] Task labels reflect the current 4.2 records, and deleted tasks do not appear.

### Accessibility and responsive behavior
- [ ] Full keyboard operation for cards, checkboxes, reaction controls, and decision controls.
- [ ] Visible focus states and semantic labels.
- [ ] Screen-reader status announces saved/completed feedback.
- [ ] Narrow viewport comparison layout is usable without horizontal scrolling.
- [ ] Selection is not communicated by color alone.

### Release gate
- [ ] Run full Stage 4 regression for 4.1, 4.2, and 4.3.
- [ ] Run automated tests and manual smoke tests on desktop and narrow screens.
- [ ] Inspect browser console for errors.
- [ ] Confirm Export/Restore and schema migration using representative old and new backups.
- [ ] Confirm public module navigation and the 4.3 → 4.4 handoff.
- [ ] Record test results and any known limitations before deployment.

## 9. Required codebase inspection before implementation

This document defines intended behavior, not permission to guess the live implementation. Before coding, inspect:
- current repository and entry points;
- `state.js` or equivalent shared store;
- current schema version and migration functions;
- persistence key and local-storage behavior;
- validation/normalization;
- Export/Restore format and error handling;
- canonical Direction Card IDs, order, and content source;
- 4.2 task/evidence record schema and delete behavior;
- current module routing/navigation and completion indicators;
- existing automated test setup.

If any required data or architecture differs from this specification, report the exact conflict and propose the smallest compatible adjustment before making a destructive or irreversible change.

## 10a. Pattern definitions (v1.1)

| Pattern | Wording shown in 4.3 (= 4.1, `m41-data.js`) |
|---|---|
| ORGANIZE | Arranging information so people can find, understand, and use it. |
| COMMUNICATE | Helping information move clearly between people. |
| RESEARCH | Finding, checking, comparing, and analyzing information so someone can make a decision or take action. |
| CREATE | Producing useful content or visual material. |
| OPERATE | Keeping a recurring business process running inside the tools and systems used by the business. |

## 10. Handoff to implementation

Implementation should use this spec and the locked v0.3 design brief together. Do not ask an implementation agent to redesign the module. Ask it to inspect first, report the actual schema and source files, implement the smallest compatible extension, run the acceptance tests, and return:
1. files changed;
2. schema/migration details;
3. tests run and results;
4. regression evidence for 4.1 and 4.2;
5. unresolved issues;
6. deployment status (never claim deployment unless verified).

## 11. Decisions still open before the 4.3 build (as of v1.1)

These must be recorded before 4.3 implementation is authorized:

1. Judgment labels and stored values. Brief: “Explore further / Not sure yet / Not for me right now”. This spec: “Want to explore / Not sure yet / Probably not for me right now”.
2. Whether learning questions are always offered (this spec) or only after “Explore” or “Not sure” (Brief §12).
3. Direction Card reuse: a shared read-only renderer (this changes `m41.js`), or 4.3 rendering from `PVA_M41.DIRECTIONS` with a consistency test. Also whether `patternsNote` and `related` are shown.
4. Explicit **Save and finish** (this spec) versus automatic completion (the 4.2 convention).
5. Whether one shared backup-summary function replaces the per-page copies in `home.js`, `m41.js` and `m42.js`.
6. Canonical direction order: confirm the live 4.1 order (General Admin → … → NDIS) as the fixed order.
