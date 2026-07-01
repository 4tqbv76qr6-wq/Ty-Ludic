/* ============================================================
   CANVAS
   ============================================================ */
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

/* ============================================================
   CONSTANTES
   ============================================================ */
const SIZE = 3;
const CELL = 120;

const GRID_OFFSET_X = (canvas.width - CELL * SIZE) / 2;
const GRID_OFFSET_Y = (canvas.height - CELL * SIZE) / 2;

const EMPTY = 0;
const P1 = 1; // X
const P2 = 2; // O

/* ============================================================
   ETAT DU JEU
   ============================================================ */
let board = [
    [0,0,0],
    [0,0,0],
    [0,0,0]
];

let currentPlayer = P1;
let gameOver = false;

let difficulty = "intermediaire";
const difficultySelect = document.getElementById("difficulty");
const statusDisplay = document.getElementById("status");

/* ============================================================
   DIFFICULTÉ
   ============================================================ */
difficultySelect.addEventListener("change", () => {
    difficulty = difficultySelect.value;
    resetGame();
});

/* ============================================================
   DESSIN
   ============================================================ */
function draw() {
    ctx.fillStyle = "black";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    drawGrid();
    drawMarks();

    requestAnimationFrame(draw);
}

function drawGrid() {
    ctx.strokeStyle = "#0af";
    ctx.lineWidth = 6;
    ctx.shadowColor = "#0af";
    ctx.shadowBlur = 10;

    for (let i = 1; i < SIZE; i++) {
        // vertical
        ctx.beginPath();
        ctx.moveTo(GRID_OFFSET_X + i * CELL, GRID_OFFSET_Y);
        ctx.lineTo(GRID_OFFSET_X + i * CELL, GRID_OFFSET_Y + CELL * SIZE);
        ctx.stroke();

        // horizontal
        ctx.beginPath();
        ctx.moveTo(GRID_OFFSET_X, GRID_OFFSET_Y + i * CELL);
        ctx.lineTo(GRID_OFFSET_X + CELL * SIZE, GRID_OFFSET_Y + i * CELL);
        ctx.stroke();
    }

    ctx.shadowBlur = 0;
}

function drawMarks() {
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            const x = GRID_OFFSET_X + c * CELL + CELL/2;
            const y = GRID_OFFSET_Y + r * CELL + CELL/2;

            if (board[r][c] === P1) drawX(x,y);
            if (board[r][c] === P2) drawO(x,y);
        }
    }
}

function drawX(x,y) {
    ctx.strokeStyle = "#f44";
    ctx.lineWidth = 10;
    ctx.shadowColor = "#f44";
    ctx.shadowBlur = 10;

    const s = 40;

    ctx.beginPath();
    ctx.moveTo(x-s, y-s);
    ctx.lineTo(x+s, y+s);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x+s, y-s);
    ctx.lineTo(x-s, y+s);
    ctx.stroke();

    ctx.shadowBlur = 0;
}

function drawO(x,y) {
    ctx.strokeStyle = "#ff4";
    ctx.lineWidth = 10;
    ctx.shadowColor = "#ff4";
    ctx.shadowBlur = 10;

    ctx.beginPath();
    ctx.arc(x, y, 45, 0, Math.PI*2);
    ctx.stroke();

    ctx.shadowBlur = 0;
}

/* ============================================================
   LOGIQUE
   ============================================================ */
canvas.addEventListener("click", (e) => {
    if (gameOver || currentPlayer !== P1) return;

    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const c = Math.floor((mx - GRID_OFFSET_X) / CELL);
    const r = Math.floor((my - GRID_OFFSET_Y) / CELL);

    if (r < 0 || r >= SIZE || c < 0 || c >= SIZE) return;
    if (board[r][c] !== EMPTY) return;

    board[r][c] = P1;

    if (checkWin(P1)) return endGame(P1);
    if (isFull()) return endGame(EMPTY);

    currentPlayer = P2;
    updateStatus();

    setTimeout(() => iaPlay(), 300);
});

/* ============================================================
   IA — DISPATCH
   ============================================================ */
