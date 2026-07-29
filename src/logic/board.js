import { Ship, ALL_SHIPS } from './ships.js';

const BOARD_SIZE = 10;

export class Board {
  constructor() {
    this.grid = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
    this.ships = [];
    this.shots = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
  }

  isValidCoordinate(row, col) {
    return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
  }

  canPlaceShip(ship) {
    const coordinates = ship.getCoordinates();
    
    // Check if all coordinates are within bounds
    for (const [row, col] of coordinates) {
      if (!this.isValidCoordinate(row, col)) {
        return false;
      }
    }

    // Check for overlaps with existing ships
    for (const [row, col] of coordinates) {
      if (this.grid[row][col] !== null) {
        return false;
      }
    }

    // Check for adjacency violations (ships cannot touch)
    for (const [row, col] of coordinates) {
      const adjacentCells = [
        [row - 1, col], [row + 1, col],
        [row, col - 1], [row, col + 1],
        [row - 1, col - 1], [row - 1, col + 1],
        [row + 1, col - 1], [row + 1, col + 1]
      ];

      for (const [adjRow, adjCol] of adjacentCells) {
        if (this.isValidCoordinate(adjRow, adjCol) && this.grid[adjRow][adjCol] !== null) {
          // Check if the adjacent cell belongs to a different ship
          const adjacentShip = this.grid[adjRow][adjCol];
          if (adjacentShip !== ship) {
            return false;
          }
        }
      }
    }

    return true;
  }

  placeShip(ship) {
    if (!this.canPlaceShip(ship)) {
      return false;
    }

    const coordinates = ship.getCoordinates();
    for (const [row, col] of coordinates) {
      this.grid[row][col] = ship;
    }
    this.ships.push(ship);
    return true;
  }

  receiveShot(row, col) {
    if (!this.isValidCoordinate(row, col)) {
      return { valid: false, hit: false, sunk: false };
    }

    if (this.shots[row][col] !== null) {
      return { valid: false, hit: false, sunk: false };
    }

    const ship = this.grid[row][col];
    const isHit = ship !== null;

    this.shots[row][col] = isHit ? 'hit' : 'miss';

    let sunk = false;
    if (isHit) {
      // Find which position on the ship was hit
      const coordinates = ship.getCoordinates();
      const positionIndex = coordinates.findIndex(([r, c]) => r === row && c === col);
      ship.hit(positionIndex);
      sunk = ship.isSunk();
    }

    return { valid: true, hit: isHit, sunk, ship };
  }

  allShipsSunk() {
    return this.ships.every(ship => ship.isSunk());
  }

  getShipAt(row, col) {
    if (!this.isValidCoordinate(row, col)) {
      return null;
    }
    return this.grid[row][col];
  }

  getShotAt(row, col) {
    if (!this.isValidCoordinate(row, col)) {
      return null;
    }
    return this.shots[row][col];
  }

  placeRandomShips() {
    this.clear();
    
    for (const shipType of ALL_SHIPS) {
      let placed = false;
      let attempts = 0;
      const maxAttempts = 1000;

      while (!placed && attempts < maxAttempts) {
        const isHorizontal = Math.random() < 0.5;
        const maxRow = isHorizontal ? BOARD_SIZE - 1 : BOARD_SIZE - shipType.size;
        const maxCol = isHorizontal ? BOARD_SIZE - shipType.size : BOARD_SIZE - 1;
        
        const startRow = Math.floor(Math.random() * (maxRow + 1));
        const startCol = Math.floor(Math.random() * (maxCol + 1));

        const ship = new Ship(shipType, startRow, startCol, isHorizontal);
        
        if (this.placeShip(ship)) {
          placed = true;
        }
        attempts++;
      }

      if (!placed) {
        // If we couldn't place a ship after many attempts, clear and try again
        this.clear();
        return this.placeRandomShips();
      }
    }
  }

  clear() {
    this.grid = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
    this.ships = [];
    this.shots = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
  }

  static get BOARD_SIZE() {
    return BOARD_SIZE;
  }
}
