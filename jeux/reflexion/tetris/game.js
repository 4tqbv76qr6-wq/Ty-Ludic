/* ============================================================
   CANVAS DIMENSIONS OPTIMISÉES
   ============================================================ */
const COLS = 10;
const ROWS = 20;
const BLOCK = 36;   // blocs agrandis

// Canvas ajusté pour iPad — ⭐ hauteur légèrement augmentée
const canvas = document.getElementById("game");
canvas.width  = COLS * BLOCK + 40;     // marge latérale
canvas.height = ROWS * BLOCK + 60;     // ⭐ marge basse augmentée (20 → 60)

const ctx = canvas.getContext("2d");

/* ============================================================
   CENTRAGE AUTOMATIQUE
   ============================================================ */
const offsetX = (canvas.width  - COLS * BLOCK) / 2;
const offsetY = 30;   // ⭐ marge haute légèrement augmentée (20 → 30)

/* ============================================================
   RESPONSIVE OPTIMISÉ
   ============================================================ */
function resizeGame() {
    const wrapper = document.querySelector(".canvas-wrapper");
    const width = wrapper.clientWidth;

    const ratio = canvas.width / canvas.height;
    let height = width / ratio;

    const maxHeight = 560;   // ⭐ hauteur max augmentée (520 → 560)
    height = Math.min(height, maxHeight);

    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
}

window.addEventListener("resize", resizeGame);
window.addEventListener("orientationchange", resizeGame);
window.addEventListener("load", resizeGame);

/* ============================================================
   SCORE & LEVEL
   ============================================================ */
let score = 0;
let level = 1;
let linesCleared = 0;
let dropInterval = 800;
let lastDropTime = 0;
let gameOver = false;

const scoreDisplay = document.getElementById("score");
const levelDisplay = document.getElementById("level");

/* ============================================================
   HIGH SCORES (LOCAL)
   ============================================================ */
const HighScores = {
    load() {
        return JSON.parse(localStorage.getItem("highscores_tetris") || "[]");
    },

    save(list) {
        localStorage.setItem("highscores_tetris", JSON.stringify(list));
    },

    add(name, score, level) {
        const list = this.load();
        list.push({ name, score, level });
        list.sort((a, b) => b.score - a.score);
        this.save(list.slice(0, 10));
    }
};

function displayHighScores() {
    const div = document.getElementById("highscores");
    const list = HighScores.load();

    div.innerHTML =
        "<h3>Meilleurs Scores Tetris (Local)</h3>" +
        list.map(s => `<div>${s.name} — ${s.score} pts (Niv ${s.level})</div>`).join("");
}

displayHighScores();

/* ============================================================
   GRILLE
   ============================================================ */
const grid = [];
for (let r = 0; r < ROWS; r++) {
    grid[r] = new Array(COLS).fill(0);
}

/* ============================================================
   TETROMINOS
   ============================================================ */
const TETROMINOS = {
    I: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
    O: [[1,1],[1,1]],
    T: [[0,1,0],[1,1,1],[0,0,0]],
    L: [[1,0,0],[1,1,1],[0,0,0]],
    J: [[0,0,1],[1,1,1],[0,0,0]],
    S: [[0,1,1],[1,1,0],[0,0,0]],
    Z: [[1,1,0],[0,1,1],[0,0,0]]
};

const COLORS = {
    I: "#00f0ff",
    O: "#ffd800",
    T: "#ff00ff",
    L: "#ff8800",
    J: "#0088ff",
    S: "#00ff66",
    Z: "#ff3355"
};

function randomTetromino() {
    const keys = Object.keys(TETROMINOS);
    const k = keys[Math.floor(Math.random() * keys.length)];
    return {
        shape: TETROMINOS[k].map(row => row.slice()),
        color: COLORS[k],
        x: 3,
        y: 0
    };
}

let current = randomTetromino();

/* ============================================================
   COLLISIONS
   ============================================================ */
function collides(shape, offsetX2, offsetY2) {
    for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
            if (!shape[r][c]) continue;

            const x = c + offsetX2;
            const y = r + offsetY2;

            if (x < 0 || x >= COLS || y >= ROWS) return true;
            if (y >= 0 && grid[y][x]) return true;
        }
    }
    return false;
}

/* ============================================================
   FIXER LA PIECE
   ============================================================ */
function mergePiece() {
    const shape = current.shape;
    for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
            if (!shape[r][c]) continue;
            const x = current.x + c;
            const y = current.y + r;
            if (y >= 0 && y < ROWS && x >= 0 && x < COLS) {
                grid[y][x] = current.color;
            }
        }
    }
}

/* ============================================================
   LIGNES
   ============================================================ */
