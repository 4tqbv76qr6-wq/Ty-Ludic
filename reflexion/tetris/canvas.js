/* ============================================================
   CANVAS — VERSION MODULE ES
   ============================================================ */

export const COLS = 10;
export const ROWS = 20;
export const BLOCK = 36;

/*
    Grille Tetris : 20 × 36 = 720 px
    Zone Game Over : 200 px
    Marges TY‑LUDIC : 40 px
    Hauteur totale : 720 + 200 + 40 = 960 px
*/

export const canvas = document.getElementById("game");

canvas.width  = COLS * BLOCK + 40;
canvas.height = ROWS * BLOCK + 60;

export const ctx = canvas.getContext("2d");

/* ============================================================
   OFFSETS TY‑LUDIC
   ============================================================ */

export const offsetX = (canvas.width - COLS * BLOCK) / 2;
export const offsetY = 30;

/* ============================================================
   ZONE GAME OVER
   ============================================================ */

export const GAMEOVER_Y = offsetY + ROWS * BLOCK + 20;
export const GAMEOVER_H = 200;

/* ============================================================
   RESPONSIVE — VERSION MODULE
   ============================================================ */

export function resizeGame() {
    const wrapper = document.querySelector(".canvas-wrapper");
    const width = wrapper.clientWidth;

    const ratio = canvas.width / canvas.height;
    let height = width / ratio;

    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
}

window.addEventListener("resize", resizeGame);
window.addEventListener("orientationchange", resizeGame);
window.addEventListener("load", resizeGame);
