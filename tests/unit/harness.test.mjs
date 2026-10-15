/* The test harness itself. Versioned script URLs (cache-busting for releases) must
   resolve to the real files, and every page's scripts must exist on disk. */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { scriptSources, PUBLIC, PAGE_FILES } from '../helpers/env.mjs';
import { goldenRaw, goldenNow } from '../helpers/golden.mjs';
import { EXPECTED } from '../fixtures/fixtures.mjs';

describe('HARNESS', () => {
  test('H1 scriptSources strips version query strings and keeps page order', () => {
    const html = '<script src="../shared/state.js?v=4.3.0"></script>\n<script src="../shared/m41-data.js?v=4.3.0&x=1"></script><script src="../shared/m43.js"></script><script src="../shared/a.js#frag"></script>';
    assert.deepEqual(scriptSources(html), ['../shared/state.js', '../shared/m41-data.js', '../shared/m43.js', '../shared/a.js']);
  });
  test('H2 every script on every existing page resolves to a file in public/', () => {
    let pages = 0;
    for (const [name, file] of Object.entries(PAGE_FILES)) {
      const pageFile = path.join(PUBLIC, file);
      if (!existsSync(pageFile)) continue;
      pages++;
      const srcs = scriptSources(readFileSync(pageFile, 'utf8'));
      assert.ok(srcs.length >= 2, name + ' loads its scripts');
      for (const s of srcs) assert.ok(existsSync(path.resolve(path.dirname(pageFile), s)), name + ': ' + s);
      const tags = (readFileSync(pageFile, 'utf8').match(/<script\b/g) || []).length;
      assert.equal(srcs.length, tags, name + ': every <script> tag is recognised by the harness');
    }
    assert.ok(pages >= 4);
  });
  test('H3 golden snapshots are the original schema-2 files; goldenNow changes only schemaVersion', () => {
    for (const n of ['profileV1.load.json', 'profileV2Full.load.json', 'profileV2Tampered.load.json', 'backup-v1.restore.json', 'backup-v2.restore.json']) {
      const raw = goldenRaw(n), now = goldenNow(n);
      assert.equal(raw.schemaVersion, 2);
      assert.equal(now.schemaVersion, EXPECTED.schema);
      assert.deepEqual({ ...now, schemaVersion: 2 }, raw);
    }
  });
});

describe('RELEASE · versioned asset URLs (cache-busting for the 4.3 release)', () => {
  const RELEASE = '4.4.0';   // deliberate update for the 4.4 release (spec R-NAV-8)
  test('R1 every local script and stylesheet on every page carries ?v=' + RELEASE, () => {
    for (const [name, file] of Object.entries(PAGE_FILES)) {
      const html = readFileSync(path.join(PUBLIC, file), 'utf8');
      const urls = [...html.matchAll(/(?:src|href)="((?:\.\.?\/)shared\/[^"]+)"/g)].map((m) => m[1]);
      assert.ok(urls.length >= 4, name + ' has shared assets');
      for (const u of urls) assert.match(u, new RegExp('\\.(js|css)\\?v=' + RELEASE.replace(/\./g, '\\.') + '$'), name + ': ' + u);
    }
  });
  test('R2 the harness loads the real versioned files (no page runs on a missing script)', async () => {
    const { openPage } = await import('../helpers/env.mjs');
    for (const name of Object.keys(PAGE_FILES)) {
      const p = openPage({ page: name });
      assert.ok(p.S && p.S.SCHEMA_VERSION === EXPECTED.schema, name + ' loaded state.js');
      assert.deepEqual(p.errors, [], name);
    }
  });
});
