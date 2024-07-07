const PLAYFILED_COLUMNS = 10;
const PLAYFILED_ROWS = 20;
let playfield;
let cells;
let isPaused = false;
let timedId;
let isGameOver = false;
let overlay = document.querySelector('.overlay');
let scoreElement = document.querySelector('.score');
let btnRestart = document.querySelector('.btn-restart');
let timeElement = document.querySelector('.time');
let finalScoreElement = document.querySelector('.final-score');
let finalTimeElement = document.querySelector('.final-time');
let finalLevelElement = document.querySelector('.final-level')
let score = 0;
let btnRestartPerm = document.querySelector('.btn-restart-permanent');
let gameStartTime;
let gameTimeInterval;

const TETROMINO_NAMES = [
    'O',
    'L',
    'J',
    'S',
    'Z',
    'I',
    'T'
];

const TETROMINOES = {
    'O': [
        [1, 1],
        [1, 1]
    ],
    'L': [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0]
    ],
    'J': [
        [0, 1, 1],
        [0, 1, 0],
        [0, 1, 0]
    ],
    'S': [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0]
    ],
    'Z': [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0]
    ],
    'I': [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
    ],
    'T': [
        [1, 1, 1],
        [0, 1, 0],
        [0, 0, 0]
    ],
};
const tetrominoColors = {
    'O': 'red',
    'L': 'green',
    'J': 'purple',
    'T': 'blue',
    'I': 'yellow',
    'S': 'aqua',
    'Z': 'brown'
};

let tetromino = {
    name: '',
    matrix: [],
    column: 0,
    row: 0
};

let nextTetromino = {
    name: '',
    matrix: []
};

let nextTetrominoGrid = document.querySelector('.next-tetromino-grid');

let level = 1;
let dropInterval = 1000;
let linesCleared = 0;

// COMMON

function init() {
    clearInterval(gameTimeInterval);
    score = 0;
    scoreElement.innerHTML = 0;
    level = 1;
    linesCleared = 0;
    updateLevelDisplay();
    isGameOver = false;
    generatePlayfield();
    cells = document.querySelectorAll('.tetris div');

    generateNextTetromino();
    generateTetromino();

    gameStartTime = Date.now();
    updateGameTime();
    gameTimeInterval = setInterval(updateGameTime, 1000);

    moveDown();
}

function updateGameTime() {
    const elapsedTime = Math.floor((Date.now() - gameStartTime) / 1000);
    timeElement.innerHTML = elapsedTime;
}

function convertPositionToIndex(row, col) {
    return row * PLAYFILED_COLUMNS + col;
}

function randomFigure(array) {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
}

// GENERATION
function generateTetromino() {
    tetromino.name = nextTetromino.name;
    tetromino.matrix = nextTetromino.matrix;
    tetromino.column = Math.floor(PLAYFILED_COLUMNS / 2 - tetromino.matrix.length / 2);
    tetromino.row = -2;

    generateNextTetromino();
}

function generateNextTetromino() {
    nextTetromino.name = randomFigure(TETROMINO_NAMES);
    nextTetromino.matrix = TETROMINOES[nextTetromino.name];
    updateNextTetrominoGrid();
}

function updateNextTetrominoGrid() {
    nextTetrominoGrid.innerHTML = '';
    const matrixNext = nextTetromino.matrix;

    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            const div = document.createElement('div');
            div.style.backgroundColor = matrixNext[row]?.[col] ? tetrominoColors[nextTetromino.name] : '#444';
            nextTetrominoGrid.appendChild(div);
        }
    }
}

function generatePlayfield() {
    for (let i = 0; i < PLAYFILED_COLUMNS * PLAYFILED_ROWS; i++) {
        const div = document.createElement('div');
        document.querySelector('.tetris').append(div);
    }

    playfield = new Array(PLAYFILED_ROWS).fill()
        .map(() => new Array(PLAYFILED_COLUMNS).fill(0));
}

