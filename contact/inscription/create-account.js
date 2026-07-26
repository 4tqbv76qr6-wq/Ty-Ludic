// create-account.js
import { auth, db } from "./firebase-init.js";
import { createUserWithEmailAndPassword } 
  from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { doc, setDoc } 
  from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

function validatePseudo(pseudo) {
  const regex = /^[A-Za-z0-9_-]{3,16}$/;
  if (!regex.test(pseudo)) return false;
  if (pseudo.includes("@")) return false;
  return true;
}

function validatePassword(pwd) {
  if (pwd.length < 6) return false;
  const forbidden = ["123456", "abcdef", "azerty"];
  if (forbidden.includes(pwd.toLowerCase())) return false;
  return true;
}

async function createAccount(pseudo, password) {
  if (!validatePseudo(pseudo)) throw new Error("Pseudo invalide.");
  if (!validatePassword(password)) throw new Error("Mot de passe invalide.");

  const emailInterne = pseudo.toLowerCase() + "@tyludic.local";

  const userCred = await createUserWithEmailAndPassword(auth, emailInterne, password);
  const uid = userCred.user.uid;

  await setDoc(doc(db, "users", uid), {
    uid,
    pseudo,
    email: emailInterne,
    coins: 0,
    badges: [],
    scoreTetris: 0,
    scoreRacer: 0,
    scoreInvaders: 0,
    scoreMatch3: 0,
    scoreCasino: 0,
    settings: {
      sound: true,
      music: true,
      language: "fr"
    }
  });

  return uid;
}

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
