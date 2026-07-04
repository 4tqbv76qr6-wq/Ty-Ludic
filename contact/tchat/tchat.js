import { auth, db } from "../contact/inscription/firebase-init.js";
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
let lastSendTime = 0;

// Pseudo TY‑LUDIC
let pseudo = localStorage.getItem("tyludic_pseudo") || "Invité";

// Auth Firebase
onAuthStateChanged(auth, (user) => {
    currentUser = user || null;
    userBox.textContent = user ? pseudo : "Non connecté";
});

// Format heure
function formatTime(date) {
    const h = String(date.getHours()).padStart(2, "0");
    const m = String(date.getMinutes()).padStart(2, "0");
    return `${h}:${m}`;
}

// Affichage message
function afficherMessage(data) {
    const wrapper = document.createElement("div");
    wrapper.className = "tchat-message";

    // Messages envoyés par soi-même
    if (currentUser && data.uid === currentUser.uid) {
        wrapper.classList.add("self");
    }

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

// Charger un salon
function subscribeChannel(channel) {
    if (unsubscribe) unsubscribe();

    messagesBox.innerHTML = "";

    const q = query(
        collection(db, "tchat_messages"),
        where("channel", "==", channel),
        orderBy("timestamp", "asc")
    );

    unsubscribe = onSnapshot(q, (snapshot) => {
        messagesBox.innerHTML = "";
        snapshot.forEach(doc => afficherMessage(doc.data()));
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

// Envoi message
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const now = Date.now();
    if (now - lastSendTime < 1000) return; // anti-spam 1s
    lastSendTime = now;

    const msg = input.value.trim();
    if (!msg) return;

    if (!currentUser) {
        alert("Tu dois être connecté pour envoyer un message.");
        return;
    }

    const safeMsg = msg.replace(/[<>]/g, "");

    try {
        await addDoc(collection(db, "tchat_messages"), {
            pseudo,
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

// Abonnement initial
subscribeChannel(currentChannel);
