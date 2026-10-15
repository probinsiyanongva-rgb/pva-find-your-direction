# PVA Beginner VA Journey — Stage 4
## Module 4.4 Design Brief v0.1

**Status:** Design Draft — for owner and peer review. Not approved. No code.
**Stage:** 4 — FIND YOUR DIRECTION
**Module:** 4.4 — DIRECTION
**Working title:** My VA Direction Map
**Guiding question:** *What am I going to explore next?*

**Built from:**
- the independent design review of 15 Oct 2026 (verdict: NOT READY for specification, because no 4.4 design existed);
- ChatGPT's resolution of that review, accepted by the owner on 15 Oct 2026 ("Proceed");
- the locked 4.3 Design Brief v0.3 (§3, §16, §17, §28) and the approved 4.3 Production Specification v1.5;
- the live application at `main` `de481a0` (4.3 v1.0 released 15 Oct 2026). Every statement about the application in this brief names the file it was checked in.

Learner-facing lines marked **DRAFT copy** are proposals for review. Final copy belongs in the production specification.

---

## 0. Decisions

### 0.1 Accepted by the owner (15 Oct 2026)

| # | Topic | Decision |
|---|---|---|
| D1 | Reasons, related tasks, learning questions | Shown from the learner's 4.3 reflections, read-only, with a link back to 4.3 to edit them. 4.4 never asks for them again. |
| D2 | Directions on the map | 4.3 choices are shown for reference. The learner adds each direction to the map deliberately. Nothing is pre-added. |
| D3 | Which directions can be added | Only directions with a saved 4.3 reflection. The learner can go back to 4.3 to examine another direction first. |
| D4 | What the learner brings | Their own 4.2 experiences and tasks, with the evidence levels they recorded. No claims of ability without evidence. |
| D5 | Next step | An exploration step. Never a practice assignment, portfolio task or job application. |
| D6 | Undecided learners | They finish by writing an investigation step. "Examine another direction in Module 4.3" is always available. |
| D7 | Changing direction | Changes the current map only. Never modifies or deletes anything recorded in 4.1–4.3. |
| D8 | Map history | None in v1. The map shows the learner's current thinking. |
| D9 | Completion | An explicit save-and-complete action. The map stays editable afterwards. No certificate or portfolio submission. |
| D10 | Removing written text | Ask before discarding a written next step (the 4.3 D16 principle). |
| D11 | Keeping the map | A readable, printable map. No promise of a separate PDF feature. |
| D12 | "Where I am now" | Optional, narrowly about the learner's place in their VA journey. No income, family, personal disclosures or readiness ratings. |
| D13 | Shape | Four screens (§6). |

### 0.2 Proposed in this draft — for owner confirmation

| # | Topic | Proposal | Why |
|---|---|---|---|
| P1 | "Relevant" 4.2 tasks | The map shows only the 4.2 tasks **the learner linked to that direction in 4.3**. If none were linked, it says so neutrally. | If the application chose "relevant" tasks, that would be automatic matching. |
| P2 | Undecided is independent | 4.4's "still exploring" is separate from 4.3's "undecided". A learner undecided in 4.3 may choose in 4.4, and the reverse. 4.3 keeps what they said then. | Learners change their minds between modules; neither module should rewrite the other. |
| P3 | Confirmation covers every way text could disappear | Removing a direction with a written step; switching to "still exploring" when steps are written; adding a direction after writing an investigation step. | D10 applied consistently. |
| P4 | "Not for me right now" directions | May be added, with no warning. | Same rule as 4.3, where any direction with a saved reflection can be selected whatever its judgment (`setSelected`, `public/shared/state.js`). |
| P5 | Placement of "Where I am now" | At the end of Screen 1, after looking back. | It follows naturally from reviewing their own work, and keeps Screens 2–3 focused. |
| P6 | Screen 1 is short | Counts and links, not content. The full content appears once, on Screen 4. | Avoids the repetition the review warned about. |
| P7 | Printing and PDF | A print layout of the map. The print copy tells learners they can choose "Save as PDF" in the print window. | Browsers already offer this; no new architecture. |

---

## 1. Purpose

4.4 is the last part of Stage 4:

**4.1 WORK → 4.2 ME → 4.3 MATCH → 4.4 DIRECTION**

| Module | Question |
|---|---|
| 4.1 | What is the work? |
| 4.2 | What have I actually done? |
| 4.3 | Where do those two views connect? |
| **4.4** | **What am I going to explore next?** |

