# Stage 4 · Module 4.4 — Build & Test Report (v1.0)

**Branch:** `design-4-4`, based on `main` at `de481a0` (4.3 v1.0, live). **Not merged. Not deployed.**
**Source of truth:** `docs/PVA_Module_4.4_Production_Specification_v1.0.md` (approved 15 Oct 2026 with the four §20 defaults: 300-character limits; strict "Use this idea" acceptance; the new wording and placements; no stored "last saved" date). Design authority: `docs/PVA_Module_4.4_Design_Brief_v0.3_APPROVED.md`.
**Built:** 15 Oct 2026.

## 1. Commits (on top of the design documents)
| Commit | Scope |
|---|---|
| `3c69024` | Step 1 — state layer: schema v4, backup v4, `normalize44`, v3→v4 migration, `PVAS4.m44`, summary flag, Restore line; `state44` tests; legacy copy of the 4.3 release `state.js`; deliberate fixture/test updates |
| `fde83a2` | Steps 2–3 — the 4.4 page, styles and print layout; navigation (hub priority, sidebars, 4.3 finish link, `?v=4.4.0`); deliberate navigation test updates |
| `89f7453` | Step 4 — page tests, Playwright E15–E23, a fix found by the tests, results, README, this report |

## 2. Files changed (vs `de481a0`)
**App (`public/`):**
| File | Change |
|---|---|
| `4-4/index.html` | New. Shell cloned from 4.3; four sections |
| `shared/m44.js` | New. Screens, transitions with confirmations, "Use this idea", map, completion, print |
| `shared/state.js` | Schema/backup 4, `LIMITS_44`, `normalize44`, migration step, `PVAS4.m44`, `module44Complete`, Restore line and sentence |
| `shared/home.js` | 4.4 status, stamp, summary line, Continue priority (D25) |
| `shared/m43.js` | One line: finish screen "Continue to Module 4.4 →" is now a link |
| `shared/stage4.css` | `.s44-*` rules and `@media print` for the map, appended only |
| `index.html` | 4.4 entry linked with `#stamp44`; footer; `?v=4.4.0` |
| `progress/index.html` | Footer; `?v=4.4.0` |
| `4-1/`, `4-2/`, `4-3/index.html` | Sidebar 4.4 link; `?v=4.4.0` |

No 4.1, 4.2 or 4.3 learning activity, learner copy (other than the 4.3 finish link and sidebars) or stored data changed. `m41.js`, `m41-data.js`, `m42.js`, `m42-data.js` untouched. Golden files untouched.

**Tests (`tests/`):** new `unit/state44.test.mjs`, `pages/m44.test.mjs`, `fixtures/legacy/state-de481a0.js`; updated `fixtures/fixtures.mjs`, `helpers/env.mjs`, `unit/harness.test.mjs`, `unit/state43.test.mjs`, `pages/pages.test.mjs`, `pages/m43.test.mjs`, `e2e/stage4.spec.mjs`, `e2e/playwright.config.mjs`; results 16–18.

## 3. Results
### Node (jsdom) — `tests/results/16-4.4-node-final.txt`: **262/262**
| File | Tests |
|---|---|
| `unit/harness.test.mjs` | 5 |
| `unit/state.test.mjs` (4.1/4.2 baseline + Phase 0 guard) | 45 |
| `unit/state43.test.mjs` | 46 |
| `unit/state44.test.mjs` (new) | 47 |
| `pages/pages.test.mjs` | 29 |
| `pages/m43.test.mjs` | 43 |
| `pages/m44.test.mjs` (new) | 47 |

### Playwright — `tests/results/17-4.4-playwright-workspace.txt`: **50 passed**
Run **in the build workspace** against its preinstalled Chromium 141 (`PW_CHROMIUM`), with Google Fonts and the favicon answered locally because the workspace has no internet. This is a real browser run, but it is not the owner's environment; **the owner's local run is the release check.** 50 = the previous 37, minus E14 (replaced by E23), plus the 4.4 page in E1 (×4 widths) and E6, plus E15–E23.

### Mutation checks — `tests/results/18-4.4-mutation-checks.txt`: **19/19 caught**
State (9): unsaved reflection added; step removed without confirmation; still exploring without confirmation; investigation step discarded on add; normalize dropping unsaved-reflection directions; migration keeping a v3 `4-4` key; summary flag missing; Restore line missing; hidden step editable. Page (8): idea saved on click; pending idea saved on blur; replace without asking; Cancel still removes; 4.3 selections pre-added; page writing 4.3; unlinked tasks on the map; warning style on "Not for me right now". Hub (2): Review label ignoring earlier modules; status ignoring data without `lastSection`.

