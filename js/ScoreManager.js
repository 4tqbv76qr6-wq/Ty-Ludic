// ScoreManager.js
import { auth, db } from "../firebase/firebase-init.js";
import { doc, setDoc, getDoc } 
    from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

export const ScoreManager = {

    // Charge le score local ou Firebase si absent
    async load(gameName) {
        debugLog(`[LOAD] Appel load(${gameName})`);

        const user = auth.currentUser;
        debugLog(`[LOAD] user = ${user ? user.uid : "NULL"}`);

        if (!user) {
            debugLog("[LOAD] Aucun utilisateur connecté → retour 0");
            return 0;
        }

        const key = `score_${user.uid}_${gameName}`;
        const local = localStorage.getItem(key);

        debugLog(`[LOAD] localStorage(${key}) = ${local}`);

        if (local !== null) {
            debugLog("[LOAD] Score local trouvé → retour local");
            return parseInt(local);
        }

        // Sinon, on va chercher dans Firebase une seule fois
        const ref = doc(db, `${gameName}_scores`, user.uid);
        debugLog(`[LOAD] ref = ${gameName}_scores/${user.uid}`);

        const snap = await getDoc(ref);

        const remoteScore = snap.exists() ? snap.data().score : 0;
        debugLog(`[LOAD] remoteScore = ${remoteScore}`);

        localStorage.setItem(key, remoteScore);
        debugLog("[LOAD] Score remote stocké en local");

        return remoteScore;
    },

    // Lire le score local
    get(gameName) {
        const user = auth.currentUser;
        debugLog(`[GET] user = ${user ? user.uid : "NULL"}`);

        if (!user) return 0;

        const key = `score_${user.uid}_${gameName}`;
        const val = parseInt(localStorage.getItem(key)) || 0;

        debugLog(`[GET] localStorage(${key}) = ${val}`);

        return val;
    },

    // Mettre à jour le score local + Firebase si battu
    async update(gameName, newScore, pseudo) {
        debugLog(`[UPDATE] Appel update(${gameName}, ${newScore})`);

        const user = auth.currentUser;
        debugLog(`[UPDATE] user = ${user ? user.uid : "NULL"}`);

        if (!user) {
            debugLog("[UPDATE] Aucun utilisateur connecté → STOP");
            return false;
        }

        const key = `score_${user.uid}_${gameName}`;
        const localScore = parseInt(localStorage.getItem(key)) || 0;

        debugLog(`[UPDATE] localScore = ${localScore}`);

        if (newScore <= localScore) {
            debugLog("[UPDATE] Score non battu → STOP");
            return false;
        }

        // Mise à jour locale
        localStorage.setItem(key, newScore);
        debugLog("[UPDATE] Score local mis à jour");

        // Tentative de sync Firebase
        try {
            const now = new Date();
            const date = now.toLocaleDateString("fr-FR");

            const ref = doc(db, `${gameName}_scores`, user.uid);
            debugLog(`[UPDATE] ref = ${gameName}_scores/${user.uid}`);

            await setDoc(ref, {
                score: newScore,
                date,
                pseudo,
                uid: user.uid
            });

            debugLog("[UPDATE] setDoc OK → Score écrit dans Firebase");
            return true;

        } catch (e) {
            debugLog(`[UPDATE] ERREUR setDoc : ${e.message}`);
            localStorage.setItem(`pending_${key}`, "true");
            return false;
        }
    },

    // Synchronisation offline
    async sync(gameName, pseudo) {
        debugLog(`[SYNC] Appel sync(${gameName})`);

        const user = auth.currentUser;
        debugLog(`[SYNC] user = ${user ? user.uid : "NULL"}`);

        if (!user) return;

        const key = `score_${user.uid}_${gameName}`;
        const pending = localStorage.getItem(`pending_${key}`);

        debugLog(`[SYNC] pending = ${pending}`);

        if (pending !== "true") return;

        const score = parseInt(localStorage.getItem(key));
        debugLog(`[SYNC] score = ${score}`);

        if (!score) return;

        try {
            const now = new Date();
            const date = now.toLocaleDateString("fr-FR");

            const ref = doc(db, `${gameName}_scores`, user.uid);
            debugLog(`[SYNC] ref = ${gameName}_scores/${user.uid}`);

            await setDoc(ref, {
                score,
                date,
                pseudo,
                uid: user.uid
            });

            debugLog("[SYNC] setDoc OK → Score synchronisé");
            localStorage.removeItem(`pending_${key}`);

        } catch (e) {
            debugLog(`[SYNC] ERREUR setDoc : ${e.message}`);
        }
    }
};
