import { Board } from '../src/logic/board';
import { Ship, SHIP_TYPES } from '../src/logic/ships';

describe('Board', () => {
  describe('constructor', () => {
    it('should create empty 10x10 grid', () => {
      const board = new Board();
      expect(board.grid.length).toBe(10);
      expect(board.grid[0].length).toBe(10);
      expect(board.grid[0][0]).toBeNull();
    });

    it('should initialize empty shots grid', () => {
      const board = new Board();
      expect(board.shots.length).toBe(10);
      expect(board.shots[0][0]).toBeNull();
    });
  });

  describe('isValidCoordinate', () => {
    it('should return true for valid coordinates', () => {
      const board = new Board();
      expect(board.isValidCoordinate(0, 0)).toBe(true);
      expect(board.isValidCoordinate(5, 5)).toBe(true);
      expect(board.isValidCoordinate(9, 9)).toBe(true);
    });

    it('should return false for invalid coordinates', () => {
      const board = new Board();
      expect(board.isValidCoordinate(-1, 0)).toBe(false);
      expect(board.isValidCoordinate(0, -1)).toBe(false);
      expect(board.isValidCoordinate(10, 0)).toBe(false);
      expect(board.isValidCoordinate(0, 10)).toBe(false);
    });
  });

  describe('canPlaceShip', () => {
    it('should return true for valid placement', () => {
      const board = new Board();
      const ship = new Ship(SHIP_TYPES.DESTROYER, 0, 0, true);
      expect(board.canPlaceShip(ship)).toBe(true);
    });

    it('should return false for out of bounds placement', () => {
      const board = new Board();
      const ship = new Ship(SHIP_TYPES.CARRIER, 0, 8, true);
      expect(board.canPlaceShip(ship)).toBe(false);
    });

    it('should return false for overlapping ships', () => {
      const board = new Board();
      const ship1 = new Ship(SHIP_TYPES.DESTROYER, 0, 0, true);
      const ship2 = new Ship(SHIP_TYPES.DESTROYER, 0, 1, true);
      board.placeShip(ship1);
      expect(board.canPlaceShip(ship2)).toBe(false);
    });

    it('should return false for adjacent ships', () => {
      const board = new Board();
      const ship1 = new Ship(SHIP_TYPES.DESTROYER, 0, 0, true);
      const ship2 = new Ship(SHIP_TYPES.DESTROYER, 1, 0, true);
      board.placeShip(ship1);
      expect(board.canPlaceShip(ship2)).toBe(false);
    });

    it('should allow ships with one cell gap', () => {
      const board = new Board();
      const ship1 = new Ship(SHIP_TYPES.DESTROYER, 0, 0, true);
      const ship2 = new Ship(SHIP_TYPES.DESTROYER, 2, 0, true);
      board.placeShip(ship1);
      expect(board.canPlaceShip(ship2)).toBe(true);
    });
  });

  describe('placeShip', () => {
    it('should place ship successfully', () => {
      const board = new Board();
      const ship = new Ship(SHIP_TYPES.DESTROYER, 0, 0, true);
      const result = board.placeShip(ship);
      expect(result).toBe(true);
      expect(board.ships.length).toBe(1);
    });

    it('should not place invalid ship', () => {
      const board = new Board();
      const ship = new Ship(SHIP_TYPES.CARRIER, 0, 8, true);
      const result = board.placeShip(ship);
      expect(result).toBe(false);
      expect(board.ships.length).toBe(0);
    });

    it('should mark grid cells with ship', () => {
      const board = new Board();
      const ship = new Ship(SHIP_TYPES.DESTROYER, 0, 0, true);
      board.placeShip(ship);
      expect(board.grid[0][0]).toBe(ship);
      expect(board.grid[0][1]).toBe(ship);
    });
  });

  describe('receiveShot', () => {
    it('should register hit on ship', () => {
      const board = new Board();
      const ship = new Ship(SHIP_TYPES.DESTROYER, 0, 0, true);
      board.placeShip(ship);
      const result = board.receiveShot(0, 0);
      expect(result.valid).toBe(true);
      expect(result.hit).toBe(true);
      expect(result.sunk).toBe(false);
    });

    it('should register miss on empty cell', () => {
      const board = new Board();
      const result = board.receiveShot(0, 0);
      expect(result.valid).toBe(true);
      expect(result.hit).toBe(false);
      expect(result.sunk).toBe(false);
    });

    it('should return invalid for out of bounds shot', () => {
      const board = new Board();
      const result = board.receiveShot(-1, 0);
      expect(result.valid).toBe(false);
    });

    it('should return invalid for duplicate shot', () => {
      const board = new Board();
      board.receiveShot(0, 0);
      const result = board.receiveShot(0, 0);
      expect(result.valid).toBe(false);
    });

    it('should detect sunk ship', () => {
      const board = new Board();
      const ship = new Ship(SHIP_TYPES.DESTROYER, 0, 0, true);
      board.placeShip(ship);
      board.receiveShot(0, 0);
      const result = board.receiveShot(0, 1);
      expect(result.valid).toBe(true);
      expect(result.hit).toBe(true);
      expect(result.sunk).toBe(true);
    });
  });

  describe('allShipsSunk', () => {
    it('should return true when no ships', () => {
      const board = new Board();
      expect(board.allShipsSunk()).toBe(true);
    });

    it('should return false when ships not sunk', () => {
      const board = new Board();
      const ship = new Ship(SHIP_TYPES.DESTROYER, 0, 0, true);
      board.placeShip(ship);
      expect(board.allShipsSunk()).toBe(false);
    });

    it('should return true when all ships sunk', () => {
      const board = new Board();
      const ship = new Ship(SHIP_TYPES.DESTROYER, 0, 0, true);
      board.placeShip(ship);
      board.receiveShot(0, 0);
      board.receiveShot(0, 1);
      expect(board.allShipsSunk()).toBe(true);
    });
  });

  describe('placeRandomShips', () => {
    it('should place all ships', () => {
      const board = new Board();
      board.placeRandomShips();
      expect(board.ships.length).toBe(5);
    });

    it('should place ships without overlaps', () => {
      const board = new Board();
      board.placeRandomShips();
      const shipCount = new Set();
      for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
          if (board.grid[row][col]) {
            shipCount.add(board.grid[row][col]);
          }
        }
      }
      expect(shipCount.size).toBe(5);
    });
  });

  describe('clear', () => {
    it('should reset board to empty state', () => {
      const board = new Board();
      const ship = new Ship(SHIP_TYPES.DESTROYER, 0, 0, true);
      board.placeShip(ship);
      board.receiveShot(0, 0);
      board.clear();
      expect(board.ships.length).toBe(0);
      expect(board.grid[0][0]).toBeNull();
      expect(board.shots[0][0]).toBeNull();
    });
  });
});
