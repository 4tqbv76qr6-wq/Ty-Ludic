alert("debut chargé !");  // DEBUG 
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

alert("tchat.js chargé !");  // DEBUG 1

const userBox = document.getElementById("user-info");
const messagesBox = document.getElementById("tchat-messages");
const form = document.getElementById("tchat-form");
const input = document.getElementById("tchat-input");
const channelButtons = document.querySelectorAll(".channel-btn");

let currentUser = null;
let currentChannel = "general";
let unsubscribe = null;
let lastSendTime = 0;

let pseudo = localStorage.getItem("tyludic_pseudo") || "Invité";
alert("Pseudo localStorage = " + pseudo);  // DEBUG 2

// Vérifier si Firebase Auth est chargé
alert("auth = " + auth);  // DEBUG 3
alert("db = " + db);      // DEBUG 4

// Auth Firebase
onAuthStateChanged(auth, (user) => {
    alert("onAuthStateChanged déclenché !");  // DEBUG 5

    currentUser = user || null;

    if (user) {
        alert("Utilisateur connecté ! UID = " + user.uid);  // DEBUG 6
        userBox.textContent = pseudo;
    } else {
        alert("Aucun utilisateur connecté");  // DEBUG 7
        userBox.textContent = "Non connecté";
    }
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
    alert("subscribeChannel : " + channel);  // DEBUG 8

    if (unsubscribe) unsubscribe();

    messagesBox.innerHTML = "";

    const q = query(
        collection(db, "tchat_messages"),
        where("channel", "==", channel),
        orderBy("timestamp", "asc")
    );

    unsubscribe = onSnapshot(q, (snapshot) => {
        alert("onSnapshot déclenché !");  // DEBUG 9

        messagesBox.innerHTML = "";
        snapshot.forEach(doc => afficherMessage(doc.data()));
    });
}

// Changement de salon
channelButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        const channel = btn.dataset.channel;
        alert("Changement de salon : " + channel);  // DEBUG 10

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

    alert("submit déclenché !");  // DEBUG 11

    const now = Date.now();
    if (now - lastSendTime < 1000) {
        alert("Anti-spam activé");  // DEBUG 12
        return;
    }
    lastSendTime = now;

    const msg = input.value.trim();
    alert("Message tapé : " + msg);  // DEBUG 13

    if (!msg) {
        alert("Message vide");  // DEBUG 14
        return;
    }

    if (!currentUser) {
        alert("Tu dois être connecté pour envoyer un message.");  // DEBUG 15
        return;
    }

    const safeMsg = msg.replace(/[<>]/g, "");

    try {
        alert("Tentative d'envoi Firebase…");  // DEBUG 16

        await addDoc(collection(db, "tchat_messages"), {
            pseudo,
            uid: currentUser.uid,
            message: safeMsg,
            timestamp: serverTimestamp(),
            channel: currentChannel
        });

        alert("Message envoyé !");  // DEBUG 17
        input.value = "";
    } catch (err) {
        alert("Erreur Firebase : " + err);  // DEBUG 18
    }
});

// Abonnement initial
subscribeChannel(currentChannel);
alert("subscribeChannel initial OK");  // DEBUG 19
