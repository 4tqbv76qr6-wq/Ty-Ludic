// hub-visibility.js

export function applyHubVisibility(state) {
    // state = { offline, online, identified, pseudo, roles }

    const cardJeux  = document.getElementById("card-jeux");
    const cardCanal = document.getElementById("card-canal");
    const cardRsl   = document.getElementById("card-rsl");
    const cardAdmin = document.getElementById("card-admin");

    // Toujours visible
    cardJeux.style.display = "block";

    // Canal TY-LUDIC : seulement online identifié
    cardCanal.style.display = state.identified ? "block" : "none";

    // RSL : seulement si rôle RSL
    cardRsl.style.display = state.roles.includes("rsl") ? "block" : "none";

    // Admin : seulement si rôle admin
    cardAdmin.style.display = state.roles.includes("admin") ? "block" : "none";
}