By now the learner has noticed Work Clues (4.1), recorded real tasks with honest evidence levels (4.2), and examined directions with their own reasons, related tasks, what may be new, and questions (4.3).

4.4 does **two new things only**:

1. it **assembles** what the learner already recorded into one map they choose the contents of; and
2. it asks for **one concrete next exploration step** per direction (or one investigation step if they are still exploring).

Everything else on the map comes from earlier modules.

---

## 2. Core Design Principles

### Assemble, don't re-ask.
If 4.1–4.3 already hold it, 4.4 shows it and links to where it can be edited. 4.4 owns only: which directions are on the map, the next steps, "still exploring", and "where I am now".

### The map is current thinking, not a decision for life.
Every view of the map, on screen and in print, says so.

### The learner decides what goes on the map.
No direction is pre-added. No direction is suggested, ranked, grouped by judgment or highlighted.

### Uncertainty is a complete answer.
"Right now, I'm still exploring" is a full outcome with the same visual weight as choosing a direction.

### Choosing a direction is not readiness.
Nothing in 4.4 says or implies the learner is ready for, suited to or qualified for a direction.

---

## 3. Boundaries

### 4.4 may:
- show the learner's own records from 4.1–4.3, read-only, with links back;
- let the learner put up to two directions on their map, or choose to keep exploring;
- ask for one concrete next exploration step per direction, or one investigation step;
- ask an optional, narrow "where I am now" question;
- produce a readable, printable map;
- point forward to PRACTICE & PROVE as the place where the work itself is tried.

### 4.4 must not:
- score, rank, weight, compare-to-recommend, or calculate similarity;
- pre-add or suggest a direction, including from 4.3 choices;
- ask again for reasons, related tasks, "what may be new" or learning questions;
- ask the learner to rate their abilities or readiness;
- write to, change or delete any 4.1, 4.2 or 4.3 record;
- set practice tasks, build a portfolio, or assess work (Stage 5);
- cover resumes, cover letters, job-platform profiles, applications, proposals, interviews, pricing or client positioning (ENTER THE MARKET);
- require paid tools, sign-ups or contacting anyone;
- create a long-term career plan;
- award a certificate or route to a portfolio submission.

---

## 4. What 4.4 reads and what it owns

| Source | Shown in 4.4 | Who can change it |
|---|---|---|
| 4.1 Work Clues | Count on Screen 1, with a link | 4.1 only |
| 4.2 experiences and tasks | Count on Screen 1; on the map, only the tasks the learner linked in 4.3 (P1), each with its recorded evidence level | 4.2 only |
| 4.3 reflection per direction (judgment, reason or "no reason yet", related tasks, what may be new, learning questions) | On Screen 2 (judgment) and on the map | 4.3 only |
| 4.3 choice (selected directions, or undecided, plus the undecided note) | On Screen 2, labelled "What you chose in Module 4.3" | 4.3 only |
| **Directions on the map (0–2)** | Screens 2–4 | **4.4** |
| **Next exploration step per direction** | Screens 3–4 | **4.4** |
| **"Still exploring" + investigation step** | Screens 2–4 | **4.4** |
| **"Where I am now" (optional)** | Screens 1 and 4 | **4.4** |

The map shows 4.3 content **as it is now**, not a copy. If the learner edits a 4.3 reflection later, the map shows the edited version. Application facts relevant here:
- 4.3 reflections can be edited but not deleted (`PVAS4.m43` in `public/shared/state.js` has no delete for explorations), so a direction on the map always has a reflection to show.
- References to deleted 4.2 tasks are already dropped from 4.3 reflections automatically (`normalize43`, `public/shared/state.js`), so the map never shows a task that no longer exists.

---

## 5. The 4.3 → 4.4 Transition

Already approved and live in 4.3 (Brief §28; Spec v1.5 Screen 6):

> **You've looked at the work. You've looked at what you've actually done. Now you've put those two views side by side.**
>
> **Next, we'll turn the directions you're exploring into a practical next step.**

4.3's finish screen currently shows 4.4 as "Coming later" (`public/shared/m43.js`). When 4.4 ships, that becomes **Continue to Module 4.4** (Spec v1.5 Screen 6). That is the only planned change to 4.3.

---

## 6. Learner Flow — four screens

### Screen 1 — Look back

**Purpose:** a short reminder of what the learner has already done, and where to find it. Not a summary of its content.

**Shows** (counts and links only; P6):
- Work Clues saved in 4.1 — link to 4.1;
- experiences and tasks recorded in 4.2 — link to 4.2;
- directions examined in 4.3, and what they chose there — link to 4.3.

