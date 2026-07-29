import React from 'react';

const CLUBS_BY_SIZE = {
  5: { label: 'Driver', head: 'driver' },
  4: { label: '3 Wood', head: 'wood' },
  3: { label: 'Iron', head: 'iron' },
  2: { label: 'Putter', head: 'putter' }
};

const HEAD_SHAPES = {
  driver: <ellipse cx="14" cy="40" rx="9" ry="6" />,
  wood: <ellipse cx="14" cy="40" rx="7" ry="5" />,
  iron: <polygon points="7,44 19,44 17,34 9,36" />,
  putter: <rect x="6" y="37" width="14" height="5" rx="1" />
};

function GolfClubIcon({ head }) {
  return (
    <svg className="club-icon" viewBox="0 0 32 48" role="img" aria-hidden="true">
      <line x1="22" y1="4" x2="16" y2="38" stroke="#6b7280" strokeWidth="3" strokeLinecap="round" />
      <line x1="22" y1="4" x2="20" y2="14" stroke="#111827" strokeWidth="5" strokeLinecap="round" />
      <g fill="#9ca3af" stroke="#4b5563" strokeWidth="1">
        {HEAD_SHAPES[head]}
      </g>
    </svg>
  );
}

function Graveyard({ title, ships }) {
  const sunkShips = ships.filter(ship => ship.isSunk());

  return (
    <div className="graveyard">
      <h4>{title}</h4>
      {sunkShips.length === 0 ? (
        <p className="graveyard-empty">No ships sunk yet</p>
      ) : (
        <ul className="graveyard-list">
          {sunkShips.map((ship, index) => {
            const club = CLUBS_BY_SIZE[ship.size];
            return (
              <li key={`${ship.name}-${index}`} className="graveyard-item" title={`${ship.name} (${ship.size}) - ${club.label}`}>
                <GolfClubIcon head={club.head} />
                <span className="club-label">{club.label}</span>
                <span className="ship-label">{ship.name}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default Graveyard;
