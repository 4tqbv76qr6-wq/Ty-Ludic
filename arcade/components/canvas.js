// ============================================================
// CANVAS — module simple et indépendant
// ============================================================

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// GAME_WIDTH et GAME_HEIGHT viennent du responsive
canvas.width = GAME_WIDTH;
canvas.height = GAME_HEIGHT;

// On expose canvas et ctx en global (comme avant)
window.canvas = canvas;
window.ctx = ctx;
