import { auth, db } from "../../firebase/firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
import { ScoreManager } from "../../js/ScoreManager.js";

const pseudo = localStorage.getItem("tyludic_pseudo");
const highscoreEl = document.getElementById("highscores");

let bestScore = 0;
let onlineReady = false;

async function initOnline(user) {
    if (!user || !pseudo) {
        highscoreEl.textContent = "Mode offline";
        return;
    }

    bestScore = await ScoreManager.load("tetris");
    highscoreEl.textContent = "Record : " + bestScore;

    onlineReady = true;
}

function watchGameOver(user) {
    function check() {
        if (window.gameOver && onlineReady) {

            const finalScore = window.score || 0;

            if (finalScore > bestScore) {
                bestScore = finalScore;
                highscoreEl.textContent = "Record : " + bestScore;

                // Écriture Firestore (collection correcte)
                const ref = doc(db, "tetris_scores", user.uid);
                setDoc(ref, {
                    bestScore: finalScore,
                    pseudo: pseudo,
                    updated: Date.now()
                });

                // Mise à jour ScoreManager
                ScoreManager.update("tetris", finalScore, pseudo);
            }

            return;
        }

        requestAnimationFrame(check);
    }

    requestAnimationFrame(check);
}

onAuthStateChanged(auth, (user) => {
    initOnline(user);
    watchGameOver(user);
});