function iaPlay() {
    if (difficulty === "debutant") return iaEasy();
    if (difficulty === "intermediaire") return iaMedium();
    if (difficulty === "expert") return iaExpert();
}

/* ============================================================
   IA DÉBUTANT — Aléatoire
   ============================================================ */
function iaEasy() {
    const moves = getAvailableMoves();
    const m = moves[Math.floor(Math.random()*moves.length)];
    playIA(m.r, m.c);
}

/* ============================================================
   IA INTERMÉDIAIRE — Gagne / bloque
   ============================================================ */
function iaMedium() {
    // 1) Coup gagnant
    for (let m of getAvailableMoves()) {
        board[m.r][m.c] = P2;
        if (checkWin(P2)) return playIA(m.r,m.c);
        board[m.r][m.c] = EMPTY;
    }

    // 2) Blocage
    for (let m of getAvailableMoves()) {
        board[m.r][m.c] = P1;
        if (checkWin(P1)) {
            board[m.r][m.c] = EMPTY;
            return playIA(m.r,m.c);
        }
        board[m.r][m.c] = EMPTY;
    }

    // 3) Centre
    if (board[1][1] === EMPTY) return playIA(1,1);

    // 4) Aléatoire
    iaEasy();
}

/* ============================================================
   IA EXPERT — Minimax parfait
   ============================================================ */
function iaExpert() {
    let bestScore = -Infinity;
    let move = null;

    for (let m of getAvailableMoves()) {
        board[m.r][m.c] = P2;
        const score = minimax(false);
        board[m.r][m.c] = EMPTY;

        if (score > bestScore) {
            bestScore = score;
            move = m;
        }
    }

    playIA(move.r, move.c);
}

function minimax(isMax) {
    if (checkWin(P2)) return 1;
    if (checkWin(P1)) return -1;
    if (isFull()) return 0;

    if (isMax) {
        let best = -Infinity;
        for (let m of getAvailableMoves()) {
            board[m.r][m.c] = P2;
            best = Math.max(best, minimax(false));
            board[m.r][m.c] = EMPTY;
        }
        return best;
    } else {
        let best = Infinity;
        for (let m of getAvailableMoves()) {
            board[m.r][m.c] = P1;
            best = Math.min(best, minimax(true));
            board[m.r][m.c] = EMPTY;
        }
        return best;
    }
}

/* ============================================================
   UTILITAIRES
   ============================================================ */
function playIA(r,c) {
    board[r][c] = P2;

    if (checkWin(P2)) return endGame(P2);
    if (isFull()) return endGame(EMPTY);

    currentPlayer = P1;
    updateStatus();
}

function getAvailableMoves() {
    const moves = [];
    for (let r = 0; r < SIZE; r++)
        for (let c = 0; c < SIZE; c++)
            if (board[r][c] === EMPTY) moves.push({r,c});
    return moves;
}

function checkWin(p) {
    for (let i = 0; i < SIZE; i++) {
        if (board[i][0]===p && board[i][1]===p && board[i][2]===p) return true;
        if (board[0][i]===p && board[1][i]===p && board[2][i]===p) return true;
    }
    if (board[0][0]===p && board[1][1]===p && board[2][2]===p) return true;
    if (board[0][2]===p && board[1][1]===p && board[2][0]===p) return true;
    return false;
}

function isFull() {
    return getAvailableMoves().length === 0;
}

function endGame(winner) {
    gameOver = true;

    if (winner === EMPTY)
        statusDisplay.textContent = "Match nul";
    else
        statusDisplay.textContent = "Victoire : " + (winner===P1 ? "Joueur 1" : "IA ("+difficulty+")");
}

function resetGame() {
    board = [
        [0,0,0],
        [0,0,0],
        [0,0,0]
    ];
    currentPlayer = P1;
    gameOver = false;
    updateStatus();
}

document.getElementById("reset").addEventListener("click", resetGame);

function updateStatus() {
    statusDisplay.textContent = "Tour : " + (currentPlayer===P1 ? "Joueur 1" : "IA ("+difficulty+")");
}

/* ============================================================
   BOUCLE
   ============================================================ */
draw();
