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

//function displayHighScores() {
    //const div = document.getElementById("highscores");
    //const list = HighScores.load();

    //div.innerHTML =
       // "<h3>Meilleurs Scores Tetris (Local)</h3>" +
        //list.map(s => `<div>${s.name} — ${s.score} pts (Niv ${s.level})</div>`).join("");
//}

//displayHighScores();

/* ============================================================
   GRILLE
   ============================================================ */
Grille.init();

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
    return Grille.collides(shape, offsetX2, offsetY2);
}

/* ============================================================
   FIXER LA PIECE
   ============================================================ */
function mergePiece() {
    Grille.mergePiece(current);
}

/* ============================================================
   LIGNES
   ============================================================ */
function clearLines() {
    const lines = Grille.clearLines();

    if (lines > 0) {
        const points = [0, 40, 100, 300, 1200][lines] || 0;
        score += points * level;
        linesCleared += lines;

        scoreDisplay.textContent = "Score : " + score;

        if (linesCleared >= 4) {
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

function hardDrop() {
    while (!collides(current.shape, current.x, current.y + 1)) {
        current.y++;
    }

    mergePiece();
    clearLines();
    current = randomTetromino();

    if (collides(current.shape, current.x, current.y)) {
        endGame();
    }
}

function drawNeonBorder(x, y, w, h) {
    const r = 20; // coins arrondis

    ctx.strokeStyle = "#0ff";
    ctx.lineWidth = 4;

    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.stroke();
}



/* ============================================================
   DESSIN
   ============================================================ */
function drawGrid() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#00ffff";
    ctx.lineWidth = 3;
    //ctx.strokeRect(offsetX, offsetY, COLS * BLOCK, ROWS * BLOCK);
    drawNeonBorder(offsetX - 4, offsetY - 4, COLS * BLOCK + 8, ROWS * BLOCK + 8);


    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const cell = Grille.grid[r][c];
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
   GAME OVER — VERSION PROPRE AVEC BOUTONS
   ============================================================ */

function showGameOverScreen() {
    // Fond noir transparent
    ctx.fillStyle = "rgba(0,0,0,0.85)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Cadre centré
    const frameW = 360;
    const frameH = 520;
    const frameX = (canvas.width - frameW) / 2;
    const frameY = (canvas.height - frameH) / 2;

    ctx.strokeStyle = "#00ffff";
    ctx.lineWidth = 4;
    ctx.strokeRect(frameX, frameY, frameW, frameH);

    // Titre
    ctx.fillStyle = "#00ffff";
    ctx.font = "28px 'Press Start 2P'";
    ctx.fillText("GAME OVER", frameX + 60, frameY + 60);

    // Score + niveau
    ctx.font = "16px 'Press Start 2P'";
    ctx.fillText("Score : " + score, frameX + 40, frameY + 120);
    ctx.fillText("Niveau : " + level, frameX + 40, frameY + 150);

    

    // Bouton REJOUER
    ctx.fillStyle = "#003344";
    ctx.fillRect(frameX + 40, frameY + frameH - 120, 280, 45);
    ctx.strokeStyle = "#00ffff";
    ctx.lineWidth = 3;
    ctx.strokeRect(frameX + 40, frameY + frameH - 120, 280, 45);

    ctx.fillStyle = "#00ffff";
    ctx.font = "20px 'Press Start 2P'";
    ctx.fillText("REJOUER", frameX + 100, frameY + frameH - 90);

    // Bouton QUITTER
    ctx.fillStyle = "#003344";
    ctx.fillRect(frameX + 40, frameY + frameH - 60, 280, 45);
    ctx.strokeStyle = "#00ffff";
    ctx.lineWidth = 3;
    ctx.strokeRect(frameX + 40, frameY + frameH - 60, 280, 45);

    ctx.fillStyle = "#00ffff";
    ctx.font = "20px 'Press Start 2P'";
    ctx.fillText("QUITTER", frameX + 100, frameY + frameH - 30);




    // Zones cliquables
    window._goButtons = [
        { x: frameX + 40, y: frameY + frameH - 120, w: 280, h: 45, action: "replay" },
        { x: frameX + 40, y: frameY + frameH - 60,  w: 280, h: 45, action: "quit" }
    ];
}



function endGame() {
    if (gameOver) return;
    gameOver = true;

    

    // Activation du clic sur les boutons
    canvas.addEventListener("click", handleGameOverClick, { once: true });
}

function handleGameOverClick(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    for (const b of window._goButtons) {
        if (x >= b.x && x <= b.x + b.w &&
            y >= b.y && y <= b.y + b.h) {

            if (b.action === "replay") {
                document.location.reload();
            }
            if (b.action === "quit") {
                window.location.href = "../../hub/hub-reflexion.html";
            }
        }
    }
}


/* ============================================================
   CONTROLES TACTILES
   ============================================================ */
const Controls = {
    init() {
        const left = document.getElementById("left");
        const right = document.getElementById("right");
        const rotateBtn = document.getElementById("rotate");
        const dropBtn = document.getElementById("drop");

        left.addEventListener("touchstart", () => move(-1));
        right.addEventListener("touchstart", () => move(1));
        rotateBtn.addEventListener("touchstart", () => tryRotate());
        dropBtn.addEventListener("touchstart", () => hardDrop());
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
