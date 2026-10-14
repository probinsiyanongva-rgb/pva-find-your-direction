# PVA Beginner VA Journey — Stage 4
## Module 4.3 Design Brief v0.1

**Status:** LOCKED — v0.3 after targeted peer review

### Change Log — v0.2

Targeted revision based on Gemini's independent peer review and owner decisions:

- removed system-inferred connection behavior;
- made evidence-to-direction connections explicitly learner-selected;
- clarified that shared patterns may organize display but never determine a match;
- fixed Direction Card presentation to a neutral, predetermined order;
- retained learner choice over which directions to inspect;
- retained the existing 1–2 provisional direction carry-forward;
- removed the phrase “evidence strength”;
- clarified that `relatedEvidenceIds` are learner-selected references;
- clarified narrow-screen comparison behavior;
- retained existing uncertainty/completion logic without adding a new “not ready” branch;
- kept **MATCH** as the internal Stage 4 module identifier while keeping learner-facing language centered on connections;
- clarified that identifying what is new is a learner judgment and is never system-calculated.

**Status:** Design Draft — For Peer Review  
**Stage:** 4 — FIND YOUR DIRECTION  
**Module:** 4.3 — MATCH  
**Working title:** Exploring Where Work and Experience Connect

---

## 1. Purpose

Module 4.3 is the third part of the Stage 4 guided experience:

**4.1 WORK → 4.2 ME → 4.3 MATCH → 4.4 DIRECTION**

4.3 asks:

> **Where do those two views connect?**

The learner has already:

- examined what different kinds of VA work actually involve in 4.1;
- recorded reactions to concrete work through **Work Clues**;
- examined their own experience in 4.2;
- identified concrete tasks they have done and the evidence attached to those tasks;
- identified the work patterns involved in those tasks without being scored or typed.

4.3 brings these two perspectives together.

Its purpose is **exploration**, not diagnosis.

The learner should leave with **one or two provisional directions worth investigating further**, along with a clearer understanding of:

- why each direction caught their attention;
- what parts of their existing experience connect to it;
- what work they have not yet experienced;
- what they would need to learn or practice before deciding whether to pursue it.

A direction is a current exploration choice, not a permanent career decision.

---

## 2. Core Design Principle

### Do not tell the learner what they are.

4.3 must not become a replacement for the retired Skills Finder.

The module should help the learner make a reasoned connection between:

**WORK**
- What does this direction actually involve?
- What work patterns does it commonly use?
- What did I react positively or negatively to in 4.1?

and

**ME**
- What have I actually done?
- What tasks have I handled?
- What evidence do I have?
- What patterns appeared in those tasks?

Then the learner decides:

> **“This is a direction I want to explore further.”**

The system may organize evidence and surface connections.  
The learner makes the judgment.

---

## 3. Learning Architecture

### The four-part Stage 4 progression

| Module | Question | Learner focus |
|---|---|---|
| **4.1 WORK** | What is the work? | Understand work patterns and explore VA directions |
| **4.2 ME** | What have I actually done? | Examine experience, tasks, evidence, and transferable work patterns |
| **4.3 MATCH** | Where do those two views connect? | Compare directions with personal evidence and decide what is worth exploring |
| **4.4 DIRECTION** | What will I explore next? | Build a practical direction plan and assemble the Direction Map |

4.3 is the **connection point** between observation and action.

---

## 4. Boundaries

### 4.3 may:

- name and discuss specific VA directions;
- reuse the standardized Direction Cards from 4.1;
- show the learner their own 4.1 Work Clues;
- show the learner their own 4.2 experiences, tasks, evidence, and learner-selected pattern tags;
- place work requirements and personal evidence side by side;
- help the learner notice areas of overlap;
- identify areas where the learner has exposure versus no experience;
- ask the learner to record why a direction interests them;
- ask the learner what they would need to learn or practice;
- allow the learner to choose one or two directions to explore further;
- preserve those provisional choices for 4.4.

### 4.3 must not:

