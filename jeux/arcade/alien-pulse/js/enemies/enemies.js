/* ============================================================
   ENEMIES
   ============================================================ */
const enemies = [];
const enemyWidth = 40;
const enemyHeight = 20;
let enemyDirection = 1;

/* ============================================================
   BONUS ALIEN
   ============================================================ */
let bonusAlien = {
    x: -100,
    y: 30,              // plus bas
    width: 40,
    height: 20,
    speed: 2,           // moins rapide
    active: false,
    direction: 1
};

function spawnBonusAlien() {
    if (bonusAlien.active) return;

    // apparition moins fréquente
    if (Math.random() < 0.004) { // 0.4% par frame
        bonusAlien.active = true;

        if (Math.random() < 0.5) {
            bonusAlien.x = -bonusAlien.width;
            bonusAlien.direction = 1;
        } else {
            bonusAlien.x = canvas.width + bonusAlien.width;
            bonusAlien.direction = -1;
        }

        bonusAlien.y = 30;
    }
}

function drawBonusAlien() {
    ctx.fillStyle = "magenta";

    const x = bonusAlien.x;
    const y = bonusAlien.y;

    // forme arcade stylée
    ctx.fillRect(x + 10, y, 20, 6);      // tête
    ctx.fillRect(x + 4, y + 6, 32, 8);   // corps
    ctx.fillRect(x + 16, y + 14, 8, 6);  // queue
}

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
                    frame: 0,
                    shootCooldown: 50 + Math.random() * 80
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

                    const previousScore = score;
                    score += 10;

                    scoreDisplay.textContent = "Score : " + score;
                    bestDisplay.textContent = "Record : " + HighScores.best();

                    addExplosion(e.x + e.width / 2, e.y + e.height / 2);

                    /* ============================================================
                       ⭐ Bouclier fiable : activation si palier franchi
                    ============================================================ */
                    const previousTier = Math.floor(previousScore / 300);
                    const newTier = Math.floor(score / 300);

                    if (previousTier !== newTier) {
                        if (player.shieldActive) {
                            player.shield += 2;
                        } else {
                            player.shield = 2;
                            player.shieldActive = true;
                        }
                        player.shieldHitTimer = 10;
                    }
                }
            });
        });

        /* ============================================================
           BONUS ALIEN UPDATE
        ============================================================ */
        spawnBonusAlien();

        if (bonusAlien.active) {
            bonusAlien.x += bonusAlien.speed * bonusAlien.direction;

            if (bonusAlien.x < -100 || bonusAlien.x > canvas.width + 100) {
                bonusAlien.active = false;
            }

            bullets.forEach(b => {
                if (
                    b.x < bonusAlien.x + bonusAlien.width &&
                    b.x + 4 > bonusAlien.x &&
                    b.y < bonusAlien.y + bonusAlien.height &&
                    b.y + 10 > bonusAlien.y
                ) {
                    bonusAlien.active = false;
                    b.y = -100;

                    const previousScore = score;
                    score += 50;

                    scoreDisplay.textContent = "Score : " + score;
                    bestDisplay.textContent = "Record : " + HighScores.best();

                    addExplosion(
                        bonusAlien.x + bonusAlien.width / 2,
                        bonusAlien.y + bonusAlien.height / 2
                    );

                    /* ============================================================
                       ⭐ Bouclier fiable pour bonus alien
                    ============================================================ */
                    const previousTier = Math.floor(previousScore / 300);
                    const newTier = Math.floor(score / 300);

                    if (previousTier !== newTier) {
                        if (player.shieldActive) {
                            player.shield += 2;
                        } else {
                            player.shield = 2;
                            player.shieldActive = true;
                        }
                        player.shieldHitTimer = 10;
                    }
                }
            });
        }

        /* ============================================================
           Tirs ennemis
        ============================================================ */
        const MAX_ENEMY_BULLETS = 8;

        enemies.forEach(e => {
            if (!e.alive || !player.alive) return;

            e.shootCooldown--;

            if (e.shootCooldown <= 0) {
                if (Math.random() < 0.4) {
                    if (enemyBullets.length < MAX_ENEMY_BULLETS) {

                        const angle = Math.atan2(
                            player.y - e.y,
                            player.x - e.x
                        ) + (Math.random() * 0.4 - 0.2);

                        const speed = 2 + Math.random() * 2;

                        enemyBullets.push({
                            x: e.x + e.width / 2 - 2,
                            y: e.y + e.height,
                            dx: Math.cos(angle) * speed,
                            dy: Math.sin(angle) * speed
                        });
                    }
                }

                e.shootCooldown = 50 + Math.random() * 80;
            }
        });

        if (enemies.every(e => !e.alive)) {
            nextLevel();
        }
    },

    draw() {
        enemies.forEach(e => {
            if (e.alive) drawAlien(e);
        });

        if (bonusAlien.active) {
            drawBonusAlien();
        }
    }
};
