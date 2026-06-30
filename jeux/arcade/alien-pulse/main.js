/* ============================================================
   ALIEN PULSE — MAIN
   ============================================================ */

function startGame() {
    // Initialisation comme avant
    initStars();
    Bunkers.init();
    Enemies.init();
    Controls.init();

    // Démarrage de la boucle de jeu
    loop();
}
