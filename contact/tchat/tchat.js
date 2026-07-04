alert("tchat.js chargé !");

// Récupération des éléments HTML
const userBox = document.getElementById("user-info");
const messagesBox = document.getElementById("tchat-messages");
const form = document.getElementById("tchat-form");
const input = document.getElementById("tchat-input");
const channelButtons = document.querySelectorAll(".channel-btn");

let currentUser = null;
let currentChannel = "general";
let unsubscribe = null;
let lastSendTime = 0;

// Pseudo TY-LUDIC
let pseudo = localStorage.getItem("tyludic_pseudo") || "Invité";
alert("Pseudo = " + pseudo);

// Vérifier si Firebase est chargé
alert("auth = " + auth);
alert("db = " + db);

// Auth Firebase
auth.onAuthStateChanged((user) => {
    alert("onAuthStateChanged déclenché");

    currentUser = user || null;

    if (user) {
        alert("Utilisateur connecté : " + user.uid);
        userBox.textContent = pseudo;
    } else {
        alert("Aucun utilisateur connecté");
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
    alert("subscribeChannel : " + channel);

    if (unsubscribe) unsubscribe();

    messagesBox.innerHTML = "";

    const q = db.collection("tchat_messages")
                .where("channel", "==", channel)
                .orderBy("timestamp", "asc");

    unsubscribe = q.onSnapshot((snapshot) => {
        alert("onSnapshot déclenché");

        messagesBox.innerHTML = "";
        snapshot.forEach(doc => afficherMessage(doc.data()));
    });
}

// Changement de salon
channelButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        const channel = btn.dataset.channel;
        alert("Changement de salon : " + channel);

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

    alert("submit déclenché");

    const now = Date.now();
    if (now - lastSendTime < 1000) {
        alert("Anti-spam");
        return;
    }
    lastSendTime = now;

    const msg = input.value.trim();
    alert("Message : " + msg);

    if (!msg) {
        alert("Message vide");
        return;
    }

    if (!currentUser) {
        alert("Tu dois être connecté");
        return;
    }

    const safeMsg = msg.replace(/[<>]/g, "");

    try {
        alert("Tentative d'envoi Firebase");

        await db.collection("tchat_messages").add({
            pseudo,
            uid: currentUser.uid,
            message: safeMsg,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            channel: currentChannel
        });

        alert("Message envoyé !");
        input.value = "";
    } catch (err) {
        alert("Erreur Firebase : " + err);
    }
});

// Abonnement initial
subscribeChannel(currentChannel);
alert("subscribeChannel initial OK");
