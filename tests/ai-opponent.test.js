import { AIOpponent } from '../src/logic/ai-opponent';
import { Board } from '../src/logic/board';

describe('AIOpponent', () => {
  let ai;
  let board;

  beforeEach(() => {
    ai = new AIOpponent();
    board = new Board();
  });

  describe('constructor', () => {
    it('should initialize in hunt mode', () => {
      expect(ai.mode).toBe('hunt');
    });

    it('should initialize empty hits stack', () => {
      expect(ai.hits.length).toBe(0);
    });

    it('should initialize empty shots set', () => {
      expect(ai.shots.size).toBe(0);
    });
  });

  describe('getShot', () => {
    it('should return valid coordinates in hunt mode', () => {
      const shot = ai.getShot(board);
      expect(shot).toHaveProperty('row');
      expect(shot).toHaveProperty('col');
      expect(shot.row).toBeGreaterThanOrEqual(0);
      expect(shot.row).toBeLessThan(10);
      expect(shot.col).toBeGreaterThanOrEqual(0);
      expect(shot.col).toBeLessThan(10);
    });

    it('should not return same shot twice', () => {
      const shot1 = ai.getShot(board);
      const shot2 = ai.getShot(board);
      expect(shot1.row).not.toBe(shot2.row) || expect(shot1.col).not.toBe(shot2.col);
    });

    it('should switch to target mode after hit', () => {
      ai.reportHit(5, 5, false);
      expect(ai.mode).toBe('target');
    });

    it('should return adjacent cell in target mode', () => {
      ai.reportHit(5, 5, false);
      const shot = ai.getShot(board);
      const rowDiff = Math.abs(shot.row - 5);
      const colDiff = Math.abs(shot.col - 5);
      expect(rowDiff + colDiff).toBe(1);
    });
  });

  describe('reportHit', () => {
    it('should switch to target mode on hit', () => {
      ai.reportHit(5, 5, false);
      expect(ai.mode).toBe('target');
    });

    it('should add hit to stack', () => {
      ai.reportHit(5, 5, false);
      expect(ai.hits.length).toBe(1);
      expect(ai.hits[0]).toEqual({ row: 5, col: 5 });
    });

    it('should clear target mode on sink', () => {
      ai.reportHit(5, 5, true);
      expect(ai.mode).toBe('hunt');
      expect(ai.hits.length).toBe(0);
    });
  });

  describe('reportMiss', () => {
    it('should remove hit from stack in target mode', () => {
      ai.reportHit(5, 5, false);
      ai.reportMiss(5, 6);
      expect(ai.hits.length).toBe(0);
    });

    it('should switch to hunt mode when stack empty', () => {
      ai.reportHit(5, 5, false);
      ai.reportMiss(5, 6);
      expect(ai.mode).toBe('hunt');
    });
  });

  describe('reset', () => {
    it('should reset to initial state', () => {
      ai.reportHit(5, 5, false);
      ai.reset();
      expect(ai.mode).toBe('hunt');
      expect(ai.hits.length).toBe(0);
      expect(ai.shots.size).toBe(0);
    });
  });

  describe('getAdjacentCells', () => {
    it('should return 4 adjacent cells for interior point', () => {
      const adjacent = ai.getAdjacentCells(5, 5);
      expect(adjacent.length).toBe(4);
    });

    it('should return 3 adjacent cells for edge point', () => {
      const adjacent = ai.getAdjacentCells(0, 5);
      expect(adjacent.length).toBe(3);
    });

    it('should return 2 adjacent cells for corner point', () => {
      const adjacent = ai.getAdjacentCells(0, 0);
      expect(adjacent.length).toBe(2);
    });

    it('should not return out of bounds cells', () => {
      const adjacent = ai.getAdjacentCells(0, 0);
      adjacent.forEach(([row, col]) => {
        expect(row).toBeGreaterThanOrEqual(0);
        expect(row).toBeLessThan(10);
        expect(col).toBeGreaterThanOrEqual(0);
        expect(col).toBeLessThan(10);
      });
    });
  });
});
