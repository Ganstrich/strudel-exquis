# strudel-exquis

Un cadavre exquis à la pomme, joué avec [Strudel](https://strudel.cc).

Chaque artiste écrit son fragment dans `patterns/`, on les joue dans le navigateur
via un REPL Strudel servi localement. Tout l'environnement vit dans un dev container :
la seule chose installée sur ta machine est Docker + VS Code.

L'intégration suit le guide officiel [Using Strudel in your Project](https://strudel.cc/technical-manual/project-start/),
dans sa variante `@strudel/repl` avec une interface utilisateur propre au projet.
La version du REPL est épinglée pour éviter qu'une mise à jour amont ne change le
comportement des patterns sans modification explicite du projet.

## Get started

### 1. Prérequis (une seule fois, sur ta machine)

Rien d'autre n'est nécessaire — ni Node, ni npm, ni Strudel.

| OS | À installer |
| --- | --- |
| **Windows** | [Docker Desktop](https://www.docker.com/products/docker-desktop/) avec le backend WSL 2 (il installe WSL 2 si besoin) + [VS Code](https://code.visualstudio.com/) + l'extension [WSL](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-wsl) |
| **WSL (Ubuntu/Debian dans Windows)** | Docker Desktop côté Windows, avec *Settings → Resources → WSL integration* activée pour ta distro. Alternative sans Docker Desktop : [Docker Engine](https://docs.docker.com/engine/install/ubuntu/) installé directement dans la distro. |
| **macOS** | [Docker Desktop](https://www.docker.com/products/docker-desktop/) (ou [OrbStack](https://orbstack.dev/)) + [VS Code](https://code.visualstudio.com/) |
| **Linux** | [Docker Engine](https://docs.docker.com/engine/install/) + [post-install non-root](https://docs.docker.com/engine/install/linux-postinstall/) (`sudo usermod -aG docker $USER`, puis relogin) + [VS Code](https://code.visualstudio.com/) |

Dans tous les cas, ajoute l'extension VS Code
[Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers).

Vérifie que Docker répond :

```bash
docker run --rm hello-world
```

### 2. Cloner et ouvrir

```bash
git clone <url-du-repo> strudel-exquis
cd strudel-exquis
code .
```

> **Windows / WSL :** clone le repo **dans** le système de fichiers Linux
> (ex. `~/code/strudel-exquis`), pas dans `/mnt/c/...` : c'est beaucoup plus rapide
> et évite les soucis de permissions.

VS Code propose « Reopen in Container » → accepte.
(Sinon : `Ctrl/Cmd+Shift+P` → **Dev Containers: Reopen in Container**.)

Le premier démarrage télécharge l'image Node 22 et lance `npm install` tout seul.

### 3. Lancer le REPL

Dans le terminal **du container** :

```bash
npm run dev
```

VS Code ouvre automatiquement l'application dans son aperçu intégré quand le
port 5173 est détecté. Si l'aperçu ne s'ouvre pas, clique sur le port **Strudel**
dans le panneau **Ports** de VS Code, ou ouvre http://localhost:5173.
Le son est produit par le navigateur de ta machine — rien à configurer côté audio.

### 4. Vérifier que tout marche (hello world)

1. Sélectionne `hello_world` dans le menu déroulant en haut.
2. Clique dans l'éditeur puis appuie sur **Ctrl+Enter** (play).
3. Tu dois entendre un kick 909, un hi-hat et une basse sawtooth.
4. **Ctrl+.** pour arrêter.

Pas de son ? Vérifie que l'onglet n'est pas muet et que l'audio a bien démarré
après un clic dans la page (politique autoplay des navigateurs).

> Le premier lancement télécharge les banques de samples publiques de Strudel :
> il faut une connexion internet la première fois.

## Écrire son fragment

1. Sélectionne `patterns/<ton-pseudo>.js` dans le menu déroulant (ou crée le
   fichier au préalable, copie `patterns/hello_world.js` comme base).
2. Livecode directement dans l'éditeur du navigateur — c'est le flow prévu :
   retour audio immédiat, coloration syntaxique, sliders, flash à l'évaluation.
3. Clique sur **💾 Sync** quand tu veux écrire le code affiché dans le vrai
   fichier `patterns/<ton-pseudo>.js` sur disque (pas d'auto-save en continu,
   pour éviter une boucle sauvegarde/rechargement pendant que tu tapes). Une
   fois content, commit/push depuis le terminal ou le panneau Source Control
   de VS Code comme d'habitude.
4. Tu peux aussi éditer le fichier depuis VS Code : le navigateur recharge le
   code à chaud et le rejoue (tant que c'est son pattern qui est affiché).
   Il faut avoir cliqué play (Ctrl+Enter) une première fois dans la page pour
   démarrer l'audio — contrainte des navigateurs, pas de notre appli.
5. Un fichier par artiste, pour éviter les conflits.

Le contenu d'un fichier de `patterns/` est du **code Strudel brut** (le même que
dans le REPL de strudel.cc), pas un module JS : pas d'`import`, pas d'`export`.

La sauvegarde automatique passe par un petit point d'API (`/api/save-pattern`)
actif uniquement en mode `npm run dev` — il n'existe pas dans le build de
production (`npm run build` / `npm run preview`).

## Visuels live

Strudel sait dessiner tout seul : ces fonctions s'accrochent à un pattern et
affichent un canvas au-dessus de l'éditeur. Exemple complet :
`patterns/examples/visuals.js`.

| Fonction | Effet |
| --- | --- |
| `.scope()` | oscilloscope / forme d'onde |
| `.spectrum()` | analyseur de spectre |
| `.pianoroll()` | rouleau de notes qui défile |
| `.punchcard()` | grille des événements du cycle |
| `.spiral()` | spirale temporelle |
| `.pitchwheel()` | hauteurs réparties sur l'octave |

```js
$: s("bd sd hh*4").scope();
$: n("c3 e3 g3 b3").pianoroll();
```

### Hydra

Pour des visuels génératifs plein écran, Strudel embarque
[Hydra](https://hydra.ojack.xyz/). Dans le code du pattern :

```js
await initHydra();

osc(10, 0.1, 0.8).rotate(0.1, 0.1).modulate(noise(3)).out(o0);

$: s("bd sd hh*2").bank("RolandTR909");
```

`initHydra()` télécharge `hydra-synth` depuis unpkg au premier appel : il faut
une connexion internet. `initHydra({ detectAudio: true })` réagit au micro, et
`H(pattern)` permet de piloter un paramètre Hydra avec un pattern Strudel.
`clearHydra()` enlève le canvas.

Strudel ajoute ces canvas en plein écran sur le `<body>` ; le player les
déplace au-dessus de l'éditeur seul, pour qu'ils ne masquent ni le header, ni la
quick sheet, ni les addons (voir [src/main.js](src/main.js)).

## Addons

Un **addon** est un module qui ajoute quelque chose à l'interface live sans
toucher au cœur du player : visualisation, contrôleur MIDI, metronome, panneau
de notes… Ils vivent dans `src/addons/` et sont listés dans
[src/addons/index.js](src/addons/index.js).

Addon fourni : **Visualizer** — forme d'onde + spectre du son qui sort de
Strudel, affichés sous l'éditeur (bouton *masquer* / *afficher*). Contrairement
à `.scope()`, il écoute le **mix complet** et tourne en permanence, sans avoir à
l'ajouter au pattern.

### Ajouter un addon

1. Crée `src/addons/<mon-addon>.js` et exporte un objet avec `id`, `name` et
   `setup(context)` :

   ```js
   export default {
     id: 'metronome',
     name: 'Metronome',
     setup({ host, editor, patternName }) {
       const panel = document.createElement('section');
       panel.className = 'addon';
       panel.textContent = `bientôt un metronome pour ${patternName}`;
       host.append(panel);

       // optionnel : fonction de nettoyage
       return () => panel.remove();
     },
   };
   ```

2. Enregistre-le dans [src/addons/index.js](src/addons/index.js) :

   ```js
   import metronome from './metronome.js';

   export const addons = [visualizer, metronome];
   ```

3. Recharge la page : l'addon est monté au démarrage.

Le `context` passé à `setup()` contient :

| Clé | Contenu |
| --- | --- |
| `host` | le `<div id="addons">` sous l'éditeur, où ajouter ton UI |
| `editor` | l'élément `<strudel-editor>` (`editor.editor` = l'instance StrudelMirror : `.code`, `.evaluate()`, `.stop()`) |
| `patternName` | le nom du pattern affiché, ex. `valentin` |

Pour analyser l'audio, importe `getAnalyser()` depuis
[src/addons/audio-tap.js](src/addons/audio-tap.js) : il renvoie un `AnalyserNode`
branché sur la sortie de Strudel (ou `null` tant que l'audio n'a pas démarré).
Les styles communs (`.addon`, `.addon-bar`, `.addon-canvas`) sont dans
[src/style.css](src/style.css).

## Commandes

| Commande | Effet |
| --- | --- |
| `npm run dev` | serveur de dev sur le port 5173 |
| `npm run build` | build statique dans `dist/` |
| `npm run preview` | sert le build de production |

## Structure

```
.devcontainer/devcontainer.json  environnement (Node 22, extensions, port 5173)
patterns/                        un fichier de code Strudel par artiste
src/main.js                      charge les patterns et monte le REPL
src/addons/                      addons de l'interface live (visualizer, …)
index.html                       page du player
```

## Aide

- [Workshop Strudel](https://strudel.cc/workshop/getting-started/)
- [Mini-notation](https://strudel.cc/learn/mini-notation/)
- [Liste des fonctions](https://strudel.cc/functions/intro/)
