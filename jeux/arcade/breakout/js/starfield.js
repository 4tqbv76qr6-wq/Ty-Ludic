// ============================================================
// STARFIELD — version intacte (avec fond noir)
// ============================================================

window.stars = [];

window.initStars = function(count = 80) {
    stars.length = 0;
    for (let i = 0; i < count; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 1,
            speed: Math.random() * 0.5 + 0.2
        });
    }
};

window.updateStars = function() {
    stars.forEach(s => {
        s.y += s.speed;
        if (s.y > canvas.height) {
            s.y = 0;
            s.x = Math.random() * canvas.width;
        }
    });
};

window.drawStars = function() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#0ff";
    stars.forEach(s => ctx.fillRect(s.x, s.y, s.size, s.size));
};

initStars();
