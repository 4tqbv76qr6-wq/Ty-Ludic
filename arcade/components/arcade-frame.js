

window.ArcadeFrame = {

    // Met le titre du jeu dans le marquee
    setTitle(text) {
        document.querySelector(".tl-marquee").textContent = text;
    },

    // Met à jour le HUD (3 cases)
    setHUD(values) {
        const hud = document.querySelector(".tl-hud");
        hud.innerHTML = "";
        values.forEach(v => {
            const div = document.createElement("div");
            div.textContent = v;
            hud.appendChild(div);
        });
    },

    // Active le bouton fullscreen
    enableFullscreen() {
        const btn = document.querySelector(".tl-btn-fullscreen");
        if (!btn) return;

        btn.onclick = () => {
            const elem = document.documentElement;
            if (!document.fullscreenElement) elem.requestFullscreen();
            else document.exitFullscreen();
        };
    }
};
