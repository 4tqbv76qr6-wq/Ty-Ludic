/* ============================================================
   GAME OVER — Breakout
   ============================================================ */

const BTN_REPLAY = { x: 140, y: 500, w: 220, h: 40 };
const BTN_QUIT   = { x: 140, y: 550, w: 220, h: 40 };

function drawRoundedButton(btn, colorFill, colorStroke, text) {
    const r = 10;

    ctx.save();
    ctx.shadowColor = colorStroke;
    ctx.shadowBlur = 15;

    ctx.fillStyle = colorFill;
    ctx.beginPath();
    ctx.moveTo(btn.x + r, btn.y);
    ctx.lineTo(btn.x + btn.w - r, btn.y);
    ctx.quadraticCurveTo(btn.x + btn.w, btn.y, btn.x + btn.w, btn.y + r);
    ctx.lineTo(btn.x + btn.w, btn.y + btn.h - r);
    ctx.quadraticCurveTo(btn.x + btn.w, btn.y + btn.h, btn.x + btn.w - r, btn.y + btn.h);
    ctx.lineTo(btn.x + r, btn.y + btn.h);
    ctx.quadraticCurveTo(btn.x, btn.y + btn.h, btn.x, btn.y + btn.h - r);
    ctx.lineTo(btn.x, btn.y + r);
    ctx.quadraticCurveTo(btn.x, btn.y, btn.x + r, btn.y);
    ctx.fill();

    ctx.strokeStyle = colorStroke;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.fillStyle = colorStroke;
    ctx.fillText(text, btn.x + 35, btn.y + 26);

    ctx.restore();
}

function drawGameOver() {
    ctx.fillStyle = "rgba(0,0,0,0.85)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#0ff";
    ctx.font = "24px 'Press Start 2P'";
    ctx.fillText("GAME OVER", 70, 80);

    ctx.font = "14px 'Press Start 2P'";
    ctx.fillText("Score : " + score, 70, 130);
    ctx.fillText("Niveau : " + level, 70, 155);

    //const list = HighScores.load();
    //ctx.fillText("TOP 10", 70, 200);

    //list.forEach((s, i) => {
        //ctx.fillStyle = (i === newScoreIndex) ? "#0ff" : "white";
        //ctx.fillText(`${s.score} pts (Niv ${s.level})`, 70, 230 + i * 18);
    //});

    drawRoundedButton(BTN_REPLAY, "#022", "#0ff", "REJOUER");
    drawRoundedButton(BTN_QUIT, "#200", "#f00", "QUITTER");

    Explosions.draw(ctx);
}
