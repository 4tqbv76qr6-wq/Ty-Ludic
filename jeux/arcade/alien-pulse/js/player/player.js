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

    // Bouclier évolutif
    shield: 0,
    shieldActive: false,
    shieldHitTimer: 0, // flash d’impact

    update() {
        if (!this.alive) return;

        if (this.movingLeft && this.x > 0) this.x -= this.speed;
        if (this.movingRight && this.x < canvas.width - this.width) this.x += this.speed;

        this.flameFrame = (this.flameFrame + 1) % 20;

        // Timer du flash d’impact
        if (this.shieldHitTimer > 0) {
            this.shieldHitTimer--;
        }
    },

    draw() {
        const x = this.x;
        const y = this.y;

        /* ============================================================
           Vaisseau
        ============================================================ */
        ctx.fillStyle = "white";
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

        /* ============================================================
           ⭐ Effet visuel du bouclier : halo néon pulsant
        ============================================================ */
        if (this.shieldActive) {

            // Pulsation (oscillation entre -2 et +2 pixels)
            const pulse = Math.sin(Date.now() / 120) * 2;

            ctx.save();
            ctx.strokeStyle = "cyan";
            ctx.lineWidth = 3;
            ctx.shadowColor = "cyan";
            ctx.shadowBlur = 15;

            ctx.beginPath();
            ctx.arc(
                x + this.width / 2,
                y + this.height / 2,
                this.width + pulse,
                0, Math.PI * 2
            );
            ctx.stroke();
            ctx.restore();
        }

        /* ============================================================
           ⭐ Flash d’impact quand le bouclier encaisse un tir
        ============================================================ */
        if (this.shieldHitTimer > 0) {
            ctx.save();
            ctx.fillStyle = "rgba(0,255,255,0.25)";
            ctx.beginPath();
            ctx.arc(
                x + this.width / 2,
                y + this.height / 2,
                this.width + 6,
                0, Math.PI * 2
            );
            ctx.fill();
            ctx.restore();
        }
    }
};
