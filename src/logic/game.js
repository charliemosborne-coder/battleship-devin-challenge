import { Board } from './board.js';
import { Ship, ALL_SHIPS } from './ships.js';
import { AIOpponent } from './ai-opponent.js';

export class Game {
  constructor() {
    this.playerBoard = new Board();
    this.computerBoard = new Board();
    this.isPlayerTurn = true;
    this.gameOver = false;
    this.winner = null;
    this.shotHistory = {
      player: [],
      computer: []
    };
    this.ai = new AIOpponent();
  }

  setupPlayerShips(placements) {
    this.playerBoard.clear();
    for (const placement of placements) {
      const { shipType, startRow, startCol, isHorizontal } = placement;
      const ship = new Ship(shipType, startRow, startCol, isHorizontal);
      if (!this.playerBoard.placeShip(ship)) {
        return false;
      }
    }
    return true;
  }

  setupComputerShips() {
    this.computerBoard.placeRandomShips();
  }

  playerShoot(row, col) {
    if (this.gameOver || !this.isPlayerTurn) {
      return { valid: false, message: 'Not your turn' };
    }

    const result = this.computerBoard.receiveShot(row, col);
    
    if (!result.valid) {
      return { valid: false, message: 'Invalid shot' };
    }

    this.shotHistory.player.push({ row, col, hit: result.hit, sunk: result.sunk });
    
    if (this.computerBoard.allShipsSunk()) {
      this.gameOver = true;
      this.winner = 'player';
    } else {
      this.isPlayerTurn = false;
    }

    return { valid: true, ...result };
  }

  computerShoot() {
    if (this.gameOver || this.isPlayerTurn) {
      return null;
    }

    const shot = this.ai.getShot(this.playerBoard);
    if (!shot) {
      return null;
    }

    const result = this.playerBoard.receiveShot(shot.row, shot.col);
    
    if (result.valid) {
      this.shotHistory.computer.push({ row: shot.row, col: shot.col, hit: result.hit, sunk: result.sunk });
      
      if (result.hit) {
        this.ai.reportHit(shot.row, shot.col, result.sunk);
      } else {
        this.ai.reportMiss(shot.row, shot.col);
      }
      
      if (this.playerBoard.allShipsSunk()) {
        this.gameOver = true;
        this.winner = 'computer';
      } else {
        this.isPlayerTurn = true;
      }
    }

    return { valid: result.valid, ...result, row: shot.row, col: shot.col };
  }

  endTurn() {
    this.isPlayerTurn = !this.isPlayerTurn;
  }

  isGameOver() {
    return this.gameOver;
  }

  getWinner() {
    return this.winner;
  }

  reset() {
    this.playerBoard = new Board();
    this.computerBoard = new Board();
    this.isPlayerTurn = true;
    this.gameOver = false;
    this.winner = null;
    this.shotHistory = {
      player: [],
      computer: []
    };
    this.ai.reset();
  }
}
