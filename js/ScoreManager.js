// ScoreManager.js
import { auth, db } from "../firebase/firebase-init.js";
import { doc, setDoc, getDoc } 
    from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

export const ScoreManager = {

    // Charge le score local ou Firebase si absent
    async load(gameName) {
        const user = auth.currentUser;
        if (!user) return 0;

        const key = `score_${user.uid}_${gameName}`;
        const local = localStorage.getItem(key);

        if (local !== null) {
            return parseInt(local);
        }

        // Sinon, on va chercher dans Firebase une seule fois
        const ref = doc(db, `${gameName}_scores`, user.uid);
        const snap = await getDoc(ref);

        const remoteScore = snap.exists() ? snap.data().score : 0;

        localStorage.setItem(key, remoteScore);
        return remoteScore;
    },

    // Lire le score local
    get(gameName) {
        const user = auth.currentUser;
        if (!user) return 0;

        const key = `score_${user.uid}_${gameName}`;
        return parseInt(localStorage.getItem(key)) || 0;
    },

    // Mettre à jour le score local + Firebase si battu
    async update(gameName, newScore, pseudo) {
        const user = auth.currentUser;
        if (!user) return false;

        const key = `score_${user.uid}_${gameName}`;
        const localScore = parseInt(localStorage.getItem(key)) || 0;

        if (newScore <= localScore) {
            return false; // Pas de mise à jour
        }

        // Mise à jour locale
        localStorage.setItem(key, newScore);

        // Tentative de sync Firebase
        try {
            const now = new Date();
            const date = now.toLocaleDateString("fr-FR");

            const ref = doc(db, `${gameName}_scores`, user.uid);

            await setDoc(ref, {
                score: newScore,
                date,
                pseudo,
                uid: user.uid
            });

            return true;

        } catch (e) {
            // Mode offline → sync plus tard
            localStorage.setItem(`pending_${key}`, "true");
            return false;
        }
    },

    // Synchronisation offline
    async sync(gameName, pseudo) {
        const user = auth.currentUser;
        if (!user) return;

        const key = `score_${user.uid}_${gameName}`;
        const pending = localStorage.getItem(`pending_${key}`);

        if (pending !== "true") return;

        const score = parseInt(localStorage.getItem(key));
        if (!score) return;

        try {
            const now = new Date();
            const date = now.toLocaleDateString("fr-FR");

            const ref = doc(db, `${gameName}_scores`, user.uid);

            await setDoc(ref, {
                score,
                date,
                pseudo,
                uid: user.uid
            });

            localStorage.removeItem(`pending_${key}`);

        } catch (e) {
            // Toujours offline → on réessaiera plus tard
        }
    }
};
