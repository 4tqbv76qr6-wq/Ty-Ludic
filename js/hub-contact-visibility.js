// hub-contact-visibility.js

export function applyHubContactVisibility(state) {
    const cardInscription = document.getElementById("card-inscription");
    const cardConnexion   = document.getElementById("card-connexion");
    const cardDeconnexion = document.getElementById("card-deconnexion");
    const cardCompte      = document.getElementById("card-compte");
    const cardTchat       = document.getElementById("card-tchat");
    const cardAssistance  = document.getElementById("card-assistance");

    const isMember = state.identified;

    // Guest
    cardInscription.style.display = isMember ? "none" : "block";
    cardConnexion.style.display   = isMember ? "none" : "block";

    // Member
    cardDeconnexion.style.display = isMember ? "block" : "none";
    cardCompte.style.display      = isMember ? "block" : "none";
    cardTchat.style.display       = isMember ? "block" : "none";
    cardAssistance.style.display  = isMember ? "block" : "none";
}
