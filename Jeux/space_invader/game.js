/* ============================================================
   RESPONSIVE CANVAS
   ============================================================ */
function resizeGame() {
    const wrapper = document.querySelector(".canvas-wrapper");
    const canvas = document.getElementById("game");

    const ratio = 500 / 600;

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
   POPUP DE NIVEAU
   ============================================================ */
let waitingForStart = false;

const popup = document.getElementById("level-popup");
const popupTitle = document.getElementById("level-title");
const popupStart = document.getElementById("level-start");

popupStart.addEventListener("click", () => {
    popup.classList.add("hidden");
    waitingForStart = false;
});

/* ============================================================
   STARFIELD BACKGROUND
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
    stars.forEach(s => {
        ctx.fillRect(s.x, s.y, s.size, s.size);
    });
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
let enemyFireRate = 0.02;
let gameOverHandled = false;

const scoreDisplay = document.getElementById("score");
const levelDisplay = document.getElementById("level");
const bestDisplay = document.getElementById("best");

/* ============================================================
   HIGH SCORES — NOUVEAU SYSTÈME
   ============================================================ */
const HighScores = {
    load() {
        return JSON.parse(localStorage.getItem("highscores") || "[]");
    },

    save(list) {
        localStorage.setItem("highscores", JSON.stringify(list));
    },

    add(score, level) {
        const list = this.load();

        const entry = {
            score,
            level,
            date: new Date().toLocaleString()
        };

        list.push(entry);
        list.sort((a, b) => b.score - a.score);

        const index = list.indexOf(entry);

        this.save(list.slice(0, 10));

        return index;
    },

    best() {
        const list = this.load();
        return list.length > 0 ? list[0].score : 0;
    }
};

bestDisplay.textContent = "Record : " + HighScores.best();

/* ============================================================
   AFFICHAGE DES SCORES
   ============================================================ */
function showHighScores(highlightIndex = -1) {
    const div = document.getElementById("highscores");
    const list = HighScores.load();

    div.innerHTML = "<h3>Meilleurs Scores</h3>";

    list.forEach((s, i) => {
        const style = (i === highlightIndex)
            ? "color:#0ff; font-weight:bold; text-shadow:0 0 10px #0ff;"
            : "color:white;";

        div.innerHTML += `<div style="${style}">
            ${s.score} pts — Niv ${s.level} — ${s.date}
        </div>`;
    });
}

/* ============================================================
   PLAYER
   ============================================================ */
const player = {
    x: canvas.width / 2 - 20,
    y: canvas.height - 60,
    width: 40,
    height: 24,
    speed: 5,
    movingLeft: false,
    movingRight: false,
    alive: true,
    flameFrame: 0,

    update() {
        if (!this.alive) return;

        if (this.movingLeft && this.x > 0) this.x -= this.speed;
        if (this.movingRight && this.x < canvas.width - this.width) this.x += this.speed;

        this.flameFrame = (this.flameFrame + 1) % 20;
    },

    draw() {
        ctx.fillStyle = "white";

        const x = this.x;
        const y = this.y;

        ctx.fillRect(x + 12, y, 16, 6);
        ctx.fillRect(x + 6, y + 6, 28, 10);
        ctx.fillRect(x, y + 8, 10, 12);
        ctx.fillRect(x + 30, y + 8, 10, 12);
        ctx.fillRect(x + 8, y + 16, 24, 6);

        const flameSize = (this.flameFrame < 10) ? 6 : 10;

        ctx.fillStyle = "orange";
        ctx.fillRect(x + 18, y + 22, 4, flameSize);

        ctx.fillStyle = "yellow";
        ctx.fillRect(x + 19, y + 22, 2, flameSize - 2);
    }
};

/* ============================================================
   BULLETS
   ============================================================ */
const bullets = [];

const Bullets = {
    fire() {
        if (!player.alive) return;
        bullets.push({ x: player.x + 18, y: player.y });
    },

    update() {
        bullets.forEach(b => b.y -= 5);
        for (let i = bullets.length - 1; i >= 0; i--) {
            if (bullets[i].y < 0) bullets.splice(i, 1);
        }
    },

    draw() {
        ctx.fillStyle = "red";
        bullets.forEach(b => ctx.fillRect(b.x, b.y, 4, 10));
    }
};

/* ============================================================
   ENEMY BULLETS
   ============================================================ */
const enemyBullets = [];

const EnemyBullets = {
    fire(enemy) {
        if (!player.alive) return;
        enemyBullets.push({
            x: enemy.x + enemy.width / 2 - 2,
            y: enemy.y + enemy.height
        });
    },

    update() {
        enemyBullets.forEach(b => b.y += 4);

        for (let i = enemyBullets.length - 1; i >= 0; i--) {
            if (enemyBullets[i].y > canvas.height) enemyBullets.splice(i, 1);
        }

        enemyBullets.forEach(b => {
            if (
                b.x < player.x + player.width &&
                b.x + 4 > player.x &&
                b.y < player.y + player.height &&
                b.y + 10 > player.y
            ) {
                if (!gameOverHandled) {
                    setTimeout(() => endGame(), 200);
                }
            }
        });
    },

    draw() {
        ctx.fillStyle = "yellow";
        enemyBullets.forEach(b => ctx.fillRect(b.x, b.y, 4, 10));
    }
};

/* ============================================================
   ENEMIES
   ============================================================ */
const enemies = [];
const enemyWidth = 40;
const enemyHeight = 20;
let enemyDirection = 1;

function drawAlien(e) {
    ctx.fillStyle = "lime";

    if (e.frame === 0) {
        ctx.fillRect(e.x + 10, e.y, 20, 10);
        ctx.fillRect(e.x, e.y + 10, 40, 10);
        ctx.fillRect(e.x + 5, e.y + 20, 10, 5);
        ctx.fillRect(e.x + 25, e.y + 20, 10, 5);
    } else {
        ctx.fillRect(e.x + 12, e.y, 16, 10);
        ctx.fillRect(e.x + 2, e.y + 10, 36, 10);
        ctx.fillRect(e.x + 8, e.y + 22, 8, 5);
        ctx.fillRect(e.x + 24, e.y + 22, 8, 5);
    }
}

const Enemies = {
    init(rows = 3, cols = 6) {
        enemies.length = 0;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                enemies.push({
                    x: 50 + c * 60,
                    y: 50 + r * 40,
                    width: enemyWidth,
                    height: enemyHeight,
                    alive: true,
                    frame: 0
                });
            }
        }
    },

    update() {
        enemies.forEach(e => {
            if (e.alive) e.x += enemyDirection;
        });

        const hitEdge = enemies.some(e =>
            e.alive && (e.x <= 0 || e.x >= canvas.width - enemyWidth)
        );

        if (hitEdge) {
            enemyDirection *= -1;
            enemies.forEach(e => e.y += 20);
        }

        bullets.forEach(b => {
            enemies.forEach(e => {
                if (e.alive &&
                    b.x < e.x + e.width &&
                    b.x + 4 > e.x &&
                    b.y < e.y + e.height &&
                    b.y + 10 > e.y
                ) {
                    e.alive = false;
                    b.y = -100;

                    score += 10;
                    scoreDisplay.textContent = "Score : " + score;
                    bestDisplay.textContent = "Record : " + HighScores.best();

                    addExplosion(e.x + e.width / 2, e.y + e.height / 2);
                }
            });
        });

        if (Math.random() < enemyFireRate && player.alive) {
            const shooters = enemies.filter(e => e.alive);
            if (shooters.length > 0) {
                const shooter = shooters[Math.floor(Math.random() * shooters.length)];
                EnemyBullets.fire(shooter);
            }
        }

        if (enemies.every(e => !e.alive)) {
            nextLevel();
        }
    },

    draw() {
        enemies.forEach(e => {
            if (e.alive) drawAlien(e);
        });
    }
};

