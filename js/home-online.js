// -----------------------------------------------------------
// TY-LUDIC — Mode Online (HTTPS uniquement)
// -----------------------------------------------------------
// Ce script est chargé uniquement si on est en HTTPS.
// Firebase v12 MODULAR est disponible.
// -----------------------------------------------------------

import { auth, db } from "../firebase/firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
//import { ScoreManager } from "../js/ScoreManager.js";

alert("debut home-online jl");
alert("auth.currentUser = " + (auth.currentUser ? auth.currentUser.uid : "NULL"));

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
        userBox.textContent = "🔌 Hors‑ligne";
        await ScoreManager.load("tetris");
        return;
    }

    onAuthStateChanged(auth, async (user) => {

        if (user && pseudo) {
            userBox.textContent = "👤 " + pseudo;

            await ScoreManager.sync("tetris", pseudo);

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
            userBox.textContent = "Non connecté";
        }
    });

})();
