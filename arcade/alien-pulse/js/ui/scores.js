/* ============================================================
   HIGH SCORES
   ============================================================ */
const HighScores = {
    load() {
        return JSON.parse(localStorage.getItem("highscores") || "[]");
    },

    save(list) {
        localStorage.setItem("highscores", JSON.stringify(list));
    },

    add(score, level) {
        const list = this.load();

        const entry = {
            score,
            level,
            date: new Date().toLocaleString()
        };

        list.push(entry);
        list.sort((a, b) => b.score - a.score);

        const index = list.indexOf(entry);

        this.save(list.slice(0, 10));

        return index;
    },

    best() {
        const list = this.load();
        return list.length > 0 ? list[0].score : 0;
    }
};

bestDisplay.textContent = "Record : " + HighScores.best();

/* ============================================================
   AFFICHAGE DES SCORES
   ============================================================ */
function showHighScores(highlightIndex = -1) {
    const div = document.getElementById("highscores");
    const list = HighScores.load();

    div.innerHTML = "<h3>Meilleurs Scores</h3>";

    list.forEach((s, i) => {
        const style = (i === highlightIndex)
            ? "color:#0ff; font-weight:bold; text-shadow:0 0 10px #0ff;"
            : "color:white;";

        div.innerHTML += `<div style="${style}">
            ${s.score} pts — Niv ${s.level} — ${s.date}
        </div>`;
    });
}
