/* ============================================================
   ENEMY BULLETS — Version équilibrée (direction + vitesse + bouclier)
   ============================================================ */

const enemyBullets = [];

const EnemyBullets = {

    fire(enemy) {
        if (!player.alive) return;

        // Direction vers le joueur
        let angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);

        // Légère dispersion pour éviter l'injouabilité
        angle += (Math.random() * 0.4 - 0.2); // ±0.2 rad

        // Variation de vitesse
        const speed = 2 + Math.random() * 2; // entre 2 et 4

        enemyBullets.push({
            x: enemy.x + enemy.width / 2 - 2,
            y: enemy.y + enemy.height,
            dx: Math.cos(angle) * speed,
            dy: Math.sin(angle) * speed
        });
    },

    update() {

        /* ============================================================
           Déplacement des tirs
        ============================================================ */
        enemyBullets.forEach(b => {
            b.x += b.dx;
            b.y += b.dy;
        });

        /* ============================================================
           Suppression hors écran
        ============================================================ */
        for (let i = enemyBullets.length - 1; i >= 0; i--) {
            if (
                enemyBullets[i].x < -20 ||
                enemyBullets[i].x > canvas.width + 20 ||
                enemyBullets[i].y > canvas.height + 20
            ) {
                enemyBullets.splice(i, 1);
            }
        }

        /* ============================================================
           Collision avec le joueur + Bouclier évolutif
        ============================================================ */
        enemyBullets.forEach(b => {

            if (
                b.x < player.x + player.width &&
                b.x + 4 > player.x &&
                b.y < player.y + player.height &&
                b.y + 10 > player.y
            ) {

                /* ============================================================
                   ⭐ Bouclier actif → absorbe le tir
                ============================================================ */
                if (player.shieldActive) {

                    player.shield--;

                    // Impact visuel
                    addExplosion(
                        player.x + player.width / 2,
                        player.y + player.height / 2
                    );

                    // Bouclier épuisé ?
                    if (player.shield <= 0) {
                        player.shieldActive = false;
                    }

                    // Supprimer le tir
                    b.y = canvas.height + 100;
                    return;
                }

                /* ============================================================
                   ⭐ Pas de bouclier → Game Over
                ============================================================ */
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