**DRAFT copy:**
> "Here's what you've worked through so far. You don't need to repeat any of it. In this module, you'll choose what goes on your map and decide on one next step."

**Optional "Where I am now"** (P5; D12; §10).

**Action:** Continue.

**Empty states:** zero counts are shown plainly ("No Work Clues saved yet") with no judgment. Nothing on this screen blocks continuing.

---

### Screen 2 — Choose what to explore

**Purpose:** the learner deliberately decides what goes on their map.

**Shows:**
1. **What you chose in Module 4.3** — the directions they selected there, or "You chose to keep exploring", or "You didn't make a choice in Module 4.3". Reference only; nothing is added to the map from it.
2. **Directions you've examined** — every direction with a saved 4.3 reflection, in the locked Direction Card order (01–11, `PVA_M41.DIRECTIONS`, `public/shared/m41-data.js`). Each shows the learner's own 4.3 judgment as a label ("Explore further", "Unsure", "Not for me right now"). Not grouped or sorted by judgment.
3. **Add to my map** on each, up to two (D2, D3, P4).
4. **Right now, I'm still exploring** — an equal option, not a link or a secondary button (§7).
5. A link: **Examine another direction in Module 4.3**.

Choosing directions and "still exploring" are mutually exclusive, as in 4.3.

**DRAFT copy:**
> "Which directions do you want to explore next? Add one or two to your map—or keep exploring for now. Both are good answers."

**Empty state — no saved 4.3 reflections:** no directions can be added. Show: "You haven't saved a reflection on any direction in Module 4.3 yet. You can examine one now, or keep exploring." Both the 4.3 link and "still exploring" stay available. This is never a dead end.

**Action:** Continue (available once at least one direction is on the map or "still exploring" is chosen).

---

### Screen 3 — Decide on your next step

**Purpose:** turn each choice into one concrete action (§8).

**For each direction on the map:**
- the direction name, and the learner's own 4.3 learning questions if any (as prompts for the step, read-only);
- one field: **My next exploration step**;
- the example ideas (§8), shown as ideas, never pre-filled.

**If still exploring:** one field, **My next step to help me decide**, with the investigation ideas (§7).

**DRAFT copy:**
> "Pick one small step you can do in the next few days, for free, without signing up for anything or contacting a client."

**Action:** Continue (available once every direction on the map has a step, or the investigation step is written).

---

### Screen 4 — Review and save my map

**Purpose:** see the whole map, save it, print it.

**Shows** the map exactly as it will print (§12).

**Actions:**
- **Save my Direction Map** — completes 4.4 the first time (§11);
- **Print my map**;
- edit links: change directions (Screen 2), change steps (Screen 3), edit "where I am now" (Screen 1), edit a reflection (4.3);
- forward link to PRACTICE & PROVE, shown as "Coming later" until Stage 5 exists (§14).

**DRAFT copy (always visible, on screen and in print):**
> "This map shows where my thinking is right now. It is not a permanent career decision. I can change it at any time."

---

## 7. The Undecided Pathway

A learner who cannot choose yet:

1. sees their 4.3 record on Screen 2 (including their 4.3 undecided note, if any, labelled as from 4.3);
2. chooses **Right now, I'm still exploring**;
3. writes one investigation step on Screen 3. Ideas offered:
   - examine one more direction in Module 4.3 (always available; linked);
   - read the Direction Cards for two directions and note how the daily work differs;
   - read a few real job posts for two directions and note which tasks repeat in each;
4. saves on Screen 4. The map reads **"Right now, I'm still exploring"** with their step.

This completes 4.4 (§11). No copy says or implies that choosing a direction is the expected or better outcome. The option has the same visual weight as adding a direction.

"Still exploring" in 4.4 is independent of "undecided" in 4.3 (P2).

---

## 8. The Next Exploration Step

### What counts
A step is one action the learner can:
- do within a few days;
- do for free, without paid tools or sign-ups;
- do without a client, an application or a practice assignment;
- describe in a sentence.

### Example ideas (shown as ideas; the learner writes their own)
- Read three real job posts for this direction and write down the tasks that appear more than once.
- Pick one task from the Direction Card that I haven't done and find a free explanation of how it's done.
- Find out what one tool named on the Direction Card is used for.
- *(Owner decision, Q2)* Ask someone who does this kind of work one question about their usual day. Never required; many beginners don't know anyone in VA work.

### Not a next step (excluded from all examples and copy)
Applying for jobs; creating or updating a job-platform profile; writing a resume or cover letter; buying a course or tool; starting a practice project or portfolio piece; contacting potential clients.

