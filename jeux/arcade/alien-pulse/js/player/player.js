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

    update() {
        if (!this.alive) return;

        if (this.movingLeft && this.x > 0) this.x -= this.speed;
        if (this.movingRight && this.x < canvas.width - this.width) this.x += this.speed;

        this.flameFrame = (this.flameFrame + 1) % 20;
    },

    draw() {
        ctx.fillStyle = "white";

        const x = this.x;
        const y = this.y;

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
    }
};
