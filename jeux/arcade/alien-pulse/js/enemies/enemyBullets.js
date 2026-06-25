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
