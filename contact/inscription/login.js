// Convertit un pseudo en email interne TY‑LUDIC
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

        // 🔥 Version globale : window.signInWithEmailAndPassword
        const userCred = await window.signInWithEmailAndPassword(
            window.auth,
            emailInterne,
            password
        );

        const uid = userCred.user.uid;

        // Stockage local
        localStorage.setItem("tyludic_uid", uid);
        localStorage.setItem("tyludic_pseudo", pseudo);

        // Redirection
        window.location.href = "login-ok.html";

    } catch (err) {
        errorBox.textContent = "Pseudo ou mot de passe incorrect.";
    }
});
