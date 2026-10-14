/* Stage 4 browser regression suite (Playwright, Chromium).
   STATUS: committed in Phase 0 but NOT RUN there (no browser engines available in that
   workspace). Run it locally before approving the guard release; see playwright.config.mjs. */
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import * as F from '../fixtures/fixtures.mjs';

const KEY = F.STORAGE_KEY;
const PAGES = [['hub', '/'], ['progress', '/progress/'], ['4.1', '/4-1/'], ['4.2', '/4-2/']];
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
      await seed(page, F.RAW.v3);
      await page.goto(url);
      await expect(page.locator('#storageBanner')).toBeVisible();
      await expect(page.locator('#storageBanner')).toContainText('newer version');
      await expect(page.getByRole('button', { name: 'Download saved data' })).toBeVisible();
      expect(await stored(page)).toBe(F.RAW.v3);
      expect(errors).toEqual([]);
    });
  }
  test('E7 the Download saved data button is reachable by keyboard and downloads the exact data', async ({ page }) => {
    await seed(page, F.RAW.v3);
    await page.goto('/');
    const btn = page.getByRole('button', { name: 'Download saved data' });
    await btn.focus();
    await expect(btn).toBeFocused();
    const [dl] = await Promise.all([page.waitForEvent('download'), page.keyboard.press('Enter')]);
    expect(dl.suggestedFilename()).toMatch(/^Find-Your-Direction-saved-data-\d{4}-\d\d-\d\d\.json$/);
    const b = JSON.parse(readFileSync(await dl.path(), 'utf8'));
    expect(b.data).toEqual(F.profileV3Future);
  });
  test('E8 working through 4.1 while blocked never writes, even after a reload', async ({ page }) => {
    await seed(page, F.RAW.v3);
    await page.goto('/4-1/#directions');
    await page.locator('#dir-amazon fieldset.s4-reaction input[value=explore]').check();
    await page.reload();
    expect(await stored(page)).toBe(F.RAW.v3);
  });
  test('E9 guard banner fits at 390px', async ({ page }) => {
    await seed(page, F.RAW.v3);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/4-2/');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    await page.screenshot({ path: 'test-results/guard-banner-390.png' });
  });
});
