import React, { useMemo } from 'react';

const CONFETTI_COUNT = 80;
const CONFETTI_COLORS = ['#ffffff', '#ffe066', '#ff6b6b', '#4dabf7', '#f783ac', '#ffd43b'];

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: CONFETTI_COUNT }, () => ({
        left: `${Math.random() * 100}%`,
        background: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        animationDelay: `${Math.random() * 1.5}s`,
        animationDuration: `${2.5 + Math.random() * 2}s`
      })),
    []
  );

  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((style, index) => (
        <span key={index} className="confetti-piece" style={style} />
      ))}
    </div>
  );
}

function GameOverScreen({ isWinner, onPlayAgain }) {
  return (
    <div className={`game-over-screen ${isWinner ? 'winner' : 'loser'}`}>
      {isWinner && <Confetti />}
      <div className="game-over-content">
        {isWinner ? (
          <h2>Congrats!! You Won the Hole!!</h2>
        ) : (
          <>
            <h2>You Lost the Hole</h2>
            <p className="game-over-subtitle">(You&apos;ll get &apos;em next time!)</p>
          </>
        )}
        <button onClick={onPlayAgain}>Play Again</button>
      </div>
    </div>
  );
}

export default GameOverScreen;
