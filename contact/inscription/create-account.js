// ======================================================
//  TY‑LUDIC – Création de compte (version harmonisée)
//  Compatible iPad + Koder (sans modules ES6)
// ======================================================

// -----------------------------
// 0. Initialisation Firebase (version globale)
// -----------------------------
const firebaseConfig = {
    apiKey: "…",
    authDomain: "…",
    projectId: "…",
    storageBucket: "…",
    messagingSenderId: "…",
    appId: "…"
};

firebase.initializeApp(firebaseConfig);

// Auth & Firestore global
const auth = firebase.auth();
const db = firebase.firestore();


// -----------------------------
// 1. Hash SHA‑256 du mot de passe
// -----------------------------
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}

// -----------------------------
// 2. Validation du pseudo
// -----------------------------
function validatePseudo(pseudo) {
    const regex = /^[A-Za-z0-9_-]{3,16}$/;

    if (!regex.test(pseudo)) return false;
    if (pseudo.includes("@")) return false;

    // Interdiction des dates
    if (/^\d{4}$/.test(pseudo)) return false;
    if (/^\d{8}$/.test(pseudo)) return false;
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(pseudo)) return false;

    return true;
}

// -----------------------------
// 3. Validation du mot de passe
// -----------------------------
function validatePassword(pwd) {
    if (pwd.length < 6) return false;

    // Interdiction des dates
    if (/^\d{4}$/.test(pwd)) return false;
    if (/^\d{8}$/.test(pwd)) return false;

    // Interdiction suites simples
    const forbidden = ["123456", "abcdef", "azerty"];
    if (forbidden.includes(pwd.toLowerCase())) return false;

    return true;
}

// -----------------------------
// 4. Création du compte Firebase + Firestore
// -----------------------------
async function createAccount(pseudo, password) {

    if (!validatePseudo(pseudo)) {
        throw new Error("Pseudo invalide.");
    }

    if (!validatePassword(password)) {
        throw new Error("Mot de passe invalide.");
    }

    const passwordHash = await hashPassword(password);

    // Auth anonyme Firebase (version globale)
    const userCredential = await auth.signInAnonymously();
    const uid = userCredential.user.uid;

    // Modèle JSON TY‑LUDIC
    const userData = {
        uid: uid,
        pseudo: pseudo,
        auth: {
            passwordHash: passwordHash,
            createdAt: Date.now()
        },
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
    };

    // Enregistrement Firestore (version globale)
    await db.collection("users").doc(uid).set(userData);

    return uid;
}

// -----------------------------
// 5. Gestion du formulaire
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
