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

    // Date JJ/MM/AAAA
    const now = new Date();
    const date = now.toLocaleDateString("fr-FR");

    list.push({ name, score, level, date });
    
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
   BALL — ANGLE + SPIN + POSITION FIXE + ANTI-VERTICAL GLOBAL
   ============================================================ */
const ball = {
    x: canvas.width / 2,
    y: canvas.height - 60,
    radius: 6,
    dx: 3,
    dy: -3,
    moving: false,
    stuck: true,

    reset() {
        this.x = canvas.width / 2;
        this.y = canvas.height - 60;
        this.dx = 3 + level * 0.5;
        this.dy = -3 - level * 0.5;
        this.moving = false;
        this.stuck = true;
    },

    update() {
        if (this.stuck) {
            return;
        }

        this.x += this.dx;
        this.y += this.dy;

        if (this.x - this.radius <= 0 || this.x + this.radius >= canvas.width) {
            this.dx *= -1;
        }

        if (this.y - this.radius <= 0)
            this.dy *= -1;

        /* ============================================================
           COLLISION RAQUETTE — angle + spin + correction horizontale
        ============================================================ */
        if (
            this.x + this.radius > paddle.x &&
            this.x - this.radius < paddle.x + paddle.width &&
            this.y + this.radius > paddle.y &&
            this.y - this.radius < paddle.y + paddle.height
        ) {
            const impact = (this.x - paddle.x) / paddle.width;

            // angle max réduit (80°)
            const maxAngle = Math.PI * 4 / 9;
            const angle = (impact - 0.5) * maxAngle;

            const speed = Math.sqrt(this.dx * this.dx + this.dy * this.dy);

            let newDx = speed * Math.sin(angle);
            let newDy = -speed * Math.cos(angle);

            // spin
            const spinFactor = 0.12;
            newDx += paddle.vx * spinFactor;

            // dy minimal pour éviter les horizontales
            const minDy = 1.5;
            if (Math.abs(newDy) < minDy) {
                newDy = (newDy < 0 ? -minDy : minDy);
            }

            // normalisation
            const newSpeed = Math.sqrt(newDx * newDx + newDy * newDy);
            const ratio = speed / newSpeed;
            newDx *= ratio;
            newDy *= ratio;

            this.dx = newDx;
            this.dy = newDy;
        }

        // ⭐ Correction anti-vertical globale stricte
        const minDx = 1.2;
        if (!this.stuck && Math.abs(this.dx) < minDx) {
            this.dx = (this.dx < 0 ? -minDx : minDx);
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
   LANCEMENT ANGULAIRE — balle fixe, raquette décalée
   ============================================================ */
function launchBall() {
    if (!ball.stuck) return;

    // La balle descend verticalement depuis le spawn
    ball.dx = 0;
    ball.dy = 4;   // vitesse vers le bas

    ball.stuck = false;
    ball.moving = true;
}

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

            Explosions.add(b.x + b.width / 2, b.y + b.height / 2);
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

function endGame() {
    ball.moving = false;
    gameOver = true;
    newScoreIndex = HighScores.add("player", score, level);
    updateHud();
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
            if (!gameOver) launchBall();
        });
        fire.addEventListener("click", () => {
            if (!gameOver) launchBall();
        });
    }
};

Controls.init();

/* ============================================================
   CONTROLES CLAVIER
   ============================================================ */
window.addEventListener("keydown", (e) => {

    if (e.key === "ArrowLeft") {
        paddle.movingLeft = true;
    }
    if (e.key === "ArrowRight") {
        paddle.movingRight = true;
    }

    if ((e.code === "Space" || e.key === "ArrowUp" || e.key === "Enter") && ball.stuck) {
        launchBall();
    }
});

window.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft") paddle.movingLeft = false;
    if (e.key === "ArrowRight") paddle.movingRight = false;
});

/* ============================================================
   GAME LOOP
   ============================================================ */
function update() {
    Starfield.update();

    Explosions.update();

    if (gameOver) return;

    paddle.update();
    ball.update();
    updateBricks();

    // ⭐ Intégration du système de cadeaux
    maybeSpawnGift();
    updateGift();
}

function draw() {
   Starfield.draw();


    if (gameOver) {
        drawGameOver();
        return;
    }

    paddle.draw();
    ball.draw();
    drawBricks();
    Explosions.draw(ctx);

    // ⭐ Dessin du cadeau
    drawGift();
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

initBricks();
ball.reset();
loop();