### Spec gates and where they are tested
| Gate | Tests |
|---|---|
| Schema v4, v3→v4 migration, golden equivalence | `state44` V1, M1–M6, N1–N5; `state` B-tests via `EXPECTED` |
| Export / Restore / Clear | `state44` M5, SU1, BK1–BK4; `m44` F2 |
| Both rollback targets | `state44` RB1b, RB2b (`ee27fd0`), RB3, RB4 (`de481a0`) |
| Guard | `state44` G1 ×3, G2; `m44` G1; Playwright E22 |
| Source-record immutability | `state44` IM1, IM2; `m44` IMP, W1; mutation "page writing 4.3" |
| Every transition and Cancel | `state44` T1–T13, T4b; `m44` TR1–TR9; Playwright E17 |
| Investigation-step preservation | `state44` T8–T12, BK3; `m44` TR7, TR8; Playwright E17 |
| "Use this idea" save semantics | `m44` U1–U9, S3a; Playwright E18 |
| Missing data (MD1–MD10) | `m44` MP3, MP4, F1, MD5, MD10, CH3; `state44` C3 |
| Completion | `state44` C1–C4; `m44` F1, F2; Playwright E15, E16 |
| Navigation priority (D25) | `m44` NV1–NV4; Playwright E15 |
| Print | `m44` PR1; Playwright E20 (print media), E21 (PDF produced) |

## 4. Deliberate updates to existing tests (spec §18)
- `EXPECTED` 3 → 4; "newer" fixtures schema/wrapper 4 → 5.
- Summary shape gains `module44Complete` (`state43` SU1, `m43` F2, `pages` P4 and SUM).
- `state43` M3–M6 use `EXPECTED` instead of a literal 3.
- Navigation: `pages` P1–P3 (4.4 linked, summary line names 4.4); `m43` J1 (finish link), N1 (with 4.1–4.3 complete, Continue is now "Start Module 4.4"), N2, N3, S1 (summary line).
- Harness: `RELEASE = '4.4.0'`; R2 uses `EXPECTED`.
- Playwright: E10 (4.4 is a link); E14 replaced by E23; `PAGES` includes the 4.4 page.

## 5. Deviations from the specification
1. **`setStillExploring(false)` when not exploring** returns the current state (`'directions'` or `'empty'`) instead of always `'empty'` as the §9 table says. It changes nothing in either case; returning `'empty'` while directions are on the map would be untrue. Tested via T9.
2. **Additions (not removals):** optional `PW_CHROMIUM` in `playwright.config.mjs` and local answers for fonts/favicon in the spec file, both active only when `PW_CHROMIUM` is set — so Playwright could run here. Unset on the owner's machine, nothing changes. Extra tests beyond §17: MP6 (learner text never becomes markup), W3 (labels equal the live 4.1/4.3 wording), IMP (page-level immutability over a whole journey), G2 (another tab saving newer data).
3. **Fix found by the tests:** a step field that had not changed was re-saved when the learner left Screen 3, which rewrote `_meta.updatedAt`, so a later Cancel did not leave storage byte-identical. Fields now save only text the learner changed. This makes the code meet R-ST-3; it is not a behaviour change for learners.

No other deviations. Every requirement ID in spec §1–§15 is implemented as written.

## 6. Limitations
- Real-browser results above come from the workspace's Chromium 141, not the owner's machine; fonts were stubbed, so text metrics there differ slightly from production.
- `page.pdf()` and print media emulation check structure and colour, not Chrome's print dialog itself (margins, headers/footers, page breaks as the learner sees them).
- Cloudflare's caching of the HTML pages themselves was not verifiable from here (same as 4.3).

## 7. Owner verification — DONE (15 Oct 2026, Windows, real Chrome)
- `npm test` on `89f7453`: **262/262**.
- `npm run test:e2e`: **50 passed** (first run on the owner's machine, Playwright's own Chromium).
- Manual checks 1–5 below: **all passed**, including Chrome's real print preview (map only, readable in black and white, sensible page breaks) and "Save as PDF".
- Owner approved the release (merge `design-4-4` → `main`) on 15 Oct 2026.

### Commands used
```text
git fetch origin && git checkout design-4-4 && git pull
cd tests && npm ci
npm.cmd test                                   # expect: tests 262, pass 262, fail 0
npm.cmd run test:e2e                           # expect: 50 passed (first run on your machine)
npm.cmd run serve                              # then open http://localhost:4173/4-4/
```
Manual checks (spec §17.4):
1. Wording of all four screens, both confirmations, "Use this idea" and the map.
2. **Chrome's real print preview** (Ctrl+P on Screen 4): only the map; readable in black and white; sensible page breaks; "Save as PDF" produces a usable file.
3. Phone width (390 px): Screen 2 list, Screen 3 ideas, the map.
4. Both confirmations by hand: Cancel keeps everything; OK removes only the map's step.
5. Export → Clear → Restore brings the map back, including a kept investigation step (choose "still exploring", write a step, add a direction, then Export).
