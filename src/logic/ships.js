// Ship types and their sizes
export const SHIP_TYPES = {
  CARRIER: { name: 'Carrier', size: 5 },
  BATTLESHIP: { name: 'Battleship', size: 4 },
  CRUISER: { name: 'Cruiser', size: 3 },
  SUBMARINE: { name: 'Submarine', size: 3 },
  DESTROYER: { name: 'Destroyer', size: 2 },
};

export const ALL_SHIPS = Object.values(SHIP_TYPES);

export class Ship {
  constructor(type, startRow, startCol, isHorizontal) {
    this.type = type;
    this.name = type.name;
    this.size = type.size;
    this.startRow = startRow;
    this.startCol = startCol;
    this.isHorizontal = isHorizontal;
    this.hits = new Array(this.size).fill(false);
  }

  getCoordinates() {
    const coordinates = [];
    for (let i = 0; i < this.size; i++) {
      if (this.isHorizontal) {
        coordinates.push([this.startRow, this.startCol + i]);
      } else {
        coordinates.push([this.startRow + i, this.startCol]);
      }
    }
    return coordinates;
  }

  hit(positionIndex) {
    if (positionIndex >= 0 && positionIndex < this.size) {
      this.hits[positionIndex] = true;
      return true;
    }
    return false;
  }

  isSunk() {
    return this.hits.every(hit => hit);
  }

  getHitCount() {
    return this.hits.filter(hit => hit).length;
  }
}
