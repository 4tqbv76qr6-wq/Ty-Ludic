/* ============================================================
   PLAYER BULLETS
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
