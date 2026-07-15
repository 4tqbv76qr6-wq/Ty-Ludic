/* ============================================================
   LEVELS
   ============================================================ */
function nextLevel() {
    level++;
    levelDisplay.textContent = "Niveau : " + level;

    enemies.length = 0;
    bullets.length = 0;
    enemyBullets.length = 0;

    enemyDirection = 1;
    const rows = 3 + Math.floor(level / 2);
    const cols = 6;

    Enemies.init(rows, cols);

    enemyFireRate = Math.min(0.05, 0.02 + level * 0.005);

    popupTitle.textContent = "LEVEL " + level;
    popup.classList.remove("hidden");
    waitingForStart = true;
}