Enemies.init();

/* ============================================================
   BUNKERS
   ============================================================ */
const bunkers = [];

const Bunkers = {
    init() {
        const positions = [80, 220, 360];
        const blockSize = 8;

        positions.forEach(x => {
            const blocks = [];

            const pattern = [
                "0111110",
                "1111111",
                "1111111",
                "1110111",
                "1100011"
            ];

            for (let row = 0; row < pattern.length; row++) {
                for (let col = 0; col < pattern[row].length; col++) {
                    if (pattern[row][col] === "1") {
                        blocks.push({
                            x: x + col * blockSize,
                            y: canvas.height - 150 + row * blockSize,
                            size: blockSize,
                            alive: true
                        });
                    }
                }
            }

            bunkers.push(blocks);
        });
    },

    update() {
        bullets.forEach(b => {
            bunkers.forEach(blocks => {
                blocks.forEach(bl => {
                    if (
                        bl.alive &&
                        b.x < bl.x + bl.size &&
                        b.x + 4 > bl.x &&
                        b.y < bl.y + bl.size &&
                        b.y + 10 > bl.y
                    ) {
                        bl.alive = false;
                        b.y = -100;
                    }
                });
            });
        });

        enemyBullets.forEach(b => {
            bunkers.forEach(blocks => {
                blocks.forEach(bl => {
                    if (
                        bl.alive &&
                        b.x < bl.x + bl.size &&
                        b.x + 4 > bl.x &&
                        b.y < bl.y + bl.size &&
                        b.y + 10 > bl.y
                    ) {
                        bl.alive = false;
                        b.y = canvas.height + 100;
                    }
                });
            });
        });
    },

    draw() {
        ctx.fillStyle = "rgb(60, 200, 60)";

        bunkers.forEach(blocks => {
            blocks.forEach(bl => {
                if (bl.alive) {
                    ctx.fillRect(bl.x, bl.y, bl.size, bl.size);
                }
            });
        });
    }
};

