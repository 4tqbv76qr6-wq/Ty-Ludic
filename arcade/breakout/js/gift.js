/* ============================================================
   GIFT SYSTEM — Power-up "paquet cadeau"
   ============================================================ */

const gift = {
    active: false,
    x: 0,
    y: 0,
    size: 22,
    speed: 2,
    type: null,
    timer: 0
};

let giftCooldown = 0;

/* ============================================================
   Apparition du cadeau
   ============================================================ */
function maybeSpawnGift() {
    giftCooldown++;

    // Apparition toutes les ~25 secondes (1500 frames à 60 FPS)
    if (giftCooldown > 1500) {
        spawnGift();
        giftCooldown = 0;
    }
}

function spawnGift() {
    gift.active = true;
    gift.x = Math.random() * (canvas.width - gift.size);
    gift.y = 0;

    // Pour l'instant : un seul type de cadeau
    gift.type = "paddle_wide";
}

/* ============================================================
   Mise à jour du cadeau
   ============================================================ */
function updateGift() {

    /* ------------------------------------------------------------
       Gestion du timer du bonus — doit être exécutée TOUT LE TEMPS
    ------------------------------------------------------------ */
    if (gift.timer > 0) {
        gift.timer--;
        if (gift.timer === 0) {
            paddle.width /= 1.3;
        }
    }

    /* ------------------------------------------------------------
       Si le cadeau n'est pas actif, on s'arrête ici
    ------------------------------------------------------------ */
    if (!gift.active) return;

    gift.y += gift.speed;

    /* ------------------------------------------------------------
       Collision avec la balle → destruction du cadeau
    ------------------------------------------------------------ */
    if (
        ball.x + ball.radius > gift.x &&
        ball.x - ball.radius < gift.x + gift.size &&
        ball.y + ball.radius > gift.y &&
        ball.y - ball.radius < gift.y + gift.size
    ) {
        gift.active = false;
        return;
    }

    /* ------------------------------------------------------------
       Collision avec la raquette → activation du bonus
    ------------------------------------------------------------ */
    if (
        gift.x < paddle.x + paddle.width &&
        gift.x + gift.size > paddle.x &&
        gift.y + gift.size > paddle.y &&
        gift.y < paddle.y + paddle.height
    ) {
        applyPowerUp(gift.type);
        gift.active = false;
        return;
    }

    /* ------------------------------------------------------------
       Sortie de l'écran → disparition
    ------------------------------------------------------------ */
    if (gift.y > canvas.height) {
        gift.active = false;
    }
}


/* ============================================================
   Dessin du cadeau
   ============================================================ */
function drawGift() {
    if (!gift.active) return;

    ctx.font = "24px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText("🎁", gift.x + gift.size / 2, gift.y + gift.size / 2);
}


/* ============================================================
   Application du bonus
   ============================================================ */
function applyPowerUp(type) {
    if (type === "paddle_wide") {
        paddle.width *= 1.3;
        gift.timer = 900; // 30 secondes à 60 FPS
    }
}