- score a learner;
- calculate a match percentage;
- rank directions;
- produce a “best match”;
- label the learner as a particular type of VA;
- infer personality, aptitude, or suitability;
- recommend a direction as objectively best;
- optimize for salary, demand, or earning potential;
- make employability or hiring claims;
- teach role-specific skills;
- build a portfolio;
- prepare applications or interviews;
- provide client positioning;
- turn missing experience into a failure;
- require the learner to have prior VA experience;
- replace 4.4 by asking the learner to create a complete long-term plan.

---

## 5. Relationship to 4.1

4.1 introduced five descriptive work patterns:

1. **ORGANIZE** — arranging information so people can find, understand, and use it.
2. **COMMUNICATE** — helping information move clearly between people.
3. **RESEARCH** — finding, checking, comparing, and analyzing information so someone can make a decision or take action.
4. **CREATE** — producing useful content or visual material.
5. **OPERATE** — keeping a recurring business process running inside tools or systems.

These remain descriptive lenses, not official VA categories or personality types.

4.3 may use them to help the learner understand *why* an existing task connects with a direction.

It must not turn pattern tags into scores, totals, or weights.

---

## 6. Relationship to 4.2

4.2 is the evidence source.

4.3 should read the learner's actual stored evidence rather than asking them to recreate it.

Relevant 4.2 information includes:

- experiences;
- deliberately selected tasks;
- evidence answers:
  - I do this regularly
  - I have done this before
  - I have some exposure to it
  - I have not done this yet
- learner-selected pattern tags;
- optional task notes.

The system should preserve the distinction between:

**“I have done something related.”**

and

**“I have already done this exact direction-specific work.”**

Those are not equivalent.

---

## 7. Core Experience Model

The proposed cognitive flow is:

### LOOK BACK

Review selected Work Clues from 4.1.

### LOOK AT MY EVIDENCE

Review selected evidence from 4.2.

### PUT THEM SIDE BY SIDE

Examine one direction at a time using its standardized Direction Card.

### NOTICE THE CONNECTION

Examine the relationship between:

- the work involved;
- the work patterns commonly used in that direction;
- the learner's own recorded tasks;
- the learner's evidence answer;
- the learner's own reaction.

The system may organize or display this information, but it must not decide that a task is a match for a direction. The learner makes the connection.

### NOTICE WHAT IS NEW

Identify important parts of the direction the learner has not yet experienced.

### DECIDE WHAT IS WORTH EXPLORING

The learner chooses whether the direction is:

- **Explore further**
- **Not sure yet**
- **Not for me right now**

The exact final response labels should remain neutral and should not imply permanent rejection.

---

## 8. Proposed Learner Flow

### Part 1 — Bring Forward What I Noticed

Show a concise read-only view of the learner's 4.1 Work Clues.

Purpose:

> “Before we compare directions with your experience, let's remember what caught your attention when you looked at the work.”

Show:

- work clue source;
- concrete work description;
- learner reaction;
- learner note, if any.

Do not calculate or summarize a “pattern profile.”

If no Work Clues exist, provide a neutral empty state and allow the learner to continue.

---

### Part 2 — Bring Forward What I Have Done

Show a concise read-only view of selected 4.2 evidence.

Each item should make clear:

- experience source;
- task;
- evidence answer;
- learner-selected pattern tags;
- optional note.

Do not ask the learner to repeat the 4.2 activity.

Do not display numerical strength or convert evidence into scores.

---

### Part 3 — Explore One Direction

Use the same Direction Cards established in 4.1.

The Direction Cards must be presented in a **fixed, predetermined neutral order**. The order must never change based on learner evidence, Work Clues, pattern tags, previous selections, or any inferred fit.

A fixed order may follow the established curriculum order or another neutral owner-approved order. It must not be a ranking.

The learner chooses which direction to open and examine.

Each direction should retain the standardized structure:

- Direction name
- What the work involves
- Task examples
- Patterns commonly involved
- Work environment
- What can be demanding
- Typical starting point
- Useful skills
- What would need to be learned

4.3 adds a new comparison layer **without modifying the canonical Direction Card**.

