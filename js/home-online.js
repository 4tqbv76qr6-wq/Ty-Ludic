// -----------------------------------------------------------
// TY-LUDIC — Mode Online (HTTPS uniquement)
// -----------------------------------------------------------
// Ce script est chargé uniquement si on est en HTTPS.
// Firebase v12 MODULAR est disponible.
// -----------------------------------------------------------



import { auth, db } from "../firebase/firebase-init.js";
alert("auth.currentUser = " + (auth.currentUser ? auth.currentUser.uid : "NULL"));

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";


import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
import { ScoreManager } from "../js/ScoreManager.js";

// Bloc utilisateur
const userBox = document.getElementById("user-info");
const pseudo = localStorage.getItem("tyludic_pseudo");

// Masquer les cartes RSL par défaut
document.querySelectorAll(".role-rsl").forEach(card => {
    card.style.display = "none";
});

// Test Firebase (Firestore)
async function hasFirebaseAccess() {
    try {
        const pingRef = doc(db, "config", "ping");
        await getDoc(pingRef);
        return true;
    } catch (e) {
        return false;
    }
}

(async () => {

    const firebaseOK = await hasFirebaseAccess();

    if (!firebaseOK) {
        // Si HTTPS mais Firebase KO → fallback hors-ligne
        userBox.textContent = "🔌 Hors‑ligne";
        await ScoreManager.load("tetris");
        return;
    }

    // Mode online complet
    onAuthStateChanged(auth, async (user) => {

        if (user && pseudo) {
            // Affichage pseudo
            userBox.textContent = "👤 " + pseudo;

            // Synchronisation des scores
            await ScoreManager.sync("tetris", pseudo);

            // Vérification du rôle RSL
            const rslRef = doc(db, "config", "rsl_players");
            const snap = await getDoc(rslRef);

            if (snap.exists()) {
                const players = snap.data().players || [];
                if (players.includes(pseudo)) {
                    document.querySelectorAll(".role-rsl").forEach(card => {
                        card.style.display = "block";
                    });
                }
            }

        } else {
            // Pas connecté
            userBox.textContent = "Non connecté";
        }
    });

})();
