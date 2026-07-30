// -----------------------------------------------------------
// TY-LUDIC — Mode Online (HTTPS uniquement)
// -----------------------------------------------------------

import { auth, db } from "../firebase/firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
// import { ScoreManager } from "../js/ScoreManager.js";

// -----------------------------------------------------------
// Cartes du hub principal
// -----------------------------------------------------------

const cardJeux  = document.getElementById("card-jeux");
const cardCanal = document.getElementById("card-canal");
const cardRsl   = document.getElementById("card-rsl");
const cardAdmin = document.getElementById("card-admin");

function applyHubVisibility(state) {
    if (cardJeux)  cardJeux.style.display  = "block";
       if (cardCanal) cardCanal.style.display = "block";
    //if (cardCanal) cardCanal.style.display = state.identified ? "block" : "none";
    if (cardRsl)   cardRsl.style.display   = state.roles.includes("rsl") ? "block" : "none";
    if (cardAdmin) cardAdmin.style.display = state.roles.includes("admin") ? "block" : "none";
}

// -----------------------------------------------------------
// Cartes du hub-contact
// -----------------------------------------------------------

const cardInscription = document.getElementById("card-inscription");
const cardConnexion   = document.getElementById("card-connexion");
const cardDeconnexion = document.getElementById("card-deconnexion");
const cardCompte      = document.getElementById("card-compte");
const cardTchat       = document.getElementById("card-tchat");
const cardAssistance  = document.getElementById("card-assistance");

function applyHubContactVisibility(state) {
    const isMember = state.identified;

    if (cardInscription) cardInscription.style.display = isMember ? "none" : "block";
    if (cardConnexion)   cardConnexion.style.display   = isMember ? "none" : "block";

    if (cardDeconnexion) cardDeconnexion.style.display = isMember ? "block" : "none";
    if (cardCompte)      cardCompte.style.display      = isMember ? "block" : "none";
    if (cardTchat)       cardTchat.style.display       = isMember ? "block" : "none";
    if (cardAssistance)  cardAssistance.style.display  = isMember ? "block" : "none";
}

// -----------------------------------------------------------
// Bloc utilisateur
// -----------------------------------------------------------

const userBox = document.getElementById("user-info");

// Sécurité : masquer les cartes RSL par défaut
document.querySelectorAll(".role-rsl").forEach(card => {
    card.style.display = "none";
});

// -----------------------------------------------------------
// Test Firebase (Firestore)
// -----------------------------------------------------------

async function hasFirebaseAccess() {
    return true; // On considère Firebase accessible tant qu'on est en HTTPS
}


// -----------------------------------------------------------
// Logique principale
// -----------------------------------------------------------

(async () => {

    const firebaseOK = await hasFirebaseAccess();

    if (!firebaseOK) {
        alert("DEBUG: Firebase inaccessible → mode hors-ligne");

        if (userBox) userBox.textContent = "🔌 Hors‑ligne";

        applyHubVisibility({
            offline: true,
            online: false,
            identified: false,
            pseudo: null,
            roles: []
        });

        applyHubContactVisibility({
            offline: true,
            online: false,
            identified: false
        });

        return;
    }

    onAuthStateChanged(auth, async (user) => {

        alert("DEBUG: onAuthStateChanged déclenché\nUser = " + (user ? "CONNECTÉ" : "NON CONNECTÉ"));

        if (!user) {
            alert("DEBUG: utilisateur NON connecté");

            if (userBox) userBox.textContent = "Non connecté";

            applyHubVisibility({
                offline: false,
                online: true,
                identified: false,
                pseudo: null,
                roles: []
            });

            applyHubContactVisibility({
                offline: false,
                online: true,
                identified: false
            });

            return;
        }

        // 🔥 PSEUDO ONLINE = Firebase
        const pseudoOnline = user.displayName || "Joueur";
        alert("DEBUG: utilisateur CONNECTÉ\nPseudo = " + pseudoOnline);

        if (userBox) userBox.textContent = "👤 " + pseudoOnline;

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

        alert("DEBUG: rôles détectés = " + (roles.length ? roles.join(", ") : "aucun"));

        // 🔥 Application des règles du hub principal
        applyHubVisibility({
            offline: false,
            online: true,
            identified: true,
            pseudo: pseudoOnline,
            roles
        });

        // 🔥 Application des règles du hub-contact
        alert(
            "DEBUG: Application hub-contact\n" +
            "inscription=" + !!cardInscription + "\n" +
            "connexion=" + !!cardConnexion + "\n" +
            "deconnexion=" + !!cardDeconnexion + "\n" +
            "compte=" + !!cardCompte + "\n" +
            "tchat=" + !!cardTchat + "\n" +
            "assistance=" + !!cardAssistance
        );

        applyHubContactVisibility({
            offline: false,
            online: true,
            identified: true
        });

        // 🔥 Synchro ScoreManager (quand tu le réactives)
        // await ScoreManager.sync("tetris", pseudoOnline);

    });

})();
