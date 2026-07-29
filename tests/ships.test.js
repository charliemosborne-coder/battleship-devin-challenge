import { Ship, SHIP_TYPES } from '../src/logic/ships';

describe('Ship', () => {
  describe('constructor', () => {
    it('should create a ship with correct properties', () => {
      const ship = new Ship(SHIP_TYPES.CARRIER, 0, 0, true);
      expect(ship.name).toBe('Carrier');
      expect(ship.size).toBe(5);
      expect(ship.startRow).toBe(0);
      expect(ship.startCol).toBe(0);
      expect(ship.isHorizontal).toBe(true);
    });
  });

  describe('getCoordinates', () => {
    it('should return correct coordinates for horizontal ship', () => {
      const ship = new Ship(SHIP_TYPES.DESTROYER, 2, 3, true);
      const coords = ship.getCoordinates();
      expect(coords).toEqual([[2, 3], [2, 4]]);
    });

    it('should return correct coordinates for vertical ship', () => {
      const ship = new Ship(SHIP_TYPES.DESTROYER, 2, 3, false);
      const coords = ship.getCoordinates();
      expect(coords).toEqual([[2, 3], [3, 3]]);
    });

    it('should return correct coordinates for carrier', () => {
      const ship = new Ship(SHIP_TYPES.CARRIER, 0, 0, true);
      const coords = ship.getCoordinates();
      expect(coords).toEqual([[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]]);
    });
  });

  describe('hit', () => {
    it('should register a hit at valid position', () => {
      const ship = new Ship(SHIP_TYPES.DESTROYER, 0, 0, true);
      const result = ship.hit(0);
      expect(result).toBe(true);
      expect(ship.hits[0]).toBe(true);
    });

    it('should not register hit at invalid position', () => {
      const ship = new Ship(SHIP_TYPES.DESTROYER, 0, 0, true);
      const result = ship.hit(5);
      expect(result).toBe(false);
    });

    it('should register multiple hits', () => {
      const ship = new Ship(SHIP_TYPES.DESTROYER, 0, 0, true);
      ship.hit(0);
      ship.hit(1);
      expect(ship.hits).toEqual([true, true]);
    });
  });

  describe('isSunk', () => {
    it('should return false for new ship', () => {
      const ship = new Ship(SHIP_TYPES.DESTROYER, 0, 0, true);
      expect(ship.isSunk()).toBe(false);
    });

    it('should return false for partially hit ship', () => {
      const ship = new Ship(SHIP_TYPES.DESTROYER, 0, 0, true);
      ship.hit(0);
      expect(ship.isSunk()).toBe(false);
    });

    it('should return true when all positions hit', () => {
      const ship = new Ship(SHIP_TYPES.DESTROYER, 0, 0, true);
      ship.hit(0);
      ship.hit(1);
      expect(ship.isSunk()).toBe(true);
    });
  });

  describe('getHitCount', () => {
    it('should return 0 for new ship', () => {
      const ship = new Ship(SHIP_TYPES.DESTROYER, 0, 0, true);
      expect(ship.getHitCount()).toBe(0);
    });

    it('should return correct hit count', () => {
      const ship = new Ship(SHIP_TYPES.CARRIER, 0, 0, true);
      ship.hit(0);
      ship.hit(2);
      ship.hit(4);
      expect(ship.getHitCount()).toBe(3);
    });
  });
});
