import '@strudel/repl';
import { installAudioTap } from './addons/audio-tap.js';
import { setupAddons } from './addons/index.js';

// Doit être installé avant que Strudel ne crée son AudioContext (au premier clic).
installAudioTap();

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

// Strudel ajoute ses canvas de dessin (.scope(), .pianoroll(), initHydra(), …)
// en plein écran sur <body> : on les replace au-dessus du seul éditeur, sinon
// ils recouvrent le header, la quick sheet et les addons.
const HYDRA_RECT_KEY = 'strudel-exquis:hydra-rect';
let hydraBox = null;

// Boîte déplaçable/redimensionnable qui accueille le canvas Hydra ; sa
// position/taille est mémorisée dans localStorage (persiste entre rechargements).
const getHydraBox = () => {
  if (hydraBox) return hydraBox;
  hydraBox = document.createElement('div');
  hydraBox.className = 'hydra-box';
  const handle = document.createElement('div');
  handle.className = 'hydra-box-handle';
  handle.textContent = 'hydra ⠿';
  hydraBox.append(handle);
  container.append(hydraBox);

  const persistRect = () => {
    const { left, top, width, height } = hydraBox.style;
    const collapsed = hydraBox.classList.contains('collapsed');
    const expandedHeight = hydraBox.dataset.expandedHeight ?? '';
    localStorage.setItem(HYDRA_RECT_KEY, JSON.stringify({ left, top, width, height, collapsed, expandedHeight }));
  };

  try {
    const saved = JSON.parse(localStorage.getItem(HYDRA_RECT_KEY) ?? 'null');
    if (saved) {
      const { collapsed, expandedHeight, ...rect } = saved;
      Object.assign(hydraBox.style, rect);
      if (expandedHeight) hydraBox.dataset.expandedHeight = expandedHeight;
      if (collapsed) hydraBox.classList.add('collapsed');
    }
  } catch {
    // ignore corrupted storage
  }

  // Double-clic sur la barre : replie la boîte pour ne garder que la poignée.
  handle.addEventListener('dblclick', () => {
    if (hydraBox.classList.contains('collapsed')) {
      hydraBox.style.height = hydraBox.dataset.expandedHeight || '';
      hydraBox.classList.remove('collapsed');
    } else {
      hydraBox.dataset.expandedHeight = hydraBox.style.height || `${hydraBox.offsetHeight}px`;
      hydraBox.classList.add('collapsed');
    }
    persistRect();
  });

  let drag = null;
  handle.addEventListener('pointerdown', (e) => {
    drag = { startX: e.clientX, startY: e.clientY, left: hydraBox.offsetLeft, top: hydraBox.offsetTop };
    handle.setPointerCapture(e.pointerId);
  });
  handle.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const bounds = container.getBoundingClientRect();
    const maxLeft = Math.max(bounds.width - hydraBox.offsetWidth, 0);
    const maxTop = Math.max(bounds.height - hydraBox.offsetHeight, 0);
    const left = Math.min(Math.max(drag.left + (e.clientX - drag.startX), 0), maxLeft);
    const top = Math.min(Math.max(drag.top + (e.clientY - drag.startY), 0), maxTop);
    hydraBox.style.left = `${left}px`;
    hydraBox.style.top = `${top}px`;
    hydraBox.style.right = 'auto';
  });
  const stopDrag = () => drag && ((drag = null), persistRect());
  handle.addEventListener('pointerup', stopDrag);
  handle.addEventListener('pointercancel', stopDrag);

  new ResizeObserver(persistRect).observe(hydraBox);

  return hydraBox;
};

const adoptCanvas = (node) => {
  if (!(node instanceof HTMLCanvasElement)) return;
  if (node.id === 'hydra-canvas') getHydraBox().append(node);
  else container.append(node);
};
document.body.childNodes.forEach(adoptCanvas);
new MutationObserver((records) => {
  for (const record of records) record.addedNodes.forEach(adoptCanvas);
}).observe(document.body, { childList: true });

const addonHost = document.getElementById('addons');
addonHost.innerHTML = '';
setupAddons({ editor, host: addonHost, patternName: label(current) });

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
const syncPattern = async () => {
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
};

syncButton.addEventListener('click', syncPattern);
document.addEventListener('keydown', (event) => {
  const target = event.target instanceof Element ? event.target : null;
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's' && target?.closest('.cm-editor')) {
    event.preventDefault();
    syncPattern();
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
