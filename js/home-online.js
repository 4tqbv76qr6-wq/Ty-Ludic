// -----------------------------------------------------------
// TY-LUDIC — Mode Online (HTTPS uniquement)
// -----------------------------------------------------------

import { auth, db } from "../firebase/firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
// import { ScoreManager } from "../js/ScoreManager.js";

// -----------------------------------------------------------
// Cartes du hub
// -----------------------------------------------------------

const cardJeux  = document.getElementById("card-jeux");
const cardCanal = document.getElementById("card-canal");
const cardRsl   = document.getElementById("card-rsl");
const cardAdmin = document.getElementById("card-admin");

function applyHubVisibility(state) {
    // Toujours visible
    cardJeux.style.display = "block";

    // Canal TY-LUDIC : seulement online identifié
    cardCanal.style.display = state.identified ? "block" : "none";

    // RSL : seulement si rôle RSL
    cardRsl.style.display = state.roles.includes("rsl") ? "block" : "none";

    // Admin : seulement si rôle admin
    cardAdmin.style.display = state.roles.includes("admin") ? "block" : "none";
}

// -----------------------------------------------------------
// Bloc utilisateur
// -----------------------------------------------------------

const userBox = document.getElementById("user-info");

// Masquer les cartes RSL par défaut (sécurité)
document.querySelectorAll(".role-rsl").forEach(card => {
    card.style.display = "none";
});

// -----------------------------------------------------------
// Test Firebase (Firestore)
// -----------------------------------------------------------

async function hasFirebaseAccess() {
    try {
        const pingRef = doc(db, "config", "ping");
        await getDoc(pingRef);
        return true;
    } catch (e) {
        return false;
    }
}

// -----------------------------------------------------------
// Logique principale
// -----------------------------------------------------------

(async () => {

    const firebaseOK = await hasFirebaseAccess();

    if (!firebaseOK) {
        userBox.textContent = "🔌 Hors‑ligne";

        applyHubVisibility({
            offline: true,
            online: false,
            identified: false,
            pseudo: null,
            roles: []
        });

        return;
    }

    onAuthStateChanged(auth, async (user) => {

        if (!user) {
            userBox.textContent = "Non connecté";

            applyHubVisibility({
                offline: false,
                online: true,
                identified: false,
                pseudo: null,
                roles: []
            });

            return;
        }

        // 🔥 PSEUDO ONLINE = Firebase
        const pseudoOnline = user.displayName || "Joueur";
        userBox.textContent = "👤 " + pseudoOnline;

        // 🔥 Récupération des rôles
        const roles = [];

        // Rôle RSL
        const rslRef = doc(db, "config", "rsl_players");
        const rslSnap = await getDoc(rslRef);
        if (rslSnap.exists()) {
            const players = rslSnap.data().players || [];
            if (players.includes(pseudoOnline)) {
                roles.push("rsl");
            }
        }

        // Rôle Admin
        const adminRef = doc(db, "config", "admins");
        const adminSnap = await getDoc(adminRef);
        if (adminSnap.exists()) {
            const admins = adminSnap.data().list || [];
            if (admins.includes(pseudoOnline)) {
                roles.push("admin");
            }
        }

        // 🔥 Application des règles du hub
        applyHubVisibility({
            offline: false,
            online: true,
            identified: true,
            pseudo: pseudoOnline,
            roles
        });

        // 🔥 Synchro ScoreManager (quand tu le réactives)
        // await ScoreManager.sync("tetris", pseudoOnline);

    });

})();
