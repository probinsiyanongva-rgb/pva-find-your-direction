/* Stage 4 browser regression suite (Playwright, Chromium).
   STATUS: E1–E14 ran 37/37 on the owner's machine (15 Oct 2026, 4.3 release). The 4.4
   additions (4.4 in E1, E15–E23) also run in the build workspace against its preinstalled
   Chromium (PW_CHROMIUM, see playwright.config.mjs); the owner's run is the release check. */
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import * as F from '../fixtures/fixtures.mjs';

const KEY = F.STORAGE_KEY;
const PAGES = [['hub', '/'], ['progress', '/progress/'], ['4.1', '/4-1/'], ['4.2', '/4-2/'], ['4.3', '/4-3/'], ['4.4', '/4-4/']];   // 4.4 added (4.4 spec E19)

/* Only when PW_CHROMIUM is set (the build workspace, which has no internet): answer the Google
   Fonts and favicon requests locally so a blocked network is not reported as a page error.
   Unset (the owner's machine), nothing is intercepted. */
if (process.env.PW_CHROMIUM) {
  test.beforeEach(async ({ page }) => {
    await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    await page.route(/\/favicon\.ico$/, (r) => r.fulfill({ status: 204, body: '' }));
  });
}
const WIDTHS = [390, 820, 1366, 1600];
const CANONICAL = ['dir-general-admin', 'dir-customer-support', 'dir-ecommerce', 'dir-amazon', 'dir-bookkeeping', 'dir-social-content',
  'dir-executive-assistant', 'dir-real-estate', 'dir-lead-generation', 'dir-technical', 'dir-ndis'];

/* Seed localStorage once per test (before any page script runs), not on every navigation. */
async function seed(page, raw) {
  await page.addInitScript(([k, v]) => {
    if (!sessionStorage.getItem('__seeded')) { localStorage.setItem(k, v); sessionStorage.setItem('__seeded', '1'); }
  }, [KEY, raw]);
}
function trackErrors(page) {
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/fonts\.(googleapis|gstatic)/.test(m.text())) errors.push('console: ' + m.text()); });
  return errors;
}
const stored = (page) => page.evaluate((k) => localStorage.getItem(k), KEY);

test.describe('BASELINE · pages load cleanly and fit every width', () => {
  for (const [name, url] of PAGES) {
    for (const width of WIDTHS) {
      test(`E1 ${name} at ${width}px: no console errors, no horizontal scroll`, async ({ page }) => {
        const errors = trackErrors(page);
        await seed(page, JSON.stringify(F.profileV2Full));
        await page.setViewportSize({ width, height: 900 });
        await page.goto(url);
        await page.waitForLoadState('networkidle');
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow).toBeLessThanOrEqual(0);
        expect(errors).toEqual([]);
      });
    }
  }
});

test.describe('BASELINE · Module 4.1 in a real browser', () => {
  test('E2 Direction Cards render in canonical order', async ({ page }) => {
    await page.goto('/4-1/#directions');
    await expect(page.locator('#directionList article.s4-dir')).toHaveCount(11);
    expect(await page.locator('#directionList article.s4-dir').evaluateAll((a) => a.map((x) => x.id))).toEqual(CANONICAL);
  });
  test('E3 a new learner completes 4.1 and it survives a reload', async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto('/4-1/#job-posts');
    for (const post of await page.locator('#postList article.s4-post').all()) {
      await post.locator('input[type=checkbox]').first().check();
      await post.locator('.s4-actions button').click();
    }
    await page.locator('#sectionNav a[data-nav=patterns]').click();
    for (const scn of await page.locator('#scenarioList article.s4-scenario').all()) {
      await scn.locator('input[type=checkbox]').first().check();
      await scn.locator('.s4-actions button').click();
    }
    await page.locator('#sectionNav a[data-nav=directions]').click();
    await page.locator('#dir-amazon fieldset.s4-reaction input[value=unsure]').check();
    await page.locator('#directionsDone').click();
    await expect(page.locator('#moduleProgress')).toHaveText('Module 4.1 complete');
    await page.reload();
    await expect(page.locator('#moduleProgress')).toHaveText('Module 4.1 complete');
    expect(errors).toEqual([]);
  });
});

