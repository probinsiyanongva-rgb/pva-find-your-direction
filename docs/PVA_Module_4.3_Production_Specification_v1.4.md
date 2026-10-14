# PVA Beginner VA Journey — Stage 4
## Module 4.3 Production Specification v1.4
**Learner-facing title:** Exploring Possible Directions  
**Module identifier:** 4.3 MATCH (internal only)  
**Status:** Production specification v1.4 — draft for owner review. Records the six reconciled decisions, the nine further owner decisions and the reason-switching rule of 14 Oct 2026 (§11). Approving this document approves the design only; implementing Module 4.3 is a separate owner decision.  
**Design authority:** `PVA_Module_4.3_Design_Brief_v0.3_LOCKED.md`. **The locked brief stays authoritative.** The brief file is not edited. Where this specification adopts a resolution that differs from the brief, the difference and the owner decision behind it are documented: in §12 (decisions from v1.1) and in §11 D10–D13 (decisions from v1.3).  
**Previous modules:** 4.1 WORK; 4.2 ME  
**Next module:** 4.4 DIRECTION

## Change log — v1.4 (14 Oct 2026, draft for owner review)

One clarification raised in the review of v1.3; nothing else changed. v1.3 is kept unchanged in `docs/` as history.

1. **Reason-switching rule (D16):**
   - **at most one answer:** a saved exploration never has both an active `reason` and `reasonSkipped: true`;
   - **typing a reason** switches `reasonSkipped` off;
   - **choosing “I don’t have a reason to add yet” when nothing is written** sets `reasonSkipped`;
   - **choosing it while a reason is written** asks first. OK removes the reason; Cancel keeps it and leaves the option unselected.

   This follows the owner's choice to never silently delete learner-written text, the same principle as the learning-question retention rule. The rule is now stated in Screen 4, the §4 data model, the §8 acceptance criteria and §11 D16.

## Change log — v1.3 (14 Oct 2026, draft for owner review)

Owner decisions on the nine items left open in v1.2 §12, plus one correction. v1.2 is kept unchanged in `docs/` as the record of the previous review.

1. **Correction (decision 5):** 4.1 backups gain **three** summary fields (`module42Complete`, `module43Complete`, `experiences`), not two as v1.2 §11 stated. The §4 combined shape was already correct and is unchanged.
2. **Reason prompt (D7):** the brief's “Why am I considering this direction?”. Its guidance prompts are shown as examples to help the learner write; they are not selectable answers and are never stored. Only the learner's own reason text, or the explicit “I don't have a reason to add yet” choice, is saved.
3. **Empty-state copy (D8):** the brief's wording (§22), keeping the **Continue without…** buttons.
4. **Transition copy (D9):** the brief's wording (§28).
5. **Task evidence (D10):** all available 4.2 tasks are shown neutrally; the learner chooses. No filtering by inferred relevance or automated matching.
6. **Pattern organization (D11):** tasks are never grouped or sorted by pattern.
7. **Artifact wording (D12):** “What may be new for me” is kept.
8. **Direction selection (D13):** one `selectedDirectionIds[]` list, at most two; no per-exploration selection flag.
9. **Learning question (D14):** the brief's prompt and its examples (§12). The examples are kinds of answer (a knowledge area, a tool or system…). This replaces the three example questions v1.2 had carried over from v1.0.
10. **Judgment explanation (D15):** “This is a separate choice about this direction. It doesn't change the Work Clues you saved in 4.1.”

§12 now lists only the three differences decided by the owner in v1.1. The other differences from the brief are recorded with their decisions in §11 (D10–D13).

## Change log — v1.2 (14 Oct 2026, draft for owner review)

Records the six decisions that were open in v1.1 §11. ChatGPT's review and Claude's recommendations were reconciled, and the owner confirmed the result. The full decision record, with rationale, risks and expected impact on 4.1 and 4.2, is in §11. Remaining differences between this specification and the locked brief are listed in §12.

