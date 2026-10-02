# PVA Stage 4 · Module 4.1 — v1.1 Build & QA Report

## Final status (2 Oct 2026, after owner approval)
- **Approved as reported:** neutral scenario titles, Typical path mapping, and the NDIS card, with two wording changes applied:
  - "Supporting administrative tasks related to invoicing and client records";
  - "Work may follow Australian business hours, depending on the client and role."
- **Source documents synchronized:** `docs/PVA_Module_4.1_Production_Specification_v1.1.md` and `docs/PVA_Module_4.1_Build_Brief_v1.1.md`.
- **Final QA:** 78/78 functional and state checks; responsive, keyboard and accessibility checks pass; content fidelity against Spec v1.1 shows no copy differences.
- **Open flag:** two NDIS lines still mention claims ("…documentation, and claims-related tasks" under "What does the work involve?", and "the claims process" under "What would you need to learn?"). Unchanged pending the owner's decision.
- Sections 1–5 below are the v1.1 review report as approved.


**Build:** `pva-find-your-direction` v1.1 (local commit only — **not pushed, not deployed**)
**Sources:** `PVA_Module_4.1_Production_Specification_v1.md` (learner copy) · `PVA_Module_4.1_Build_Brief_v1.md` (implementation) · v1.1 correction instructions (2 Oct 2026)
**QA run:** 2 Oct 2026, headless Chromium, local server

---

## 1. Changes made in v1.1

| # | Correction | What changed | Files |
|---|---|---|---|
| 1 | Scenario titles | All five titles replaced with neutral, work-based titles drawn from each scenario's own context. Scenario text, IDs, options and explanations unchanged. | `m41-data.js` |
| 2 | NDIS VA card | Added as card **11**, same nine-field structure, same neutral treatment and reaction control. No other card removed; the list layout has no card-count limit. | `m41-data.js` |
| 3 | Reaction question | One question on every reaction control (5 scenarios, 11 cards, Work Clues review): **"Would you want to explore this kind of work?"** with **Want to explore / Not sure yet / Probably not for me**. "This reaction is optional." under every scenario and card control. Stored values unchanged (`explore` / `unsure` / `not_for_me`). | `m41.js` |
| 4 | Typical path | All 11 cards now use one of three categories. Each card's explanatory sentence under it is unchanged spec copy. Identical styling for all three. | `m41-data.js` |
| — | Version label | Footers and README read v1.1. | 3 HTML files, `README.md` |

**Scenario titles**

| # | v1.0 (spec) | v1.1 |
|---|---|---|
| 1 | Organizing Information | The Client’s Shared Drive *(your example)* |
| 2 | Customer Communication | A Question About an Order |
| 3 | Research and Analysis | Several Competitors |
| 4 | Creating Content | Next Month’s Topics |
| 5 | Keeping a Process Running | Orders Throughout the Day |

**Typical path mapping (needs your sign-off — see §5)**

| Card | Spec wording | v1.1 category |
|---|---|---|
| General VA / Administrative Support | Often entered directly | Often entered directly |
| Customer Support VA | Often entered directly | Often entered directly |
| Social Media / Content Support | Often entered directly with relevant skills | Often entered directly |
| Lead Generation / Appointment Setting | Often entered directly with relevant communication skills | Often entered directly |
| E-commerce VA | Possible starting direction with relevant skills | Often entered with related experience |
| Amazon VA | Possible starting direction with relevant preparation | Often entered with related experience |
| Bookkeeping / Accounting Support | Often entered with relevant experience or training | Often entered with related experience |
| Executive / Personal Assistance | Possible starting direction with relevant experience | Often entered with related experience |
| Real Estate Support | Possible starting direction with relevant preparation | Often entered with related experience |
| NDIS VA *(new)* | — | Often entered with related experience |
| Technical / Specialized VA Support | Often developed after relevant experience or training | Often developed after related experience |

**State architecture: unchanged.** `schemaVersion: 1`; `workClues` the only reaction store; no `interestedDirections`; no `reflection`; `exploredDirections` never used for completion; no score, ranking, recommendation or "best match". The NDIS card uses the new stable ID `dir-ndis`; no existing ID changed.

---

## 2. Copy provenance

### A. Reproduced from the Production Specification (verbatim)
- Module opening (hero), Section 1–4 openings, Discovery panel, Key idea.
- All four job posts: titles, text, questions, feedback; the five observation options.
- All five scenarios: text, "What kind of work is happening here?", "Mainly: …", explanations, "Think of … as", the numbers note (S3) and the ORGANIZE/OPERATE distinction block (S5).
- Pattern Reference Panel and "Remember" box.
- Direction Cards 01–10: every field **except** the Typical path category line (see B).
- Amazon PPC related-specialization note (on the E-commerce and Amazon cards).
- Section 4 opening, the three clue groups and their descriptions, "Why did you react this way?".
- End-of-Module Synthesis and Transition to 4.2 ("WORK → ME").

Automated check: all 388 learner-facing lines of spec §2–§12 were searched for in the rendered module. 363 appear verbatim. The 25 that don't are all expected:
- 5 retitled scenarios and 9 normalized Typical path lines (v1.1 corrections);
- 10 card pattern lists, which render as separate tags, not a "·"-joined line (same words, same order);
- "Why did you react this way?", which only renders once a clue exists;
- 1 spec heading fragment.

