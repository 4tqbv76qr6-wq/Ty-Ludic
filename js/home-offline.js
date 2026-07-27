// -----------------------------------------------------------
// TY-LUDIC — Mode Hors-Ligne
// -----------------------------------------------------------
// Ce script est chargé uniquement si on est en HTTP (Koder / localhost)
// Aucun import, aucun Firebase, aucun appel réseau.
// -----------------------------------------------------------

// Affichage du statut hors-ligne
const userBox = document.getElementById("user-info");
if (userBox) {
    userBox.textContent = "🔌 Hors‑ligne";
}

// Masquer les cartes RSL (non disponibles hors-ligne)
document.querySelectorAll(".role-rsl").forEach(card => {
    card.style.display = "none";
});

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
