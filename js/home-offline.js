// -----------------------------------------------------------
// TY-LUDIC — Mode Hors-Ligne
// -----------------------------------------------------------
// Ce script est chargé uniquement si on est en HTTP (Koder / localhost)
// Aucun import, aucun Firebase, aucun appel réseau.
// -----------------------------------------------------------

// -----------------------------------------------------------
// Cartes du hub
// -----------------------------------------------------------

const cardJeux  = document.getElementById("card-jeux");
const cardCanal = document.getElementById("card-canal");
const cardRsl   = document.getElementById("card-rsl");
const cardAdmin = document.getElementById("card-admin");

function applyHubVisibility(state) {
    // Jeux toujours visible
    cardJeux.style.display = "block";

    // Canal TY-LUDIC : jamais hors-ligne
    cardCanal.style.display = "none";

    // RSL : jamais hors-ligne
    cardRsl.style.display = "none";

    // Admin : jamais hors-ligne
    cardAdmin.style.display = "none";
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
// Application des règles du hub (mode hors-ligne)
// -----------------------------------------------------------

applyHubVisibility({
    offline: true,
    online: false,
    identified: false,
    pseudo,
    roles: []
});