### B. Introduced or normalized from the Build Brief / your v1.1 instructions
- Reaction question on cards and in the review: "Would you want to explore this kind of work?" (the spec had it only for scenarios; v1.0 used the Brief's "How does this kind of work feel to you?" on cards).
- "This reaction is optional." under card controls (spec had it for scenarios only).
- Typical path categories (the three Brief §17 phrasings, per v1.1 §4).
- Neutral scenario titles (v1.1 §1).
- NDIS VA card *content* — **drafted by me** (see C), at your instruction to add it.

### C. Implementation wording added by me
- **NDIS VA card — all field text.** Not in the spec. Kept exploratory: what the work involves, typical tasks, environment, demands, path, skills, what to learn. No NDIS training, rules, prices or claim steps. **Needs your approval** (see §5).
- **Navigation:**
  - sidebar section names: "Start", "1 · Look Behind the Job Post" … "Wrap-up";
  - "Stage 4 home"; "4.2/4.3/4.4 … Coming later";
  - "☰ Stage 4 menu" and "My Work Clues (n)" mobile buttons;
  - "Continue to Section 2/3/4 →" and "Continue →".
- **Activity controls:**
  - job posts: "Select one or more." and "See what stands out";
  - scenarios: "Possible patterns. You can select more than one." and "Show the explanation";
  - "You noticed: …" (echoes the learner's own picks back, with no right/wrong marking);
  - Direction Cards: "Show tasks, demands and path" / "Hide details".
- **Work Clues review:**
  - "Nothing here yet.";
  - the empty-state note pointing to Sections 2 and 3 ("Any reaction counts, including ‘Probably not for me.’");
  - "Remove this clue";
  - "(optional)" next to the note label;
  - the sidebar panel line "No Work Clues yet. React to any scenario or direction to start collecting them."
- **Completion box:**
  - "To finish Module 4.1" with four checklist lines;
  - "You don’t need to open every direction card or choose a direction.";
  - "Module 4.1 complete" with the backup reminder.
- **Stage 4 home and Progress page:**
  - structural text reusing approved phrases (stage and module core questions, WORK → ME → MATCH → DIRECTION, the spec's "direction is not a permanent decision" line);
  - the standard PVA storage warnings and backup/restore messages, adapted from Parts 2–5.
- **Screen-reader only:** each reaction control's name includes which scenario or direction it belongs to (for example "… (Scenario 1: The Client’s Shared Drive)"). Not visible on screen.

---

## 3. Tests rerun

**Functional and state: 77 checks, all PASS.** The v1.0 suite (63) was rerun in full, plus 14 v1.1 checks. These include:
- Scenario-answer leakage: no title contains organiz-/communicat-/research/creat-/operat-/analy-/"process running". The pattern only appears after the learner chooses and asks for the explanation.
- NDIS card present (11 cards). No separate Amazon PPC card; the PPC note stays on E-commerce/Amazon only.
- Reaction consistency: all 19 rendered reaction controls (scenarios, cards, review) show the identical question and the identical three responses. Internal values are exactly `explore` / `unsure` / `not_for_me`. Each control's screen-reader name includes its context.
- Direction Card consistency: all 11 cards have the identical field structure and order. Typical path uses only the three categories, with identical computed styling.
- Completion:
  - not complete without a clue, or before Directions is passed;
  - complete with a single "Probably not for me" clue and zero cards opened;
  - `exploredDirections` never affects it.
- State: `schemaVersion: 1` present. No `interestedDirections` or `reflection` stored. The derived direction list works.
- Persistence: survives refresh (section, observations, clues, notes).
- Export/Restore/Clear:
  - the export contains only Stage 4 data;
  - restore works;
  - non-JSON, another course's backup, a newer backup version and a newer `schemaVersion` are each rejected with a message, with state unchanged;
  - tampered data is cleaned (bad reactions and unknown keys like `score` or `recommendedNiche` are dropped);
  - Clear leaves other courses' keys alone.
- **Existing progress:** a backup exported from the v1.0 build restores into v1.1 identically (clues, notes, scenario and job-post observations, module state), and its clues display with the new labels.

**Responsive (all pass):** 390 / 820 / 1366 / 1600 px across the home page, Progress page and all six 4.1 sections, with every card expanded. No horizontal overflow. The mobile drawer opens from "My Work Clues" with focus on the panel; Esc closes it and returns focus. No touch target under 40 px in the activities.

**Keyboard and accessibility (all pass):**
- every button has a name and every input has a label;
- cards open with Enter and expose `aria-expanded`;
- reactions work with Space and arrow keys and show a visible focus outline;
- no meaning is carried by color alone.

**Content fidelity:** see §2A.

---

## 4. Remaining discrepancies
None found in testing. Known, intentional, and documented:
- The spec's own wording for the 5 scenario titles and 9 Typical path lines is now superseded by v1.1. If the spec is the long-term source of truth, it should be updated to match (v1.1 of the spec), or the next build will reintroduce them.
- The Build Brief §19 example question ("How does this kind of work feel to you?") is now unused, per v1.1 §3.

---

## 5. Decisions that need your approval
1. **NDIS VA card text** (drafted by me, §2C). Please check it against your NDIS VA Foundations course. In particular, check whether "Supporting invoicing and claims processes" and "Work often follows Australian business hours" describe the beginner-level reality you want shown.
2. **Typical path mapping** (§1 table). Most mappings are direct. The judgment calls are:
   - E-commerce, Amazon and Real Estate, whose spec wording ("possible starting direction with relevant skills/preparation") I mapped to *Often entered with related experience*;
   - Social Media and Lead Generation ("entered directly *with relevant skills*"), which I mapped to *Often entered directly*.
3. **Neutral scenario titles** (§1 table). Please confirm the five titles, especially "Several Competitors" and "Next Month’s Topics", which stay close to the scenario text.

No learning-design issues were found that would require changing the architecture.
