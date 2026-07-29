# Bug Log

This document documents real bugs encountered during development and how they were fixed.

## Bug 1: Adjacency Check Preventing Same Ship Placement

**Date:** During initial board implementation

**Symptom:** When placing a ship, the adjacency validation was incorrectly rejecting valid placements of the same ship.

**Root Cause:** In the `canPlaceShip` method in `board.js`, the adjacency check was comparing all adjacent cells to the current ship being placed. Since the ship being placed was already partially on the board during validation, it was detecting its own cells as "adjacent to a different ship."

**Code Location:** `src/logic/board.js`, lines 45-58

**Fix:** Modified the adjacency check to explicitly compare the adjacent cell's ship reference to the current ship being placed. If the adjacent cell contains the same ship reference, it's allowed (it's part of the same ship being placed).

```javascript
// Before (buggy):
if (this.isValidCoordinate(adjRow, adjCol) && this.grid[adjRow][adjCol] !== null) {
  return false;
}

// After (fixed):
if (this.isValidCoordinate(adjRow, adjCol) && this.grid[adjRow][adjCol] !== null) {
  const adjacentShip = this.grid[adjRow][adjCol];
  if (adjacentShip !== ship) {
    return false;
  }
}
```

**Testing:** Added unit test in `tests/board.test.js` to verify ships can be placed with one cell gap between them.

---

## Bug 2: AI Target Mode Infinite Loop

**Date:** During AI opponent implementation

**Symptom:** The AI opponent would get stuck in an infinite loop when in target mode if all adjacent cells to a hit had already been fired upon.

**Root Cause:** In `ai-opponent.js`, the `getShot` method in target mode would iterate through adjacent cells but didn't handle the case where all adjacent cells were already in the shots set. It would keep trying the same invalid coordinates.

**Code Location:** `src/logic/ai-opponent.js`, lines 18-42

**Fix:** Added a check to switch back to hunt mode if no valid adjacent cells are available, and pop the current hit from the stack to try targeting from a different hit.

```javascript
// If no valid adjacent cells, switch back to hunt mode
if (row === undefined) {
  this.mode = 'hunt';
  this.hits.pop(); // Remove the hit we couldn't target
  return this.getShot(opponentBoard);
}
```

**Testing:** Added unit test in `tests/ai-opponent.test.js` to verify AI switches modes correctly when adjacent cells are exhausted.

---

## Bug 3: Ship Hit Position Index Calculation

**Date:** During gameplay implementation

**Symptom:** When a ship was hit, the wrong position on the ship was being marked as hit. For example, hitting the second cell of a horizontal ship would mark the first cell as hit.

**Root Cause:** In `board.js`, the `receiveShot` method was calculating the position index by finding the coordinate in the ship's coordinates array, but the coordinates array was being regenerated each time. For vertical ships, the row calculation was off by one.

**Code Location:** `src/logic/board.js`, lines 75-82

**Fix:** Simplified the position index calculation to directly compute it based on the ship's orientation and the hit coordinates, rather than searching through the coordinates array.

```javascript
// Before (buggy):
const coordinates = ship.getCoordinates();
const positionIndex = coordinates.findIndex(([r, c]) => r === row && c === col);

// After (fixed):
let positionIndex;
if (ship.isHorizontal) {
  positionIndex = col - ship.startCol;
} else {
  positionIndex = row - ship.startRow;
}
```

**Testing:** Added unit tests in `tests/board.test.js` to verify hit detection works correctly for both horizontal and vertical ships at various positions.

---

## Bug 4: React Async Import Error

**Date:** During UI implementation

**Symptom:** TypeScript/ESLint error: "'await' expressions are only allowed within async functions and at the top levels of modules."

**Root Cause:** In `App.jsx`, there was an attempt to dynamically import the Ship class using `await import()` inside a regular function, which is not valid syntax.

**Code Location:** `src/components/App.jsx`, line 65

**Fix:** Removed the dynamic import and instead imported Ship at the top of the file with the other imports.

```javascript
// Before (buggy):
const { Ship } = await import('../logic/ships');

// After (fixed):
import { Ship, ALL_SHIPS } from '../logic/ships';
```

**Testing:** Verified the application loads without syntax errors in the browser console.
