# PVA Beginner VA Journey --- Module 4.1

## Build Brief v1.1 --- Understanding VA Work Directions

**Build status:** Ready for implementation\
**Design status:** LOCKED\
**Production source:** `PVA_Module_4.1_Production_Specification_v1.1.md`\
**v1.1:** aligned with the approved v1.1 build (2 Oct 2026)\
**Stage:** 4 --- FIND YOUR DIRECTION\
**Module:** 4.1 --- Understanding VA Work Directions\
**Core question:** What kinds of VA work are there?

------------------------------------------------------------------------

# 1. Build Mission

Build Module 4.1 as the first part of the **single integrated Stage 4
experience**.

This is an implementation brief, not a redesign invitation.

The learning architecture, instructional intent, interaction model,
direction-card philosophy, clue model, and Stage 4 boundaries are
already decided.

### The build should accomplish this learner experience

The learner should:

1.  examine realistic VA job descriptions;
2.  notice that titles do not fully describe the work;
3.  analyze concrete work scenarios;
4.  use the five work patterns as a language for describing the work;
5.  explore a balanced set of VA directions;
6.  record lightweight reactions to concrete work;
7.  leave with Work Clues that can feed 4.2--4.4 later.

The learner should **not** receive:

-   a score;
-   a ranking;
-   a recommended niche;
-   a personality type;
-   a "best match";
-   a permanent career direction.

------------------------------------------------------------------------

# 2. NON-NEGOTIABLE ARCHITECTURE

## 2.1 One Stage 4 application

Do **not** build 4.1 as a completely independent microsite that cannot
share state with 4.2--4.4.

Stage 4 must be designed as one application/course experience
containing:

``` text
Stage 4 — Find Your Direction
├── 4.1 Understanding VA Work Directions
├── 4.2 Looking at Yourself as a VA
├── 4.3 Exploring Possible Directions
└── 4.4 Build Your Direction Map
```

4.1 may initially be the only populated module, but the technical
architecture must leave clean extension points for 4.2--4.4.

Do not create a data architecture that will require a rewrite when the
later modules are added.

------------------------------------------------------------------------

# 3. FIRST STEP BEFORE CODING

Before changing code:

1.  Inspect the existing PVA Academy/Stage 3 implementation available in
    the repository.
2.  Identify the existing:
    -   routing/navigation pattern;
    -   design tokens;
    -   typography;
    -   component conventions;
    -   local persistence mechanism;
    -   Export/Restore implementation, if available;
    -   responsive behavior;
    -   accessibility patterns;
    -   progress/completion handling.
3.  Reuse stable existing infrastructure where it fits.
4.  Do not replace an established mechanism merely for stylistic
    preference.

If the existing implementation does not support Stage 4's shared state
requirements, adapt it carefully rather than creating a parallel
persistence system.

------------------------------------------------------------------------

# 4. SOURCE OF TRUTH

The production specification is the source of truth for:

-   learner-facing copy;
-   module sequence;
-   scenario content;
-   pattern definitions;
-   Direction Card content;
-   Work Clues behavior;
-   boundaries;
-   completion criteria.

Do not invent new instructional content during implementation.

If implementation reveals a genuine ambiguity or conflict in the
production specification, stop and ask for clarification rather than
silently changing the learning design.

------------------------------------------------------------------------

# 5. MODULE ROUTING

The module should have a stable Stage 4 route structure.

Preferred conceptual structure:

``` text
/stage-4/
/stage-4/4-1/
```

If the existing Academy architecture uses another routing convention,
follow that convention.

The important requirement is:

> 4.1 must be a module inside the Stage 4 application, not a
> disconnected product.

------------------------------------------------------------------------

# 6. STATE MODEL

Use a single Stage 4 state object.

Minimum conceptual structure:

``` js
stage4Profile = {
  schemaVersion: 1,

  workClues: [
    {
      id: String,            // sourceType + ":" + sourceId (one clue per source)
      sourceType: "scenario" | "direction",
      sourceId: String,
      reaction: "explore" | "unsure" | "not_for_me",
      note: String,
      updatedAt: String
    }
  ],

  jobPostObservations: [
    {
      postId: String,
      selected: String[],
      completed: Boolean
    }
  ],

  scenarioObservations: [
    {
      scenarioId: String,
      selectedPatterns: String[],
      completed: Boolean
    }
  ],

  exploredDirections: [
    String
  ],

  modules: {
    "4-1": { lastSection: String, directionsReviewed: Boolean, completedAt: String }
  }
}
```

