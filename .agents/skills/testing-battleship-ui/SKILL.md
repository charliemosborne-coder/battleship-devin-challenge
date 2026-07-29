---
name: testing-battleship-ui
description: How to run and end-to-end test the React Battleship web UI locally (dev server workaround, board cell coordinates, known pre-existing bugs).
---

# Testing the Battleship React UI locally

## Getting a running app (repo has a broken entry point)

`index.html` lives in `public/`, not the repo root. Consequences:

- `npm run build` fails with `Could not resolve entry module "index.html"`.
- Loading `http://localhost:5173/index.html` serves the file untransformed → blank page and
  `@vitejs/plugin-react can't detect preamble` in the console.

Workaround (do NOT commit it):

```bash
cp public/index.html ./index.html      # untracked; delete when done
npx vite --port 5173
# open http://localhost:5173/?v=1   (avoid /index.html — Chrome autocompletes to it)
```

`npm test` also fails pre-existing: `jest.config.js` uses ESM `export default` under CJS.
Note it, don't fix it as part of unrelated work.

## Known pre-existing runtime bug: manual ship placement crashes the app

`src/components/GameBoard.jsx` builds the placement preview with
`new (require('../logic/ships').Ship)(...)`. `require` is undefined in the browser/ESM build, so
**the first `mouseenter` on a board cell while a ship is selected unmounts the whole app**
(white page, React logs "The above error occurred in the `<GameBoard>` component").

Implications for testing:

- Manual placement and the "Cannot place ship there" rejection path are unreachable via the UI.
  Verify this reproduces on `main` before blaming a feature branch (run a second worktree on
  another port: `git worktree add /tmp/bs-main main`, symlink `node_modules`, `npx vite --port 5174`).
- Use **Random Placement** to start games in automated tests.
- After `Reset Game` / `Play Again`, `selectedShip` is set to Carrier again, so *do not move the
  mouse over either board* while in the setup phase or the app will blank out.
- On a fresh page load `selectedShip` is `null`, so hovering/clicking cells is safe; clicking a cell
  then shows "Select a ship to place" — a useful non-crashing check of the setup click handler.

## Clicking board cells reliably

The status banner (`.status`) is rendered conditionally *above* the boards, so the layout jumps
~40 px whenever a message appears or its 3 s timeout expires — scripted clicks then land on the
wrong row. Pin it out of flow once from the browser console before a click sweep:

```js
const s=document.createElement('style');
s.textContent='.status{position:fixed !important;top:0;left:0;right:0;z-index:9999;margin:0 !important}';
document.head.appendChild(s);
```

Then derive cell centers from real rects rather than guessing, e.g.:

```js
const b=document.querySelectorAll('.board')[1];      // [0]=Your Board, [1]=Computer's Board
const c0=b.children[0].getBoundingClientRect();      // cell (0,0)
// screen = chromeOffset + devicePixelScale * cssCoord ; verify with one probe click
```

Useful read-only queries (measurement only, don't drive gameplay from the console):

```js
// cells not yet shot on the computer board
[...document.querySelectorAll('.board')[1].children]
  .map((c,i)=>[c,i]).filter(([c])=>!c.classList.contains('hit')&&!c.classList.contains('miss'))
  .map(([,i])=>[Math.floor(i/10),i%10]);
```

## Making a game reach interesting states quickly

- One player shot triggers one computer shot ~500 ms later; clicking faster yields
  "Wait for computer turn" and the shot is dropped. Leave ≥1 s between clicks.
- Ships cannot be placed adjacent to each other, so **cells orthogonally/diagonally adjacent to a
  known ship cell are guaranteed empty**. Shooting those is a safe way to "pass" turns and let the
  AI catch up (e.g. to get the player-side graveyard/sunk states populated) without ending the game.
- Hunt/target: after a hit, probe the 4 neighbours to find the ship axis; sizes are
  Carrier 5, Battleship 4, Cruiser 3, Submarine 3, Destroyer 2.
- Sinking all 5 computer ships ends the game with "You Win!" and a "Play Again" button; the
  in-game reset is the "Reset Game" button below the boards.

## Devin Secrets Needed

None — the app is fully local with no auth or API keys.
