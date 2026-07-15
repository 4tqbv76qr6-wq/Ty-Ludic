/* ============================================================
   BUNKERS
   ============================================================ */
const bunkers = [];

const Bunkers = {
    init() {
        const positions = [80, 220, 360];
        const blockSize = 8;

        positions.forEach(x => {
            const blocks = [];

            const pattern = [
                "0111110",
                "1111111",
                "1111111",
                "1110111",
                "1100011"
            ];

            for (let row = 0; row < pattern.length; row++) {
                for (let col = 0; col < pattern[row].length; col++) {
                    if (pattern[row][col] === "1") {
                        blocks.push({
                            x: x + col * blockSize,
                            y: canvas.height - 150 + row * blockSize,
                            size: blockSize,
                            alive: true
                        });
                    }
                }
            }

            bunkers.push(blocks);
        });
    },

    update() {
        bullets.forEach(b => {
            bunkers.forEach(blocks => {
                blocks.forEach(bl => {
                    if (
                        bl.alive &&
                        b.x < bl.x + bl.size &&
                        b.x + 4 > bl.x &&
                        b.y < bl.y + bl.size &&
                        b.y + 10 > bl.y
                    ) {
                        bl.alive = false;
                        b.y = -100;
                    }
                });
            });
        });

        enemyBullets.forEach(b => {
            bunkers.forEach(blocks => {
                blocks.forEach(bl => {
                    if (
                        bl.alive &&
                        b.x < bl.x + bl.size &&
                        b.x + 4 > bl.x &&
                        b.y < bl.y + bl.size &&
                        b.y + 10 > bl.y
                    ) {
                        bl.alive = false;
                        b.y = canvas.height + 100;
                    }
                });
            });
        });
    },

    draw() {
        ctx.fillStyle = "rgb(60, 200, 60)";

        bunkers.forEach(blocks => {
            blocks.forEach(bl => {
                if (bl.alive) {
                    ctx.fillRect(bl.x, bl.y, bl.size, bl.size);
                }
            });
        });
    }
};
