/* ============================================================
   CANVAS
   ============================================================ */
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

/* ============================================================
   SCORE & LEVEL
   ============================================================ */
let score = 0;
let level = 1;
let enemyFireRate = 0.02;
let gameOverHandled = false;
let gameRunning = true;

const scoreDisplay = document.getElementById("score");
const levelDisplay = document.getElementById("level");

/* ============================================================
   HIGH SCORES (LOCAL)
   ============================================================ */
const HighScores = {
    load() {
        return JSON.parse(localStorage.getItem("highscores") || "[]");
    },

    save(list) {
        localStorage.setItem("highscores", JSON.stringify(list));
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
        "<h3>Meilleurs Scores (Local)</h3>" +
        list.map(s => `<div>${s.name} — ${s.score} pts (Niv ${s.level})</div>`).join("");
}

displayHighScores();

/* ============================================================
   HIGH SCORES (GLOBAL FIREBASE)
   ============================================================ */
function saveGlobalScore(name, score, level) {
    db.collection("scores_space_invader").add({
        name,
        score,
        level,
        date: Date.now()
    });
}

/* ============================================================
   PLAYER
   ============================================================ */
const player = {
    x: canvas.width / 2 - 20,
    y: canvas.height - 60,
    width: 40,
    height: 20,
    speed: 5,
    movingLeft: false,
    movingRight: false,

    update() {
        if (!gameRunning) return;
        if (this.movingLeft && this.x > 0) this.x -= this.speed;
        if (this.movingRight && this.x < canvas.width - this.width) this.x += this.speed;
    },

    draw() {
        ctx.fillStyle = "white";
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
};

/* ============================================================
   BULLETS (PLAYER)
   ============================================================ */
const bullets = [];

const Bullets = {
    fire() {
        if (!gameRunning) return;
        bullets.push({ x: player.x + 18, y: player.y });
    },

    update() {
        if (!gameRunning) return;
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
        if (!gameRunning) return;
        enemyBullets.push({
            x: enemy.x + enemy.width / 2 - 2,
            y: enemy.y + enemy.height
        });
    },

    update() {
        if (!gameRunning) return;

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
                    alive: true
                });
            }
        }
    },

    update() {
        if (!gameRunning) return;

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
                }
            });
        });

        if (Math.random() < enemyFireRate) {
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
        ctx.fillStyle = "green";
        enemies.forEach(e => {
            if (e.alive) ctx.fillRect(e.x, e.y, e.width, e.height);
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
        const bunkerWidth = 60;
        const bunkerHeight = 40;
        const positions = [80, 220, 360];

        positions.forEach(x => {
            bunkers.push({
                x: x,
                y: canvas.height - 150,
                width: bunkerWidth,
                height: bunkerHeight,
                health: 6
            });
        });
    },

    update() {
        if (!gameRunning) return;

        bullets.forEach(b => {
            bunkers.forEach(bk => {
                if (
                    bk.health > 0 &&
                    b.x < bk.x + bk.width &&
                    b.x + 4 > bk.x &&
                    b.y < bk.y + bk.height &&
                    b.y + 10 > bk.y
                ) {
                    bk.health--;
                    b.y = -100;
                }
            });
        });

        enemyBullets.forEach(b => {
            bunkers.forEach(bk => {
                if (
                    bk.health > 0 &&
                    b.x < bk.x + bk.width &&
                    b.x + 4 > bk.x &&
                    b.y < bk.y + bk.height &&
                    b.y + 10 > bk.y
                ) {
                    bk.health--;
                    b.y = canvas.height + 100;
                }
            });
        });
    },

    draw() {
        bunkers.forEach(bk => {
            if (bk.health > 0) {
                ctx.fillStyle = `rgb(${50 * bk.health}, ${200 - 20 * bk.health}, 50)`;
                ctx.fillRect(bk.x, bk.y, bk.width, bk.height);
            }
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
}

/* ============================================================
   GAME OVER SCREEN
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
   END GAME (ARRÊT COMPLET)
   ============================================================ */
function endGame() {
    if (gameOverHandled) return;
    gameOverHandled = true;

    // 🔥 Stoppe TOUT immédiatement
    gameRunning = false;

    const name = prompt("Bravo ! Entre ton nom pour enregistrer ton score :");

    if (name) {
        HighScores.add(name, score, level);
        saveGlobalScore(name, score, level);
    }

    // 🔥 On dessine le Game Over APRÈS l’arrêt complet
    showGameOverScreen();
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
   GAME LOOP (ARRÊT COMPLET)
   ============================================================ */
function loop() {
    update();   // s’exécute seulement si gameRunning = true
    draw();     // dessine toujours la frame actuelle

    if (gameRunning) {
        requestAnimationFrame(loop);  // 🔥 on boucle SEULEMENT si le jeu tourne
    }
}

loop();
