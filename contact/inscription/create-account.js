// ======================================================
//  TY‑LUDIC – Création de compte (version email interne)
// ======================================================

// -----------------------------
// IMPORTS FIREBASE
// -----------------------------
import { auth, db } from "./firebase-init.js";
import { createUserWithEmailAndPassword } 
    from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { doc, setDoc } 
    from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

// -----------------------------
// Validation du pseudo
// -----------------------------
function validatePseudo(pseudo) {
    const regex = /^[A-Za-z0-9_-]{3,16}$/;

    if (!regex.test(pseudo)) return false;
    if (pseudo.includes("@")) return false;

    return true;
}

// -----------------------------
// Validation du mot de passe
// -----------------------------
function validatePassword(pwd) {
    if (pwd.length < 6) return false;

    const forbidden = ["123456", "abcdef", "azerty"];
    if (forbidden.includes(pwd.toLowerCase())) return false;

    return true;
}

// -----------------------------
// Création du compte TY‑LUDIC
// -----------------------------
async function createAccount(pseudo, password) {

    if (!validatePseudo(pseudo)) {
        throw new Error("Pseudo invalide.");
    }

    if (!validatePassword(password)) {
        throw new Error("Mot de passe invalide.");
    }

    // 1. Générer l’email interne TY‑LUDIC
    const emailInterne = pseudo.toLowerCase() + "@tyludic.local";

    // 2. Créer le compte Firebase Auth
    const userCred = await createUserWithEmailAndPassword(auth, emailInterne, password);
    const uid = userCred.user.uid;

    // 3. Créer le document Firestore
    await setDoc(doc(db, "users", uid), {
        uid: uid,
        pseudo: pseudo,
        email: emailInterne,
        scores: {
            spaceInvader: 0,
            neonRacer: 0,
            domino: 0
        },
        scoreGlobal: 0,
        badges: [],
        settings: {
            sound: true,
            music: true,
            language: "fr"
        }
    });

    return uid;
}

// -----------------------------
// Gestion du formulaire
// -----------------------------
document.getElementById("create-account-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const pseudo = document.getElementById("pseudo").value.trim();
    const password = document.getElementById("password").value.trim();
    const errorBox = document.getElementById("error-msg");

    errorBox.textContent = "";

    try {
        const uid = await createAccount(pseudo, password);

        localStorage.setItem("tyludic_uid", uid);
        localStorage.setItem("tyludic_pseudo", pseudo);

        window.location.href = "compte-ok.html";

    } catch (err) {
        errorBox.textContent = err.message;
    }
});
