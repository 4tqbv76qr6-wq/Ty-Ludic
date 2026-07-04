// Firebase INIT - Version iPad / Koder (sans modules)

const firebaseConfig = {
  apiKey: "AIzaSyDODrXEPdxUIB_trqiZEFPMF5qQcZRuMyI",
  authDomain: "ty-ludic-f37a9.firebaseapp.com",
  projectId: "ty-ludic-f37a9",
  storageBucket: "ty-ludic-f37a9.firebasestorage.app",
  messagingSenderId: "487462368828",
  appId: "1:487462368828:web:700af454a339d3b8e7f539",
  measurementId: "G-8MBXBRGXVW"
};

// Initialisation Firebase
firebase.initializeApp(firebaseConfig);

// Services Firebase
const db = firebase.firestore();
const auth = firebase.auth();

// Export global (accessible partout)
window.db = db;
window.auth = auth;
