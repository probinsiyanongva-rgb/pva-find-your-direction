# Stage 4 — Phase 0 Report: Data-Protection Guard and Regression Baseline

**Branch:** `phase-0-guard` (based on `main` at `33c4e04`). **Owner-verified and approved for release on 14 Oct 2026 (§8).** Merging to `main` deploys it (Cloudflare deploys automatically from `main`).
**Scope:** Phase 0 only. No Module 4.3 code. No change to 4.1/4.2 page HTML, module scripts, content data, schema version or backup format.
**Date:** 14 Oct 2026

## 1. What was wrong
`public/shared/state.js` at `33c4e04` handled saved progress it could not read (newer `schemaVersion`, malformed JSON, invalid version) like this:
- It showed a banner and continued with an empty in-memory profile.
- The next save then **replaced the stored data**.

**Module 4.1 and 4.2 save as soon as they open** (they record the current section). So just **opening** either page with newer data replaced the learner's whole profile with an empty one, including 4.1 and 4.2 progress. The hub and Progress pages don't save on open, but the first Export/Restore/Clear interaction would.

This is reproduced by the recorded baseline run, `tests/results/01-baseline-before-guard.txt`:
- P13 `4-1`: expected `{"schemaVersion":3,…}`, actual `{"schemaVersion":2,"workClues":[],…}`.

## 2. What changed (`public/shared/state.js` only)
| Area | Behaviour now |
|---|---|
| Load | Unreadable or newer stored data is kept untouched. **This includes a key that exists with an empty-string value** (review revision): `''` is treated as unreadable saved data, not as "nothing saved". Saving is paused (`PVAS4.saveBlocked()` returns `'newer'` or `'unreadable'`). The page still works in memory. |
| Every save | **Exactly one write per save** (review revision: an earlier duplicate `setItem()` was removed). `lastSeenRaw` is set only after that write succeeds. Never writes while paused. Before each write, if the stored text changed since this tab last read or wrote it, and this version can't read the new text, the tab pauses instead of writing. This covers an old tab left open while another tab or a newer version saves. A value that changes to `''` is caught the same way. |
| Banner | The existing storage banner is reused. A **Download saved data** button is added from `state.js`, so no page HTML changes. |
| Download saved data | Gives the exact stored data. JSON objects are wrapped in the normal backup format (`version: 2`), so a newer version can restore them. Text that isn't JSON is saved verbatim as `rawText`. |
| Export while paused | Hands over the protected data, not the empty in-memory page state. |
| Clear / Restore while paused | Separate warning: "…can't read… will permanently delete/replace it… press Cancel and download it first." OK proceeds (an explicit learner choice). Cancel changes nothing. |
| Intentional change from `33c4e04` | `33c4e04` treated an empty-string value as "nothing saved", started fresh, and overwrote it on the first save. It is now preserved, and the "could not be read" message is shown. |
| Unchanged | Storage key, schema v2, `migrate()`, `normalize()`, wrong-file messages, the storage-unavailable banner, and all v1/v2 behaviour. Golden tests prove that v1/v2/tampered data is still read exactly as before. |

### Learner-facing text added (please review the wording)
- **Heading:** Saved progress needs attention.
- **Newer data:** This browser has Stage 4 progress saved by a newer version of this course. To keep it safe, this page will not save over it, so changes you make here won’t be saved. Use Download saved data to keep a copy, then open the course again later.
- **Unreadable data:** Your saved Stage 4 progress could not be read. To keep it safe, this page will not save over it, so changes you make here won’t be saved. Use Download saved data to keep a copy before you restore or clear progress.
- **Button:** Download saved data
- **Save status:** Not saved — see the message at the top of this page.
- **Restore warning (added to the existing confirmation):** This browser also has Stage 4 progress that this version of the course can’t read. Restoring will permanently replace it. If you haven’t used “Download saved data” yet, press Cancel and download it first.
- **Clear confirmation (paused only):** This browser has Stage 4 progress that this version of the course can’t read. Clearing will permanently delete it. If you haven’t used “Download saved data” yet, press Cancel and download it first. Delete it and start fresh? Other PVA courses are not affected.

