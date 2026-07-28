// -----------------------------------------------------------
// TY-LUDIC — Mode Hors-Ligne
// -----------------------------------------------------------
// Ce script est chargé uniquement si on est en HTTP (Koder / localhost)
// Aucun import, aucun Firebase, aucun appel réseau.
// -----------------------------------------------------------

// -----------------------------------------------------------
// Cartes du hub principal
// -----------------------------------------------------------

const cardJeux  = document.getElementById("card-jeux");
const cardCanal = document.getElementById("card-canal");
const cardRsl   = document.getElementById("card-rsl");
const cardAdmin = document.getElementById("card-admin");

function applyHubVisibility(state) {
    if (cardJeux)  cardJeux.style.display  = "block";
    if (cardCanal) cardCanal.style.display = "none";
    if (cardRsl)   cardRsl.style.display   = "none";
    if (cardAdmin) cardAdmin.style.display = "none";
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
    const isMember = state.identified; // toujours false hors-ligne

    if (cardInscription) cardInscription.style.display = isMember ? "none" : "block";
    if (cardConnexion)   cardConnexion.style.display   = isMember ? "none" : "block";

    if (cardDeconnexion) cardDeconnexion.style.display = isMember ? "block" : "none";
    if (cardCompte)      cardCompte.style.display      = isMember ? "block" : "none";
    if (cardTchat)       cardTchat.style.display       = isMember ? "block" : "none";
    if (cardAssistance)  cardAssistance.style.display  = isMember ? "block" : "none";
}

// -----------------------------------------------------------
// Affichage du statut hors-ligne
// -----------------------------------------------------------

const userBox = document.getElementById("user-info");
if (userBox) {
    userBox.textContent = "🔌 Hors‑ligne";
}

// Charger le pseudo local si présent
const pseudo = localStorage.getItem("tyludic_pseudo");

// Charger les scores locaux (si ScoreManager global est chargé)
if (window.ScoreManager) {
    window.ScoreManager.load("tetris");
}

// Optionnel : afficher le pseudo même hors-ligne
if (pseudo) {
    userBox.textContent = "👤 " + pseudo + " (hors‑ligne)";
}

// -----------------------------------------------------------
// Application des règles du hub principal + hub-contact
// -----------------------------------------------------------

applyHubVisibility({
    offline: true,
    online: false,
    identified: false,
    pseudo,
    roles: []
});

applyHubContactVisibility({
    offline: true,
    online: false,
    identified: false
});
