# Stage 4 · Module 4.3 — Build & Test Report (v1.0)

**Branch:** `module-4-3`, based on `main` at `75ad730`. **Not merged. Not deployed.**
**Source of truth:** `docs/PVA_Module_4.3_Production_Specification_v1.5.md` (approved 14 Oct 2026), plus owner decisions of 15 Oct 2026 on field names, limits, 4.4, cache-busting and navigation.
**Built:** 15 Oct 2026.

## 1. Commits (in order)
| Commit | Step | Scope |
|---|---|---|
| `e5fc95d` | A | Test preparation only: version constants, schema-4 "newer" fixtures, golden-equivalence helper, harness support for versioned URLs. **71/71 on the unchanged app** (`tests/results/08`). |
| `ec1f9e2` | B | `state.js` only: schema v3, migration, `normalize43`, D16, limits, `PVAS4.m43`, shared summary function, Restore confirmation line. 117/117 (`results/09`). |
| `de2a2f5` | C | Shared backup summary used everywhere; page summaries removed from `home.js`, `m41.js`, `m42.js`. 123/123 (`results/10`). |
| `bca5a8c` | D | The 4.3 page, `m43.js`, `.s43-*` styles. 157/157 (`results/11`). |
| `d9fff3a` | E1 | Navigation: hub, Progress, `home.js`, 4.1/4.2 sidebars, 4.2's NEXT link. 160/160. |
| `45e3ef0` | E2 | `?v=4.3.0` on every shared asset, on all five pages. 162/162. |
| `eb422fd` | E3 | Playwright tests for 4.3: committed, **not run** (`results/12`). |
| (this commit) | E4 | README, this report, final run (`results/13`). |

## 2. App files changed (vs `75ad730`)
**New:**
- `public/4-3/index.html`
- `public/shared/m43.js`

**Shared code:**
- `state.js`: schema v3, `normalize43`, 4.3 API, shared summary, Restore line.
- `home.js`: 4.3 status and Continue; its own summary removed.
- `stage4.css`: additions at the end of the file only.

**4.1 and 4.2** (only navigation, the summary refactor and versioned URLs):
- `m41.js`, `m42.js`: own summary removed (the only change to each).
- `4-1/index.html`, `4-2/index.html`: 4.3 sidebar link, `?v=`, and 4.2's NEXT link.

**Hub and Progress:**
- `index.html`: 4.3 entry, footer, `?v=`.
- `progress/index.html`: footer, `?v=`.

No 4.1 or 4.2 learning activity, learner-facing copy or stored data changed. The golden snapshots are untouched.

## 3. Final results (`tests/results/13-4.3-final.txt`): 162/162
| File | Tests | Result |
|---|---|---|
| `unit/harness.test.mjs` | 5 | 5 pass |
| `unit/state.test.mjs` (4.1/4.2 baseline + Phase 0 guard) | 45 | 45 pass |
| `unit/state43.test.mjs` (4.3 state) | 46 | 46 pass |
| `pages/pages.test.mjs` (hub, Progress, 4.1, 4.2, summary) | 29 | 29 pass |
| `pages/m43.test.mjs` (4.3 page) | 37 | 37 pass |
| **Playwright** `e2e/stage4.spec.mjs` | 37 | **NOT RUN.** The browser download is blocked in the build workspace. E1–E9 (27 tests) passed on the owner's machine on 14 Oct, before 4.3; the 4.3 additions have never run. |

