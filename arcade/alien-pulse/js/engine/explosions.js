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
