import { auth, db } from "../inscription/firebase-init.js";
import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    addDoc,
    serverTimestamp
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

// Récup pseudo localStorage
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

// Abonnement à un salon
function subscribeChannel(channel) {
    if (unsubscribe) unsubscribe();

    messagesBox.innerHTML = "";

    const q = query(
        collection(db, "tchat_messages"),
        where("channel", "==", channel),
        orderBy("timestamp", "asc")
    );

    unsubscribe = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach(change => {
            if (change.type === "added") {
                afficherMessage(change.doc.data());
            }
        });
    });
}

// Changement de salon
channelButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        const channel = btn.dataset.channel;
        if (channel === currentChannel) return;

        currentChannel = channel;

        channelButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        subscribeChannel(currentChannel);
    });
});

// Envoi d’un message
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const msg = input.value.trim();
    if (!msg) return;

    if (!currentUser) {
        alert("Tu dois être connecté pour envoyer un message.");
        return;
    }

    // Anti-injection HTML
    const safeMsg = msg.replace(/[<>]/g, "");

    try {
        await addDoc(collection(db, "tchat_messages"), {
            pseudo: pseudo,
            uid: currentUser.uid,
            message: safeMsg,
            timestamp: serverTimestamp(),
            channel: currentChannel
        });

        input.value = "";
    } catch (err) {
        console.error("Erreur envoi message", err);
        alert("Impossible d'envoyer le message pour le moment.");
    }
});

// 🔥 Abonnement initial déclenché SEULEMENT quand Auth est prêt
onAuthStateChanged(auth, (user) => {
    currentUser = user || null;

    if (user && pseudo) {
        userBox.textContent = pseudo;
        subscribeChannel(currentChannel);   // 🔥 Correction ici
    } else {
        userBox.textContent = "Non connecté";
    }
});