`jobPostObservations` and `modules` were approved additions during the v1 build (job-post activity state and per-module progress). Further modules add their own entries under `modules`.

## 6.1 Single source of truth

`workClues` is the authoritative record of learner reactions.

Do NOT separately store:

``` js
interestedDirections
```

if it duplicates information already represented by:

``` js
workClues[].reaction === "explore"
```

Lists such as "directions I want to explore" should be derived from the
authoritative clue data when needed.

## 6.2 Reflection

Do not create an unused generic `reflection` property.

If a later module requires reflection data, define it deliberately at
that time.

## 6.3 Explored directions

`exploredDirections` may record which direction cards the learner has
opened or inspected.

It must **never**:

-   determine completion;
-   generate a recommendation;
-   generate a score;
-   influence a ranking.

------------------------------------------------------------------------

# 7. SCHEMA VERSIONING

`schemaVersion` is required.

The exported Stage 4 state must include it.

Example:

``` json
{
  "schemaVersion": 1,
  "workClues": [],
  "scenarioObservations": [],
  "jobPostObservations": [],
  "exploredDirections": [],
  "modules": {}
}
```

Future versions may migrate older saved data.

Do not assume that the 4.1 schema will remain unchanged through 4.4.

------------------------------------------------------------------------

# 8. PERSISTENCE

Persist Stage 4 state locally.

Requirements:

-   survive normal page navigation;
-   survive refresh;
-   survive moving between 4.1 screens;
-   preserve learner clues;
-   preserve scenario observations;
-   preserve direction exploration state.

Do not rely on transient component state.

------------------------------------------------------------------------

# 9. EXPORT / RESTORE

Export/Restore must be available from the beginning of Stage 4.

The learner must be able to:

-   export their Stage 4 progress;
-   restore it later;
-   continue without losing Work Clues.

The export must contain enough information to restore:

-   schema version;
-   Work Clues;
-   scenario observations;
-   job-post observations;
-   explored directions;
-   module progress.

The implementation must validate the imported structure before applying
it.

Do not blindly replace application state with arbitrary imported JSON.

------------------------------------------------------------------------

# 10. LEARNER EXPERIENCE

## 10.1 Opening

The opening should establish:

> You already know how to work. Now we're going to look at the range of
> work you might explore.

Do not re-teach basic VA foundations.

Acknowledge that learners have already encountered different VA
directions in Stage 1.

The transition should make clear:

> In Stage 1, you were introduced to different kinds of VA work. Here,
> you'll look more closely at the work itself.

------------------------------------------------------------------------

# 11. SECTION 1 --- LOOK BEHIND THE JOB POST

Build this as the first substantial interaction.

## Purpose

Learners discover that:

-   the same title can describe different work;
-   different titles can contain similar work;
-   some titles describe a system or business area rather than the
    actual work.

## Implementation

Use realistic job-post-style descriptions.

Do not turn these into application exercises.

The learner should compare the task descriptions and identify what the
work actually involves.

Each of the four posts offers the same five observation options from the
production specification (select one or more), followed by that post's
feedback.

## Required interaction characteristics

-   readable on mobile;
-   concise enough to compare;
-   task-focused;
-   no salary ranking;
-   no application CTA;
-   no "should I apply?" decision.

The learner is analyzing the work, not applying for it.

------------------------------------------------------------------------

# 12. SECTION 2 --- WHAT KIND OF WORK IS THIS?

This is the main judgment activity.

## Interaction sequence

For each scenario:

1.  Present the work.
2.  Ask the learner what pattern(s) they notice.
3.  Allow multiple reasonable selections where appropriate.
4.  Reveal an explanation.
5.  Offer an optional reaction tap.

Do not force the learner to classify every scenario into exactly one
pattern.

Scenario titles must be neutral: they describe the situation and never
name or imply the pattern.

## Feedback principle

Feedback should explain reasoning.

Example:

> This is mainly OPERATE because the work keeps an ongoing business
> process moving inside the client's system. It also involves ORGANIZE
> because the information must stay accurate.

Do not reduce feedback to:

> Correct: OPERATE.

------------------------------------------------------------------------

# 13. FIVE PATTERNS

Implement these exact conceptual definitions.

## ORGANIZE

Arranging information so people can find, understand, and use it.

Distinguishing question:

