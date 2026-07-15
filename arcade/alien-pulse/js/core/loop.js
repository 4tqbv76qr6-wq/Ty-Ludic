/* ============================================================
   GAME LOOP
   ============================================================ */
function update() {
    if (waitingForStart) return;
    if (!player.alive) return;

    Starfield.update();
    updateExplosions();
    player.update();
    Bullets.update();
    EnemyBullets.update();
    Enemies.update();
    Bunkers.update();
}



function draw() {
    Starfield.draw();


    // ⭐ Test : afficher le pseudo
    if (currentUser) {
        ctx.fillStyle = "cyan";
        ctx.font = "16px monospace";
        ctx.fillText("Joueur : " + currentUser.pseudo, 10, 20);
    }

if (currentUser) {
 currentUser.scoreGlobal = 9999;   // ⭐ TEST
            User.saveData();                  // ⭐ Sauvegarde
    ctx.fillStyle = "cyan";
    ctx.font = "16px monospace";
    ctx.fillText("Joueur : " + currentUser.pseudo, 10, 20);
    ctx.fillText("Global : " + currentUser.scoreGlobal, 10, 40);
ctx.fillText("Global : " + currentUser.scoreGlobal, 10, 40);

}

    if (!player.alive) {
        if (!gameOverHandled) {
            if (currentUser) {
                //User.addScore("spaceInvader", score);
                 User.addScore("spaceInvader", 500);
                 currentUser.scoreGlobal = 9999;   // ⭐ TEST
            User.saveData();                  // ⭐ Sauvegarde
            }
            gameOverHandled = true;
        }

        showGameOverScreen();
        return;
    }


    player.draw();
    Bunkers.draw();
    Bullets.draw();
    Enemies.draw();
    EnemyBullets.draw();
    drawExplosions();
}



    


function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}
