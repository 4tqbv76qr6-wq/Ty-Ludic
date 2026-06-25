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
