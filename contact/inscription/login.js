import { auth } from "./firebase-init.js";
import { signInWithEmailAndPassword } 
    from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

function pseudoToEmail(pseudo) {
    return pseudo.toLowerCase() + "@tyludic.local";
}

document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const pseudo = document.getElementById("pseudo").value.trim();
    const password = document.getElementById("password").value.trim();
    const errorBox = document.getElementById("error-msg");

    errorBox.textContent = "";

    if (pseudo.length < 3) {
        errorBox.textContent = "Pseudo invalide.";
        return;
    }

    try {
        const emailInterne = pseudoToEmail(pseudo);

        const userCred = await signInWithEmailAndPassword(auth, emailInterne, password);
        const uid = userCred.user.uid;

        localStorage.setItem("tyludic_uid", uid);
        localStorage.setItem("tyludic_pseudo", pseudo);

        window.location.href = "login-ok.html";

    } catch (err) {
        errorBox.textContent = "Pseudo ou mot de passe incorrect.";
    }
});
