/* ============================================================
   MODULE EXPLOSIONS — TY‑LUDIC
   ============================================================ */

window.Explosions = (function () {

    const list = [];

    function add(x, y) {
        list.push({
            x,
            y,
            frame: 0,
            maxFrame: 8,
            size: 10
        });
    }

    function update() {
        for (let i = list.length - 1; i >= 0; i--) {
            const ex = list[i];
            ex.frame++;
            if (ex.frame > ex.maxFrame) {
                list.splice(i, 1);
            }
        }
    }

    function draw(ctx) {
        list.forEach(ex => {
            const p = ex.frame / ex.maxFrame;
            const alpha = 1 - p;
            const size = ex.size + p * 20;

            ctx.fillStyle = `rgba(255, 200, 0, ${alpha})`;
            ctx.beginPath();
            ctx.arc(ex.x, ex.y, size, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    return {
        add,
        update,
        draw
    };

})();
