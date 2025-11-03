let board = null;
let game = new Chess();
let stockfish = STOCKFISH();
let aiLevel = 10;

const levelInput = document.getElementById('level');
const levelValue = document.getElementById('levelValue');

levelInput.addEventListener('input', () => {
    aiLevel = levelInput.value;
    levelValue.textContent = aiLevel;
});

function onDragStart(source, piece, position, orientation) {
    if (game.game_over()) return false;
    if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
        (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
        return false;
    }
}

function makeAIMove() {
    stockfish.postMessage(`position fen ${game.fen()}`);
    stockfish.postMessage(`go depth ${aiLevel}`);
}

function onDrop(source, target) {
    const move = game.move({ from: source, to: target, promotion: 'q' });
    if (move === null) return 'snapback';
    setTimeout(makeAIMove, 200);
}

function onSnapEnd() {
    board.position(game.fen());
}

// Initialize chessboard
board = Chessboard('board', {
    draggable: true,
    position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd
});

// Reset button
document.getElementById('resetBtn').addEventListener('click', () => {
    game.reset();
    board.start();
});

// Stockfish message handler
stockfish.onmessage = function(event) {
    const line = event.data || event;
    if (line.includes('bestmove')) {
        const move = line.split(' ')[1];
        game.move({ from: move.slice(0, 2), to: move.slice(2, 4), promotion: 'q' });
        board.position(game.fen());
    }
};
