/* ============================================================
   RESPONSIVE — AUTO SCALE GLOBAL
   ============================================================ */
const GAME_WIDTH = 500;
const GAME_HEIGHT = 600;

function autoScaleGame() {
    const wrapper = document.getElementById("game-wrapper");

    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    const scale = Math.min(
        screenW / GAME_WIDTH,
        screenH / GAME_HEIGHT
    );

    wrapper.style.transform = `scale(${scale})`;
    wrapper.style.transformOrigin = "top left";
}

window.addEventListener("resize", autoScaleGame);
window.addEventListener("orientationchange", autoScaleGame);
window.addEventListener("load", autoScaleGame);

/* ============================================================
   CANVAS
   ============================================================ */
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// Résolution interne fixe
canvas.width = GAME_WIDTH;
canvas.height = GAME_HEIGHT;

/* ============================================================
   STARFIELD
   ============================================================ */
const stars = [];

function initStars(count = 80) {
    stars.length = 0;
    for (let i = 0; i < count; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 1,
            speed: Math.random() * 0.5 + 0.2
        });
    }
}

function updateStars() {
    stars.forEach(s => {
        s.y += s.speed;
        if (s.y > canvas.height) {
            s.y = 0;
            s.x = Math.random() * canvas.width;
        }
    });
}

function drawStars() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#0ff";
    stars.forEach(s => ctx.fillRect(s.x, s.y, s.size, s.size));
}

initStars();

/* ============================================================
   EXPLOSIONS
   ============================================================ */
const explosions = [];

function addExplosion(x, y) {
    explosions.push({
        x,
        y,
        frame: 0,
        maxFrame: 8,
        size: 10
    });
}

function updateExplosions() {
    for (let i = explosions.length - 1; i >= 0; i--) {
        explosions[i].frame++;
        if (explosions[i].frame > explosions[i].maxFrame) {
            explosions.splice(i, 1);
        }
    }
}

function drawExplosions() {
    explosions.forEach(ex => {
        const p = ex.frame / ex.maxFrame;
        const alpha = 1 - p;
        const size = ex.size + p * 20;

        ctx.fillStyle = `rgba(255, 200, 0, ${alpha})`;
        ctx.beginPath();
        ctx.arc(ex.x, ex.y, size, 0, Math.PI * 2);
        ctx.fill();
    });
}

/* ============================================================
   SCORE & LEVEL
   ============================================================ */
let score = 0;
let level = 1;

const scoreDisplay = document.getElementById("score");
const levelDisplay = document.getElementById("level");

/* ============================================================
   HIGH SCORES
   ============================================================ */
const HighScores = {
    load() {
        return JSON.parse(localStorage.getItem("breakout_scores") || "[]");
    },

    save(list) {
        localStorage.setItem("breakout_scores", JSON.stringify(list));
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
        "<h3>Meilleurs Scores (Breakout)</h3>" +
        list.map(s => `<div>${s.name} — ${s.score} pts (Niv ${s.level})</div>`).join("");
}

displayHighScores();

/* ============================================================
   PADDLE
   ============================================================ */
const paddle = {
    width: 80,
    height: 12,
    x: canvas.width / 2 - 40,
    y: canvas.height - 40,
    speed: 6,
    movingLeft: false,
    movingRight: false,

    update() {
        if (this.movingLeft && this.x > 0) this.x -= this.speed;
        if (this.movingRight && this.x < canvas.width - this.width) this.x += this.speed;
    },

    draw() {
        ctx.fillStyle = "white";
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
};

/* ============================================================
   BALL
   ============================================================ */
const ball = {
    x: canvas.width / 2,
    y: canvas.height - 60,
    size: 6,
    dx: 3,
    dy: -3,
    moving: false,

    reset() {
        this.x = canvas.width / 2;
        this.y = canvas.height - 60;
        this.dx = 3 + level * 0.5;
        this.dy = -3 - level * 0.5;
        this.moving = false;
    },

    update() {
        if (!this.moving) return;

        this.x += this.dx;
        this.y += this.dy;

        if (this.x <= 0 || this.x >= canvas.width - this.size) this.dx *= -1;
        if (this.y <= 0) this.dy *= -1;

        if (
            this.x < paddle.x + paddle.width &&
            this.x + this.size > paddle.x &&
            this.y + this.size > paddle.y &&
            this.y < paddle.y + paddle.height
        ) {
            this.dy *= -1;
        }

        if (this.y > canvas.height) {
            endGame();
        }
    },

    draw() {
        ctx.fillStyle = "cyan";
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }
};

/* ============================================================
   BRICKS
   ============================================================ */
const bricks = [];
const brickRowsBase = 5;
const brickCols = 7;
const brickWidth = 60;
const brickHeight = 20;

function initBricks() {
    bricks.length = 0;
    const rows = brickRowsBase + (level - 1);

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < brickCols; c++) {
            bricks.push({
                x: 20 + c * (brickWidth + 5),
                y: 50 + r * (brickHeight + 5),
                width: brickWidth,
                height: brickHeight,
                alive: true,
                color: ["#0ff", "#0f0", "#ff0", "#f80", "#f00"][r % 5]
            });
        }
    }
}

function updateBricks() {
    bricks.forEach(b => {
        if (!b.alive) return;

        if (
            ball.x < b.x + b.width &&
            ball.x + ball.size > b.x &&
            ball.y < b.y + b.height &&
            ball.y + ball.size > b.y
        ) {
            b.alive = false;
            ball.dy *= -1;

            score += 10;
            scoreDisplay.textContent = "Score : " + score;

            addExplosion(b.x + b.width / 2, b.y + b.height / 2);
        }
    });

    if (bricks.every(b => !b.alive)) {
        nextLevel();
    }
}

function drawBricks() {
    bricks.forEach(b => {
        if (b.alive) {
            ctx.fillStyle = b.color;
            ctx.fillRect(b.x, b.y, b.width, b.height);
        }
    });
}

/* ============================================================
   LEVEL UP
   ============================================================ */
function nextLevel() {
    level++;
    levelDisplay.textContent = "Niveau : " + level;

    ball.reset();
    initBricks();
}

/* ============================================================
   GAME OVER
   ============================================================ */
function endGame() {
    ball.moving = false;

    const name = prompt("Bravo ! Entre ton nom pour enregistrer ton score :");
    if (name) HighScores.add(name, score, level);

    document.location.reload();
}

/* ============================================================
   TOUCH CONTROLS
   ============================================================ */
const Controls = {
    init() {
        const left = document.getElementById("left");
        const right = document.getElementById("right");
        const fire = document.getElementById("fire");

        left.addEventListener("touchstart", () => paddle.movingLeft = true);
        left.addEventListener("touchend", () => paddle.movingLeft = false);

        right.addEventListener("touchstart", () => paddle.movingRight = true);
        right.addEventListener("touchend", () => paddle.movingRight = false);

        fire.addEventListener("touchstart", () => ball.moving = true);
    }
};

Controls.init();

/* ============================================================
   GAME LOOP
   ============================================================ */
function update() {
    updateStars();
    updateExplosions();
    paddle.update();
    ball.update();
    updateBricks();
}

function draw() {
    drawStars();
    paddle.draw();
    ball.draw();
    drawBricks();
    drawExplosions();
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

initBricks();
ball.reset();
loop();