After reviewing the direction, the learner can choose which of their own recorded tasks they want to consider alongside it. The system does not preselect those tasks.

The learner may choose none, one, or several tasks while examining the direction.

---

## 9. The Connection View

For each direction the learner chooses to examine, present three clearly separated areas.

### A. What this direction involves

Use the Direction Card's actual work description and task examples.

### B. What I already bring

Surface only the learner's actual recorded evidence that is meaningfully related to the work.

The wording should remain evidence-based:

- “You recorded…”
- “You have done…”
- “You have some exposure to…”
- “You have not done this yet…”

Avoid:

- “You are suited for…”
- “You are naturally good at…”
- “You have a strong match…”

### C. What would be new for me

Review the Direction Card's task examples and work requirements and note which parts are new to you or are not represented in your recorded experience.

The system must **not calculate or infer these gaps**.

The learner makes this judgment by looking at the Direction Card and their own recorded evidence.

This is an **information gap**, not a deficiency judgment.

The purpose is to help the learner see what they would need to investigate or practice before deciding whether to pursue it.

---

## 10. Connection Evidence

### Learner-selected, not system-inferred

4.3 must not contain an automated connection engine.

The system may:

- display the Direction Card;
- display the learner's own 4.2 tasks;
- organize those tasks by the learner-selected five work patterns;
- provide a simple way for the learner to select one or more of their own tasks for consideration;
- store the learner's selected evidence references.

The system must **not**:

- parse free-text to infer a connection;
- calculate task-to-direction similarity;
- count shared patterns;
- calculate an overlap score;
- identify a “missing experience” score;
- automatically select evidence for a direction;
- reorder directions based on apparent fit;
- label a task as a match.

A useful learner prompt is:

> **“Do any of your recorded tasks feel connected to this work?”**

The learner may select one or more of their own recorded tasks.

For example, the learner might select:

> “I kept a shared sheet or app up to date for a group.”

The system may then display the learner's selected task alongside the relevant Direction Card information.

The system should not conclude:

> “This task matches this direction.”

Instead, it should preserve the learner's own connection as their choice.

The stored relationship therefore means:

> **The learner chose to consider this evidence in relation to this direction.**

It does not mean:

> **The system determined that this evidence qualifies as a match.**

No numerical score, percentage, ranking, weight, or suitability judgment may be derived from these selections.

---

## 11. Learner Judgment

After examining a direction, the learner records a current judgment.

Proposed choices:

- **Explore further**
- **Not sure yet**
- **Not for me right now**

The learner should also be invited to answer:

> **Why am I considering this direction?**

This should be a short optional note, not a reflection essay.

Possible prompt guidance:

- Something about the work interests me.
- I have related experience.
- I want to learn this kind of work.
- I want to understand it better before deciding.
- Other.

These are prompts, not scored reasons.

---

## 12. Learning Gaps

If the learner chooses **Explore further** or **Not sure yet**, the module may ask:

> **What would you need to learn or experience to understand this direction better?**

This is not a training lesson.

The answer can be:

- a knowledge area;
- a tool or system;
- a type of task;
- a workflow;
- a type of client environment;
- hands-on practice.

The learner should not be expected to know the complete learning path.

The purpose is to create a useful question for later exploration.

---

## 13. Choosing Provisional Directions

4.3 should end with a small, deliberate choice.

The learner may examine as many of the 11 directions as they wish, but the Direction Cards are always presented in a fixed neutral order and are never prioritized by the system.

At the end, the learner may carry forward:

**1–2 directions to explore further.**

This prevents the module from becoming another directory or collection exercise while preserving learner control over what they inspect first.

The wording should emphasize:

> “These are the directions you want to investigate next.”

Not:

> “These are the directions you are qualified for.”

Not:

> “These are your best matches.”

A learner may choose only one direction.

A learner may also remain uncertain if the evidence does not yet give them enough reason to choose.

The system must not force a direction merely to complete the module.

---

## 14. Direction Comparison

A learner may compare their selected directions side by side.

The comparison should be descriptive rather than evaluative.

