import React, { useState, useEffect } from 'react';
import { Game } from '../logic/game';
import { SHIP_TYPES, ALL_SHIPS, Ship } from '../logic/ships';
import GameBoard from './GameBoard';
import ShipPlacement from './ShipPlacement';
import Graveyard from './Graveyard';
import GameOverScreen from './GameOverScreen';
import './App.css';

function App() {
  const [game] = useState(() => new Game());
  const [gameState, setGameState] = useState('setup'); // 'setup', 'playing', 'gameover'
  const [selectedShip, setSelectedShip] = useState(null);
  const [isHorizontal, setIsHorizontal] = useState(true);
  const [placedShips, setPlacedShips] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');
  const [previewCells, setPreviewCells] = useState([]);

  useEffect(() => {
    game.setupComputerShips();
  }, [game]);

  const showMessage = (msg, type = 'info') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleShipSelect = (shipType) => {
    if (placedShips.includes(shipType.name)) {
      return;
    }
    setSelectedShip(shipType);
    setPreviewCells([]);
  };

  const handleOrientationToggle = () => {
    setIsHorizontal(!isHorizontal);
    setPreviewCells([]);
  };

  const handleCellClick = (row, col) => {
    if (gameState === 'setup') {
      handlePlacementClick(row, col);
    } else if (gameState === 'playing') {
      handleShotClick(row, col);
    }
  };

  const handlePlacementClick = (row, col) => {
    if (!selectedShip) {
      showMessage('Select a ship to place', 'error');
      return;
    }

    const ship = {
      shipType: selectedShip,
      startRow: row,
      startCol: col,
      isHorizontal
    };

    const newShip = new Ship(selectedShip, row, col, isHorizontal);

    if (game.playerBoard.placeShip(newShip)) {
      const newPlacedShips = [...placedShips, ship];
      setPlacedShips(newPlacedShips);
      
      if (newPlacedShips.length === ALL_SHIPS.length) {
        game.setupPlayerShips(newPlacedShips);
        setGameState('playing');
        showMessage('All ships placed! Game starts!', 'success');
      } else {
        const nextShip = ALL_SHIPS.find(s => !newPlacedShips.some(p => p.shipType.name === s.name));
        setSelectedShip(nextShip);
        showMessage(`${selectedShip.name} placed!`, 'success');
      }
      setPreviewCells([]);
    } else {
      showMessage('Cannot place ship there', 'error');
    }
  };

  const handleShotClick = (row, col) => {
    if (!game.isPlayerTurn) {
      showMessage('Wait for computer turn', 'error');
      return;
    }

    const result = game.playerShoot(row, col);
    
    if (result.valid) {
      if (result.hit) {
        showMessage(result.sunk ? `You sunk a ${result.ship.name}!` : 'Hit!', 'success');
      } else {
        showMessage('Miss!', 'info');
      }

      if (game.isGameOver()) {
        setGameState('gameover');
        return;
      }

      // Computer's turn
      setTimeout(() => {
        const computerResult = game.computerShoot();
        if (computerResult) {
          if (computerResult.hit) {
            showMessage(`Computer hit at ${computerResult.row},${computerResult.col}!`, 'error');
          } else {
            showMessage(`Computer missed at ${computerResult.row},${computerResult.col}`, 'info');
          }

          if (game.isGameOver()) {
            setGameState('gameover');
          }
        }
      }, 500);
    } else {
      showMessage('Invalid shot', 'error');
    }
  };

  const handleCellHover = (row, col) => {
    if (gameState === 'setup' && selectedShip) {
      const coordinates = [];
      for (let i = 0; i < selectedShip.size; i++) {
        if (isHorizontal) {
          coordinates.push([row, col + i]);
        } else {
          coordinates.push([row + i, col]);
        }
      }
      setPreviewCells(coordinates);
    }
  };

  const handleRandomPlacement = () => {
    game.playerBoard.placeRandomShips();
    const ships = game.playerBoard.ships.map(ship => ({
      shipType: ship.type,
      startRow: ship.startRow,
      startCol: ship.startCol,
      isHorizontal: ship.isHorizontal
    }));
    setPlacedShips(ships);
    game.setupPlayerShips(ships);
    setGameState('playing');
    showMessage('Ships placed randomly!', 'success');
  };

  const handleReset = () => {
    game.reset();
    game.setupComputerShips();
    setGameState('setup');
    setSelectedShip(ALL_SHIPS[0]);
    setPlacedShips([]);
    setPreviewCells([]);
    showMessage('Game reset!', 'info');
  };

  const handlePlayAgain = () => {
    handleReset();
  };

  const unplacedShips = ALL_SHIPS.filter(ship => !placedShips.some(p => p.shipType.name === ship.name));

  return (
    <div className="app">
      <h1>Battleship</h1>
      
      {message && (
        <div className={`status ${messageType}`}>
          {message}
        </div>
      )}

      {gameState === 'setup' && (
        <ShipPlacement
          ships={unplacedShips}
          selectedShip={selectedShip}
          onShipSelect={handleShipSelect}
          isHorizontal={isHorizontal}
          onOrientationToggle={handleOrientationToggle}
          onRandomPlacement={handleRandomPlacement}
          placedShips={placedShips}
          totalShips={ALL_SHIPS.length}
        />
      )}

      <div className="board-container">
        <div className="board-section">
          <h2>Your Board</h2>
          <GameBoard
            board={game.playerBoard}
            onCellClick={handleCellClick}
            onCellHover={handleCellHover}
            previewCells={previewCells}
            selectedShip={selectedShip}
            isHorizontal={isHorizontal}
            showShips={true}
            gameState={gameState}
          />
          <Graveyard title="Your Ship Graveyard" ships={game.playerBoard.ships} />
          <ShotHistory title="Computer's Shots" shots={game.shotHistory.computer} />
        </div>

        <div className="board-section">
          <h2>Computer's Board</h2>
          <GameBoard
            board={game.computerBoard}
            onCellClick={handleCellClick}
            showShips={false}
            gameState={gameState}
          />
          <Graveyard title="Computer's Ship Graveyard" ships={game.computerBoard.ships} />
          <ShotHistory title="Your Shots" shots={game.shotHistory.player} />
        </div>
      </div>

      {gameState === 'gameover' && (
        <GameOverScreen
          isWinner={game.getWinner() === 'player'}
          onPlayAgain={handlePlayAgain}
        />
      )}

      {gameState !== 'gameover' && (
        <div className="controls">
          <button onClick={handleReset} className="secondary">Reset Game</button>
        </div>
      )}
    </div>
  );
}

function ShotHistory({ title, shots }) {
  return (
    <div className="shot-history">
      <h4>{title}</h4>
      <ul>
        {shots.slice(-10).map((shot, index) => (
          <li key={index}>
            ({shot.row}, {shot.col}) - {shot.hit ? 'Hit' : 'Miss'}
            {shot.sunk && ' - Sunk!'}
          </li>
        ))}
        {shots.length === 0 && <li>No shots yet</li>}
      </ul>
    </div>
  );
}

export default App;