> Is the main job making information orderly and usable?

## COMMUNICATE

Helping information move clearly between people.

## RESEARCH

Finding, checking, comparing, and analyzing information so someone can
make a decision or take action.

This includes basic numbers/report analysis.

## CREATE

Producing useful content or visual material.

## OPERATE

Keeping a recurring business process running inside the tools and
systems used by the business.

Distinguishing question:

> Is the main job keeping an ongoing business process working correctly
> inside its tools?

### Important

These are descriptive work patterns.

Never present them as:

-   personality types;
-   aptitude types;
-   identity labels;
-   official career categories.

------------------------------------------------------------------------

# 14. PATTERN UI

Pattern tags should be visually descriptive, not status badges.

Avoid UI that communicates:

> You ARE this type.

Prefer UI that communicates:

> This kind of work INVOLVES this pattern.

Do not use color alone to distinguish patterns.

Each pattern must remain understandable through text.

------------------------------------------------------------------------

# 15. SECTION 3 --- EXPLORE VA DIRECTIONS

Use the balanced Direction Card set from the production specification.

The v1.1 production set is these eleven directions:

-   General VA / Administrative Support
-   Customer Support VA
-   E-commerce VA
-   Amazon VA
-   Bookkeeping / Accounting Support
-   Social Media Management / Content Support
-   Executive / Personal Assistance
-   Real Estate Support
-   Lead Generation / Appointment Setting
-   Technical / Specialized VA Support
-   NDIS VA

The card content follows the production specification v1.1.

Do not add directions merely because they are currently popular.

Do not remove directions merely because PVA does not currently have a
course for them.

------------------------------------------------------------------------

# 16. TECHNICAL / SPECIALIZED VA SUPPORT

This direction exists partly for continuity with Stage 1.

It should acknowledge work such as:

-   WordPress support;
-   CRM administration;
-   automation-related support;
-   technical system maintenance.

It must not become a technical training module.

The card should make clear that additional technical learning may be
needed.

------------------------------------------------------------------------

# 17. DIRECTION CARD COMPONENT

Every card must use the same field structure.

Required:

1.  Direction name
2.  What the work involves
3.  Examples of tasks
4.  Work patterns commonly involved
5.  Work environment
6.  What can be demanding
7.  Typical path (starting point)
8.  Useful skills
9.  What would you need to learn?

## Starting-point presentation

Do not visually rank directions.

Do not use:

-   beginner → advanced;
-   level 1 → level 3;
-   entry → premium;
-   basic → expert.

Use exactly these three categories, worded exactly as shown:

-   Often entered directly
-   Often entered with related experience
-   Often developed after related experience

Give all options equal visual treatment.

------------------------------------------------------------------------

# 18. AMAZON PPC

Amazon PPC should not appear as a peer "entry direction" simply because
PVA teaches it.

Where appropriate, represent it as a later specialization related to
Amazon/e-commerce work.

Do not create an implicit message that Amazon PPC is more advanced,
valuable, or desirable.

------------------------------------------------------------------------

# 19. SECTION 4 --- WORK CLUES

Work Clues are lightweight observations.

They are not scores.

They are not personality results.

They are not recommendations.

## Reaction options

Use exactly three conceptual states:

-   **Want to explore**
-   **Not sure yet**
-   **Probably not for me**

The learner should be able to change a previous reaction.

## Interaction rule

Reaction capture should be **optional and lightweight**.

Do not require a reaction after every scenario.

After scenario feedback, and at the end of every Direction Card, present
the same compact optional control:

> Would you want to explore this kind of work?

\[Want to explore\] \[Not sure yet\] \[Probably not for me\]

Use this one question everywhere a reaction is captured (scenarios,
Direction Cards, Work Clues review). Do not introduce other wording.

The learner can continue without selecting one.

------------------------------------------------------------------------

# 20. WORK CLUES REVIEW

Provide a visible way for the learner to review accumulated clues.

The learner should be able to:

-   see their reactions;
-   change a reaction;
-   add/edit a short note;
-   remove a clue if desired.

The review should not calculate:

-   percentages;
-   scores;
-   top patterns;
-   best niches.

------------------------------------------------------------------------

# 21. NO RECOMMENDATION ENGINE

This build must not contain:

-   matching scores;
-   weighted scoring;
-   "top 3";
-   "best fit";
-   "recommended niche";
-   earning-potential optimization;
-   personality classification.

Do not add these as "future-ready" functionality.

