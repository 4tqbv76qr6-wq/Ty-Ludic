// ScoreManager.js SANS export, juste pour test
alert("ScoreManager chargé");

const ScoreManager = {
    async update(gameName, newScore, pseudo) {
        alert("update() : début");

        alert("gameName = " + gameName);
        alert("newScore = " + newScore);
        alert("pseudo = " + pseudo);

        alert("update() : fin");
    }
};

window.ScoreManager = ScoreManager;