1. **Judgment labels:** **Explore further / Not sure yet / Not for me right now** (the brief's wording), stored as `explore_further`, `unsure`, `not_now` in a field of their own, never in 4.1 Work Clues (Screen 4, §4).
2. **Learning questions** are offered after the judgment, only for Explore further and Not sure yet. They stay optional, and they are kept and shown if the judgment later changes (Screen 4).
3. **Direction Cards** in 4.3 are rendered from the canonical `m41-data.js` data, with a content-parity test against 4.1. The PPC "related specialization" notes and the Technical `patternsNote` are shown, informational only (Screens 3–4).
4. **Completion:** the explicit **Save and finish Module 4.3** action and the seven agreed criteria are confirmed (Screen 6).
5. **Backup summary:** one shared summary function and one combined informational summary. This intentionally standardizes the summaries that previously differed. Restore does not depend on the summary (§4).
6. **Direction order:** the verified 11-direction order of the rendered 4.1 cards is locked (Screen 3).

Consequence of decision 2: Screen 4 now runs A → B → C ("What may be new for me") → judgment and reason → learning questions (conditional).

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

**Empty state** (D8; brief §22, verbatim): “You don't have Work Clues saved from 4.1 yet. You can still explore directions here.” Action: **Continue without Work Clues**.

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

**Empty state** (D8; brief §22, verbatim): “You don't have experience records saved from 4.2 yet. You can still examine the directions and note what you would like to learn.” Action: **Continue without task evidence**.

Progress flag: `reviewedEvidence = true` when the learner continues from this screen, whether records exist or not.

### Screen 3 — Choose a direction to examine

**Heading:** “Which kind of work would you like to look at?”  
**Copy:** “Choose any direction that you want to understand better. The order below is fixed and does not indicate a ranking.”

Show all canonical 4.1 Direction Cards in the exact established neutral order. Reuse their canonical content; do not rewrite or fork card data. Each card provides an **Examine this direction** action.

**Locked order (decision 6).** This is the order of `PVA_M41.DIRECTIONS` in `public/shared/m41-data.js`. It is also the order of the rendered 4.1 cards, verified by regression test P5 (jsdom) and by Playwright E2 in real Chromium on the owner's machine (14 Oct 2026). 4.3 uses this order everywhere directions are listed: Screen 3, Screen 5, the Screen 5A columns, and Screen 6. 4.1 is not reordered or modified.

| # | Stable ID | Direction |
|---|---|---|
| 1 | `dir-general-admin` | General VA / Administrative Support |
| 2 | `dir-customer-support` | Customer Support VA |
| 3 | `dir-ecommerce` | E-commerce VA |
| 4 | `dir-amazon` | Amazon VA |
| 5 | `dir-bookkeeping` | Bookkeeping / Accounting Support |
| 6 | `dir-social-content` | Social Media / Content Support |
| 7 | `dir-executive-assistant` | Executive / Personal Assistance |
| 8 | `dir-real-estate` | Real Estate Support |
| 9 | `dir-lead-generation` | Lead Generation / Appointment Setting |
| 10 | `dir-technical` | Technical / Specialized VA Support |
| 11 | `dir-ndis` | NDIS VA |

Opening a card is exploration activity, not completion by itself. Do not reorder cards based on Work Clues, evidence, pattern tags, previous selections, or stored state.

### Screen 4 — Direction connection view

For the selected direction, display three visually distinct sections.

**A. What this direction involves**  
Render from the canonical `PVA_M41.DIRECTIONS` data in `m41-data.js` (decision 3). Do not copy the content into 4.3 files, and do not modify `m41.js` or `m41-data.js`. Show every learner-facing field, under the same field headings 4.1 uses:

| Card field (data key) | Heading used in 4.1 |
|---|---|
| direction name (`name`) | card title |
| direction number (`num`, “01”–“11”) | shown beside the title, as in 4.1 |
| what the work involves (`involves`) | “What does the work involve?” |
| patterns commonly involved (`patterns`) | “Work patterns commonly involved” |
| patterns note, where present (`patternsNote`; Technical only) | shown under the patterns, as in 4.1 |
| task examples (`tasks`) | “Examples of tasks” |
| work environment (`environment`) | “What kind of work environment?” |
| what can be demanding (`demanding`) | “What can be demanding about it?” |
| typical starting point (`path`, `pathNote`) | “Typical path” |
| useful skills (`skills`) | “Useful skills” |
| what would need to be learned (`learn`) | “What would you need to learn?” |
| related specialization note, where present (`related`; E-commerce and Amazon only) | shown after the card details, as in 4.1 |

**Not card content:** 4.1's Work Clue reaction control (“Would you want to explore this kind of work?”) and its “Show tasks, demands and path” toggle are 4.1 interactions. They are not reproduced in 4.3, and 4.3 never writes Work Clues.

**Content-parity test (required):** for every one of the 11 directions, the learner-facing text 4.3 displays must equal the text 4.1 displays for the same card, covering every field above including both notes. The test must fail if a field is missing, altered, or added.

**The notes are informational only.** The PPC note and the Technical `patternsNote` must never be used to match, rank, recommend, preselect, highlight or reorder a direction. They are displayed exactly as in 4.1, and nothing else.

Do not modify the canonical card content as part of 4.3.

**B. What I have done that I want to consider**  
Show **all** of the learner’s available 4.2 tasks as a neutral list with checkboxes (D10). Never filter, hide, highlight or shorten the list by inferred relevance or automated matching. Use the same stable order as Screen 2 (4.2's own order); never group or sort by pattern or evidence answer (D11). No tasks are preselected. Prompt:
“Which of your recorded tasks, if any, would you like to consider alongside this direction?”

The learner may select none, one, or multiple tasks. Selection is deliberate, stored by stable task ID, and scoped to this direction. The system must not suggest which task to select.

If no task records exist, show the Screen 2 empty-state explanation and let the learner continue.

**C. What may be new for me**  
Prompt:
“Look at the work and task examples above. Which parts have you not tried yet, or do you want to understand better?”

The learner—not the system—identifies what is new. Provide an optional short reflection field. This section is always shown, whatever the judgment. Never automatically compare task labels to direction tasks, infer gaps, or label anything a deficiency.

**Direction judgment** (decision 1)
Ask: “For now, how do you feel about exploring this direction further?”
Options (stored values in brackets; see §4):
- **Explore further** (`explore_further`) — “I can imagine investigating this kind of work.”
- **Not sure yet** (`unsure`) — “I need more information or experience before I know.”
- **Not for me right now** (`not_now`) — “I don’t want to prioritize this direction at the moment.”

Show this line with the judgment (D15): “This is a separate choice about this direction. It doesn't change the Work Clues you saved in 4.1.”

**Reason** (D7; brief §11)
Prompt: “Why am I considering this direction?”
Allow a short optional note (“a short optional note, not a reflection essay”). Also offer an explicit choice: **I don’t have a reason to add yet**. This choice is valid and satisfies the reason/uncertainty checkpoint.

Show the brief's guidance prompts beside the note field, as examples that help the learner write their own reason:
- Something about the work interests me.
- I have related experience.
- I want to learn this kind of work.
- I want to understand it better before deciding.
- Other.

**Guidance data rule (D7):**
- The guidance prompts are **plain, non-interactive text**: not checkboxes, radio buttons, chips, buttons, a dropdown or any other selectable control. Clicking them does nothing.
- They are **never stored**: no reason category, no selected-option field, no record of which prompt was read, and no count, score or analytics of reasons.
- Only two things are persisted: the learner's own **reason text** (`reason`), or their explicit **“I don’t have a reason to add yet”** choice (`reasonSkipped`).

**Switching between a reason and “I don’t have a reason to add yet”** (D16)
1. **Typing a reason:** when the note field holds any text other than blank space, save it as `reason` and set `reasonSkipped` to false. Only the flag is cleared; no text is lost.
2. **Choosing “I don’t have a reason to add yet” while the note field is empty:** set `reasonSkipped` to true. Nothing else changes.
3. **Choosing it while a reason is written:** ask first, “This will remove the reason you wrote. Remove it?”
   - **OK:** clear `reason` and set `reasonSkipped` to true.
   - **Cancel:** keep the reason exactly as written, and leave the option unselected.
4. **Never both active:** a saved exploration has either a non-empty `reason` or `reasonSkipped: true`, never both. A reason containing only blank space counts as empty and is not saved as a reason.
5. **Emptying the field by hand:** leaves neither active. The reason checkpoint (completion criterion 5) is then unmet until the learner writes a reason or chooses the option. If Module 4.3 was already completed, it stays completed, as elsewhere in Stage 4.
6. **No silent deletion:** a written reason is removed only by the learner deleting it, or by confirming OK in rule 3.

The judgment describes the learner’s current reaction, not competence or suitability.

**Learning questions** (decision 2; Brief §12)
- **When shown:** after the judgment, and only when the judgment is **Explore further** or **Not sure yet**. They are not offered for **Not for me right now**.
- **Optional:** never required for saving the reflection or for completing the module.
- **Prompt** (D14; brief §12, verbatim): “What would you need to learn or experience to understand this direction better?”
- **Examples** (brief §12): the answer can be
  - a knowledge area;
  - a tool or system;
  - a type of task;
  - a workflow;
  - a type of client environment;
  - hands-on practice.

  Like the reason guidance, these are plain non-interactive text and are not stored. The learner writes their own questions. Show the brief's reassurance too: they are not expected to know the complete learning path.
- **Retention:** if the learner entered questions and later changes the judgment to **Not for me right now**, the questions are **kept and still displayed**, and the learner can still edit or remove them. Learner-authored content is never silently deleted or hidden. Only a deliberate removal by the learner deletes a question.
- **Display elsewhere:** any saved questions are shown on Screen 5A and Screen 6 whatever the current judgment.

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

Do not automatically select directions judged “Explore further”. A learner may choose a direction despite uncertainty, or decline to prioritize a direction they previously wanted to explore. The choice belongs to the learner.

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
| What I want to learn | The learner's learning questions, shown whatever the current judgment (Screen 4 retention rule) | “Nothing added yet” |

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

**Completion action:** **Save and finish Module 4.3** (decision 4: explicit action confirmed; 4.1 and 4.2 keep their automatic completion)

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
(D9; brief §28, verbatim) “You've looked at the work. You've looked at what you've actually done. Now you've put those two views side by side.” / “Next, we'll turn the directions you're exploring into a practical next step.”

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
- `modules["4-3"].selectedDirectionIds[]` (0–2, selected explicitly). This is the **only** store of the provisional choice; there is no per-exploration `selectedForNextStep` flag (D13)

Each `directionExplorations` record should minimally contain:
- stable `directionId`;
- learner-selected `judgment`: one of `explore_further`, `unsure`, `not_now` (decision 1). This is a field of its own in `modules["4-3"]`. It is never written to, copied into, or derived from 4.1 `workClues`, and existing Work Clue values (`explore`, `unsure`, `not_for_me`) are not renamed or migrated;
- `reason` string, optional: the learner's own words only (D7). Stored only when it contains text other than blank space;
- explicit `reasonSkipped` boolean, true only when the learner chose “I don’t have a reason to add yet” (D7);
- **at most one is active (D16):** never a non-empty `reason` together with `reasonSkipped: true`. Transitions follow the Screen 4 switching rule. A written reason is cleared only by the learner deleting it, or by confirming removal. Validation on load and restore must not keep both: if a stored record has both, keep the learner's `reason` text and set `reasonSkipped` to false, so text is never dropped;
- **no** reason category, guidance-prompt selection, or reason analytics field of any kind (D7);
- `relatedEvidenceIds[]` containing only task IDs the learner deliberately selected;
- learner-authored `whatMayBeNew` string, optional;
- learner-authored `learningQuestions[]`, optional. Kept when the judgment changes (Screen 4 retention rule);
- saved/update metadata only if required by the existing architecture.

Do not duplicate Work Clues or 4.2 task records. Store references to source records. Never store computed match scores, pattern counts, inferred gaps, recommended directions, or a generated learner profile.

### Backup summary (decision 5)

**Today, on `main` at the time of writing,** the informational `summary` written into every backup file comes from several different places, and they produce different shapes:

| Source | Used by | Shape |
|---|---|---|
| `home.js` (`wireTools` option) | Stage 4 home page and Progress page | `{ workClues, module41Complete, module42Complete, experiences, schemaVersion }` |
| `m41.js` `summary()` | Module 4.1 | `{ workClues, module41Complete, schemaVersion }` |
| `m42.js` `summary()` | Module 4.2 | same shape as `home.js` |
| `state.js` `exportProgress()` fallback | any call without a summary function | `{ workClues }` |

**Decision:** replace these with **one shared summary function** in the shared state layer and **one combined informational summary**, used by the hub, the Progress page, 4.1, 4.2 and 4.3. This **intentionally standardizes** the previously different summaries: a backup exported from 4.1 will carry the same summary fields as one exported from the hub.
- **Combined shape:** `{ workClues, module41Complete, module42Complete, module43Complete, experiences, schemaVersion }`.
- **4.3 adds only the completion flag** `module43Complete`. It does not add counts of examined or selected directions, judgments or tasks, so the summary cannot become a tally or profile.
- **Not covered:** the separate summary inside a **Download saved data** file (guard: `savedSchemaVersion`, `readableByThisVersion`). It describes protected data and stays unchanged.

**Restore does not depend on the summary.** This was verified in the code: `validateBackup()` and `restoreFromFile()` never read `payload.summary`. Restore decides only from `format`, `version` and `data`, and builds its confirmation message from the restored data. Changing the summary therefore cannot change what restores. Implementation must keep it that way, with a test proving that a backup with a missing or altered `summary` restores identically.

**Regression expectations are updated deliberately, not silently.** Page test P4 currently asserts the hub's summary shape exactly. When the shared function lands, P4 is updated to the combined shape in the same commit, and the change is recorded in that commit message and its build report. The golden snapshots are not affected, because they contain `data`, not `summary`.

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
- [ ] 4.3's direction order equals the locked table in Screen 3 and the rendered 4.1 order (same 11 stable IDs, same sequence).
- [ ] Content-parity test: every learner-facing card field 4.3 shows equals 4.1's for all 11 directions, including the PPC notes (E-commerce, Amazon) and the Technical `patternsNote`.
- [ ] The notes never affect order, highlighting, selection or any stored value.
- [ ] No task is preselected in the connection view.
- [ ] The connection view lists every available 4.2 task (count equals 4.2's task count) in 4.2's own stable order: never filtered by relevance, and never grouped or sorted by pattern or evidence.
- [ ] Selecting a third direction is impossible; the provisional choice is stored only in `selectedDirectionIds` (0–2), with no per-exploration selection flag.
- [ ] Learner can select none, one, or several tasks for a direction.
- [ ] Learner can record each of the three judgments (Explore further / Not sure yet / Not for me right now); negative or uncertain judgments are not treated as failure.
- [ ] The judgment shows the D15 line exactly: “This is a separate choice about this direction. It doesn't change the Work Clues you saved in 4.1.”
- [ ] The reason prompt is “Why am I considering this direction?”; the five guidance prompts appear as plain non-interactive text. There is no checkbox, radio, chip, button or select for them, and clicking them changes nothing.
- [ ] After saving with and without a reason, the stored exploration contains exactly one active answer: a non-empty `reason` (learner text) or `reasonSkipped: true`, never both (D16). No reason category, guidance selection or reason analytics field exists in state or in an exported backup.
- [ ] D16 rule 1: with “I don’t have a reason to add yet” chosen, typing a reason saves `reason` and sets `reasonSkipped` to false.
- [ ] D16 rule 2: with the field empty, choosing the option sets `reasonSkipped` to true without asking.
- [ ] D16 rule 3: with a reason written, choosing the option asks first. **Cancel** leaves the reason byte-identical and the option unselected; **OK** clears `reason` and sets `reasonSkipped` to true.
- [ ] D16 rule 4: a reason of only blank space is not saved as a reason; no saved exploration ever has both a non-empty `reason` and `reasonSkipped: true`, including after reload and Export/Restore.
- [ ] D16 rule 5: emptying the field by hand leaves neither active; the reason checkpoint is unmet until the learner acts, and an existing completion is kept.
- [ ] A restored or stored record that has both a `reason` and `reasonSkipped: true` is normalized to keep the `reason` text with `reasonSkipped` false.
- [ ] The learning-question prompt and its six answer-type examples match brief §12; the examples are non-interactive and not stored.
- [ ] The empty states on Screens 1 and 2 match brief §22 exactly, and both **Continue without…** buttons work.
- [ ] The completion transition matches brief §28 exactly.
- [ ] Judgments are stored as `explore_further` / `unsure` / `not_now` in `modules["4-3"]` only; 4.1 `workClues` are byte-identical before and after using 4.3.
- [ ] The learning-question prompt appears after the judgment only for Explore further and Not sure yet, never for Not for me right now; questions are never required.
- [ ] Questions entered under Explore further or Not sure yet are kept and still displayed after the judgment changes to Not for me right now; they disappear only when the learner removes them.
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
- [ ] Backups exported from the hub, Progress page, 4.1, 4.2 and 4.3 all carry the one combined summary shape (§4).
- [ ] **Executed test required (not document inspection):** a backup whose `payload.summary` is missing, or altered, restores exactly like the same backup with the correct summary: same restored state, same confirmation message. This must be an automated acceptance test that runs the real Restore code.
- [ ] Test P4's expectation is updated to the combined shape deliberately, and the change is recorded in the commit message and build report.
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

## 11. Decision record (v1.2–v1.4)

Decisions 1–6: the six decisions open in v1.1 §11, as reconciled on 14 Oct 2026 and confirmed by the owner (recorded in v1.2; decision 5's impact corrected in v1.3). D7–D15: the nine items left open in v1.2 §12, decided by the owner on 14 Oct 2026 (recorded in v1.3). D16: the reason-switching rule, decided by the owner on 14 Oct 2026 after review of v1.3 (recorded in v1.4). Every decision keeps the brief's non-negotiables: no scoring, ranking, matching, recommendations or preselection.

### Decision 1 — Judgment labels and stored values
- **Decision:** **Explore further / Not sure yet / Not for me right now**, stored as `explore_further`, `unsure`, `not_now` in `modules["4-3"]`, independent of 4.1 Work Clues.
- **Rationale:** the v1.1 label “Want to explore” is word-for-word the 4.1 Work Clue label, so learners could think they are answering the same question twice. 4.3's judgment is a different act: a decision about a named direction after considering their own tasks. The brief's wording (§7, §11) keeps the two distinct.
- **Principal risks:**
  - the new wording may feel less familiar (mitigated by the one-line explanation on Screen 4);
  - a coding slip could write into `workClues` (guarded by an acceptance test).
- **Impact on 4.1/4.2:** none. Work Clue values and labels are not renamed or migrated.

### Decision 2 — When learning questions are offered
- **Decision:** after the judgment, only for Explore further and Not sure yet. Always optional. Retained and displayed if the judgment later changes to Not for me right now. Learner-authored content is never silently deleted.
- **Rationale:** follows locked Brief §12. Those two judgments naturally invite investigation, and a learner who isn't prioritizing a direction shouldn't be asked to produce questions to finish.
- **Principal risks:**
  - Screen 4's order changes (now A → B → C → judgment → questions), which must be reflected in the build;
  - questions entered under one judgment could look orphaned under Not for me right now (handled by the retention rule);
  - an implementation might hide or drop them (guarded by an acceptance test).
- **Impact on 4.1/4.2:** none.

### Decision 3 — Direction Card reuse and the two notes
- **Decision:** render in 4.3 from the canonical `m41-data.js` data, with a content-parity test against 4.1. Keep the renderer isolated to 4.3. Show the PPC “related specialization” notes and the Technical `patternsNote`, informational only.
- **Rationale:** the data is already shared, while the renderer lives inside the live 4.1 script. Rendering separately avoids changing 4.1, and the parity test catches drift. The PPC note is cautionary (“requires additional training and practice”), not a course plug, so showing it keeps the cards identical to 4.1.
- **Principal risks:**
  - a second renderer can drift in layout or drop a field (mitigated by the parity test, which covers every field including the notes);
  - the notes could be misused as signals (forbidden by the non-negotiables and an acceptance test).
- **Impact on 4.1/4.2:** none. `m41.js` and `m41-data.js` are not modified.

### Decision 4 — Completion
- **Decision:** keep the explicit **Save and finish Module 4.3** action and the seven completion criteria in Screen 6.
- **Rationale:** 4.3 ends in a deliberate provisional decision, or an explicit choice to stay undecided. A finish action lets the learner confirm what is saved, and it separates saving one reflection from finishing the module.
- **Principal risks:** extra friction (kept to the final review step, with no repeated work). The button must not require a positive judgment, multiple directions, prior experience or learning questions.
- **Impact on 4.1/4.2:** none. They keep their automatic completion.

### Decision 5 — Backup summary
- **Decision:** one shared summary function and one combined informational summary (§4), intentionally standardizing the previously different summaries.
- **Rationale:** the separate copies had already drifted (see the §4 table). Adding a fourth module-specific copy would extend that.
- **Principal risks:**
  - the refactor touches live 4.1/4.2 code (mitigated by the regression suite, the deliberate P4 update, and the Restore-independence test);
  - the summary could grow into a profile (prevented: 4.3 adds only `module43Complete`).
- **Impact on 4.1/4.2:**
  - **yes, internally:** `m41.js`, `m42.js` and `home.js` stop building their own summaries;
  - **visible:** 4.1 backups gain **three** summary fields: `module42Complete`, `module43Complete` and `experiences`. The existing 4.1 summary has three fields (`workClues`, `module41Complete`, `schemaVersion`); the combined summary has six. (Corrected in v1.3; v1.2 said two.)
  - **unchanged:** what restores, all learning activities, and all screens.

### Decision 6 — Direction order
- **Decision:** lock the verified 11-direction order of the rendered 4.1 cards (Screen 3 table) for every 4.3 list.
- **Rationale:** continuity with 4.1, and no implied priority. The rendered order already matches the canonical data order (tests P5 and E2).
- **Principal risks:** a future edit to `m41-data.js` order would change both modules (an acceptance test compares 4.3 against the locked table).
- **Impact on 4.1/4.2:** none. 4.1 is not reordered or modified.

### D7 — Reason prompt and its guidance (former §12 item 4)
- **Decision:** the brief's prompt “Why am I considering this direction?”, with its guidance prompts shown as non-interactive examples, plus **I don’t have a reason to add yet**. Only `reason` (learner text) or `reasonSkipped` is stored, and never both (see D16 for switching).
- **Rationale:** it ties the reason to the decision. The examples help beginners start writing, and keeping them unselectable follows the brief: “These are prompts, not scored reasons.”
- **Principal risks:**
  - an implementation could render the prompts as tick-boxes and create a categorized data set that could later be counted or compared (forbidden by the guidance data rule, §4 and §8);
  - learners might copy an example verbatim (acceptable; it is still their choice).
- **Impact on 4.1/4.2:** none.
- **Relationship to the brief:** follows §11.

### D8 — Empty-state copy (former item 5)
- **Decision:** brief §22 wording, verbatim, on Screens 1 and 2, with the **Continue without Work Clues** and **Continue without task evidence** buttons kept.
- **Rationale:** continuity with the locked design; the copy already says the learner can continue.
- **Principal risks:** none significant.
- **Impact on 4.1/4.2:** none.
- **Relationship to the brief:** follows §22; the buttons are the spec's addition.

### D9 — Transition copy (former item 6)
- **Decision:** brief §28 wording, verbatim.
- **Rationale:** it preserves the agreed progression from exploring directions to a practical next step.
- **Principal risks:** none significant.
- **Impact on 4.1/4.2:** none.
- **Relationship to the brief:** follows §28.

### D10 — Task evidence shown in full (former item 7)
- **Decision:** show all available 4.2 tasks neutrally; the learner explicitly chooses. No filtering by inferred relevance or automated matching.
- **Rationale:** the learner, not the system, decides which evidence to consider. Listing tasks is not matching them.
- **Principal risks:** long lists for learners with many tasks (acceptable; stable order, nothing preselected).
- **Impact on 4.1/4.2:** none.
- **Relationship to the brief — documented difference:** brief §9B says “Surface only the learner's actual recorded evidence that is meaningfully related to the work”. This specification does not filter. Brief §10 and §34 (locked owner decisions) require learner-selected, never system-inferred, connections, and filtering by relevance would be an inferred connection. Adopted resolution: list everything, and the learner selects.

### D11 — No pattern grouping (former item 8)
- **Decision:** never group or sort tasks by pattern (or by evidence answer); use 4.2's stable order.
- **Rationale:** simpler, and it avoids implying that a shared pattern creates a connection.
- **Principal risks:** none significant.
- **Impact on 4.1/4.2:** none.
- **Relationship to the brief — documented difference:** brief §10 permits organizing tasks by learner-selected patterns. The specification adopts the stricter rule.

### D12 — “What may be new for me” (former item 9)
- **Decision:** keep the heading “What may be new for me”, in the connection view, the comparison and the summary.
- **Rationale:** it invites reflection without framing inexperience as a deficiency.
- **Principal risks:** none significant.
- **Impact on 4.1/4.2:** none.
- **Relationship to the brief — documented difference:** brief §16 names this artifact item “what I have not experienced yet”. The specification adopts the gentler wording; the content is the same.

### D13 — One selection list (former item 10)
- **Decision:** `selectedDirectionIds[]`, 0–2 entries, is the only store of the provisional choice.
- **Rationale:** one explicit list makes the limit of two and the undecided state easy to validate, and avoids redundant flags that could disagree.
- **Principal risks:** none significant.
- **Impact on 4.1/4.2:** none.
- **Relationship to the brief — documented difference:** brief §18 sketches a per-exploration `selectedForNextStep` flag and says implementation should follow repository conventions rather than copy it literally. Adopted resolution: one list.

### D14 — Learning-question prompt (former item 11)
- **Decision:** brief §12 prompt and examples, verbatim. The examples are kinds of answer, shown as non-interactive text and not stored.
- **Rationale:** follows the locked learning design and keeps questions learner-directed.
- **Principal risks:** none significant. (v1.2 had paired the brief's prompt with v1.0's three example questions; v1.3 uses the brief's own examples.)
- **Impact on 4.1/4.2:** none.
- **Relationship to the brief:** follows §12.

### D15 — Judgment explanation (former item 12)
- **Decision:** “This is a separate choice about this direction. It doesn't change the Work Clues you saved in 4.1.”
- **Rationale:** short and direct about the difference between the 4.3 judgment and the 4.1 reaction.
- **Principal risks:** none significant.
- **Impact on 4.1/4.2:** none; Work Clues are never changed by 4.3.
- **Relationship to the brief:** the brief is silent; this is the spec's addition.

### D16 — Switching between a reason and “I don’t have a reason to add yet” (v1.4)
- **Decision:**
  - **at most one active answer:** a non-empty `reason` or `reasonSkipped: true`, never both;
  - **typing a reason** clears the flag;
  - **choosing the option** sets the flag when nothing is written. When a reason is written, it asks before removing it: OK removes the reason, Cancel keeps it;
  - blank-space-only text counts as empty;
  - a record found with both answers keeps the `reason` text.
- **Rationale:**
  - the v1.3 review found that switching was undefined and could leave contradictory saved state;
  - ChatGPT proposed clearing `reason` whenever the option is chosen. That would silently delete learner-written text, so the owner chose to ask first, consistent with the learning-question retention rule (decision 2) and the principle that learner-authored content is never silently deleted.
- **Principal risks:**
  - one extra confirmation step (only when a reason is already written);
  - an implementation could clear the text without asking, or keep both values (covered by the D16 acceptance tests, including Cancel keeping the text byte-identical).
- **Impact on 4.1/4.2:** none.
- **Relationship to the brief:** the brief is silent on switching; this refines D7.

## 12. Differences from the locked brief decided by the owner in v1.1

The brief file is not edited. These three differences were owner decisions in v1.1. The differences decided in v1.3 are documented with their decisions in §11 (D10–D13). No brief/spec difference is left open in v1.4.

| # | Locked brief | This specification | Owner decision |
|---|---|---|---|
| 1 | §14 comparison rows include Direction Card content (“What the work involves”, “Work patterns commonly involved”) | Screen 5A shows learner-authored rows only | v1.1 (change log item 2) |
| 2 | Working title “Exploring Where Work and Experience Connect” | Title “Exploring Possible Directions” | v1.1 (change log item 1) |
| 3 | §5 OPERATE: “…running inside tools or systems” | 4.3 reuses the 4.1 wording verbatim (§10a) | v1.1 (change log item 3) |

Housekeeping, not a design difference: the locked brief's heading says “Design Brief v0.1” while its status line says LOCKED v0.3. The file is kept byte-identical, as supplied by the owner.
