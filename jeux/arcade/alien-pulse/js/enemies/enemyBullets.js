/* ============================================================
   ENEMY BULLETS — Version dynamique (cooldown + direction + vitesse)
   ============================================================ */

const enemyBullets = [];

const EnemyBullets = {

    fire(enemy) {
        if (!player.alive) return;

        // Calcul direction vers le joueur
        const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);

        // Variation de vitesse
        const speed = 2 + Math.random() * 3; // entre 2 et 5

        enemyBullets.push({
            x: enemy.x + enemy.width / 2 - 2,
            y: enemy.y + enemy.height,
            dx: Math.cos(angle) * speed,
            dy: Math.sin(angle) * speed
        });
    },

    update() {
        // Déplacement des tirs
        enemyBullets.forEach(b => {
            b.x += b.dx;
            b.y += b.dy;
        });

        // Suppression hors écran
        for (let i = enemyBullets.length - 1; i >= 0; i--) {
            if (
                enemyBullets[i].x < -20 ||
                enemyBullets[i].x > canvas.width + 20 ||
                enemyBullets[i].y > canvas.height + 20
            ) {
                enemyBullets.splice(i, 1);
            }
        }

        // Collision joueur
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
