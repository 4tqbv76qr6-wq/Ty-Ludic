/* ============================================================
   MODULE SCORES — TY‑LUDIC
   ============================================================ */

window.Scores = (function () {

    let score = 0;
    let level = 1;
    let gameOver = false;
    let newScoreIndex = -1;

    const scoreDisplay = document.getElementById("score");
    const levelDisplay = document.getElementById("level");
    const bestDisplay  = document.getElementById("best");

    /* ============================================================
       HIGH SCORES (localStorage)
       ============================================================ */
    const HighScores = {
        load() {
            return JSON.parse(localStorage.getItem("breakout_scores") || "[]");
        },

        save(list) {
            localStorage.setItem("breakout_scores", JSON.stringify(list));
        },

        add(name, score, level) {
            const list = this.load();
            list.push({ name, score, level });
            list.sort((a, b) => b.score - a.score);
            const trimmed = list.slice(0, 10);
            this.save(trimmed);
            return trimmed.findIndex(s => s.score === score && s.level === level);
        },

        best() {
            const list = this.load();
            return list.length ? list[0].score : 0;
        }
    };

    /* ============================================================
       HUD
       ============================================================ */
    function updateHud() {
        scoreDisplay.textContent = "Score : " + score;
        levelDisplay.textContent = "Niveau : " + level;
        bestDisplay.textContent  = "Record : " + HighScores.best();
    }

    /* ============================================================
       API publique
       ============================================================ */
    return {

        get score() { return score; },
        get level() { return level; },
        get gameOver() { return gameOver; },
        get newScoreIndex() { return newScoreIndex; },

        addPoints(pts) {
            score += pts;
            updateHud();
        },

        nextLevel() {
            level++;
            updateHud();
        },

        endGame() {
            gameOver = true;
            newScoreIndex = HighScores.add("player", score, level);
            updateHud();
        },

        reset() {
            score = 0;
            level = 1;
            gameOver = false;
            newScoreIndex = -1;
            updateHud();
        },

        highscores: HighScores,
        updateHud
    };

})();
