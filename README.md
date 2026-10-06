# strudel-exquis

Un cadavre exquis à la pomme, joué avec [Strudel](https://strudel.cc).

Chaque artiste écrit son fragment dans `patterns/`, on les joue dans le navigateur
via un REPL Strudel servi localement. Tout l'environnement vit dans un dev container :
la seule chose installée sur ta machine est Docker + VS Code.

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

Ouvre http://localhost:5173 (VS Code forward le port 5173 automatiquement).
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

1. Crée `patterns/<ton-pseudo>.js` (copie `patterns/hello_world.js` comme base).
2. Recharge la page : ton fichier apparaît dans le menu déroulant.
3. Tu peux livecoder directement dans l'éditeur du navigateur, puis recopier le
   résultat dans ton fichier pour le commiter.
4. Un fichier par artiste, pour éviter les conflits.

Le contenu d'un fichier de `patterns/` est du **code Strudel brut** (le même que
dans le REPL de strudel.cc), pas un module JS : pas d'`import`, pas d'`export`.

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
index.html                       page du player
```

## Aide

- [Workshop Strudel](https://strudel.cc/workshop/getting-started/)
- [Mini-notation](https://strudel.cc/learn/mini-notation/)
- [Liste des fonctions](https://strudel.cc/functions/intro/)
