/* ============================================================
   STARFIELD — Module commun TY‑LUDIC
   ============================================================ */

window.Starfield = {
    stars: [],

    init(count = 80) {
        this.stars.length = 0;
        for (let i = 0; i < count; i++) {
            this.stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2 + 1,
                speed: Math.random() * 0.5 + 0.2
            });
        }
    },

    update() {
        this.stars.forEach(s => {
            s.y += s.speed;
            if (s.y > canvas.height) {
                s.y = 0;
                s.x = Math.random() * canvas.width;
            }
        });
    },

    draw() {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#0ff";
        this.stars.forEach(s => ctx.fillRect(s.x, s.y, s.size, s.size));
    }
};

// Initialisation automatique
Starfield.init();
