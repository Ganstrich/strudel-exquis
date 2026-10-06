import '@strudel/repl';

// Every file in patterns/ is loaded as raw text and handed to the Strudel editor.
const patterns = import.meta.glob('../patterns/*.js', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const names = Object.keys(patterns).sort();
const select = document.getElementById('pattern-select');
const container = document.getElementById('strudel');

const label = (path) => path.replace('../patterns/', '').replace(/\.js$/, '');

for (const path of names) {
  const option = document.createElement('option');
  option.value = path;
  option.textContent = label(path);
  select.append(option);
}

const initial = new URLSearchParams(location.search).get('pattern');
const current = names.includes(`../patterns/${initial}.js`) ? `../patterns/${initial}.js` : names[0];
select.value = current;

const editor = document.createElement('strudel-editor');
editor.setAttribute('code', patterns[current] ?? '// add a file in patterns/ to get started');
container.append(editor);

select.addEventListener('change', () => {
  const url = new URL(location.href);
  url.searchParams.set('pattern', label(select.value));
  location.href = url.toString();
});
