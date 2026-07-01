/* ============================================================
   RESPONSIVE CANVAS
   ============================================================ */
function resizeGame() {
    const wrapper = document.querySelector(".canvas-wrapper");
    const canvas = document.getElementById("game");

    const ratio = 700 / 500;
    const width = wrapper.clientWidth;
    const height = width / ratio;

    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
}

window.addEventListener("resize", resizeGame);
window.addEventListener("orientationchange", resizeGame);
window.addEventListener("load", resizeGame);

/* ============================================================
   CANVAS
   ============================================================ */
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

/* ============================================================
   CONSTANTES
   ============================================================ */
const COLS = 7;
const ROWS = 6;
const CELL_SIZE = 60;

const GRID_WIDTH = COLS * CELL_SIZE;
const GRID_HEIGHT = ROWS * CELL_SIZE;

const GRID_OFFSET_X = (canvas.width - GRID_WIDTH) / 2;
const GRID_OFFSET_Y = (canvas.height - GRID_HEIGHT) / 2;

const EMPTY = 0;
const P1 = 1;
const P2 = 2;

/* ============================================================
   ETAT DU JEU
   ============================================================ */
let grid = [];
let currentPlayer = P1;
let selectedCol = 3;
let gameOver = false;

let difficulty = "intermediaire"; // valeur par défaut
let iaEnabled = true;

const statusDisplay = document.getElementById("status");
const difficultySelect = document.getElementById("difficulty");

/* ============================================================
   STATS LOCALES
   ============================================================ */
const Stats = {
    load() {
        return JSON.parse(localStorage.getItem("p4_stats") || "{}");
    },
    save(data) {
        localStorage.setItem("p4_stats", JSON.stringify(data));
    },
    addWin(player) {
        const data = this.load();
        if (!data.p1Wins) data.p1Wins = 0;
        if (!data.p2Wins) data.p2Wins = 0;

        if (player === P1) data.p1Wins++;
        if (player === P2) data.p2Wins++;

        this.save(data);
    },
    render() {
        const div = document.getElementById("highscores");
        const data = this.load();
        div.innerHTML =
            "<h3>Stats locales</h3>" +
            `<div>Joueur 1 : ${data.p1Wins || 0} victoire(s)</div>` +
            `<div>Joueur 2 : ${data.p2Wins || 0} victoire(s)</div>`;
    }
};

Stats.render();

/* ============================================================
   INITIALISATION
   ============================================================ */
function initGrid() {
    grid = [];
    for (let r = 0; r < ROWS; r++) {
        grid.push(new Array(COLS).fill(EMPTY));
    }
}

initGrid();
updateStatus();

/* ============================================================
   LOGIQUE DE JEU
   ============================================================ */
function dropPiece(col) {
    if (gameOver) return;

    for (let r = ROWS - 1; r >= 0; r--) {
        if (grid[r][col] === EMPTY) {
            grid[r][col] = currentPlayer;

            if (checkWin(r, col, currentPlayer)) {
                endGame(currentPlayer);
            } else if (isBoardFull()) {
                endGame(EMPTY);
            } else {
                currentPlayer = currentPlayer === P1 ? P2 : P1;
                updateStatus();

                if (iaEnabled && currentPlayer === P2 && !gameOver) {
                    setTimeout(() => iaPlay(), 300);
                }
            }
            return;
        }
    }
}

function isBoardFull() {
    return grid[0].every(cell => cell !== EMPTY);
}

function updateStatus() {
    if (gameOver) return;
    statusDisplay.textContent =
        "Tour : " + (currentPlayer === P1 ? "Joueur 1" : "IA (" + difficulty + ")");
}

/* ============================================================
   SÉLECTEUR DE DIFFICULTÉ
   ============================================================ */
difficultySelect.addEventListener("change", () => {
    difficulty = difficultySelect.value;
    resetGame();
});

/* ============================================================
   IA — DISPATCH SELON DIFFICULTÉ
   ============================================================ */
function iaPlay() {
    if (difficulty === "debutant") return iaPlayEasy();
    if (difficulty === "intermediaire") return iaPlayMedium();
    if (difficulty === "expert") return iaPlayStrong();
}

/* ============================================================
   IA DÉBUTANT — Aléatoire améliorée
   ============================================================ */
function iaPlayEasy() {
    const playable = [];
    for (let col = 0; col < COLS; col++) {
        if (columnPlayable(col)) playable.push(col);
    }
    const col = playable[Math.floor(Math.random() * playable.length)];
    dropPiece(col);
}

