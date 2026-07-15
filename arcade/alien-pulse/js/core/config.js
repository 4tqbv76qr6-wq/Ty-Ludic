/* ============================================================
   CANVAS + RESPONSIVE
   ============================================================ */
function resizeGame() {
    const wrapper = document.querySelector(".canvas-wrapper");
    const canvas = document.getElementById("game");

    const ratio = 500 / 600;
    const width = wrapper.clientWidth;
    const height = width / ratio;

    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
}

window.addEventListener("resize", resizeGame);
window.addEventListener("orientationchange", resizeGame);
window.addEventListener("load", resizeGame);

/* ============================================================
   CANVAS
   ============================================================ */
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
