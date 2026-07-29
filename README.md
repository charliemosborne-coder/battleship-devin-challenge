# Battleship Game

A fully playable two-player Battleship game with a web UI, built with React and featuring a computer opponent with hunt-target AI.

## Features

- **Standard 10x10 grid** per player
- **Complete ship set**: Carrier (5), Battleship (4), Cruiser (3), Submarine (3), Destroyer (2)
- **Manual ship placement** with drag-and-drop style preview
- **Random ship placement** option for quick setup
- **Placement validation**: No overlapping ships, no out-of-bounds, no adjacency violations
- **Turn-based gameplay** with hit/miss/sink detection
- **Shot history tracking** for both players
- **Smart AI opponent** with hunt-target mode (prioritizes adjacent cells after hits)
- **Clean game-over state** with replay option
- **Responsive web UI** built with React

## Architecture

The project follows a clean separation of concerns:

```
battleship-game/
├── src/
│   ├── logic/           # Core game logic (independent of UI)
│   │   ├── ships.js     # Ship class and ship type definitions
│   │   ├── board.js     # Board class with placement and shot logic
│   │   ├── game.js      # Game class managing overall game state
│   │   └── ai-opponent.js # AI opponent with hunt-target strategy
│   ├── components/      # React UI components
│   │   ├── App.jsx      # Main application component
│   │   ├── GameBoard.jsx # Board display component
│   │   ├── ShipPlacement.jsx # Ship placement UI
│   │   └── App.css      # Component-specific styles
│   ├── main.jsx         # React entry point
│   └── index.css        # Global styles
├── tests/               # Unit tests for core logic
│   ├── ships.test.js
│   ├── board.test.js
│   └── ai-opponent.test.js
├── public/
│   └── index.html       # HTML template
└── BUGS.md              # Documentation of real bugs encountered
```

### Key Design Decisions

- **Logic-UI separation**: All game logic is in `src/logic/` and has no dependencies on React. This makes the logic easily testable and reusable.
- **Adjacency rule**: Ships cannot touch each other (including diagonally). This is the standard rule used in most implementations.
- **AI strategy**: The AI uses a hunt-target mode. It randomly shoots until it hits, then prioritizes adjacent cells to sink the ship before returning to hunting.
- **Web UI choice**: A web UI was chosen over terminal output for better user experience and visual feedback of game state.

## How to Run

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd battleship-game
```

2. Install dependencies:
```bash
npm install
```

### Running the Game

Start the development server:
```bash
npm start
```

Open your browser to `http://localhost:5173` (or the URL shown in the terminal).

### Running Tests

Run the unit tests:
```bash
npm test
```

### Building for Production

Create an optimized production build:
```bash
npm run build
```

## How to Play

1. **Setup Phase**: Place your ships on the board
   - Click a ship button to select it
   - Toggle orientation (horizontal/vertical)
   - Click on the board to place the ship
   - Or click "Random Placement" for automatic setup
   - Place all 5 ships to start the game

2. **Gameplay**: Take turns shooting
   - Click on the Computer's Board to fire
   - Hits are marked with X, misses with O
   - Sunk ships are marked in red
   - The computer will automatically take its turn after you

3. **Win Condition**: Sink all of the computer's ships before it sinks yours

4. **Game Over**: See the result and click "Play Again" to restart

## Known Limitations

- No multiplayer over network (single-player vs AI only)
- No persistent storage (game state resets on refresh)
- No sound effects or animations
- AI is relatively simple (hunt-target mode only, no probability-based targeting)
- No ship rotation during placement (must toggle before clicking)

## Testing

The project includes comprehensive unit tests for core game logic:

- **Ship tests**: Coordinate calculation, hit detection, sink detection
- **Board tests**: Placement validation, shot handling, win condition
- **AI tests**: Mode switching, shot generation, adjacency handling

Run tests with `npm test`. The test suite uses Jest with jsdom environment.

## Bug Log

Real bugs encountered during development are documented in [BUGS.md](BUGS.md). This includes:
- Adjacency check preventing same ship placement
- AI target mode infinite loop
- Ship hit position index calculation error
- React async import syntax error

## License

MIT
