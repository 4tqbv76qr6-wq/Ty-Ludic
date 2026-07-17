// ScoreManager.js
import { auth, db } from "../firebase/firebase-init.js";
import { doc, setDoc } 
    from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

export async function saveScore(gameName, score, pseudo) {
    const user = auth.currentUser;
    if (!user) {
        alert("Aucun utilisateur connecté");
        return false;
    }

    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = String(now.getFullYear()).slice(-2);
    const date = `${day}/${month}/${year}`;

    const collectionName = `${gameName}_scores`;
    const ref = doc(db, collectionName, user.uid);

    try {
        await setDoc(ref, {
            score,
            date,
            pseudo,
            uid: user.uid
        });

        alert("Score enregistré !");
        return true;

    } catch (e) {
        alert("Erreur Firestore : " + e.message);
        return false;
    }
}
