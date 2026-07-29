import React from 'react';

function ShipPlacement({ ships, selectedShip, onShipSelect, isHorizontal, onOrientationToggle, onRandomPlacement, placedShips, totalShips }) {
  return (
    <div className="ship-placement">
      <h3>Place Your Ships</h3>
      <div className="ship-selector">
        {ships.map((ship) => (
          <button
            key={ship.name}
            className={`ship-button ${selectedShip?.name === ship.name ? 'selected' : ''}`}
            onClick={() => onShipSelect(ship)}
          >
            {ship.name} ({ship.size})
          </button>
        ))}
      </div>
      
      {selectedShip && (
        <div className="orientation-toggle">
          <label>Orientation:</label>
          <button onClick={onOrientationToggle} className="secondary">
            {isHorizontal ? 'Horizontal' : 'Vertical'}
          </button>
        </div>
      )}

      <div className="controls">
        <button onClick={onRandomPlacement} className="secondary">
          Random Placement
        </button>
      </div>

      <p>Placed: {placedShips.length} / {totalShips}</p>
    </div>
  );
}

export default ShipPlacement;