### Vague steps
The application does not judge the learner's wording. The prompt and examples are what steer toward concrete steps ("learn more about it" is discouraged by the copy, not blocked).

---

## 9. What the Learner Brings

On the map, under each direction: **"Experiences and tasks I can draw on"**, showing only the 4.2 tasks the learner linked to that direction in 4.3 (P1), each with its recorded evidence level in the learner-facing wording 4.2 already uses.

If none were linked: **"No tasks linked yet."** with a link to the 4.3 reflection. No judgment, and nothing suggesting this is a gap.

There is no free-text field for abilities (D4).

---

## 10. "Where I Am Now"

**Optional.** One short free-text answer at the end of Screen 1.

**DRAFT copy:**
> "Where are you in your VA journey right now? (Optional)"
> Examples: "I'm learning the basics." · "I've tried a few tasks for my family's online shop." · "I've done some admin work but never as a VA."

**DRAFT note under the field:**
> "Keep it about your VA journey. You don't need to share private details."

No ratings, scales, checklists or follow-up questions. A length limit is set in the specification.

---

## 11. Completion

4.4 is complete when the learner presses **Save my Direction Map** after:
1. reaching Screen 4; and
2. either
   - putting at least one direction on the map, each with a written next step; or
   - choosing "still exploring" with a written investigation step.

Not required: completing 4.1–4.3; "where I am now"; any Work Clues, tasks or linked tasks; two directions.

Completion is kept once set (Stage 4 convention: `completedAt`, as in 4.1–4.3). The map stays editable. If a later edit leaves a direction without a step, the map simply shows the gap; completion is not removed.

No certificate, badge or submission (D9).

---

## 12. The Map (what the learner keeps)

**MY VA DIRECTION MAP** — Last updated: *date*

*Provisional reminder (§6, Screen 4).*

**Where I am now** — if given.

**For each direction on the map** (in the order the learner added them):
- direction name;
- **Why I'm considering it** — 4.3 reason, or "No reason added yet";
- **Experiences and tasks I can draw on** — §9;
- **What may be new for me** — from 4.3, if written;
- **Questions I want answered** — 4.3 learning questions, if any;
- **My next exploration step** — from 4.4.

**Or, if still exploring:**
- **Right now, I'm still exploring.**
- my 4.3 undecided note, if any, labelled as from Module 4.3;
- **My next step to help me decide.**

**Printing (D11, P7):** a print layout containing only the map, readable in black and white. The print copy says: "To keep a PDF, choose 'Save as PDF' in the print window." The existing Export file is a backup for restoring progress, not the learner's copy of the map. The map is never uploaded or shared by the application.

The current shared print rules are minimal (an inherited `@media print` block in `public/shared/course.css`), so the print layout is new work and must be checked in a real browser.

---

## 13. Changing the Map

### Three layers
| Layer | Holds | Changed by |
|---|---|---|
| Records | 4.1 Work Clues; 4.2 experiences, tasks, evidence; 4.3 reflections and choice | Their own module only |
| Current map | Directions on the map, next steps, "still exploring", "where I am now" | 4.4 only |
| Stage 5 practice | Not built yet | Outside Stage 4 |

### Rules
1. No 4.4 action writes to a 4.1, 4.2 or 4.3 record (D7). This must be a tested rule.
2. Removing a direction with a written next step asks first (D10, P3). **DRAFT copy:** "This will remove the next step you wrote for *[direction]* from your map. Your Module 4.3 reflection stays as it is. Remove it?" Cancel keeps everything unchanged.
3. The same confirmation applies to switching to "still exploring" when next steps are written, and to adding a direction after writing an investigation step (P3).
4. Removing a direction with no written step needs no confirmation.
5. No map history (D8). The learner's earlier thinking about a direction survives in its 4.3 reflection.

### Walkthrough
A learner saves a map with direction A and a next step. Later (perhaps after Stage 5 practice) they prefer B.
1. They remove A on Screen 2 and confirm. A's next step leaves the map; A's 4.3 reflection is untouched.
2. If B has no saved 4.3 reflection, they examine it in 4.3 first. That creates a new 4.3 record, which is the right place for it.
3. They add B, write its next step, and save. The map shows B. Every Work Clue, task and 4.3 reflection is unchanged.

If the learner later changes their selection in 4.3, the map does not change (D2). The two may differ; the map's provisional reminder makes clear it shows current thinking.

---

## 14. Boundary with PRACTICE & PROVE

