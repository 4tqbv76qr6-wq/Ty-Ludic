/* ============================================================
   TOUCH CONTROLS
   ============================================================ */
const Controls = {
    init() {
        const left = document.getElementById("left");
        const right = document.getElementById("right");
        const fire = document.getElementById("fire");

        left.addEventListener("touchstart", () => player.movingLeft = true);
        left.addEventListener("touchend", () => player.movingLeft = false);

        right.addEventListener("touchstart", () => player.movingRight = true);
        right.addEventListener("touchend", () => player.movingRight = false);

        fire.addEventListener("touchstart", () => Bullets.fire());
    }
};
