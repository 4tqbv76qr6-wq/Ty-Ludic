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
                    frame: 0,

                    // ⭐ Cooldown individuel équilibré
                    shootCooldown: 50 + Math.random() * 80 // entre 0.8s et 2s
                });
            }
        }
    },

    update() {
        // Déplacement horizontal
        enemies.forEach(e => {
            if (e.alive) e.x += enemyDirection;
        });

        // Changement de direction + descente
        const hitEdge = enemies.some(e =>
            e.alive && (e.x <= 0 || e.x >= canvas.width - enemyWidth)
        );

        if (hitEdge) {
            enemyDirection *= -1;
            enemies.forEach(e => e.y += 20);
        }

        // Collision avec les tirs du joueur
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

                    /* ============================================================
                       ⭐ Activation du bouclier tous les 300 points
                    ============================================================ */
                    if (score % 300=== 0) {

                        // Bouclier déjà actif → cumul +10
                        if (player.shieldActive) {
                            player.shield += 2;
                        }

                        // Bouclier inactif → activation à 10
                        else {
                            player.shield = 2;
                            player.shieldActive = true;
                        }

                        // Flash d’activation
                        player.shieldHitTimer = 10;
                    }
                }
            });
        });

        /* ============================================================
           ⭐ Tirs ennemis équilibrés
        ============================================================ */

        const MAX_ENEMY_BULLETS = 7; // limite dure → jouable

        enemies.forEach(e => {
            if (!e.alive || !player.alive) return;

            e.shootCooldown--;

            if (e.shootCooldown <= 0) {

                // ⭐ Probabilité de tir (évite le spam)
                if (Math.random() < 0.4) { // 40% de chance de tirer
                    if (enemyBullets.length < MAX_ENEMY_BULLETS) {

                        // ⭐ Tir directionnel adouci
                        const angle = Math.atan2(
                            player.y - e.y,
                            player.x - e.x
                        ) + (Math.random() * 0.4 - 0.2); // ± 0.2 rad de dispersion

                        const speed = 2 + Math.random() * 2; // vitesse entre 2 et 4

                        enemyBullets.push({
                            x: e.x + e.width / 2 - 2,
                            y: e.y + e.height,
                            dx: Math.cos(angle) * speed,
                            dy: Math.sin(angle) * speed
                        });
                    }
                }

                // ⭐ Cooldown réinitialisé
                e.shootCooldown = 50 + Math.random() * 80;
            }
        });

        // Niveau suivant
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