Bunkers.init();

/* ============================================================
   LEVELS
   ============================================================ */
function nextLevel() {
    level++;
    levelDisplay.textContent = "Niveau : " + level;

    enemies.length = 0;
    bullets.length = 0;
    enemyBullets.length = 0;

    enemyDirection = 1;
    const rows = 3 + Math.floor(level / 2);
    const cols = 6;

    Enemies.init(rows, cols);

    enemyFireRate = Math.min(0.05, 0.02 + level * 0.005);

    popupTitle.textContent = "LEVEL " + level;
    popup.classList.remove("hidden");
    waitingForStart = true;
}

/* ============================================================
   GAME OVER — NOUVEAU SYSTÈME
   ============================================================ */
function showGameOverScreen() {
    ctx.fillStyle = "rgba(0,0,0,0.8)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#0ff";
    ctx.font = "28px 'Press Start 2P'";
    ctx.fillText("GAME OVER", 80, 200);

    ctx.font = "16px 'Press Start 2P'";
    ctx.fillText("Score : " + score, 120, 260);
    ctx.fillText("Niveau : " + level, 120, 300);

    ctx.fillText("▶ Rejouer", 120, 380);
    ctx.fillText("◀ Menu", 120, 430);
}

function endGame() {
    if (gameOverHandled) return;
    gameOverHandled = true;

    player.alive = false;

    const index = HighScores.add(score, level);

    showHighScores(index);

    canvas.addEventListener("click", handleGameOverClick);
}

function handleGameOverClick(e) {
    const y = e.offsetY;

    if (y > 350 && y < 400) {
        document.location.reload();
    }

    if (y > 410 && y < 460) {
        window.location.href = "menu.html";
    }
}

/* ============================================================
   TOUCH CONTROLS
   ============================================================ */
const Controls = {
    init() {
        const left = document.getElementById("left");
        const right = document.getElementById("right");
        const fire = document.getElementById("fire");

        left.addEventListener("touchstart", () => player.movingLeft = true);
        left.addEventListener("touchend", () => player.movingLeft = false);

        right.addEventListener("touchstart", () => player.movingRight = true);
        right.addEventListener("touchend", () => player.movingRight = false);

        fire.addEventListener("touchstart", () => Bullets.fire());
    }
};

Controls.init();

/* ============================================================
   GAME LOOP
   ============================================================ */
function update() {
    if (waitingForStart) return;
    if (!player.alive) return;

    updateStars();
    updateExplosions();
    player.update();
    Bullets.update();
    EnemyBullets.update();
    Enemies.update();
    Bunkers.update();
}

function draw() {
    drawStars();

    if (!player.alive) {
        showGameOverScreen();
        return;
    }

    player.draw();
    Bunkers.draw();
    Bullets.draw();
    Enemies.draw();
    EnemyBullets.draw();
    drawExplosions();
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

loop();