/* ============================================================
   IA INTERMÉDIAIRE — Bloque / gagne / coups sûrs
   ============================================================ */
function iaPlayMedium() {
    const winMove = findWinningMove(P2);
    if (winMove !== null) return dropPiece(winMove);

    const blockMove = findWinningMove(P1);
    if (blockMove !== null) return dropPiece(blockMove);

    const goodMove = findGoodMove();
    if (goodMove !== null) return dropPiece(goodMove);

    const preferred = [3, 2, 4, 1, 5, 0, 6];
    for (let col of preferred) {
        if (columnPlayable(col)) return dropPiece(col);
    }
}

function findGoodMove() {
    const preferred = [3, 2, 4, 1, 5, 0, 6];

    for (let col of preferred) {
        if (!columnPlayable(col)) continue;

        const row = getDropRow(col);
        if (row === null) continue;

        grid[row][col] = P2;
        const threat = findWinningMove(P2);
        grid[row][col] = EMPTY;

        if (threat !== null) return col;

        grid[row][col] = P2;
        const danger = findWinningMove(P1);
        grid[row][col] = EMPTY;

        if (danger === null) return col;
    }

    return null;
}

/* ============================================================
   IA EXPERT — Heuristique forte
   ============================================================ */
function iaPlayStrong() {
    const winMove = findWinningMove(P2);
    if (winMove !== null) return dropPiece(winMove);

    const blockMove = findWinningMove(P1);
    if (blockMove !== null) return dropPiece(blockMove);

    const best = findBestHeuristicMove();
    if (best !== null) return dropPiece(best);

    const preferred = [3, 2, 4, 1, 5, 0, 6];
    for (let col of preferred) {
        if (columnPlayable(col)) return dropPiece(col);
    }
}

function findBestHeuristicMove() {
    let bestScore = -Infinity;
    let bestCol = null;

    for (let col = 0; col < COLS; col++) {
        if (!columnPlayable(col)) continue;

        const row = getDropRow(col);
        if (row === null) continue;

        grid[row][col] = P2;
        const score = evaluateBoard(P2) - evaluateBoard(P1);
        grid[row][col] = EMPTY;

        const centerBonus = (col === 3) ? 2 : 0;
        const finalScore = score + centerBonus;

        if (finalScore > bestScore) {
            bestScore = finalScore;
            bestCol = col;
        }
    }

    return bestCol;
}

function evaluateBoard(player) {
    let score = 0;

    for (let r = 0; r < ROWS; r++)
        for (let c = 0; c < COLS - 3; c++)
            score += evaluateWindow(r, c, 0, 1, player);

    for (let c = 0; c < COLS; c++)
        for (let r = 0; r < ROWS - 3; r++)
            score += evaluateWindow(r, c, 1, 0, player);

    for (let r = 3; r < ROWS; r++)
        for (let c = 0; c < COLS - 3; c++)
            score += evaluateWindow(r, c, -1, 1, player);

    for (let r = 0; r < ROWS - 3; r++)
        for (let c = 0; c < COLS - 3; c++)
            score += evaluateWindow(r, c, 1, 1, player);

    return score;
}

function evaluateWindow(r, c, dr, dc, player) {
    let countPlayer = 0;
    let countEmpty = 0;
    let countOpponent = 0;
    const opponent = (player === P1) ? P2 : P1;

    for (let i = 0; i < 4; i++) {
        const rr = r + dr * i;
        const cc = c + dc * i;
        const cell = grid[rr][cc];

        if (cell === player) countPlayer++;
        else if (cell === EMPTY) countEmpty++;
        else if (cell === opponent) countOpponent++;
    }

    let score = 0;

    if (countPlayer === 4) score += 1000;
    else if (countPlayer === 3 && countEmpty === 1) score += 50;
    else if (countPlayer === 2 && countEmpty === 2) score += 10;

    if (countOpponent === 3 && countEmpty === 1) score -= 40;

    return score;
}

/* ============================================================
   UTILITAIRES
   ============================================================ */
function columnPlayable(col) {
    return grid[0][col] === EMPTY;
}

function findWinningMove(player) {
    for (let col = 0; col < COLS; col++) {
        if (!columnPlayable(col)) continue;

        const row = getDropRow(col);
        if (row === null) continue;

        grid[row][col] = player;
        const win = checkWin(row, col, player);
        grid[row][col] = EMPTY;

        if (win) return col;
    }
    return null;
}

