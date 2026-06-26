/* ============================================================
   RESPONSIVE — AUTO SCALE GLOBAL
   ============================================================ */
const GAME_WIDTH = 500;
const GAME_HEIGHT = 600;
let CURRENT_SCALE = 1;

function autoScaleGame() {
    const wrapper = document.getElementById("game-wrapper");

    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    const scale = Math.min(
        screenW / GAME_WIDTH,
        screenH / GAME_HEIGHT,
        1.2
    );

    CURRENT_SCALE = scale;

    wrapper.style.transform = `scale(${scale})`;
    wrapper.style.transformOrigin = "top left";
}

window.addEventListener("resize", autoScaleGame);
window.addEventListener("orientationchange", autoScaleGame);
window.addEventListener("load", () => {
    autoScaleGame();
    updateHud();
});

/* ============================================================
   CANVAS
   ============================================================ */
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

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
   SCORE / LEVEL / RECORD
   ============================================================ */
let score = 0;
let level = 1;
let gameOver = false;
let newScoreIndex = -1;

const scoreDisplay = document.getElementById("score");
const levelDisplay = document.getElementById("level");
const bestDisplay = document.getElementById("best");

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
        const trimmed = list.slice(0, 10);
        this.save(trimmed);
        return trimmed.findIndex(s => s.score === score && s.level === level);
    },

    best() {
        const list = this.load();
        return list.length ? list[0].score : 0;
    }
};

function updateHud() {
    scoreDisplay.textContent = "Score : " + score;
    levelDisplay.textContent = "Niveau : " + level;
    bestDisplay.textContent = "Record : " + HighScores.best();
}

/* ============================================================
   PADDLE — Capsule néon + SPIN
   ============================================================ */
const paddle = {
    width: 80,
    height: 12,
    x: canvas.width / 2 - 40,
    y: canvas.height - 40,
    speed: 6,
    movingLeft: false,
    movingRight: false,
    vx: 0,

    update() {
        let oldX = this.x;

        if (this.movingLeft && this.x > 0) this.x -= this.speed;
        if (this.movingRight && this.x < canvas.width - this.width) this.x += this.speed;

        this.vx = this.x - oldX;
    },

    draw() {
        const r = this.height / 2;

        const grad = ctx.createLinearGradient(this.x, this.y, this.x + this.width, this.y);
        grad.addColorStop(0, "#0ff");
        grad.addColorStop(0.5, "#fff");
        grad.addColorStop(1, "#0ff");

        ctx.fillStyle = grad;

        ctx.beginPath();
        ctx.moveTo(this.x + r, this.y);
        ctx.lineTo(this.x + this.width - r, this.y);
        ctx.arcTo(this.x + this.width, this.y, this.x + this.width, this.y + r, r);
        ctx.lineTo(this.x + this.width, this.y + this.height - r);
        ctx.arcTo(this.x + this.width, this.y + this.height, this.x + this.width - r, this.y + this.height, r);
        ctx.lineTo(this.x + r, this.y + this.height);
        ctx.arcTo(this.x, this.y + this.height, this.x, this.y + this.height - r, r);
        ctx.lineTo(this.x, this.y + r);
        ctx.arcTo(this.x, this.y, this.x + r, this.y, r);
        ctx.fill();

        ctx.strokeStyle = "#0ff";
        ctx.lineWidth = 2;
        ctx.stroke();
    }
};

/* ============================================================
   BALL — ANGLE + SPIN ADOUCI
   ============================================================ */
