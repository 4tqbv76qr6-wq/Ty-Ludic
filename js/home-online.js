// -----------------------------------------------------------
// TY-LUDIC — Mode Online (HTTPS uniquement)
// -----------------------------------------------------------

import { auth, db } from "../firebase/firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
// import { ScoreManager } from "../js/ScoreManager.js";

alert("debut home-online");
alert("auth.currentUser = " + (auth.currentUser ? auth.currentUser.uid : "NULL"));

const userBox = document.getElementById("user-info");

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
        return;
    }

    onAuthStateChanged(auth, async (user) => {

        if (user) {

            // 🔥 PSEUDO ONLINE = Firebase
            const pseudoOnline = user.displayName || "Joueur";

            userBox.textContent = "👤 " + pseudoOnline;

            // 🔥 Synchro ScoreManager (quand on le réactive)
            // await ScoreManager.sync("tetris", pseudoOnline);

            // 🔥 Vérification RSL
            const rslRef = doc(db, "config", "rsl_players");
            const snap = await getDoc(rslRef);

            if (snap.exists()) {
                const players = snap.data().players || [];
                if (players.includes(pseudoOnline)) {
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