// KEYBOARDS & CLICKS

btnRestart.addEventListener('click', function () {
    document.querySelector('.tetris').innerHTML = '';
    overlay.style.display = 'none';

    init();
});

btnRestartPerm.addEventListener('click', function () {
    document.querySelector('.tetris').innerHTML = '';
    overlay.style.display = 'none';

    init();
});

document.addEventListener('keydown', onKeyDown);

document.querySelectorAll('.btn-control').forEach(button => {
    button.addEventListener('click', function () {
        const action = this.getAttribute('data-action');
        handleControlAction(action);
    });
});

function handleControlAction(action) {
    if (action == 'paused') {
        togglePaused();
    }
    if (!isPaused) {
        if (action === 'left') {
        moveTetrominoLeft();
        } else if (action === 'rotate') {
        rotate();
        } else if (action === 'down') {
        moveTetrominoDown();
        } else if (action === 'right') {
        moveTetrominoRight();
        } else if (action === 'drop') {
        dropTetrominoDown();
        }
    }
    draw();
    
}
function onKeyDown(event) {
    if (event.key == 'Escape') {
        togglePaused();
    }
    if (!isPaused) {
        if (event.key == ' ') {
            dropTetrominoDown();
        }
        if (event.key == 'ArrowUp') {
            rotate();
        }
        if (event.key == 'ArrowLeft') {
            moveTetrominoLeft();
        }
        if (event.key == 'ArrowRight') {
            moveTetrominoRight();
        }
        if (event.key == 'ArrowDown') {
            moveTetrominoDown();
        }
    }
    draw();
}

function moveTetrominoDown() {
    tetromino.row += 1;
    if (!isValid()) {
        tetromino.row -= 1;
        placeTetromino();
    }
}

function moveTetrominoLeft() {
    tetromino.column -= 1;
    if (!isValid()) {
        tetromino.column += 1;
    }
}

function moveTetrominoRight() {
    tetromino.column += 1;
    if (!isValid()) {
        tetromino.column -= 1;
    }
}

function draw() {
    cells.forEach(el => el.removeAttribute('class'));
    drawPlayfield();
    drawTetromino();
}

function dropTetrominoDown() {
    while (isValid()) {
        tetromino.row++;
    }
    tetromino.row--;
}

function togglePaused() {
    if (isPaused) {
        startLoop();
    } else {
        stopLoop();
    }

    isPaused = !isPaused;
}

function rotate() {
    rotateTetromino();
    draw();
}

function rotateTetromino() {
    const oldMatrix = tetromino.matrix;
    const rotatedMatrix = rotateMatrix(tetromino.matrix);
    tetromino.matrix = rotatedMatrix;
    if (!isValid()) {
        tetromino.matrix = oldMatrix;
    }
}

function rotateMatrix(matrixTetromino) {
    const N = matrixTetromino.length;
    const rotateMatrix = [];

    for (let i = 0; i < N; i++) {
        rotateMatrix[i] = [];
        for (let j = 0; j < N; j++) {
            rotateMatrix[i][j] = matrixTetromino[N - j - 1][i];
        }
    }

    return rotateMatrix;
}

function isValid() {
    const matrixSize = tetromino.matrix.length;
    for (let row = 0; row < matrixSize; row++) {
        for (let column = 0; column < matrixSize; column++) {
            if (isOutsideOfGameboard(row, column)) { return false; }
            if (hasCollisions(row, column)) { return false; }
        }
    }
    return true;
}

function isOutsideOfTopGameboard(row) {
    return tetromino.row + row < 0;
}

function isOutsideOfGameboard(row, column) {
    return tetromino.matrix[row][column] &&
        (tetromino.row + row >= PLAYFILED_ROWS ||
            tetromino.column + column < 0 ||
            tetromino.column + column >= PLAYFILED_COLUMNS);
}

