import { auth, db } from "../inscription/firebase-init.js";
import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    addDoc,
    serverTimestamp,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

const userBox = document.getElementById("user-info");
const messagesBox = document.getElementById("tchat-messages");
const form = document.getElementById("tchat-form");
const input = document.getElementById("tchat-input");
const channelButtons = document.querySelectorAll(".channel-btn");

let currentUser = null;
let currentChannel = "general";
let unsubscribe = null;

const pseudo = localStorage.getItem("tyludic_pseudo") || "Invité";

// Format heure HH:MM
function formatTime(date) {
    const h = String(date.getHours()).padStart(2, "0");
    const m = String(date.getMinutes()).padStart(2, "0");
    return `${h}:${m}`;
}

// Affichage d’un message
function afficherMessage(data) {
    const wrapper = document.createElement("div");
    wrapper.className = "tchat-message";

    const meta = document.createElement("div");
    meta.className = "tchat-meta";

    const pseudoEl = document.createElement("span");
    pseudoEl.className = "tchat-pseudo";
    pseudoEl.textContent = data.pseudo || "Anonyme";

    const timeEl = document.createElement("span");
    timeEl.className = "tchat-time";
    if (data.timestamp?.toDate) {
        timeEl.textContent = formatTime(data.timestamp.toDate());
    } else {
        timeEl.textContent = "--:--";
    }

    meta.appendChild(pseudoEl);
    meta.appendChild(timeEl);

    const textEl = document.createElement("div");
    textEl.className = "tchat-text";
    textEl.textContent = data.message || "";

    wrapper.appendChild(meta);
    wrapper.appendChild(textEl);

    messagesBox.appendChild(wrapper);
    messagesBox.scrollTop = messagesBox.scrollHeight;
}

// Recharge complet + listener temps réel
async function loadChannelWithRealtime(channel) {

    alert("1 - Début loadChannelWithRealtime, canal = " + channel);

    if (unsubscribe) {
        alert("2 - Suppression ancien listener");
        unsubscribe();
    }

    alert("3 - Nettoyage messagesBox");
    messagesBox.innerHTML = "";

    alert("4 - Construction de la requête Firestore");

    const q = query(
        collection(db, "tchat_messages"),
        where("channel", "==", channel),
        orderBy("timestamp", "asc")
    );

    alert("5 - Requête construite, lancement getDocs");

    let snapshot;
    try {
        snapshot = await getDocs(q);
        alert("6 - getDocs OK");
    } catch (err) {
        alert("ERREUR getDocs : " + err);
        return;
    }

    alert("7 - Snapshot size = " + snapshot.size);

    snapshot.forEach(doc => {
        alert("8 - Message historique affiché");
        afficherMessage(doc.data());
    });

    alert("9 - Installation listener temps réel");

    try {
        unsubscribe = onSnapshot(q, (snap) => {
            alert("10 - Listener déclenché, changements = " + snap.docChanges().length);
            snap.docChanges().forEach(change => {
                if (change.type === "added") {
                    afficherMessage(change.doc.data());
                }
            });
        });
    } catch (err) {
        alert("ERREUR listener : " + err);
    }

    alert("11 - Listener installé");
}

// Changement de salon
channelButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        const channel = btn.dataset.channel;

        alert("CHANGEMENT DE SALON → " + channel);

        if (channel === currentChannel) {
            alert("Canal identique, rien à faire");
            return;
        }

        currentChannel = channel;

        channelButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        loadChannelWithRealtime(currentChannel);
    });
});

// Envoi d’un message
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const msg = input.value.trim();
    if (!msg) {
        alert("Message vide, ignoré");
        return;
    }

    if (!currentUser) {
        alert("Pas connecté → envoi impossible");
        return;
    }

    const safeMsg = msg.replace(/[<>]/g, "");

    alert("Envoi du message : " + safeMsg);

    try {
        await addDoc(collection(db, "tchat_messages"), {
            pseudo: pseudo,
            uid: currentUser.uid,
            message: safeMsg,
            timestamp: serverTimestamp(),
            channel: currentChannel
        });

        alert("Message envoyé");

        input.value = "";
        messagesBox.scrollTop = messagesBox.scrollHeight;
    } catch (err) {
        alert("Erreur envoi message");
    }
});

// Auth → affichage pseudo
onAuthStateChanged(auth, (user) => {
    currentUser = user || null;

    alert("Auth changé : " + (user ? "connecté" : "non connecté"));

    if (user && pseudo) {
        userBox.textContent = pseudo;
    } else {
        userBox.textContent = "Non connecté";
    }
});

// Abonnement initial
alert("ARRIVÉE SUR LE TCHAT — canal : " + currentChannel);
loadChannelWithRealtime(currentChannel);