test.describe('BASELINE · Module 4.2 in a real browser', () => {
  test('E4 a learner with 4.1 done completes 4.2', async ({ page }) => {
    const errors = trackErrors(page);
    await seed(page, JSON.stringify(F.profileV1));
    await page.goto('/4-2/#experience');
    await page.locator('input[name=new-source][value=work]').check();
    await page.locator('#addExperience').click();
    await page.locator('#sectionNav a[data-nav=tasks]').click();
    await page.locator('#taskPicker button.s4-prompt').first().click();
    await page.locator('#sectionNav a[data-nav=evidence]').click();
    await page.locator('#evidenceList fieldset.s4-evq input[value=done_before]').first().check();
    await page.locator('#sectionNav a[data-nav=involved]').click();
    await page.locator('#involvedList .s4-chips input[value=organize]').first().check();
    await page.locator('#sectionNav a[data-nav=snapshot]').click();
    await expect(page.locator('#moduleProgress')).toHaveText('Module 4.2 complete');
    expect(errors).toEqual([]);
  });
  test('E5 Export from the hub downloads a backup that restores', async ({ page }) => {
    await seed(page, JSON.stringify(F.profileV2Full));
    await page.goto('/');
    const [dl] = await Promise.all([page.waitForEvent('download'), page.locator('[data-export]').first().click()]);
    expect(dl.suggestedFilename()).toMatch(/^Find-Your-Direction-progress-backup-\d{4}-\d\d-\d\d\.json$/);
    const b = JSON.parse(readFileSync(await dl.path(), 'utf8'));
    expect(b.format).toBe(F.BACKUP_FORMAT);
    expect(b.data.modules['4-2'].experiences).toHaveLength(2);
  });
});

test.describe('GUARD · newer saved progress is protected in a real browser', () => {
  for (const [name, url] of PAGES) {
    test(`E6 ${name}: opening with newer data leaves it untouched and shows Download saved data`, async ({ page }) => {
      const errors = trackErrors(page);
      await seed(page, F.RAW.newer);
      await page.goto(url);
      await expect(page.locator('#storageBanner')).toBeVisible();
      await expect(page.locator('#storageBanner')).toContainText('newer version');
      await expect(page.getByRole('button', { name: 'Download saved data' })).toBeVisible();
      expect(await stored(page)).toBe(F.RAW.newer);
      expect(errors).toEqual([]);
    });
  }
  test('E7 the Download saved data button is reachable by keyboard and downloads the exact data', async ({ page }) => {
    await seed(page, F.RAW.newer);
    await page.goto('/');
    const btn = page.getByRole('button', { name: 'Download saved data' });
    await btn.focus();
    await expect(btn).toBeFocused();
    const [dl] = await Promise.all([page.waitForEvent('download'), page.keyboard.press('Enter')]);
    expect(dl.suggestedFilename()).toMatch(/^Find-Your-Direction-saved-data-\d{4}-\d\d-\d\d\.json$/);
    const b = JSON.parse(readFileSync(await dl.path(), 'utf8'));
    expect(b.data).toEqual(F.profileNewer);
  });
  test('E8 working through 4.1 while blocked never writes, even after a reload', async ({ page }) => {
    await seed(page, F.RAW.newer);
    await page.goto('/4-1/#directions');
    await page.locator('#dir-amazon fieldset.s4-reaction input[value=explore]').check();
    await page.reload();
    expect(await stored(page)).toBe(F.RAW.newer);
  });
  test('E9 guard banner fits at 390px', async ({ page }) => {
    await seed(page, F.RAW.newer);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/4-2/');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    await page.screenshot({ path: 'test-results/guard-banner-390.png' });
  });
});


/* ------------------------- Module 4.3 (spec v1.5) ------------------------- */
async function judge(page, id, value) { await page.locator(`input[name="judgment-${id}"][value="${value}"]`).check({ force: true }); }

