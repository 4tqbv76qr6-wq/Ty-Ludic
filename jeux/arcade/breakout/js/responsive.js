// ============================================================
// RESPONSIVE — AUTO SCALE GLOBAL
// ============================================================

window.GAME_WIDTH = 500;
window.GAME_HEIGHT = 600;
window.CURRENT_SCALE = 1;



// ============================================================
// AUTO SCALE
// ============================================================

window.autoScaleGame = function () {
    const wrapper = document.getElementById("game-wrapper");

    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    const scale = Math.min(
        screenW / GAME_WIDTH,
        screenH / GAME_HEIGHT,
        1.2
    );

    CURRENT_SCALE = scale;

    wrapper.style.transform = `scale(${scale})`;
    wrapper.style.transformOrigin = "top left";
};

window.addEventListener("resize", autoScaleGame);
window.addEventListener("orientationchange", autoScaleGame);
window.addEventListener("load", () => {
    autoScaleGame();
    updateHud(); // reste dans game.js
});
