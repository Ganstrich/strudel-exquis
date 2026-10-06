import '@strudel/repl';

// Every file in patterns/ is loaded as raw text and handed to the Strudel editor.
const patterns = import.meta.glob('../patterns/**/*.js', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const names = Object.keys(patterns).sort();
const select = document.getElementById('pattern-select');
const container = document.getElementById('strudel');
const patternPath = document.getElementById('pattern-path');

const relativePath = (path) => path.replace('../patterns/', '');
const label = (path) => relativePath(path).replace(/\.js$/, '');

// Defensive: if this module ever gets re-executed (e.g. a stray HMR reload
// of main.js itself) instead of a full page reload, don't pile up a second
// <select>/<strudel-editor>.
select.innerHTML = '';
container.innerHTML = '';

for (const path of names) {
  const option = document.createElement('option');
  option.value = path;
  option.textContent = label(path);
  select.append(option);
}

const initial = new URLSearchParams(location.search).get('pattern');
const current = names.includes(`../patterns/${initial}.js`) ? `../patterns/${initial}.js` : names[0];
select.value = current;
patternPath.textContent = `patterns/${relativePath(current)}`;

const editor = document.createElement('strudel-editor');
editor.setAttribute('code', patterns[current] ?? '// add a file in patterns/ to get started');
container.append(editor);

const startButton = document.getElementById('start-pattern');
const stopButton = document.getElementById('stop-pattern');
const helpToggle = document.getElementById('help-toggle');
const quickSheet = document.getElementById('quick-sheet');
const audioStatus = document.getElementById('audio-status');

startButton.addEventListener('click', () => {
  editor.editor?.evaluate();
  audioStatus.textContent = 'Playing';
});

stopButton.addEventListener('click', async () => {
  await editor.editor?.stop();
  audioStatus.textContent = 'Stopped';
});

helpToggle.addEventListener('click', () => {
  const isHidden = quickSheet.toggleAttribute('hidden');
  helpToggle.setAttribute('aria-expanded', String(!isHidden));
});

select.addEventListener('change', () => {
  const url = new URL(location.href);
  url.searchParams.set('pattern', label(select.value));
  location.href = url.toString();
});

// Livecoding happens in the browser editor; "Sync" explicitly writes the
// current code back to the real patterns/<name>.js file on disk, so it shows
// up as a normal, committable/pushable change in git. Explicit (not on every
// keystroke) to avoid a save <-> hot-reload feedback loop while typing.
const syncButton = document.getElementById('sync-pattern');
syncButton.addEventListener('click', async () => {
  const code = editor.editor?.code;
  if (typeof code !== 'string') return;
  syncButton.disabled = true;
  syncButton.textContent = '…';
  try {
    let res;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      try {
        res = await fetch('/api/save-pattern', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: label(current), code }),
          signal: controller.signal,
        });
        if (res.ok || res.status < 500) break;
      } catch (err) {
        if (attempt === 2) throw err;
      } finally {
        clearTimeout(timeout);
      }
    }
    patterns[current] = code;
    syncButton.textContent = res?.ok ? '✓ Sync' : '✗ Erreur';
  } catch (err) {
    console.error('[pattern-saver] save failed', err);
    syncButton.textContent = '✗ Erreur';
  } finally {
    setTimeout(() => {
      syncButton.textContent = '💾 Sync';
      syncButton.disabled = false;
    }, 1200);
  }
});

// Live reload: when the pattern file currently shown changes on disk (edited
// from VS Code, or written by our own Sync button above), sync the editor.
// Skip it when the content already matches what's in the editor, otherwise
// it would reset the cursor mid-typing for no reason.
if (import.meta.hot) {
  for (const path of names) {
    import.meta.hot.accept(path, (mod) => {
      if (!mod) return;
      patterns[path] = mod.default;
      if (path === current && editor.editor && editor.editor.code !== mod.default) {
        editor.setAttribute('code', mod.default);
        editor.editor.evaluate();
      }
    });
  }
}
