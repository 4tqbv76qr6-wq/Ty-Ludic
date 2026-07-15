/* ============================================================
   ALIEN PULSE — MAIN
   ============================================================ */

function startGame() {
    Starfield.init();     // ⭐ Nouveau starfield commun
    Bunkers.init();
    Enemies.init();
    Controls.init();

    loop();
}
