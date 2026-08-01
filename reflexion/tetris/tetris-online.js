//alert("tetris-online.js chargé");

import { auth, db } from "../../firebase/firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
import { ScoreManager } from "../../js/ScoreManager.js";
alert("tetris-online.js chargé");

const pseudo = localStorage.getItem("tyludic_pseudo");
const highscoreEl = document.getElementById("highscores");

let bestScore = 0;
let onlineReady = false;

/* ============================================================
   INITIALISATION ONLINE
   ============================================================ */
async function initOnline(user) {

    if (!user || !pseudo) {
        highscoreEl.textContent = "Mode offline";
        return;
    }

    // Charger le record
    bestScore = await ScoreManager.load("tetris");

    // Afficher immédiatement dans le HUD
    highscoreEl.textContent = "Record : " + bestScore;

    onlineReady = true;
}


/* ============================================================
   SURVEILLANCE GAME OVER
   ============================================================ */
function watchGameOver(user) {

    alert("Surveillance du gameOver démarrée");

    function check() {

        if (window.gameOver && onlineReady) {

            alert("GAME OVER détecté");

            const finalScore = window.score || 0;
            alert("Score final = " + finalScore);

            if (finalScore > bestScore) {

                alert("Nouveau record → écriture Firestore");

                const ref = doc(db, "tetris_scores", user.uid);

                alert("Chemin Firestore : tetris_scores / " + user.uid);

                setDoc(ref, {
                    bestScore: finalScore,
                    pseudo: pseudo,
                    updated: Date.now()
                });

                alert("setDoc() exécuté");

                ScoreManager.update("tetris", finalScore, pseudo);
                alert("ScoreManager.update() exécuté");
            } else {
                alert("Score NON supérieur au record → pas d'écriture");
            }

            return; // stop surveillance
        }

        requestAnimationFrame(check);
    }

    requestAnimationFrame(check);
}

/* ============================================================
   AUTH
   ============================================================ */
onAuthStateChanged(auth, (user) => {
    alert("onAuthStateChanged() déclenché");
    initOnline(user);
    watchGameOver(user);
});