Possible columns:

| | Direction A | Direction B |
|---|---|---|
| What the work involves | | |
| Work patterns commonly involved | | |
| Related experience I recorded | | |
| Parts I have not experienced | | |
| What I want to learn | | |
| Why I am considering it | | |

Do not add:

- score;
- percentage;
- ranking;
- “winner”;
- recommendation;
- salary;
- demand;
- difficulty rating.

The learner makes the comparison.

---

## 15. Important Distinction: Related Experience ≠ Direction Experience

This distinction should be visible throughout the module.

For example:

A learner may have:

> managed an inbox for a family business

That is evidence of having handled a task related to communication and organization.

It does not mean:

> “I have already done Executive Assistant work.”

Likewise:

> maintained a spreadsheet for a previous job

does not automatically mean:

> “I have bookkeeping experience.”

4.3 should help learners recognize transfer without overstating it.

---

## 16. 4.3 Artifact

4.3 should begin contributing to the future **MY VA DIRECTION MAP**.

The 4.3 contribution should be:

### DIRECTIONS I AM EXPLORING

For each selected direction:

- direction name;
- why I am considering it;
- related experience I noticed;
- what I have not experienced yet;
- what I want to learn or investigate.

This is provisional.

4.4 will turn this into the learner's next-step direction plan.

---

## 17. Relationship to the Direction Map

The Direction Map should remain progressively assembled.

4.1 contributed:

- Work Clues;
- observations about work.

4.2 contributed:

- what I have actually done;
- evidence from experience.

4.3 contributes:

- directions worth exploring;
- reasons for considering them;
- questions/gaps to investigate.

4.4 will contribute:

- what I will explore next;
- what I will build/practice;
- the next step toward PRACTICE & PROVE.

The map should never imply that the learner has made a permanent career choice.

---

## 18. State Requirements

4.3 must extend the existing Stage 4 state model rather than create a separate application or duplicate profile.

The existing shared Stage 4 architecture must remain the source of truth.

Proposed conceptual structure:

```js
stage4Profile: {
  schemaVersion: 3,

  modules: {
    "4-1": { ... },
    "4-2": { ... },
    "4-3": {
      completed: false,

      directionExplorations: [
        {
          directionId,
          reaction,
          reason,
          relatedEvidenceIds: [], // learner-selected evidence references only
          learningQuestions: [],
          selectedForNextStep: false
        }
      ]
    }
  },

  workClues: [...]
}
```

Implementation should follow the repository's established state conventions rather than copying this conceptual structure literally.

### Requirements

- Preserve all existing 4.1 and 4.2 data.
- Migrate earlier Stage 4 state safely.
- Use stable direction IDs.
- Do not duplicate Work Clues or 4.2 evidence as independent sources of truth.
- Store references to existing evidence where possible; `relatedEvidenceIds` must represent only evidence the learner deliberately selected for consideration, never system-inferred matches.
- Export/Restore must continue to work.
- Reject malformed or incompatible future-state data according to established conventions.
- No personal data beyond what is necessary for the learning artifact.

---

## 19. Completion Logic

Completion should reflect actual learning activity.

Opening every direction card must not complete 4.3.

Recommended completion requirements:

1. Learner has reviewed the 4.1 Work Clues area or explicitly continued from the empty state.
2. Learner has reviewed their 4.2 evidence area or explicitly continued from the empty state.
3. Learner has deliberately examined at least one named direction.
4. Learner has recorded a judgment for at least one direction.
5. Learner has recorded why they are considering it, or explicitly chosen “I don't have a reason to add yet.”
6. Learner has reached the provisional direction decision step.
7. Learner has either selected at least one direction for further exploration or explicitly chosen to remain undecided.

Do not require a minimum number of directions.

Do not require a positive reaction.

An undecided learner can complete the module honestly.

Do not add a separate “not ready to examine directions” branch. The existing **Not sure yet** judgment is sufficient to preserve uncertainty without creating another progression path.

Completion should persist.

---

## 20. 4.1 → 4.3 Data Continuity