test.describe('4.3 · real browser', () => {
  /* Deliberate update for the 4.4 release (spec R-NAV-6): the finish screen now links to 4.4. */
  test('E10 a new learner completes 4.3 by staying undecided; no console errors; Continue to Module 4.4 is a link', async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto('/4-3/');
    await page.getByRole('link', { name: 'Start exploring' }).click();
    await page.getByRole('button', { name: 'Continue without Work Clues' }).click();
    await page.getByRole('button', { name: 'Continue without task evidence' }).click();
    await page.getByRole('link', { name: 'Examine this direction: NDIS VA' }).click();
    await judge(page, 'dir-ndis', 'unsure');
    await page.locator('#skip-dir-ndis').check();
    await page.getByRole('button', { name: 'Save my reflection' }).click();
    await expect(page.getByText('Saved. You can revisit or change this reflection later.')).toBeVisible();
    await page.getByRole('link', { name: 'Continue to my provisional decision' }).click();
    await page.locator('#undecided').check();
    await page.getByRole('link', { name: 'Continue to review and finish →' }).click();
    await page.getByRole('button', { name: 'Save and finish Module 4.3' }).click();
    await expect(page.locator('#completionStatus')).toContainText('Module 4.3 complete');
    await expect(page.locator('#completionStatus a.s4-next')).toHaveAttribute('href', '../4-4/');
    await expect(page.locator('#completionStatus a.s4-next')).toContainText('Continue to Module 4.4');
    await page.reload();
    await expect(page.locator('#moduleProgress')).toHaveText('Module 4.3 complete');
    expect(errors).toEqual([]);
  });

  test('E11 the comparison is a table on wide screens and stacked under 960px, with no horizontal scroll', async ({ page }) => {
    await seed(page, JSON.stringify(F.profileV3Full));
    for (const [width, tableShown] of [[1366, true], [820, false], [390, false]]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/4-3/#compare');
      await page.locator('#comparePick input[value="dir-ecommerce"]').check();
      await page.locator('#comparePick input[value="dir-customer-support"]').check();
      await expect(page.locator('.s43-compare-table')).toBeVisible({ visible: tableShown });
      await expect(page.locator('.s43-compare-stacked')).toBeVisible({ visible: !tableShown });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, 'no horizontal scroll at ' + width).toBeLessThanOrEqual(0);
    }
    await page.screenshot({ path: 'test-results/compare-390.png', fullPage: true });
  });

  test('E12 keyboard: open a direction, choose a judgment, and Cancel the remove-reason dialog (reason kept)', async ({ page }) => {
    await seed(page, JSON.stringify(F.profileV2Full));
    await page.goto('/4-3/#directions');
    const examine = page.getByRole('link', { name: 'Examine this direction: Amazon VA' });
    await examine.focus();
    await expect(examine).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('#s4Title')).toContainText('Amazon VA');
    await page.locator('input[name="judgment-dir-amazon"][value="explore_further"]').focus();
    await page.keyboard.press('Space');
    await expect(page.locator('input[name="judgment-dir-amazon"][value="explore_further"]')).toBeChecked();
    await page.locator('#reason-dir-amazon').fill('My own reason');
    const dialogs = [];
    page.on('dialog', (d) => { dialogs.push(d.message()); d.dismiss(); });
    await page.locator('#skip-dir-amazon').focus();
    await page.keyboard.press('Space');
    expect(dialogs).toEqual(['This will remove the reason you wrote. Remove it?']);
    await expect(page.locator('#skip-dir-amazon')).not.toBeChecked();
    await expect(page.locator('#reason-dir-amazon')).toHaveValue('My own reason');
  });

  test('E13 the 4.3 Direction Card fits at 390px and the guidance prompts are not focusable', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/4-3/#examine-dir-technical');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    expect(await page.locator('#guide-dir-technical :is(a, button, input, select, textarea, [tabindex])').count()).toBe(0);
    await page.screenshot({ path: 'test-results/examine-390.png', fullPage: true });
  });

});

/* ===== Module 4.4 (spec v1.0 §17.3) ===== */
const V4 = () => JSON.stringify(F.profileV4Full);
const V3 = () => JSON.stringify(F.profileV3Full);
const noOverflow = async (page) => expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
const map44 = (page) => page.evaluate((k) => JSON.parse(localStorage.getItem(k)).modules['4-4'], KEY);