function getDropRow(col) {
    for (let r = ROWS - 1; r >= 0; r--) {
        if (grid[r][col] === EMPTY) return r;
    }
    return null;
}

/* ============================================================
   VICTOIRE
   ============================================================ */
function checkWin(row, col, player) {
    return (
        count(row, col, 1, 0, player) + count(row, col, -1, 0, player) > 2 ||
        count(row, col, 0, 1, player) + count(row, col, 0, -1, player) > 2 ||
        count(row, col, 1, 1, player) + count(row, col, -1, -1, player) > 2 ||
        count(row, col, 1, -1, player) + count(row, col, -1, 1, player) > 2
    );
}

function count(row, col, dr, dc, player) {
    let n = 0;
    let r = row + dr;
    let c = col + dc;

    while (r >= 0 && r < ROWS && c >= 0 && c < COLS && grid[r][c] === player) {
        n++;
        r += dr;
        c += dc;
    }
    return n;
}

/* ============================================================
   FIN DE PARTIE
   ============================================================ */
function endGame(winner) {
    gameOver = true;

    if (winner === EMPTY) {
        statusDisplay.textContent = "Match nul";
    } else {
        statusDisplay.textContent =
            "Victoire : " + (winner === P1 ? "Joueur 1" : "IA (" + difficulty + ")");
        Stats.addWin(winner);
        Stats.render();
    }

    setTimeout(() => {
        if (confirm("Rejouer ?")) resetGame();
    }, 300);
}

function resetGame() {
    initGrid();
    currentPlayer = P1;
    selectedCol = 3;
    gameOver = false;
    updateStatus();
}

/* ============================================================
   DESSIN
   ============================================================ */
function draw() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawGridBackground();
    drawPieces();
    drawSelector();

    requestAnimationFrame(draw);
}

function drawGridBackground() {
    ctx.fillStyle = "#004080";
    ctx.fillRect(GRID_OFFSET_X, GRID_OFFSET_Y, GRID_WIDTH, GRID_HEIGHT);

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const x = GRID_OFFSET_X + c * CELL_SIZE + CELL_SIZE / 2;
            const y = GRID_OFFSET_Y + r * CELL_SIZE + CELL_SIZE / 2;

            ctx.fillStyle = "black";
            ctx.beginPath();
            ctx.arc(x, y, CELL_SIZE * 0.35, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

function drawPieces() {
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const cell = grid[r][c];
            if (cell === EMPTY) continue;

            const x = GRID_OFFSET_X + c * CELL_SIZE + CELL_SIZE / 2;
            const y = GRID_OFFSET_Y + r * CELL_SIZE + CELL_SIZE / 2;

            ctx.fillStyle = cell === P1 ? "#ff4444" : "#ffff44";

            ctx.beginPath();
            ctx.arc(x, y, CELL_SIZE * 0.35, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = "rgba(0,0,0,0.5)";
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }
}

function drawSelector() {
    if (gameOver) return;

    const x = GRID_OFFSET_X + selectedCol * CELL_SIZE + CELL_SIZE / 2;
    const y = GRID_OFFSET_Y - 20;

    ctx.fillStyle = currentPlayer === P1 ? "#ff4444" : "#ffff44";
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 12, y - 18);
    ctx.lineTo(x + 12, y - 18);
    ctx.closePath();
    ctx.fill();
}

/* ============================================================
   CONTROLES
   ============================================================ */
function moveSelector(dir) {
    selectedCol += dir;
    if (selectedCol < 0) selectedCol = 0;
    if (selectedCol > COLS - 1) selectedCol = COLS - 1;
}

document.getElementById("left").addEventListener("touchstart", () => moveSelector(-1));
document.getElementById("right").addEventListener("touchstart", () => moveSelector(1));
document.getElementById("drop").addEventListener("touchstart", () => dropPiece(selectedCol));

window.addEventListener("keydown", (e) => {
    if (gameOver) return;
    if (e.key === "ArrowLeft") moveSelector(-1);
    if (e.key === "ArrowRight") moveSelector(1);
    if (e.key === "ArrowDown" || e.key === " ") dropPiece(selectedCol);
});

/* ============================================================
   BOUCLE
   ============================================================ */
resizeGame();
requestAnimationFrame(draw);
