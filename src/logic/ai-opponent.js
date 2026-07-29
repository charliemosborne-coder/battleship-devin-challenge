const BOARD_SIZE = 10;

export class AIOpponent {
  constructor() {
    this.mode = 'hunt'; // 'hunt' or 'target'
    this.hits = []; // Stack of hit coordinates to target
    this.shots = new Set(); // Track all shots taken
  }

  reset() {
    this.mode = 'hunt';
    this.hits = [];
    this.shots.clear();
  }

  getShot(opponentBoard) {
    let row, col;

    if (this.mode === 'target' && this.hits.length > 0) {
      // Target mode: shoot adjacent to known hits
      const lastHit = this.hits[this.hits.length - 1];
      const adjacent = this.getAdjacentCells(lastHit.row, lastHit.col);
      
      // Find first valid adjacent cell that hasn't been shot
      for (const [r, c] of adjacent) {
        if (!this.shots.has(`${r},${c}`)) {
          row = r;
          col = c;
          break;
        }
      }

      // If no valid adjacent cells, switch back to hunt mode
      if (row === undefined) {
        this.mode = 'hunt';
        this.hits.pop(); // Remove the hit we couldn't target
        return this.getShot(opponentBoard);
      }
    } else {
      // Hunt mode: random valid shot
      let attempts = 0;
      const maxAttempts = 1000;
      
      do {
        row = Math.floor(Math.random() * BOARD_SIZE);
        col = Math.floor(Math.random() * BOARD_SIZE);
        attempts++;
      } while (this.shots.has(`${row},${col}`) && attempts < maxAttempts);

      if (attempts >= maxAttempts) {
        // All cells have been shot (shouldn't happen in normal game)
        return null;
      }
    }

    this.shots.add(`${row},${col}`);
    return { row, col };
  }

  getAdjacentCells(row, col) {
    const adjacent = [];
    const directions = [
      [-1, 0], [1, 0], [0, -1], [0, 1] // up, down, left, right
    ];

    for (const [dr, dc] of directions) {
      const newRow = row + dr;
      const newCol = col + dc;
      if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE) {
        adjacent.push([newRow, newCol]);
      }
    }

    return adjacent;
  }

  reportHit(row, col, sunk) {
    if (sunk) {
      // Ship sunk, clear target mode
      this.mode = 'hunt';
      this.hits = [];
    } else {
      // Hit but not sunk, switch to target mode
      this.mode = 'target';
      this.hits.push({ row, col });
    }
  }

  reportMiss(row, col) {
    // If in target mode and we missed, try targeting from a different hit
    if (this.mode === 'target' && this.hits.length > 0) {
      // Remove the current hit from consideration and try another
      this.hits.pop();
      if (this.hits.length === 0) {
        this.mode = 'hunt';
      }
    }
  }
}