The Stage 4 philosophy explicitly rejects this model.

------------------------------------------------------------------------

# 22. COMPLETION LOGIC

Completion should be based on meaningful learning activity.

Required conceptual conditions:

-   job-post activity completed;
-   scenario activity completed;
-   learner continued past Explore VA Directions (pressed Continue at
    the end of that section);
-   at least one Work Clue saved (any reaction, including "Probably not
    for me").

Do NOT require:

-   every card opened;
-   every direction explored;
-   a particular pattern selected;
-   a direction chosen;
-   all reactions completed.

`exploredDirections` must never be a completion dependency.

------------------------------------------------------------------------

# 23. NAVIGATION

The learner should always understand:

-   where they are in 4.1;
-   what remains;
-   how to return to previous sections;
-   where their Work Clues are.

Do not create excessive page transitions.

Prefer a guided flow with persistent Stage 4 state.

If a side panel is used, it should provide access to:

-   Stage 4 navigation;
-   Work Clues;
-   Export/Restore;
-   module progress.

Do not duplicate the old Academy dashboard architecture if the current
Academy has already moved to the newer side-panel approach.

------------------------------------------------------------------------

# 24. RESPONSIVE DESIGN

The experience must work on:

-   desktop;
-   laptop;
-   tablet;
-   mobile.

Pay particular attention to:

-   job-post comparison;
-   scenario pattern selection;
-   Direction Cards;
-   Work Clues panel;
-   Export/Restore controls.

On mobile:

-   cards may collapse secondary fields;
-   important information must remain discoverable;
-   Work Clues should remain easy to reach;
-   do not require horizontal scrolling.

------------------------------------------------------------------------

# 25. ACCESSIBILITY

Implement:

-   semantic buttons;
-   keyboard navigation;
-   visible focus states;
-   sufficient text contrast;
-   labels that do not depend on color;
-   accessible expanded/collapsed card controls;
-   readable touch targets;
-   screen-reader-friendly reaction controls.

Do not encode meaning only through color.

------------------------------------------------------------------------

# 26. VISUAL DIRECTION

Use the current PVA Academy design system where appropriate.

However:

> Do not introduce a generic AI-minisite visual identity.

The experience should feel like **PVA Academy**, not like an
interchangeable ChatGPT-generated course template.

Use the established PVA tone:

-   practical;
-   valuable;
-   authentic;
-   calm;
-   approachable;
-   learner-centered.

Avoid unnecessary decorative elements that compete with the learning
interaction.

------------------------------------------------------------------------

# 27. PROGRESS

Progress should communicate completion of the learner's journey through
the module.

It should not communicate:

-   ranking;
-   performance percentile;
-   aptitude;
-   career fit.

If progress indicators are reused from existing PVA courses, ensure they
do not imply that the learner is "leveling up" into a more valuable
niche.

------------------------------------------------------------------------

# 28. EXISTING STUDENT DATA

Do not modify unrelated existing student-progress data.

Do not migrate or overwrite Stage 1--3 progress unless explicitly
required by the existing Academy architecture.

Stage 4 should have its own state namespace.

If an existing shared progress mechanism is used, isolate Stage 4 data
cleanly.

------------------------------------------------------------------------

# 29. ACADEMY HOME INTEGRATION

When Stage 4.1 is ready:

-   Stage 4 should appear as one coherent learning experience;
-   the Academy Home should point learners to the Stage 4 course;
-   the old scored Niche Finder should not be presented as the Stage 4
    learning activity;
-   the existing "Direction Map --- Coming soon" placeholder can become
    the Stage 4 entry point.

The final Stage 4 card should communicate the journey rather than
presenting four unrelated mini-courses.

------------------------------------------------------------------------

# 30. OUT OF SCOPE

Do not build:

-   4.2 content;
-   4.3 matching logic;
-   4.4 Direction Map generation;
-   portfolio functionality;
-   job application functionality;
-   interview preparation;
-   client positioning;
-   salary tools;
-   market ranking;
-   AI niche recommendations;
-   role-specific training.

Create clean extension points, but do not implement future modules
prematurely.

------------------------------------------------------------------------

# 31. QA ACCEPTANCE TESTS

Before deployment, verify all of the following.

## Functional

-   [ ] 4.1 loads correctly.
-   [ ] All sections are reachable.
-   [ ] Job-post activity works.
-   [ ] Scenario selection works.
-   [ ] Multiple reasonable pattern selections can be represented where
    required.
-   [ ] Feedback displays correctly.
-   [ ] Optional reactions save correctly.
-   [ ] Reactions can be changed.
-   [ ] Notes can be added/edited/removed.
-   [ ] Direction Cards open and close correctly.
-   [ ] Direction exploration state persists.
-   [ ] Completion works.
-   [ ] Completion does not depend on opening every card.
-   [ ] Export works.
-   [ ] Restore works.
-   [ ] Invalid import data is rejected safely.
-   [ ] Refresh does not lose progress.

## State

-   [ ] `schemaVersion` is present.
-   [ ] `workClues` is the only authoritative reaction store.
-   [ ] No duplicate `interestedDirections` source of truth exists.
-   [ ] `reflection` is not stored unless explicitly required.
-   [ ] `exploredDirections` never feeds completion.
-   [ ] State is isolated to Stage 4.

## Learning

-   [ ] No score exists.
-   [ ] No ranking exists.
-   [ ] No recommendation exists.
-   [ ] No "best match" result exists.
-   [ ] Pattern tags do not imply identity.
-   [ ] Starting-point descriptions are visually neutral.
-   [ ] Technical/Specialized VA Support is represented.
-   [ ] NDIS VA is represented.
-   [ ] Scenario titles do not name or imply the pattern.
-   [ ] Every reaction control uses the same question and three responses.
-   [ ] Amazon PPC is not presented as a ranked peer entry path.

## Responsive

-   [ ] Desktop tested.
-   [ ] Laptop tested.
-   [ ] Tablet tested.
-   [ ] Mobile tested.
-   [ ] No horizontal overflow.
-   [ ] Work Clues remain usable on mobile.
-   [ ] Job-post comparison remains understandable on mobile.

## Accessibility

-   [ ] Keyboard navigation works.
-   [ ] Focus states are visible.
-   [ ] Buttons have meaningful labels.
-   [ ] Color is not the only signal.
-   [ ] Contrast is adequate.
-   [ ] Interactive controls have usable touch targets.

------------------------------------------------------------------------

# 32. QA CONTENT REVIEW

After functional QA, perform a separate content/learning QA.

Check every learner-facing screen against:

`PVA_Module_4.1_Production_Specification_v1.md`

Specifically verify:

-   no copy was silently rewritten into a different instructional
    meaning;
-   no additional framework was introduced;
-   no generic course filler was added;
-   no personality language appeared;
-   no scoring language appeared;
-   no "best niche" language appeared;
-   no application advice appeared;
-   no Stage 5 technical training appeared.

------------------------------------------------------------------------

# 33. BUILD BEHAVIOR IF SOMETHING IS AMBIGUOUS

If you encounter an implementation question that changes:

-   the learning sequence;
-   the data model;
-   the meaning of a learner interaction;
-   completion logic;
-   the Direction Card structure;
-   the Stage 4 architecture;

**do not make a silent design decision.**

Pause and ask for clarification.

For minor implementation details that do not affect the learning design,
follow the existing PVA Academy conventions.

------------------------------------------------------------------------

# 34. DEFINITION OF DONE

Module 4.1 is ready for release when:

1.  The learner can complete the full 4.1 journey without confusion.
2.  The five-pattern framework works as a descriptive lens.
3.  Job-post analysis creates the intended discovery.
4.  Scenario activities require judgment rather than memorization.
5.  Direction Cards provide balanced, neutral exploration.
6.  Work Clues capture the learner's own reactions.
7.  No recommendation/scoring system exists.
8.  State persists correctly.
9.  Export/Restore works.
10. The architecture can accept 4.2--4.4 without redesigning the state
    foundation.
11. Existing student progress is untouched.
12. Academy Home integration is clean.
13. Mobile and accessibility checks pass.
14. Content QA confirms fidelity to the production specification.

------------------------------------------------------------------------

# 35. FINAL BUILD INSTRUCTION

Build **Module 4.1 --- Understanding VA Work Directions** according to
this brief and the production specification.

Treat the design as locked.

**Do not redesign the learning architecture.**

If you see an opportunity to improve something that would change the
learning design, flag it for review rather than implementing it
unilaterally.

The goal is not to make another course-shaped microsite.

The goal is to build the first part of a coherent Stage 4 experience in
which a learner can genuinely explore:

> **What kinds of VA work are there---and what do I notice about the
> work itself?**