**DRAFT copy at the end of Screen 4:**
> "Your map shows what you want to explore next—not what you're already ready for. In Stage 5, PRACTICE & PROVE, you'll try the work itself."

Until Stage 5 exists, the link shows "Coming later".

**Handoff limitation (application fact):** progress is saved in the browser under `pva-stage4-progress` for this site only (`public/shared/state.js`). A different website cannot read it. If Stage 5 is built as a separate site, the printed or saved map is how the learner carries their direction forward. Where Stage 5 will live is an open question (Q6).

## 15. Boundary with ENTER THE MARKET

4.4 does not teach or prompt portfolios, proposals, applications, interviews, profiles, pricing, client positioning or marketplace strategy (§3, §8).

---

## 16. Handling Missing Data

| Situation | What happens |
|---|---|
| No saved 4.3 reflections | No direction can be added. "Examine a direction in Module 4.3" and "still exploring" are both available (§6, Screen 2). |
| 4.3 not completed | 4.4 still opens. Directions with saved reflections can be added. |
| No 4.2 tasks, or none linked | "No tasks linked yet." (§9) |
| No Work Clues | Shown as a zero count on Screen 1. Nothing else changes. |
| No 4.3 reason (learner chose "I don't have a reason to add yet") | "No reason added yet." |

---

## 17. State (conceptual — exact names and limits belong in the specification)

4.4 extends the shared Stage 4 store; it is not a separate application.

Conceptual `modules["4-4"]` fields: last section; `completedAt`; where I am now; directions on the map (0–2, each with a direction id and a next step); still exploring; investigation step.

**Verified application facts the specification must handle** (`public/shared/state.js`, `main` `de481a0`):
- `normalize()` keeps only modules listed in `MODULE_IDS` (`['4-1','4-2','4-3']`). 4.4 therefore needs **schema v4**, **backup wrapper v4**, and a **v3 → v4 migration**.
- The Restore confirmation lists each module's status; it needs a 4.4 line. The shared backup summary (`summaryOf`) needs 4.4 completion.
- Restore replaces all progress (after confirmation). Restoring an older backup removes the current map. The confirmation should make that visible.
- **Release safety:** under the Phase 0 guard, the live 4.3 release treats v4 data as "newer" — protected and read-only, never overwritten. This needs a test like RB1–RB2. The oldest version that may be redeployed stays `ee27fd0`.
- Pages that change when 4.4 ships: 4.3's finish screen (§5); the hub (4.4 status, Continue button); the 4.1–4.3 sidebars; Progress. 4.1 and 4.2 learning activities do not change.

---

## 18. UX, Accessibility and AI-Slop Filter

Same standards as 4.3 (Brief v0.3 §25–27): keyboard operable; visible focus; semantic controls; no colour-only meaning; responsive at about 390, 820, 1366 and 1600 px; no hover-only interaction; clear recovery messages.

Specific to 4.4:
- "still exploring" has the same visual weight as adding a direction;
- no progress bar, badge or wording that implies readiness or skill level;
- four screens; one new writing prompt per direction, plus the optional "where I am now";
- no repeated reflection prompts; no motivational filler; no career-coach language;
- print layout readable in black and white.

---

## 19. Open Questions for the Owner

| # | Question | Recommendation |
|---|---|---|
| Q1 | Confirm proposals P1–P7 (§0.2). | Accept all. |
| Q2 | Include "Ask someone who does this kind of work one question" as an example idea? | Include it, clearly optional. |
| Q3 | A "Use this idea" button that copies an example into the step field for the learner to edit? | Yes. It helps beginners with less writing confidence, and it is learner-initiated, not a pre-fill. |
| Q4 | An optional "When I'll do it" field with each step? | No, for v1. It adds a field without changing the outcome. |
| Q5 | When 4.4 is complete, what does the hub's Continue button say? | "Review my Direction Map". No "Stage 4 complete" certificate or badge. |
| Q6 | Where will Stage 5 live (same site or separate)? | Decide before the Stage 5 design; it does not block 4.4, because the printable map works either way. |

---

## 20. Production Gate

4.4 moves to a production specification only after:
- owner and peer review of this brief;
- answers to Q1–Q6;
- final learner-facing copy for all four screens, the confirmations and the map.

The specification must then cover, with acceptance tests: schema v4 and migration; backup v4; Restore confirmation; shared summary; the no-writes-to-4.1–4.3 rule; the confirmation rules (§13); completion (§11); the undecided path (§7); missing data (§16); print layout; navigation changes (§17); and release safety under the guard (§17).

Do not redesign 4.1, 4.2 or 4.3 as part of 4.4.
