import React from 'react';
import { Board } from '../logic/board';
import { Ship } from '../logic/ships';

function GameBoard({ board, onCellClick, onCellHover, previewCells, selectedShip, isHorizontal, showShips, gameState }) {
  const renderCell = (row, col) => {
    const ship = board.getShipAt(row, col);
    const shot = board.getShotAt(row, col);
    
    let cellClass = 'cell';
    
    if (shot === 'hit') {
      cellClass += ' hit';
    } else if (shot === 'miss') {
      cellClass += ' miss';
    } else if (showShips && ship) {
      if (ship.isSunk()) {
        cellClass += ' sunk';
      } else {
        cellClass += ' ship';
      }
    }

    // Preview placement
    if (previewCells && previewCells.some(([r, c]) => r === row && c === col)) {
      if (selectedShip) {
        const tempShip = new Ship(selectedShip,
          previewCells[0][0], previewCells[0][1], isHorizontal);
        if (board.canPlaceShip(tempShip)) {
          cellClass += ' preview';
        } else {
          cellClass += ' preview-invalid';
        }
      }
    }

    // Disable clicking during computer's turn
    if (gameState === 'playing' && !showShips) {
      cellClass += ' disabled';
    }

    return (
      <div
        key={`${row}-${col}`}
        className={cellClass}
        onClick={() => onCellClick(row, col)}
        onMouseEnter={() => onCellHover && onCellHover(row, col)}
      >
        {shot === 'hit' && <span className="golf-ball" />}
        {shot === 'miss' && 'OB'}
        {!shot && !(showShips && ship) && <span className="flag-pin" aria-hidden="true">⛳</span>}
      </div>
    );
  };

  const cells = [];
  for (let row = 0; row < Board.BOARD_SIZE; row++) {
    for (let col = 0; col < Board.BOARD_SIZE; col++) {
      cells.push(renderCell(row, col));
    }
  }

  return <div className="board">{cells}</div>;
}

export default GameBoard;