const ball = {
    x: canvas.width / 2,
    y: canvas.height - 60,
    radius: 6,
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

        if (this.x - this.radius <= 0 || this.x + this.radius >= canvas.width)
            this.dx *= -1;

        if (this.y - this.radius <= 0)
            this.dy *= -1;

        /* ============================================================
           COLLISION RAQUETTE — ANGLE + SPIN ADOUCI
        ============================================================ */
        if (
            this.x + this.radius > paddle.x &&
            this.x - this.radius < paddle.x + paddle.width &&
            this.y + this.radius > paddle.y &&
            this.y - this.radius < paddle.y + paddle.height
        ) {
            const impact = (this.x - paddle.x) / paddle.width;
            const angle = (impact - 0.5) * (Math.PI * 5 / 6);

            const speed = Math.sqrt(this.dx * this.dx + this.dy * this.dy);

            let newDx = speed * Math.sin(angle);
            let newDy = -speed * Math.cos(angle);

            // SPIN adouci
            const spinFactor = 0.12;
            newDx += paddle.vx * spinFactor;

            // Limiter l’angle horizontal
            const maxDx = speed * 0.75;
            newDx = Math.max(-maxDx, Math.min(maxDx, newDx));

            // Normalisation légère
            const newSpeed = Math.sqrt(newDx * newDx + newDy * newDy);
            const ratio = speed / newSpeed;
            newDx *= ratio;
            newDy *= ratio;

            this.dx = newDx;
            this.dy = newDy;
        }

        if (this.y - this.radius > canvas.height) {
            endGame();
        }
    },

    draw() {
        const r = this.radius;

        const grad = ctx.createRadialGradient(
            this.x - r * 0.3, this.y - r * 0.3, r * 0.1,
            this.x, this.y, r
        );

        grad.addColorStop(0, "#ffffff");
        grad.addColorStop(0.4, "#7df");
        grad.addColorStop(1, "#004");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
        ctx.fill();
    }
};

/* ============================================================
   BRICKS — Collision logique + rebonds cohérents
   ============================================================ */
const bricks = [];
const brickRowsBase = 5;
const brickCols = 7;
const brickWidth = 60;
const brickHeight = 20;
const brickGap = 5;

function initBricks() {
    bricks.length = 0;
    const rows = brickRowsBase + (level - 1);

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < brickCols; c++) {
            bricks.push({
                x: 20 + c * (brickWidth + brickGap),
                y: 50 + r * (brickHeight + brickGap),
                width: brickWidth,
                height: brickHeight,
                alive: true,
                color: ["#0ff", "#0f0", "#ff0", "#f80", "#f00"][r % 5]
            });
        }
    }
}