## 3. Tests (`tests/`, Node 22.12+, jsdom 27.4.0)
| Suite | What it covers |
|---|---|
| `unit/state.test.mjs` | **B1–B18 baseline:** loading and migration (golden), saving, Work Clues, 4.2 tasks and deletion, completion persistence, Export/Restore/Clear, rejected files, storage unavailable. **G1–G17 guard**, including G15–G17 for an empty-string value. **W1–W2:** one write per save, and a failed write. |
| `pages/pages.test.mjs` | Hub, Progress, 4.1 and 4.2 driven through their own controls. **P1–P12 baseline:** statuses, Continue button, canonical card order, full 4.1 and 4.2 completion, persistence on reopen, read-only handoff, delete with confirm. **P13–P17 guard** on every page, including P16–P17 for an empty-string value. |
| `fixtures/golden/` | Output of the **unchanged** `state.js` (`33c4e04`, sha256 recorded) for v1, v2 and tampered data, and v1/v2 backups. |
| `e2e/stage4.spec.mjs` | 27 Playwright tests: widths 390/820/1366/1600, console errors, real downloads, keyboard. **Not run** (see §4). |

### Recorded runs (`tests/results/`)
| File | Code under test | Result |
|---|---|---|
| `01-baseline-before-guard.txt` | unchanged `33c4e04` | 55 tests: **33 pass** (all baseline), **22 fail** (all guard tests; expected) |
| `02-final-suite-on-unchanged-code.txt` | unchanged `33c4e04`, final 58-test suite | **33 pass, 25 fail** (all guard tests). G12–G14 were added after run 01. G14 fails there only because `saveBlocked()` doesn't exist yet, not because of a behaviour difference. |
| `03-after-guard.txt` | first guard commit `96df889` | **58 pass, 0 fail**. Earlier record; superseded by 07. |
| `04-playwright-not-run.txt` | — | Chromium download failed in this workspace. The suite was listed (27 tests) but **not executed**. |
| `05-revision-suite-on-unchanged-33c4e04.txt` | unchanged `33c4e04`, revised 68-test suite | **33 pass, 35 fail.** All 35 failures are guard tests. W1 and W2 fail there only because `saveBlocked()` doesn't exist; the original code wrote once. |
| `06-revision-suite-on-previous-guard-39a13ff.txt` | previous branch head `39a13ff` | **59 pass, 9 fail.** W1 fails ("written once": the duplicate `setItem()`). G15–G17, P16 ×4 and P17 fail (the empty-string value was overwritten). This shows the new tests catch both review findings. |
| **`07-after-revision.txt`** | **this revision** | **68 pass, 0 fail** |

Runs 01–04 are kept unchanged as the original evidence. The golden files were generated once, from unchanged code, in the baseline commit. They were not regenerated afterwards (`git diff` is empty from the baseline commit to this branch).

## 4. Remaining limitations
1. **Playwright suite not run.** Layout at the four widths, keyboard focus and the banner's look (the button reuses the existing `progress-tools` / `btn subtle` styles inside the banner) are **unverified**. Run `npm run test:e2e` locally before approving.
2. **jsdom is not a browser.** The page tests check behaviour and DOM, not layout, visual focus or real downloads.
3. **While paused, the hub and Progress status stamps show "Not started"**, because they read the empty in-memory state. The banner explains why. Fixing this would mean changing `home.js`, which is outside Phase 0.
4. **Two tabs, both with readable data:** the last save wins, as before. The guard only covers data this version can't read.
5. **The guard protects nobody until it is deployed.** Rolling back to `33c4e04` or older remains destructive, so the rollback policy below applies.
6. **A learner who chooses Clear or Restore after the warnings loses the protected data.** This is intended: it is their explicit choice.
7. **Text that isn't JSON** is saved as `rawText` for manual recovery only. No version can restore it automatically.
8. **The historical QA can't be reproduced** (4.1 "78/78", 4.2 cases A–L): no test files were ever committed. This suite is a new baseline. It does not include the old verbatim-copy checks or drawer tests.
9. **Not checked against production.** Footer version labels are unchanged. Choose a release label at merge time.

