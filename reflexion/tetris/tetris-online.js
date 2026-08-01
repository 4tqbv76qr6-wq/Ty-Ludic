/* ============================================================
   TETRIS ONLINE — Firebase + ScoreManager (MODULE ES)
   ============================================================ */

import { auth, db } from "../../firebase/firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
import { ScoreManager } from "../../js/ScoreManager.js";

/* ============================================================
   VARIABLES
   ============================================================ */
const pseudo = localStorage.getItem("tyludic_pseudo");
const highscoreEl = document.getElementById("highscores");

let bestScore = 0;
let onlineReady = false;

/* ============================================================
   INITIALISATION ONLINE
   ============================================================ */
async function initOnline(user) {
    if (!user || !pseudo) {
        highscoreEl.textContent = "Mode offline (non connecté)";
        return;
    }

    // Charger le record
    bestScore = await ScoreManager.load("tetris");
    highscoreEl.textContent = "Record : " + bestScore;

    onlineReady = true;
}

/* ============================================================
   SURVEILLANCE DU GAME OVER
   ============================================================ */
function watchGameOver(user) {
    // Boucle légère qui surveille window.gameOver
    function check() {
        if (onlineReady && window.gameOver) {
            const finalScore = window.score || 0;

            // Si record battu → mise à jour Firestore + ScoreManager
            if (finalScore > bestScore) {
                bestScore = finalScore;
                highscoreEl.textContent = "Record : " + bestScore;

                if (user) {
                    const ref = doc(db, "tetris_scores", user.uid);
                    setDoc(ref, {
                        bestScore: finalScore,
                        pseudo: pseudo,
                        updated: Date.now()
                    });
                }

                ScoreManager.update("tetris", finalScore, pseudo);
            }

            return; // on arrête la surveillance après la fin de partie
        }

        requestAnimationFrame(check);
    }

    requestAnimationFrame(check);
}

/* ============================================================
   AUTH
   ============================================================ */
onAuthStateChanged(auth, async (user) => {
    initOnline(user);   // pas besoin d'attendre
    watchGameOver(user);

});
