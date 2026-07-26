// ============================================================
//  Firebase INIT — Version globale TY‑LUDIC
// ============================================================

// Configuration Firebase TY‑LUDIC
const firebaseConfig = {
  apiKey: "AIzaSyDODrXEPdxUIB_trqiZEFPMF5qQcZRuMyI",
  authDomain: "ty-ludic-f37a9.firebaseapp.com",
  projectId: "ty-ludic-f37a9",
  storageBucket: "ty-ludic-f37a9.firebasestorage.app",
  messagingSenderId: "487462368828",
  appId: "1:487462368828:web:700af454a339d3b8e7f539",
  measurementId: "G-8MBXBRGXVW"
};

// App
const app = window.initializeApp(firebaseConfig);

// Auth globale
window.auth = window.getAuth(app);

// Firestore globale
window.db = window.getFirestore(app);

// Analytics
window.analytics = window.getAnalytics(app);

// Fonctions Firestore v9
window.doc = window.doc;
window.getDoc = window.getDoc;
window.setDoc = window.setDoc;
window.collection = window.collection;

console.log("Firebase initialisé (global) — auth & db disponibles");