## 5. Rollback policy (owner decision)
1. Deploy the guard release **before** any schema v3 release.
2. The guard release is the **oldest version that may be redeployed**. Never redeploy `33c4e04` or older once a newer schema has shipped.
3. When deployed, record the merge commit in the README (`GUARD RELEASE: <SHA, date>`).

## 6. How to review
```text
git fetch origin phase-0-guard
git diff 33c4e04..origin/phase-0-guard -- public/        # the only app change: public/shared/state.js
cd tests && npm install && npm test                       # expect 58 pass
npx playwright install chromium && npm run test:e2e       # not yet run anywhere
```
Approval of the guard release and its deployment are separate owner steps.

## 7. Review revision (14 Oct 2026)
Requested before approval. Applied on `phase-0-guard` only.
1. **Duplicate write removed.** `persist()` contained the new `setItem()` and also the original one, so every save wrote the key twice, with `lastSeenRaw` set between the two writes. There is now one write, and `lastSeenRaw` is set after it succeeds. Covered by W1 (exactly one write per save; the stored text equals this tab's last write; the next save is not blocked) and W2 (a failed write leaves storage unchanged and shows the existing cannot-save banner, not the guard).
2. **Empty-string value.** `load()` used `if (raw)` and the pre-save check skipped `''`, so an empty value was silently overwritten. Both now treat `''` as unreadable saved data: preserved, the "could not be read" message shown, and Download saved data offered (the download contains `rawText: ""`). Covered by:
   - G15: at load;
   - G16: changes to `''` before a save;
   - G17: Clear warns and Cancel keeps it;
   - P16: all four pages on open;
   - P17: working through 4.1.
3. **Results:** 07 = 68/68 pass. Runs 05 and 06 show the new tests fail on the original code and on the previous guard commit. Runs 01–04 are unchanged.
4. **Playwright:** still **not run**. Nothing in this revision has been checked in a real browser.

## 8. Owner verification and approval (14 Oct 2026)
Run by the owner on his own computer against commit `7aa916536b07e1d0e61082dee1e7aea53b879b78`. The commit was confirmed with `git rev-parse HEAD`. Results are as reported by the owner; the raw output files stayed on his machine.

**Environment:** Windows, PowerShell, Node v24.21.0, `npm ci` from the committed lockfile, Playwright Chrome for Testing 156.0.8078.4.

| Check | Result |
|---|---|
| Node/jsdom suite (`npm test`) | **68 / 68 passed** (11 suites) |
| Playwright suite (`npm run test:e2e`), real Chromium | **27 / 27 passed**. This is the first real-browser run of the suite. |
| Manual checks on `http://localhost:4173` in Chrome | **All passed:** guard banner fully visible at the top on 4.2 at 390 px, with `saveBlocked()` returning `'newer'` and the stored v3 data unchanged; banner on hub, Progress and 4.1; data unchanged after interacting; keyboard (Tab, visible focus, Space); Download saved data; Export while paused; Clear warning with Cancel keeping the data; broken and empty values show "could not be read"; Restore warning; private-window banner. |

**Observations (not blocking; owner decided to release as-is):**
1. **Button text wraps** onto two lines ("Download saved / data") at 390 px. Cosmetic; deferred.
2. **Playwright screenshot E9** captured the page while it was scrolled, so the top of the banner was behind the sticky bars. A manual check at the top of the page showed the full banner, so there is no layout fault. Test gaps to fix later:
   - E9 doesn't check whether anything covers the banner, and saves its screenshot outside the ignored folder;
   - the empty-string cases are covered only by the Node suite.
3. **Caching.** The owner's first tab kept running the old cached `state.js` until a hard reload. Learners' browsers can do the same after release. So:
   - allow time between this release and any schema v3 release;
   - the v3 release must make browsers fetch the new files (for example, versioned file names).

**Decision:** guard release approved as-is by the owner on 14 Oct 2026, to be merged to `main` and deployed. Module 4.3 remains parked.