function updateBricks() {
    const rows = brickRowsBase + (level - 1);

    const col = Math.floor((ball.x - 20) / (brickWidth + brickGap));
    const row = Math.floor((ball.y - 50) / (brickHeight + brickGap));

    if (row >= 0 && row < rows && col >= 0 && col < brickCols) {
        const index = row * brickCols + col;
        const b = bricks[index];

        if (b && b.alive) {

            const prevX = ball.x - ball.dx;
            const prevY = ball.y - ball.dy;

            const hitLeft   = prevX < b.x;
            const hitRight  = prevX > b.x + b.width;
            const hitTop    = prevY < b.y;
            const hitBottom = prevY > b.y + b.height;

            if (hitLeft || hitRight) {
                ball.dx *= -1;
            } else if (hitTop || hitBottom) {
                ball.dy *= -1;
            } else {
                ball.dy *= -1;
            }

            b.alive = false;
            score += 10;
            updateHud();

            addExplosion(b.x + b.width / 2, b.y + b.height / 2);
        }
    }

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
   GAME OVER
   ============================================================ */
const BTN_REPLAY = { x: 140, y: 520, w: 220, h: 40 };
const BTN_QUIT   = { x: 140, y: 570, w: 220, h: 40 };

function nextLevel() {
    level++;
    updateHud();
    ball.reset();
    initBricks();
}

function endGame() {
    ball.moving = false;
    gameOver = true;
    newScoreIndex = HighScores.add("player", score, level);
    updateHud();
}

function drawRoundedButton(btn, colorFill, colorStroke, text) {
    const r = 10;

    ctx.save();
    ctx.shadowColor = colorStroke;
    ctx.shadowBlur = 15;

    ctx.fillStyle = colorFill;
    ctx.beginPath();
    ctx.moveTo(btn.x + r, btn.y);
    ctx.lineTo(btn.x + btn.w - r, btn.y);
    ctx.quadraticCurveTo(btn.x + btn.w, btn.y, btn.x + btn.w, btn.y + r);
    ctx.lineTo(btn.x + btn.w, btn.y + btn.h - r);
    ctx.quadraticCurveTo(btn.x + btn.w, btn.y + btn.h, btn.x + btn.w - r, btn.y + btn.h);
    ctx.lineTo(btn.x + r, btn.y + btn.h);
    ctx.quadraticCurveTo(btn.x, btn.y + btn.h, btn.x, btn.y + btn.h - r);
    ctx.lineTo(btn.x, btn.y + r);
    ctx.quadraticCurveTo(btn.x, btn.y, btn.x + r, btn.y);
    ctx.fill();

    ctx.strokeStyle = colorStroke;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.fillStyle = colorStroke;
    ctx.fillText(text, btn.x + 35, btn.y + 26);

    ctx.restore();
}

function drawGameOver() {
    ctx.fillStyle = "rgba(0,0,0,0.85)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#0ff";
    ctx.font = "24px 'Press Start 2P'";
    ctx.fillText("GAME OVER", 70, 80);

    ctx.font = "14px 'Press Start 2P'";
    ctx.fillText("Score : " + score, 70, 130);
    ctx.fillText("Niveau : " + level, 70, 155);

    const list = HighScores.load();
    ctx.fillText("TOP 10", 70, 200);

    list.forEach((s, i) => {
        ctx.fillStyle = (i === newScoreIndex) ? "#0ff" : "white";
        ctx.fillText(`${s.score} pts (Niv ${s.level})`, 70, 230 + i * 18);
    });

    drawRoundedButton(BTN_REPLAY, "#022", "#0ff", "REJOUER");
    drawRoundedButton(BTN_QUIT, "#200", "#f00", "QUITTER");
}

function restartGame() {
    score = 0;
    level = 1;
    gameOver = false;
    newScoreIndex = -1;
    updateHud();
    initBricks();
    ball.reset();
}

/* ============================================================
   TOUCH + CLICK : REJOUER / QUITTER
   ============================================================ */
function handleReplayTap(clientX, clientY) {
    if (!gameOver) return;

    const rect = canvas.getBoundingClientRect();

    const xScaled = clientX - rect.left;
    const yScaled = clientY - rect.top;

    const x = xScaled / CURRENT_SCALE;
    const y = yScaled / CURRENT_SCALE;

    if (
        x > BTN_REPLAY.x &&
        x < BTN_REPLAY.x + BTN_REPLAY.w &&
        y > BTN_REPLAY.y &&
        y < BTN_REPLAY.y + BTN_REPLAY.h
    ) {
        restartGame();
    }

    if (
        x > BTN_QUIT.x &&
        x < BTN_QUIT.x + BTN_QUIT.w &&
        y > BTN_QUIT.y &&
        y < BTN_QUIT.y + BTN_QUIT.h
    ) {
        window.location.href = "../index.html";
    }
}

canvas.addEventListener("touchstart", (e) => {
    const t = e.touches[0];
    handleReplayTap(t.clientX, t.clientY);
});

canvas.addEventListener("click", (e) => {
    handleReplayTap(e.clientX, e.clientY);
});

/* ============================================================
   TOUCH CONTROLS
   ============================================================ */
const Controls = {
    init() {
        const left = document.getElementById("left");
        const right = document.getElementById("right");
        const fire = document.getElementById("fire");

        left.addEventListener("touchstart", () => {
            if (!gameOver) paddle.movingLeft = true;
        });
        left.addEventListener("touchend", () => {
            paddle.movingLeft = false;
        });
        left.addEventListener("mousedown", () => {
            if (!gameOver) paddle.movingLeft = true;
        });
        left.addEventListener("mouseup", () => {
            paddle.movingLeft = false;
        });

        right.addEventListener("touchstart", () => {
            if (!gameOver) paddle.movingRight = true;
        });
        right.addEventListener("touchend", () => {
            paddle.movingRight = false;
        });
        right.addEventListener("mousedown", () => {
            if (!gameOver) paddle.movingRight = true;
        });
        right.addEventListener("mouseup", () => {
            paddle.movingRight = false;
        });

        fire.addEventListener("touchstart", () => {
            if (!gameOver) ball.moving = true;
        });
        fire.addEventListener("click", () => {
            if (!gameOver) ball.moving = true;
        });
    }
};

Controls.init();

/* ============================================================
   GAME LOOP
   ============================================================ */
function update() {
    updateStars();
    updateExplosions();

    if (gameOver) return;

    paddle.update();
    ball.update();
    updateBricks();
}




function draw() {
    drawStars();

    if (gameOver) {
        drawGameOver();
        drawExplosions();
        return;
    }

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