The module should use the learner's actual 4.1 Work Clues.

No new version of Work Clues should be created in 4.3.

If a learner has:

- Want to explore
- Not sure yet
- Probably not for me

4.3 should not silently convert those into recommendations.

A “Probably not for me” clue can still be useful when comparing a direction because it provides context for the learner's decision.

---

## 21. 4.2 → 4.3 Data Continuity

Use the actual 4.2 records.

Do not recalculate evidence.

Do not transform the four evidence answers into numbers.

Do not generate hidden rankings.

Do not count pattern tags.

The learner's selected pattern tags can be used as descriptive evidence when showing connections.

---

## 22. Handling Missing Data

4.3 must work even when a learner has limited earlier data.

### No Work Clues

Show:

> “You don't have Work Clues saved from 4.1 yet. You can still explore directions here.”

### No 4.2 experience

Show:

> “You don't have experience records saved from 4.2 yet. You can still examine the directions and note what you would like to learn.”

### Limited experience

Do not penalize or downgrade the learner.

Use the absence of evidence as a reason for exploration, not as a negative score.

---

## 23. Filipino Learner Context

Examples should remain grounded in realistic Filipino learner backgrounds:

- BPO/customer support;
- office/admin;
- teaching;
- healthcare;
- sales;
- accounting/bookkeeping;
- retail/hospitality;
- online selling;
- family or small business;
- freelancing;
- content/social media;
- technical/IT;
- community or organizational responsibilities;
- fresh graduate/internship experience;
- previous VA work.

The learner's context should shape examples, but the module should not lower the instructional level.

---

## 24. Direction Coverage

4.3 should use the balanced Direction Card set established in 4.1.

The direction landscape should remain broader than PVA's own course catalog.

The current direction set includes:

- General VA
- Customer Support
- Social Media
- Lead Generation
- E-commerce
- Amazon
- Bookkeeping
- Executive/Personal Assistance
- Real Estate
- NDIS
- Technical/Specialized

No direction should be presented as “best.”

---

## 25. UX Principles

4.3 should feel like guided exploration rather than a test.

Use:

- clear progression;
- concise evidence cards;
- side-by-side comparison where useful;
- visible learner decisions;
- saved progress;
- accessible controls;
- mobile-first responsive behavior;
- keyboard accessibility;
- persistent Stage 4 navigation;
- Export/Restore consistent with 4.1 and 4.2.

Avoid:

- quiz-like scoring;
- progress bars that imply skill percentage;
- badges implying competence;
- gamified rankings;
- excessive cards;
- repeated reflection questions;
- long walls of explanation;
- “AI career coach” language.

---

## 26. Accessibility

Maintain the established accessibility standard:

- keyboard operable;
- visible focus states;
- semantic controls;
- meaningful labels;
- sufficient text contrast;
- responsive at approximately 390px, 820px, 1366px, and 1600px;
- no interaction dependent solely on hover;
- no color-only meaning;
- clear error/recovery messages;
- comparison views must use stacked, tabbed, or toggle-based presentation on narrow screens rather than requiring an unreadable multi-column table.

---

## 27. AI-Slop Filter

Before production, every screen should pass this test:

> **Does this help the learner make a real decision, or does it merely make the course sound educational?**

Remove:

- generic motivational paragraphs;
- repetitive “reflect on yourself” prompts;
- artificial career-coach language;
- inflated claims about transferable skills;
- decorative frameworks with no learner action;
- repeated summaries of information already visible.

Prefer:

- concrete work examples;
- actual learner evidence;
- short comparisons;
- explicit choices;
- useful questions;
- saved decisions.

---

## 28. 4.3 → 4.4 Transition

The transition should preserve the Stage 4 logic.

Proposed copy:

> **You've looked at the work. You've looked at what you've actually done. Now you've put those two views side by side.**
>
> **Next, we'll turn the directions you're exploring into a practical next step.**

4.4 should receive the learner's provisional directions and exploration notes.

---

## 29. Boundary with PRACTICE & PROVE

4.3 may identify:

> “I need hands-on practice with this type of workflow.”

It should not provide that practice.

The next major stage is:

**PRACTICE & PROVE**

where the learner can actually perform useful VA work.

4.3 prepares the learner to choose what to investigate and practice; it does not certify readiness.

---

## 30. Boundary with ENTER THE MARKET

4.3 should not teach:

- portfolio presentation;
- proposals;
- applications;
- interviews;
- client positioning;
- marketplace strategy.

Those belong later in the Journey.

---

## 31. Skills Finder Status

The old scored/ranked Skills Finder is retired from the Academy learner flow.

Its pages may remain online and preserved for now, but Academy Home should no longer link to it.

4.3 must not reproduce its:

- scoring;
- ranking;
- top-three result;
- earning-potential framing;
- “best match” language;
- personality/result-test behavior.

---

## 32. Open Design Questions for Peer Review

The peer review should specifically examine:

1. Is the WORK → ME → MATCH progression genuinely different from the old Skills Finder?
2. Does the comparison mechanism use evidence without secretly scoring?
3. Is the learner still making the direction judgment?
4. Does the module make useful use of 4.1 Work Clues?
5. Does it make useful use of 4.2 evidence without duplicating 4.2?
6. Are direction-specific gaps introduced at the correct point?
7. Does the module allow a learner to remain uncertain without being treated as incomplete or unsuccessful?
8. Is the one-to-two-direction provisional choice meaningful without becoming a ranking?
9. Does the Direction Map contribution feel earned and useful?
10. Is the 4.3 → 4.4 boundary clean?
11. Does the state model preserve the shared Stage 4 architecture?
12. Does the experience avoid personality-test and career-coach behavior?
13. Is the direction set balanced and neutral?
14. Are the learner-facing prompts concrete enough?
15. Does any wording accidentally imply suitability, competence, or employability?
16. Does the module contain unnecessary “course-shaped” content?
17. Does the design remain useful for learners with little formal work experience?

---

## 33. Production Gate

4.3 should not move to implementation until the design is peer-reviewed and the following are settled:

- comparison mechanism;
- learner judgment language;
- provisional direction selection;
- treatment of missing/limited evidence;
- direction-specific learning questions;
- Direction Map contribution;
- state model/schema migration;
- completion logic;
- 4.3 → 4.4 transition;
- Filipino context examples;
- retired Skills Finder boundary;
- learner-selected connection mechanism;
- fixed neutral Direction Card order.

After peer review, create a production specification with final learner-facing copy and implementation behavior.

Do not redesign 4.1 or 4.2 as part of 4.3 implementation.

---

## 34. Owner Decisions From v0.1 Peer Review

The following decisions are locked for the next peer-review pass:

1. **No automated connection engine.** The system organizes and displays information; the learner selects the evidence they want to consider in relation to a direction.
2. **No hidden matching.** Shared work patterns may organize evidence for viewing, but no pattern intersection, frequency, weight, or similarity calculation may determine a direction.
3. **Fixed neutral direction order.** Direction presentation must never be personalized or dynamically reordered.
4. **No additional “not ready” branch.** The existing **Not sure yet** judgment and honest uncertainty path remain sufficient.
5. **MATCH remains the Stage 4 module identifier.** Learner-facing copy should use “connection” language rather than implying an automated compatibility result.

---

## 35. Owner Decision

This brief is **LOCKED for production specification** after targeted independent peer review.

The learning architecture and boundaries are now settled.

The next step is to create the production specification with final learner-facing copy and implementation behavior.

The production specification may clarify implementation details, interaction behavior, content presentation, validation, and QA procedures, but it must not change the locked learning architecture or boundaries without an explicit owner decision.

The production specification must preserve:

- the live 4.1 implementation and its Work Clues;
- the live 4.2 implementation and its evidence records;
- the shared Stage 4 architecture;
- learner-selected connections rather than system-inferred matching;
- fixed neutral Direction Card order;
- no scoring, ranking, weighting, or recommendation;
- the existing uncertainty/completion model;
- the retired Skills Finder boundary.

