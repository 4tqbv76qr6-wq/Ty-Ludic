/* ============================================================
   GAME OVER
   ============================================================ */
function showGameOverScreen() {
    ctx.fillStyle = "rgba(0,0,0,0.8)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#0ff";
    ctx.font = "28px 'Press Start 2P'";
    ctx.fillText("GAME OVER", 80, 200);

    ctx.font = "16px 'Press Start 2P'";
    ctx.fillText("Score : " + score, 120, 260);
    ctx.fillText("Niveau : " + level, 120, 300);

    ctx.fillText("▶ Rejouer", 120, 380);
    ctx.fillText("◀ Menu", 120, 430);
}

function endGame() {
    if (gameOverHandled) return;
    gameOverHandled = true;

    player.alive = false;

    const index = HighScores.add(score, level);

    showHighScores(index);

    canvas.addEventListener("click", handleGameOverClick);
}

function handleGameOverClick(e) {
    const y = e.offsetY;

    if (y > 350 && y < 400) {
        document.location.reload();
    }

    if (y > 410 && y < 460) {
        window.location.href = "menu.html";
    }
}