### Required gates and where they are tested (all executed, all passing)
| Gate | Tests |
|---|---|
| **Restore integrity** (missing / altered / null / text / misleading `payload.summary` → same state, same message) | `state43` RI ×2 (v3 and v2 backups) |
| D16 switching rules 1–5 | `state43` D16-1…5 + unskip; `m43` U1–U6 (page, incl. Cancel keeping the reason byte-identical, and text typed but not yet saved) |
| D16 four-case normalization + standard cleaning | `state43` N1–N5, each on load **and** on restore |
| Migration v1/v2 → v3; v4 rejected; round trip | `state43` M1–M7; `state` B1–B3, B11–B13 via golden equivalence |
| Rollback: guard release `ee27fd0` meets v3 data | `state43` RB1 (byte-identical legacy copy, sha256) and RB2 (kept, downloadable, restorable by v3) |
| Direction Card content parity with 4.1 | `m43` P1, all 11 cards, field by field plus full card text, incl. PPC notes and `patternsNote` |
| Full 4.1/4.2 regression | `state` B1–B18, G1–G17, W1–W2; `pages` P1–P17; Playwright E1–E9 (owner) |
| Limits (300 / 1000 / 140 ×10 / 300 / 2) | `state43` L1–L3, plus `m43` LQ3 |
| Shared summary on every page | `pages` SUM ×6, P4 (updated deliberately); `m43` F2; `state43` SU1–SU2 |
| No scoring / matching / preselection / reordering | `m43` O1, C1, D1, W1; `state43` V4, S1 |

**Mutation checks** (each fault introduced on purpose, then reverted):
- **State layer, 4 faults, all caught:** silent reason removal; Restore reading the summary; a blank reason kept; questions cleared on a judgment change.
- **Page, 5 faults, all caught:** the page removing a reason without asking; questions offered for "Not for me right now"; preselection; a missing `patternsNote`; reordering of directions.

## 4. Deliberate test updates (not weakened)
- `EXPECTED` versions moved from 2 to 3. Golden files are unchanged and compared with only `schemaVersion` replaced.
- The "newer data" fixtures moved from schema 3 to schema 4, because v3 is now real.
- P4: summary shape now includes `module43Complete` (decision 5).
- P1–P3: navigation now includes 4.3.

## 5. Interpretations made (within v1.5; flag any you want changed)
1. Fields are saved as the learner types; **Save my reflection** marks the reflection saved and requires a judgment. Screen 5 lists only saved reflections.
2. **Examine this direction** (or opening `#examine-<id>`) counts as "examined". Screen 5 reached with at least one saved reflection counts as "reached the provisional decision step".
3. Both **Examine another direction** and **Review my directions** go to the direction list. The spec names both actions but gives them no distinct destination.
4. All 4.3 text fields use the standard cleaning (`cleanText`). That includes "What may be new for me", so line breaks become spaces there as well as in reasons.
5. An invalid stored judgment becomes "no judgment"; the learner's text is kept. If undecided and a selection are both stored, the selection stands, `undecided` is cleared, and the note is kept.
6. Opening 4.3 marks it "In progress" on the hub, the same convention as 4.1 and 4.2 (via the saved `lastSection`). **Correction (15 Oct):** when 4.3 progress is saved without a valid `lastSection`, the hub now also counts *any* saved 4.3 progress: Work Clues or evidence reviewed, a direction examined, the decision reached, undecided chosen, or a selection. Before, it counted only explorations, so it could show "Not started" / "Start Module 4.3". Tests S1–S3 (`tests/results/14`, 168/168); S2 ×4 failed on the previous code.

## 6. Limitations
- **Not yet checked in a real browser:**
  - all 4.3 layout, keyboard and dialog behaviour;
  - the comparison layout at the 960 px breakpoint;
  - the `?v=` asset requests.

  Run `npm run test:e2e` locally (37 tests).
- Cache-busting covers scripts and stylesheets. Whether browsers revalidate the HTML pages themselves depends on Cloudflare's headers, which were not verifiable from here.
- The release must respect the guard-propagation and rollback policy (README, "4.3 release checklist").

## 7. Owner verification (to run locally)
```text
git fetch origin && git checkout module-4-3
cd tests && npm ci
npm test                                   # expect: tests 162, pass 162, fail 0
npx playwright install chromium && npm run test:e2e   # expect 37 passed; first run of the 4.3 tests
npm run serve                              # manual check at http://localhost:4173/4-3/
```
