// ============================================================
// Firebase INIT — Version globale (compatible iPad + Koder)
// ============================================================

// ⚠️ Mets ici TA configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDODrXEPdxUIB_trqiZEFPMF5qQcZRuMyI",
  authDomain: "ty-ludic-f37a9.firebaseapp.com",
  projectId: "ty-ludic-f37a9",
  storageBucket: "ty-ludic-f37a9.firebasestorage.app",
  messagingSenderId: "487462368828",
  appId: "1:487462368828:web:700af454a339d3b8e7f539",
  measurementId: "G-8MBXBRGXVW"
};

// ------------------------------------------------------------
// 1) Initialisation Firebase
// ------------------------------------------------------------
firebase.initializeApp(firebaseConfig);

// ------------------------------------------------------------
// 2) Auth & Firestore en GLOBAL
// ------------------------------------------------------------
// ⭐ IMPORTANT : on met sur window pour que create-account.js
// et ton HTML puissent y accéder sans erreur.
window.auth = firebase.auth();
window.db = firebase.firestore();

// ------------------------------------------------------------
// 3) Vérification console (facultatif)
// ------------------------------------------------------------
console.log("Firebase initialisé :", firebase.apps.length);
console.log("Auth prêt :", !!window.auth);
console.log("Firestore prêt :", !!window.db);
