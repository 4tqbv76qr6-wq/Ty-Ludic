/*
 * ---------------------------------------------------------
 *  ScoreManager.js — Module d’enregistrement des scores TY‑LUDIC
 * ---------------------------------------------------------
 *  Fonction : saveScore(gameName, score, pseudo)
 *
 *  - gameName : nom du jeu (ex : "breakout", "alienpulse")
 *  - score    : score numérique
 *  - pseudo   : pseudo affiché dans les classements
 *
 *  Structure Firestore utilisée (Option A) :
 *      breakout_scores/<uid>
 *      alienpulse_scores/<uid>
 *      simcity_scores/<uid>
 *
 *  Chaque document contient :
 *      {
 *          score: number,
 *          date: "JJ/MM/AA",
 *          pseudo: string,
 *          uid: string
 *      }
 *
 *  Règles Firestore :
 *      allow read: if request.auth != null;
 *      allow write: if request.auth.uid == userId;
 *
 *  Ce module est compatible iPad + Safari + ES6 modules.
 * ---------------------------------------------------------
 */

import { auth, db } from "./firebase-init.js";
import { doc, setDoc } 
    from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

/**
 * Enregistre un score dans Firestore
 */
export async function saveScore(gameName, score, pseudo) {

    // -----------------------------------------------------
    // 1) Vérification utilisateur
    // -----------------------------------------------------
    const user = auth.currentUser;

    if (!user) {
        alert("Aucun utilisateur connecté !");
        return false;
    }

    // -----------------------------------------------------
    // 2) Formatage de la date (JJ/MM/AA)
    // -----------------------------------------------------
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = String(now.getFullYear()).slice(-2);
    const date = `${day}/${month}/${year}`;

    // -----------------------------------------------------
    // 3) Construction du nom de collection
    //    Option A : <gameName>_scores
    // -----------------------------------------------------
    const collectionName = `${gameName}_scores`;

    // -----------------------------------------------------
    // 4) Référence Firestore :
    //    - collection : breakout_scores
    //    - document   : <uid>
    // -----------------------------------------------------
    const ref = doc(db, collectionName, user.uid);

    // -----------------------------------------------------
    // 5) Tentative d’écriture dans Firestore
    // -----------------------------------------------------
    try {
        await setDoc(ref, {
            score,
            date,
            pseudo,
            uid: user.uid
        });

        alert("Score enregistré !");
        return true;

    } catch (e) {
        alert("Erreur Firestore : " + e.message);
        return false;
    }
}
