# GrepoBot Updated (local build)

This repository builds a single userscript (`GrepoBotUpdated.user.js`) from the
sources in `src/`.

## Requirements
- Python 3 (used by `GrepoBotUpdatedBuilder.py`)
- A userscript manager (Tampermonkey, Violentmonkey, or Greasemonkey)

## Build
From the project root:

```sh
./build.sh
```

Or run the builder directly:

```sh
python3 GrepoBotUpdatedBuilder.py
```

The output is written to:

```
GrepoBotUpdated.user.js
```

## Install the userscript
1. Open your userscript manager.
2. Create a new script (or import a script).
3. Paste the content of `GrepoBotUpdated.user.js` (or drag the file into the
   manager, depending on the extension).
4. Save and refresh the Grepolis game page.

## Rebuild after changes
Any time you edit files under `src/` (JS, CSS, or assets), re-run the build
step so `GrepoBotUpdated.user.js` is updated.

## Sources
- JavaScript: `src/js`
- CSS: `src/styles/GrepoBotUpdated.css`
- Assets: `src/assets/images`

## Avertissement / CGU
Ce programme a ete mis a jour pour le plaisir et le challenge. Il ne doit en
aucun cas etre utilise sans l'autorisation d'InnoGames. Merci de respecter les
CGU d'InnoGames.