function hasCollisions(row, column) {
    return tetromino.matrix[row][column] && playfield[tetromino.row + row]?.[tetromino.column + column];
}

function drawTetromino() {
    const name = tetromino.name;
    const tetrominoMatrixSize = tetromino.matrix.length;

    for (let row = 0; row < tetrominoMatrixSize; row++) {
        for (let column = 0; column < tetrominoMatrixSize; column++) {
            if (isOutsideOfTopGameboard(row)) { continue; }
            if (!tetromino.matrix[row][column]) { continue; }
            const cellIndex = convertPositionToIndex(tetromino.row + row, tetromino.column + column);
            cells[cellIndex].classList.add(name);
        }
    }
}

function drawPlayfield() {
    for (let row = 0; row < PLAYFILED_ROWS; row++) {
        for (let column = 0; column < PLAYFILED_COLUMNS; column++) {
            if (!playfield[row][column]) continue;
            const nameFigure = playfield[row][column];
            const cellIndex = convertPositionToIndex(row, column);
            cells[cellIndex].classList.add(nameFigure);
        }
    }
}

function countScore(destroyRows) {
    if (destroyRows == 1) {
        score += 10;
    }
    if (destroyRows == 2) {
        score += 20;
    }
    if (destroyRows == 3) {
        score += 50;
    }
    if (destroyRows == 4) {
        score += 100;
    }

    scoreElement.innerHTML = score;
}

function placeTetromino() {
    const tetrominoMatrixSize = tetromino.matrix.length;
    for (let row = 0; row < tetrominoMatrixSize; row++) {
        for (let column = 0; column < tetrominoMatrixSize; column++) {
            if (isOutsideOfTopGameboard(row)) {
                isGameOver = true;
                clearInterval(gameTimeInterval);
                overlay.style.display = 'flex';
                finalScoreElement.innerHTML = score;
                finalTimeElement.innerHTML = timeElement.innerHTML;
                finalLevelElement.innerHTML = level;
                return;
            }
            if (tetromino.matrix[row][column]) {
                playfield[tetromino.row + row][tetromino.column + column] = tetromino.name;
            }
        }
    }
    let filledRows = findFilledRows();
    removeFillRow(filledRows);
    countScore(filledRows.length);
    updateLevel(filledRows.length);
    generateTetromino();
}

function findFilledRows() {
    const fillRows = [];

    for (let row = 0; row < PLAYFILED_ROWS; row++) {
        let filledColumns = 0;
        for (let column = 0; column < PLAYFILED_COLUMNS; column++) {
            if (playfield[row][column] != 0) {
                filledColumns++;
            }
        }
        if (PLAYFILED_COLUMNS == filledColumns) {
            fillRows.push(row);
        }
    }
    return fillRows;
}

function removeFillRow(filledRows) {
    for (let i = 0; i < filledRows.length; i++) {
        const row = filledRows[i];
        dropRowsAbove(row);
    }
}

function dropRowsAbove(rowDelete) {
    for (let row = rowDelete; row > 0; row--) {
        playfield[row] = playfield[row - 1];
    }
    playfield[0] = new Array(PLAYFILED_COLUMNS).fill(0);
}

function moveDown() {
    moveTetrominoDown();
    draw();
    stopLoop();
    startLoop();
}

function startLoop() {
    timedId = setTimeout(() => requestAnimationFrame(moveDown), dropInterval);
}

function stopLoop() {
    clearTimeout(timedId);
    timedId = null;
}
function updateLevel(clearedLines) {
    linesCleared += clearedLines;
    const newLevel = Math.floor(linesCleared / 2) + 1;
    if (newLevel > level) {
        level = newLevel;
        dropInterval = Math.max(100, dropInterval - 100); 
        document.querySelector('.level-value').innerHTML = level;
    }
}
function updateLevelDisplay() {
    document.querySelector('.level-value').innerHTML = level; 
}

init();
