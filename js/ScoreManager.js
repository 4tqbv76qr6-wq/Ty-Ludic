// ScoreManager.js SANS export, juste pour test
alert("ScoreManager chargé");
alert("window.db = " + window.db);
alert("typeof window.db = " + typeof window.db);
alert("window.db.constructor = " + (window.db && window.db.constructor.name));


const ScoreManager = {
    async update(gameName, newScore, pseudo) {
alert("window.db = " + window.db);
alert("typeof window.db = " + typeof window.db);
alert("window.db.constructor = " + (window.db && window.db.constructor.name));

        alert("update() : début");

        alert("gameName = " + gameName);
        alert("newScore = " + newScore);
        alert("pseudo = " + pseudo);

        alert("update() : fin");
    }
};

window.ScoreManager = ScoreManager;