test.describe('4.4 · real browser', () => {
  test('E15 add one direction, write a step, save; survives reload; hub says Review my Direction Map; no console errors', async ({ page }) => {
    const errors = trackErrors(page);
    await seed(page, V3());
    await page.goto('/4-4/');
    await page.getByRole('link', { name: 'Continue →' }).click();
    await page.getByRole('button', { name: 'Add to my map: E-commerce VA' }).click();
    await page.getByRole('button', { name: 'Continue →' }).click();
    await page.getByLabel('My next exploration step').fill('Read three job posts for e-commerce VAs.');
    await page.getByRole('button', { name: 'Continue to my map →' }).click();
    await expect(page.locator('#mapView')).toContainText('My next exploration step');
    await page.getByRole('button', { name: 'Save my Direction Map' }).click();
    await expect(page.locator('#completionStatus')).toContainText('Module 4.4 complete');
    await page.reload();
    await expect(page.locator('#moduleProgress')).toHaveText('Module 4.4 complete');
    await expect(page.locator('#mapView')).toContainText('Read three job posts for e-commerce VAs.');
    await page.goto('/');
    await expect(page.locator('#continueBtn')).toHaveText('Review my Direction Map');
    await expect(page.locator('#continueBtn')).toHaveAttribute('href', './4-4/#map');
    await expect(page.locator('#stamp44')).toHaveText('Complete');
    expect(errors).toEqual([]);
  });

  test('E16 a learner with no 4.2 data and no 4.3 reflections completes by still exploring', async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto('/4-4/#choose');
    await expect(page.locator('#chooseEmpty')).toBeVisible();
    await page.getByRole('button', { name: 'Choose this' }).click();
    await page.getByRole('button', { name: 'Continue →' }).click();
    await page.getByLabel('My next step to help me decide').fill('Examine one more direction in Module 4.3.');
    await page.getByRole('button', { name: 'Continue to my map →' }).click();
    await page.getByRole('button', { name: 'Save my Direction Map' }).click();
    await expect(page.locator('#completionStatus')).toContainText('Module 4.4 complete');
    await expect(page.locator('#mapView')).toContainText("Right now, I'm still exploring.");
    expect(errors).toEqual([]);
  });

  test('E17 real dialogs: Cancel keeps everything, OK removes; adding a direction keeps the investigation step', async ({ page }) => {
    await seed(page, V3());
    await page.goto('/4-4/#choose');
    await page.getByRole('button', { name: 'Add to my map: E-commerce VA' }).click();
    await page.getByRole('button', { name: 'Continue →' }).click();
    await page.getByLabel('My next exploration step').fill('My own step');
    await page.getByLabel('My next exploration step').blur();
    await page.locator('#sectionNav a[data-nav="choose"]').click();
    const before = await page.evaluate((k) => localStorage.getItem(k), KEY);
    const seen = [];
    page.once('dialog', (d) => { seen.push(d.message()); d.dismiss(); });
    await page.getByRole('button', { name: 'Remove from my map: E-commerce VA' }).click();
    expect(await page.evaluate((k) => localStorage.getItem(k), KEY)).toBe(before);
    page.once('dialog', (d) => { seen.push(d.message()); d.dismiss(); });
    await page.getByRole('button', { name: 'Choose this' }).click();
    expect(await page.evaluate((k) => localStorage.getItem(k), KEY)).toBe(before);
    expect(seen).toEqual(['This will remove the next step you wrote for E-commerce VA from your map. Your Module 4.3 reflection stays as it is. Remove it?',
      'Choosing to keep exploring will remove your directions and the next steps you wrote for them from your map. Your Module 4.3 reflections stay as they are. Continue?']);
    page.once('dialog', (d) => d.accept());
    await page.getByRole('button', { name: 'Choose this' }).click();
    expect((await map44(page)).stillExploring).toBe(true);
    await page.getByRole('button', { name: 'Continue →' }).click();
    await page.getByLabel('My next step to help me decide').fill('Compare two cards');
    await page.getByLabel('My next step to help me decide').blur();
    await page.locator('#sectionNav a[data-nav="choose"]').click();
    let asked = false; page.once('dialog', (d) => { asked = true; d.dismiss(); });
    await page.getByRole('button', { name: 'Add to my map: Customer Support VA' }).click();
    expect(asked).toBe(false);
    expect((await map44(page)).investigationStep).toBe('Compare two cards');
  });

  test('E18 keyboard only: Use this idea, edit, Continue', async ({ page }) => {
    await seed(page, V3());
    await page.goto('/4-4/#choose');
    await page.getByRole('button', { name: 'Add to my map: E-commerce VA' }).focus();
    await page.keyboard.press('Enter');
    await page.locator('#chooseContinue').focus();
    await page.keyboard.press('Enter');
    const idea = page.locator('[data-step-dir="dir-ecommerce"] [data-idea="0"]');
    await idea.focus();
    await page.keyboard.press('Enter');
    const box = page.locator('textarea[data-step="dir-ecommerce"]');
    await expect(box).toBeFocused();
    expect((await map44(page)).mapDirections[0].nextStep).toBe('');
    await page.keyboard.press('End');
    await page.keyboard.type(' Today.');
    await page.locator('#stepsContinue').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#map')).toBeVisible();
    expect((await map44(page)).mapDirections[0].nextStep).toMatch(/appear more than once\. Today\.$/);
  });

  test('E19 all four screens fit at 390, 820, 1366 and 1600px', async ({ page }) => {
    await seed(page, V4());
    for (const width of [390, 820, 1366, 1600]) {
      await page.setViewportSize({ width, height: 900 });
      for (const s of ['look-back', 'choose', 'steps', 'map']) {
        await page.goto('/4-4/#' + s);
        await expect(page.locator('#' + s)).toBeVisible();
        await noOverflow(page);
      }
      if (width === 390) { await page.goto('/4-4/#steps'); await page.screenshot({ path: 'test-results/m44-steps-390.png', fullPage: true }); }
    }
  });

  test('E20 print layout: only the map; print date shown; text dark; Save as PDF line not printed', async ({ page }) => {
    await seed(page, V4());
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto('/4-4/#map');
    await page.emulateMedia({ media: 'print' });
    for (const sel of ['#s4Side', '.s4-mobilebar', '#mapActions', '#stage5', '#completionStatus', '#s4Title', 'footer', '.route-bar']) await expect(page.locator(sel).first()).toBeHidden();
    for (const sel of ['#look-back', '#choose', '#steps']) await expect(page.locator(sel)).toBeHidden();
    await expect(page.locator('#mapView')).toBeVisible();
    await expect(page.locator('#mapPrintDate')).toBeVisible();
    await expect(page.locator('#mapPrintDate')).toContainText('Printed on');
    await expect(page.locator('#mapReminder')).toBeVisible();
    expect(await page.locator('#mapView .s44-screen-only a:visible').count()).toBe(0);
    const dark = await page.evaluate(() => [...document.querySelectorAll('#mapView dt, #mapView dd, #mapView h3, #mapView p')].every((n) => {
      const m = getComputedStyle(n).color.match(/\d+/g).map(Number); return m[0] < 80 && m[1] < 80 && m[2] < 80;
    }));
    expect(dark).toBe(true);
    await page.screenshot({ path: 'test-results/m44-print-view.png', fullPage: true });
    await page.emulateMedia({ media: 'screen' });
    await expect(page.locator('#mapPrintDate')).toBeHidden();
  });

  test('E21 a PDF of the map is produced (artifact for the owner to open)', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'page.pdf is Chromium-only');
    await seed(page, V4());
    await page.goto('/4-4/#map');
    const pdf = await page.pdf({ path: 'test-results/direction-map.pdf', format: 'A4', printBackground: false });
    expect(pdf.length).toBeGreaterThan(5000);
  });

  test('E22 guard: newer (schema 5) data is protected on the 4.4 page; working through 4.4 never writes', async ({ page }) => {
    await seed(page, F.RAW.newer);
    await page.goto('/4-4/#choose');
    await expect(page.locator('#storageBanner')).toContainText('Saved progress needs attention.');
    await page.getByRole('button', { name: 'Choose this' }).click();
    await page.getByRole('button', { name: 'Continue →' }).click();
    await page.getByLabel('My next step to help me decide').fill('x');
    await page.getByRole('button', { name: 'Continue to my map →' }).click();
    await page.getByRole('button', { name: 'Save my Direction Map' }).click();
    expect(await stored(page)).toBe(F.RAW.newer);
  });

  /* Replaces E14 (4.3 release) for the 4.4 release: version 4.4.0 and the 4.4 page included. */
  test('E23 every page requests its shared assets with ?v=4.4.0 and all load', async ({ page }) => {
    for (const [, url] of PAGES) {
      const assets = [];
      page.on('response', (r) => { if (/\/shared\//.test(r.url())) assets.push([r.url(), r.status()]); });
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      expect(assets.length).toBeGreaterThanOrEqual(4);
      for (const [u, status] of assets) { expect(u, url).toMatch(/\?v=4\.4\.0$/); expect(status, u).toBe(200); }
      page.removeAllListeners('response');
    }
  });
});
