/* Test harness: loads a real Stage 4 page (HTML + its scripts, in the page's own
   order) into jsdom, so tests exercise the shipped code, not a copy.
   Only browser features jsdom lacks are stubbed (matchMedia, scrollTo, dialogs,
   object URLs). Nothing in public/ is modified. */
import { JSDOM, VirtualConsole } from 'jsdom';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const PUBLIC = path.join(ROOT, 'public');
export const KEY = 'pva-stage4-progress';

const PAGES = {
  'index': { file: 'index.html', url: 'https://pva.test/' },
  'progress': { file: 'progress/index.html', url: 'https://pva.test/progress/' },
  '4-1': { file: '4-1/index.html', url: 'https://pva.test/4-1/' },
  '4-2': { file: '4-2/index.html', url: 'https://pva.test/4-2/' }
};

/* A minimal page carrying the real storage banner markup from public/index.html,
   used by the state.js unit tests. */
function statePageHtml() {
  const home = readFileSync(path.join(PUBLIC, 'index.html'), 'utf8');
  const banner = home.match(/<div class="storage-banner[\s\S]*?<\/div>/)[0];
  return '<!doctype html><html><body>' + banner +
    '<span class="save-state" data-save-state>Progress is saved in this browser.</span>' +
    '<input id="restoreFile" type="file" hidden><script src="./shared/state.js"></script></body></html>';
}

/**
 * @param {object} o
 * @param {'state'|'index'|'progress'|'4-1'|'4-2'} o.page
 * @param {Record<string,string>} [o.storage]  localStorage contents before load (raw strings)
 * @param {boolean} [o.storageThrows]          simulate blocked site data
 * @param {boolean|((msg:string)=>boolean)} [o.confirm]  answer for window.confirm (default true)
 * @param {string} [o.hash]
 */
export function openPage(o) {
  const spec = o.page === 'state' ? { url: 'https://pva.test/' } : PAGES[o.page];
  const pageFile = o.page === 'state' ? null : path.join(PUBLIC, spec.file);
  const html = pageFile ? readFileSync(pageFile, 'utf8') : statePageHtml();
  const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((m) => m[1]);
  const bare = html.replace(/<script src="[^"]+"><\/script>/g, '');

  const errors = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', (e) => { if (!/Not implemented: navigation/.test(e.message)) errors.push('jsdom: ' + e.message); });
  vc.on('error', (...a) => errors.push('console.error: ' + a.join(' ')));

  const dom = new JSDOM(bare, { url: spec.url + (o.hash ? '#' + o.hash : ''), runScripts: 'outside-only', pretendToBeVisual: true, virtualConsole: vc });
  const w = dom.window;
  w.addEventListener('error', (e) => errors.push('window.error: ' + (e.error && e.error.stack || e.message)));

  const dialogs = { confirms: [], alerts: [] };
  const answer = o.confirm === undefined ? true : o.confirm;
  w.confirm = (msg) => { dialogs.confirms.push(String(msg)); return typeof answer === 'function' ? !!answer(String(msg)) : !!answer; };
  w.alert = (msg) => { dialogs.alerts.push(String(msg)); };
  w.scrollTo = () => {};
  w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });

  const downloads = [];
  const blobs = new Map();
  w.URL.createObjectURL = (b) => { const u = 'blob:test/' + blobs.size; blobs.set(u, b); return u; };
  w.URL.revokeObjectURL = () => {};
  const realClick = w.HTMLAnchorElement.prototype.click;
  w.HTMLAnchorElement.prototype.click = function () {
    if (this.hasAttribute('download')) { downloads.push({ filename: this.getAttribute('download'), blob: blobs.get(this.getAttribute('href')) }); return; }
    return realClick.call(this);
  };

  if (o.storageThrows) {
    Object.defineProperty(w, 'localStorage', { configurable: true, get() { throw new w.DOMException('The operation is insecure.', 'SecurityError'); } });
  } else if (o.storage) {
    for (const [k, v] of Object.entries(o.storage)) w.localStorage.setItem(k, v);
  }

  for (const src of scripts) {
    const file = o.page === 'state' ? path.join(PUBLIC, src) : path.resolve(path.dirname(pageFile), src);
    w.eval(readFileSync(file, 'utf8') + '\n//# sourceURL=' + path.relative(ROOT, file));
  }

  const api = {
    window: w, document: w.document, S: w.PVAS4, errors, dialogs, downloads,
    raw: (k = KEY) => (o.storageThrows ? null : w.localStorage.getItem(k)),
    stored: (k = KEY) => { const r = api.raw(k); return r === null ? null : JSON.parse(r); },
    allStorage: () => { const out = {}; for (let i = 0; i < w.localStorage.length; i++) { const k = w.localStorage.key(i); out[k] = w.localStorage.getItem(k); } return out; },
    $: (sel) => w.document.querySelector(sel),
    $$: (sel) => [...w.document.querySelectorAll(sel)],
    click: (elOrSel) => { const el = typeof elOrSel === 'string' ? w.document.querySelector(elOrSel) : elOrSel; if (!el) throw new Error('click: not found ' + elOrSel); el.click(); },
    check: (input) => { input.checked = true; input.dispatchEvent(new w.Event('change', { bubbles: true })); },
    /* Open a page again in a fresh browser tab that shares this tab's storage. */
    reopen: (page = o.page, extra = {}) => openPage({ page, storage: api.allStorage(), ...extra }),
    bannerVisible: () => { const b = w.document.getElementById('storageBanner'); return !!b && !b.classList.contains('hidden'); },
    bannerText: () => { const b = w.document.getElementById('storageBanner'); return b ? b.textContent.replace(/\s+/g, ' ').trim() : ''; },
    restoreText: (text) => new Promise((resolve) => {
      const file = new w.File([text], 'backup.json', { type: 'application/json' });
      w.PVAS4.restoreFromFile(file, () => resolve('restored'));
      setTimeout(() => resolve('not-restored'), 250);
    }),
    /* Text of the i-th download (jsdom 27 Blobs have no .text()). */
    downloadText: (i = 0) => new Promise((resolve, reject) => {
      const fr = new w.FileReader();
      fr.onload = () => resolve(fr.result);
      fr.onerror = () => reject(fr.error);
      fr.readAsText(downloads[i].blob);
    }),
    close: () => w.close()
  };
  return api;
}

/* Values created inside the jsdom window have that window's prototypes; strict deep
   equality in Node compares prototypes too. Compare plain JSON copies instead. */
export const plain = (v) => (v === undefined ? v : JSON.parse(JSON.stringify(v)));

export function settle(ms = 5) { return new Promise((r) => setTimeout(r, ms)); }
