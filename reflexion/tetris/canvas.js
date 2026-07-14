/* ============================================================
   CANVAS — VERSION STABLE POUR KODER
   ============================================================ */

window.COLS = 10;
window.ROWS = 20;
window.BLOCK = 36;

/*
    Grille Tetris : 20 × 36 = 720 px
    Zone Game Over : 200 px
    Marges TY‑LUDIC : 40 px
    Hauteur totale : 720 + 200 + 40 = 960 px
*/

window.canvas = document.getElementById("game");
//canvas.width  = COLS * BLOCK + 130;   // 490 px
//canvas.height = ROWS * BLOCK + 240;   // 960 px
canvas.width  = COLS * BLOCK + 40;   // 490 px
canvas.height = ROWS * BLOCK + 60;   // 960 px
window.ctx = canvas.getContext("2d");

/* ============================================================
   OFFSETS TY‑LUDIC
   ============================================================ */

//window.offsetX = (canvas.width - COLS * BLOCK) / 2;
//window.offsetY = (canvas.height - ROWS * BLOCK) / 2;
window.offsetX = (canvas.width  - COLS * BLOCK) / 2;
 window.offsetY = 30;   // ⭐ marge haute légèrement augmentée (20 → 30)

/* ============================================================
   ZONE GAME OVER
   ============================================================ */

window.GAMEOVER_Y = offsetY + ROWS * BLOCK + 20;
window.GAMEOVER_H = 200;

/* ============================================================
   RESPONSIVE — VERSION CORRECTE
   ============================================================ */

window.resizeGame = function() {
    const wrapper = document.querySelector(".canvas-wrapper");
    const width = wrapper.clientWidth;

    const ratio = canvas.width / canvas.height;
    let height = width / ratio;

    // ⭐ On respecte la hauteur réelle du canvas
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
};

window.addEventListener("resize", resizeGame);
window.addEventListener("orientationchange", resizeGame);
window.addEventListener("load", resizeGame);
