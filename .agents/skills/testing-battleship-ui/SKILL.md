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

## Historic runtime bug (fixed on `main`, but re-check on old branches)

Older revisions of `src/components/GameBoard.jsx` built the placement preview with
`new (require('../logic/ships').Ship)(...)`. `require` is undefined in the browser/ESM build, so
the first `mouseenter` on a board cell while a ship was selected unmounted the whole app
(white page, React logs "The above error occurred in the `<GameBoard>` component").
Current `main` imports `Ship` at the top of the file and manual placement works.

If you see a blank page while hovering a cell in the setup phase, grep `GameBoard.jsx` for
`require(`; if present, the branch predates the fix. Verify on `main` before blaming a feature
branch (second worktree on another port: `git worktree add /tmp/bs-main main`, symlink
`node_modules`, `npx vite --port 5174`).

Manual-placement regression check that exercises the whole path:
click a ship button → hover a cell (expect `.cell.preview` highlights) → click the orientation
button (label shows the *current* orientation) → hover again (preview flips axis) → click a cell
where the ship overflows the grid (e.g. horizontal Carrier at column 7) → expect the exact
message `Cannot place ship there` with `Placed: 0 / 5` unchanged.

## Clicking board cells reliably

The status toast (`.status`) is `position: fixed; bottom: 20px` on current `main`, so it no longer
shifts the boards — verify by comparing `.board` `getBoundingClientRect().top` with and without a
toast (it stayed 451px in a 1600×1069 viewport). On old branches it was in normal flow above the
boards and jumped the layout ~40 px; if you hit that, pin it out of flow once from the console:

```js
const s=document.createElement('style');
s.textContent='.status{position:fixed !important;top:0;left:0;right:0;z-index:9999;margin:0 !important}';
document.head.appendChild(s);
```

**The boards DO move between phases**: the `Place Your Ships` panel exists only in the setup phase
(and grows when the Orientation row appears after selecting a ship), so re-measure geometry after
every phase change. Derive cell centres from real rects instead of guessing — note that column and
row pitch differ (≈49.8 px vs 34 px per cell in a 1600px-wide window) so you cannot assume a square
step:

```js
const b=document.querySelectorAll('.board')[1];   // [0]=Your Board, [1]=Computer's Board
const c0=b.children[0].getBoundingClientRect();   // cell (0,0)
const dx=(b.children[9].getBoundingClientRect().left-c0.left)/9;
const dy=(b.children[90].getBoundingClientRect().top-c0.top)/9;
// css centre of (r,c) = [c0.left+c0.width/2 + dx*c, c0.top+c0.height/2 + dy*r]
// screenshot coord = scale*cssCoord + browserChromeOffsetY  (scale = 1024/screen.width)
// verify with one probe click; a click that produces no status message probably landed in a gap
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
- Sinking all 5 computer ships ends the game in the win state; the AI sinking all 5 of yours ends it
  in the loss state. Both render a full-screen `.game-over-screen` takeover (`.winner` green
  gradient + 80 `.confetti-piece` spans, `.loser` solid black) with a "Play Again" button; the
  in-game reset is the "Reset Game" button below the boards.

### Reaching the WIN state deterministically (read-only fiber harness)

Random Placement, then read the computer's ship coordinates from the App `game` state on the React
fiber and click exactly those 17 cells ~0.9 s apart. This only *reads* state — do not call game
methods from the console.

```js
const root=document.getElementById('root');
const key=Object.keys(root).find(k=>k.startsWith('__reactContainer'));
let n=root[key]; if(n&&n.current)n=n.current;      // FiberRootNode -> current HostRoot fiber
const seen=new Set(); const stack=[n]; let g=null;
while(stack.length){const f=stack.pop(); if(!f||seen.has(f))continue; seen.add(f);
  let h=f.memoizedState,i=0;
  while(h&&typeof h==='object'&&'memoizedState' in h&&i<20){         // walk the hook chain
    const s=h.memoizedState; if(s&&s.playerBoard&&s.computerBoard){g=s;break;} h=h.next;i++;}
  if(g)break; if(f.child)stack.push(f.child); if(f.sibling)stack.push(f.sibling);}
const cells=s=>Array.from({length:s.size},(_,i)=>s.isHorizontal?[s.startRow,s.startCol+i]:[s.startRow+i,s.startCol]);
g.computerBoard.ships.flatMap(cells);   // 17 winning cells
```

Gotcha: `root[key]` is the FiberRootNode — you must step into `.current` first, and the state lives
on a hook in the `memoizedState.next` chain, not directly on `fiber.memoizedState`.

### Reaching the LOSS state

Shoot only cells that are **not** computer ship cells (complement of the list above, 83 cells) at
~1.2 s intervals. Each of your shots grants the AI one turn, and you can never win, so the AI
usually sinks all five of your ships within ~40–60 shots (it took ~45 in practice). Do this *before*
the win run, since the win run only needs 17 clicks and the AI rarely wins in that time.

Do NOT reset between reading coordinates and clicking — `Reset Game` / `Play Again` re-randomises
both fleets, so re-read the fiber after every reset.

## Devin Secrets Needed

None — the app is fully local with no auth or API keys.
