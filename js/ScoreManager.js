/* ============================================================
   SCOREMANAGER — VERSION MODULE ES (TY‑LUDIC)
   ============================================================ */

import { auth, db } from "../firebase/firebase-init.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

export const ScoreManager = {

    // Cache local pour éviter les appels Firebase inutiles
    cache: {},

    /* ============================================================
       LOAD — Charger le record
       ============================================================ */
    async load(gameName) {

        // Cache déjà chargé → éviter Firestore
        if (this.cache[gameName] !== undefined) {
            return this.cache[gameName];
        }

        // Vérification de l'authentification
        if (!auth.currentUser) {
            this.cache[gameName] = 0;
            return 0;
        }

        const uid = auth.currentUser.uid;

        // Chemin Firestore correct
        const ref = doc(db, gameName + "_scores", uid);

        const snap = await getDoc(ref);

        if (snap.exists()) {
            const best = snap.data().bestScore || 0;
            this.cache[gameName] = best;
            return best;
        }

        // Aucun score → 0
        this.cache[gameName] = 0;
        return 0;
    },

    /* ============================================================
       UPDATE — Mettre à jour le record
       ============================================================ */
    async update(gameName, newScore, pseudo) {

        // Vérification auth
        if (!auth.currentUser) {
            return;
        }

        const uid = auth.currentUser.uid;

        // Charger le record actuel
        const currentBest = await this.load(gameName);

        // Si record non battu → ne rien faire
        if (newScore <= currentBest) {
            return;
        }

        // Mise à jour Firestore
        const ref = doc(db, gameName + "_scores", uid);

        await setDoc(ref, {
            bestScore: newScore,
            pseudo: pseudo,
            updated: Date.now()
        });

        // Mise à jour du cache
        this.cache[gameName] = newScore;
    }
};