function clearLines() {
    let lines = 0;
    for (let r = ROWS - 1; r >= 0; r--) {
        if (grid[r].every(cell => cell !== 0)) {
            grid.splice(r, 1);
            grid.unshift(new Array(COLS).fill(0));
            lines++;
            r++;
        }
    }

    if (lines > 0) {
        const points = [0, 40, 100, 300, 1200][lines] || 0;
        score += points * level;
        linesCleared += lines;

        scoreDisplay.textContent = "Score : " + score;

        if (linesCleared >= 10) {
            level++;
            linesCleared = 0;
            dropInterval = Math.max(150, dropInterval - 80);
            levelDisplay.textContent = "Niveau : " + level;
        }
    }
}

/* ============================================================
   ROTATION
   ============================================================ */
function rotate(shape) {
    const N = shape.length;
    const res = [];
    for (let r = 0; r < N; r++) {
        res[r] = [];
        for (let c = 0; c < N; c++) {
            res[r][c] = shape[N - c - 1][r];
        }
    }
    return res;
}

function tryRotate() {
    const rotated = rotate(current.shape);
    if (!collides(rotated, current.x, current.y)) {
        current.shape = rotated;
    }
}

/* ============================================================
   DEPLACEMENTS
   ============================================================ */
function move(dx) {
    if (!collides(current.shape, current.x + dx, current.y)) {
        current.x += dx;
    }
}

function softDrop() {
    if (!collides(current.shape, current.x, current.y + 1)) {
        current.y++;
    } else {
        mergePiece();
        clearLines();
        current = randomTetromino();
        if (collides(current.shape, current.x, current.y)) {
            endGame();
        }
    }
}

/* ============================================================
   DESSIN — CENTRÉ + AGRANDI + HAUTEUR AJUSTÉE
   ============================================================ */
function drawGrid() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Bordure centrée
    ctx.strokeStyle = "#00ffff";
    ctx.lineWidth = 3;
    ctx.strokeRect(offsetX, offsetY, COLS * BLOCK, ROWS * BLOCK);

    // Grille interne
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const cell = grid[r][c];
            if (cell) {
                drawBlock(c, r, cell);
            } else {
                ctx.strokeStyle = "rgba(255,255,255,0.05)";
                ctx.strokeRect(
                    offsetX + c * BLOCK,
                    offsetY + r * BLOCK,
                    BLOCK,
                    BLOCK
                );
            }
        }
    }
}

function drawBlock(c, r, color) {
    const x = offsetX + c * BLOCK;
    const y = offsetY + r * BLOCK;

    ctx.fillStyle = color;
    ctx.fillRect(x, y, BLOCK, BLOCK);

    ctx.strokeStyle = "rgba(0,0,0,0.4)";
    ctx.strokeRect(x, y, BLOCK, BLOCK);
}

function drawPiece() {
    const shape = current.shape;

    for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
            if (!shape[r][c]) continue;
            drawBlock(current.x + c, current.y + r, current.color);
        }
    }
}

/* ============================================================
   GAME OVER
   ============================================================ */
function showGameOverScreen() {
    ctx.fillStyle = "rgba(0,0,0,0.8)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#0ff";
    ctx.font = "24px 'Press Start 2P'";
    ctx.fillText("GAME OVER", 80, 200);

    ctx.font = "14px 'Press Start 2P'";
    ctx.fillText("Score : " + score, 120, 260);
    ctx.fillText("Niveau : " + level, 120, 300);
    ctx.fillText("Touchez pour rejouer", 40, 380);
}

function endGame() {
    if (gameOver) return;
    gameOver = true;

    const name = prompt("Bravo ! Entre ton nom pour enregistrer ton score :");
    if (name) HighScores.add(name, score, level);
    displayHighScores();

    canvas.addEventListener("click", () => {
        document.location.reload();
    }, { once: true });
}

/* ============================================================
   CONTROLES TACTILES
   ============================================================ */
const Controls = {
    init() {
        const left = document.getElementById("left");
        const right = document.getElementById("right");
        const rotateBtn = document.getElementById("rotate");

        left.addEventListener("touchstart", () => move(-1));
        right.addEventListener("touchstart", () => move(1));
        rotateBtn.addEventListener("touchstart", () => tryRotate());
    }
};

Controls.init();

/* ============================================================
   CONTROLES CLAVIER
   ============================================================ */
window.addEventListener("keydown", (e) => {
    if (gameOver) return;
    if (e.key === "ArrowLeft") move(-1);
    if (e.key === "ArrowRight") move(1);
    if (e.key === "ArrowUp") tryRotate();
    if (e.key === "ArrowDown") softDrop();
});

/* ============================================================
   GAME LOOP
   ============================================================ */
function update(timestamp) {
    if (gameOver) return;

    if (!lastDropTime) lastDropTime = timestamp;
    const delta = timestamp - lastDropTime;

    if (delta > dropInterval) {
        softDrop();
        lastDropTime = timestamp;
    }
}

function draw() {
    drawGrid();
    if (!gameOver) {
        drawPiece();
    } else {
        showGameOverScreen();
    }
}

function loop(timestamp) {
    update(timestamp);
    draw();
    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
