// ======================================================
//  TY‑LUDIC – Firebase INIT (version harmonisée iPad/Koder)
//  Sans modules ES6 – Firebase global
// ======================================================

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDODrXEPdxUIB_trqiZEFPMF5qQcZRuMyI",
  authDomain: "ty-ludic-f37a9.firebaseapp.com",
  projectId: "ty-ludic-f37a9",
  storageBucket: "ty-ludic-f37a9.firebasestorage.app",
  messagingSenderId: "487462368828",
  appId: "1:487462368828:web:700af454a339d3b8e7f539",
  measurementId: "G-8MBXBRGXVW"
};

// Initialisation Firebase (version globale)
firebase.initializeApp(firebaseConfig);

// Services Firebase globaux
const db = firebase.firestore();
const auth = firebase.auth();

// Exposition globale pour tous les scripts
window.db = db;
window.auth = auth;
