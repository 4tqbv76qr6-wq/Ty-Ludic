alert("ScoreManager chargé");

const ScoreManager = {

    // Cache local pour éviter les appels Firebase inutiles
    cache: {},

    async load(gameName) {
        alert("ScoreManager.load() : " + gameName);

        // Si déjà chargé → pas d'appel Firebase
        if (this.cache[gameName] !== undefined) {
            alert("Score déjà en cache : " + this.cache[gameName]);
            return this.cache[gameName];
        }

        // Vérification de l'authentification
        if (!window.auth || !window.auth.currentUser) {
            alert("ERREUR : utilisateur non connecté");
            this.cache[gameName] = 0;
            return 0;
        }

        const uid = window.auth.currentUser.uid;

        // Chemin Firestore correct (important !)
        const ref = window.doc(window.db, gameName + "_scores/" + uid);

        alert("Lecture Firebase : " + ref.path);

        const snap = await window.getDoc(ref);

        if (snap.exists()) {
            const best = snap.data().bestScore || 0;
            alert("Score Firebase trouvé : " + best);
            this.cache[gameName] = best;
            return best;
        }

        alert("Aucun score Firebase → 0");
        this.cache[gameName] = 0;
        return 0;
    },

    async update(gameName, newScore, pseudo) {
        alert("update() : début");

        alert("gameName = " + gameName);
        alert("newScore = " + newScore);
        alert("pseudo = " + pseudo);

        // Vérification auth
        if (!window.auth || !window.auth.currentUser) {
            alert("ERREUR : utilisateur non connecté");
            alert("update() : fin");
            return;
        }

        const uid = window.auth.currentUser.uid;

        // Charger le record actuel
        const currentBest = await this.load(gameName);

        alert("Record actuel = " + currentBest);
        alert("Nouveau score = " + newScore);

        // Si record non battu → ne rien faire
        if (newScore <= currentBest) {
            alert("Record NON battu → aucune mise à jour Firebase");
            alert("update() : fin");
            return;
        }

        alert("Record battu → mise à jour Firebase");

        // Chemin Firestore correct
        const ref = window.doc(window.db, gameName + "_scores/" + uid);

        await window.setDoc(ref, {
            bestScore: newScore,
            pseudo: pseudo,
            updated: Date.now()
        });

        // Mise à jour du cache
        this.cache[gameName] = newScore;

        alert("Firebase mis à jour !");
        alert("update() : fin");
    }
};

window.ScoreManager = ScoreManager;



