/* Playwright suite for Stage 4 (real Chromium: layout, keyboard, downloads, console).
   NOT RUN in the Phase 0 workspace: browser engines could not be downloaded there.
   To run locally (from tests/):
     npm install
     npx playwright install chromium
     npm run test:e2e
   Fonts load from Google Fonts; offline runs still work but text metrics may differ. */
import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;
export default defineConfig({
  testDir: '.',
  testMatch: /.*\.spec\.mjs/,
  fullyParallel: false,
  retries: 0,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  outputDir: 'test-results',
  use: { baseURL: `http://localhost:${PORT}`, trace: 'retain-on-failure', acceptDownloads: true },
  webServer: { command: `node e2e/serve.mjs ${PORT}`, cwd: '..', url: `http://localhost:${PORT}/`, reuseExistingServer: true, timeout: 20000 },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]
});
