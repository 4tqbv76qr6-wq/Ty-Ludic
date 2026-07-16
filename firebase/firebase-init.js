import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-analytics.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyDODrXEPdxUIB_trqiZEFPMF5qQcZRuMyI",
  authDomain: "ty-ludic-f37a9.firebaseapp.com",
  projectId: "ty-ludic-f37a9",
  storageBucket: "ty-ludic-f37a9.firebasestorage.app",
  messagingSenderId: "487462368828",
  appId: "1:487462368828:web:700af454a339d3b8e7f539",
  measurementId: "G-8MBXBRGXVW"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const analytics = getAnalytics(app);   // 🔥 Ajout essentiel

export { db, auth, analytics };
