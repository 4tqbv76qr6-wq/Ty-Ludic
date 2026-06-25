/* ============================================================
   TY‑LUDIC — USER MODULE (LAB VERSION)
   ============================================================ */

let currentUser = null;

const STORAGE_KEY = "tyludic_users";
const SESSION_KEY = "tyludic_current_user";

/* ------------------------------------------------------------
   Utils stockage local
   ------------------------------------------------------------ */
function loadAllUsers() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    try {
        return JSON.parse(raw);
    } catch {
        return {};
    }
}

function saveAllUsers(users) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

function saveSession(email) {
    if (email) {
        localStorage.setItem(SESSION_KEY, email);
    } else {
        localStorage.removeItem(SESSION_KEY);
    }
}

/* ------------------------------------------------------------
   Modèle utilisateur
   ------------------------------------------------------------ */
function createDefaultUser(pseudo, email) {
    return {
        pseudo,
        email,
        scoreGlobal: 0,
        scores: {},
        badges: [],
        skins: [],
        preferences: {
            sound: true,
            vibration: true
        },
        createdAt: Date.now()
    };
}

/* ------------------------------------------------------------
   Affichage dans le User Lab
   ------------------------------------------------------------ */
function renderUser() {
    const el = document.getElementById("userData");
    if (!el) return;

    if (!currentUser) {
        el.textContent = "Aucun utilisateur connecté";
    } else {
        el.textContent = JSON.stringify(currentUser, null, 2);
    }
}

/* ------------------------------------------------------------
   API publique
   ------------------------------------------------------------ */
const User = {
    createAccount() {
        const emailEl = document.getElementById("emailCreate");
        const passEl = document.getElementById("passwordCreate");
        const pseudoEl = document.getElementById("pseudoCreate");

        const email = emailEl?.value.trim();
        const password = passEl?.value.trim();
        const pseudo = pseudoEl?.value.trim();

        if (!email || !password || !pseudo) {
            alert("Merci de remplir email, mot de passe et pseudo.");
            return;
        }

        const users = loadAllUsers();

        if (users[email]) {
            alert("Un compte existe déjà avec cet email.");
            return;
        }

        users[email] = {
            password, // ⚠️ en prod : jamais stocker en clair
            data: createDefaultUser(pseudo, email)
        };

        saveAllUsers(users);
        saveSession(email);

        currentUser = users[email].data;
        renderUser();

        alert("Compte créé et connecté.");
    },

    login() {
        const emailEl = document.getElementById("emailLogin");
        const passEl = document.getElementById("passwordLogin");

        const email = emailEl?.value.trim();
        const password = passEl?.value.trim();

        if (!email || !password) {
            alert("Merci de remplir email et mot de passe.");
            return;
        }

        const users = loadAllUsers();
        const entry = users[email];

        if (!entry) {
            alert("Aucun compte trouvé pour cet email.");
            return;
        }

        if (entry.password !== password) {
            alert("Mot de passe incorrect.");
            return;
        }

        currentUser = entry.data;
        saveSession(email);
        renderUser();

        alert("Connexion réussie.");
    },

    logout() {
        currentUser = null;
        saveSession(null);
        renderUser();
        alert("Déconnexion.");
    },

    loadFromSession() {
        const email = localStorage.getItem(SESSION_KEY);
        if (!email) {
            currentUser = null;
            renderUser();
            return;
        }

        const users = loadAllUsers();
        const entry = users[email];

        if (!entry) {
            currentUser = null;
            saveSession(null);
        } else {
            currentUser = entry.data;
        }

        renderUser();
    },

    saveData() {
        if (!currentUser) return;

        const users = loadAllUsers();
        const email = currentUser.email;

        if (!users[email]) return;

        users[email].data = currentUser;
        saveAllUsers(users);
        renderUser();
    },

    /* --------------------------------------------------------
       ⭐ Ajout score global + score par jeu
       -------------------------------------------------------- */
    addScore(gameId, score) {
        if (!currentUser) {
            alert("Aucun utilisateur connecté.");
            return;
        }

        // Score du jeu (on garde le meilleur)
        const previous = currentUser.scores[gameId] || 0;
        if (score > previous) {
            currentUser.scores[gameId] = score;
        }

        // Score global = somme des meilleurs scores
        let total = 0;
        for (const key in currentUser.scores) {
            total += currentUser.scores[key];
        }
        currentUser.scoreGlobal = total;

        // Sauvegarde
        User.saveData();
    }
};

/* ------------------------------------------------------------
   Initialisation au chargement de la page
   ------------------------------------------------------------ */
window.addEventListener("load", () => {
    User.loadFromSession();
});
