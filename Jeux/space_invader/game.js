const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

/* ============================================================
   MODULE : PLAYER
   ============================================================ */
const player = {
    x: canvas.width / 2 - 20,
    y: canvas.height - 60,
    width: 40,
    height: 20,
    speed: 5,
    movingLeft: false,
    movingRight: false,

    update() {
        if (this.movingLeft && this.x > 0) this.x -= this.speed;
        if (this.movingRight && this.x < canvas.width - this.width) this.x += this.speed;
    },

    draw() {
        ctx.fillStyle = "white";
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
};

/* ============================================================
   MODULE : BULLETS
   ============================================================ */
const bullets = [];

const Bullets = {
    fire() {
        bullets.push({ x: player.x + 18, y: player.y });
    },

    update() {
        bullets.forEach(b => b.y -= 5);
        for (let i = bullets.length - 1; i >= 0; i--) {
            if (bullets[i].y < 0) bullets.splice(i, 1);
        }
    },

    draw() {
        ctx.fillStyle = "red";
        bullets.forEach(b => ctx.fillRect(b.x, b.y, 4, 10));
    }
};

/* ============================================================
   MODULE : ENEMIES
   ============================================================ */
const enemies = [];
const enemyWidth = 40;
const enemyHeight = 20;
let enemyDirection = 1;

const Enemies = {
    init(rows = 3, cols = 6) {
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                enemies.push({
                    x: 50 + c * 60,
                    y: 50 + r * 40,
                    width: enemyWidth,
                    height: enemyHeight,
                    alive: true
                });
            }
        }
    },

    update() {
        enemies.forEach(e => {
            if (e.alive) e.x += enemyDirection;
        });

        const hitEdge = enemies.some(e =>
            e.alive && (e.x <= 0 || e.x >= canvas.width - enemyWidth)
        );

        if (hitEdge) {
            enemyDirection *= -1;
            enemies.forEach(e => e.y += 20);
        }

        // collisions
        bullets.forEach(b => {
            enemies.forEach(e => {
                if (e.alive &&
                    b.x < e.x + e.width &&
                    b.x + 4 > e.x &&
                    b.y < e.y + e.height &&
                    b.y + 10 > e.y
                ) {
                    e.alive = false;
                    b.y = -100;
                }
            });
        });
    },

    draw() {
        ctx.fillStyle = "green";
        enemies.forEach(e => {
            if (e.alive) ctx.fillRect(e.x, e.y, e.width, e.height);
        });
    }
};

Enemies.init();

/* ============================================================
   MODULE : TOUCH CONTROLS
   ============================================================ */
const Controls = {
    init() {
        const left = document.getElementById("left");
        const right = document.getElementById("right");
        const fire = document.getElementById("fire");

        left.addEventListener("touchstart", () => player.movingLeft = true);
        left.addEventListener("touchend", () => player.movingLeft = false);

        right.addEventListener("touchstart", () => player.movingRight = true);
        right.addEventListener("touchend", () => player.movingRight = false);

        fire.addEventListener("touchstart", () => Bullets.fire());
    }
};

Controls.init();

/* ============================================================
   GAME LOOP
   ============================================================ */
function update() {
    player.update();
    Bullets.update();
    Enemies.update();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    player.draw();
    Bullets.draw();
    Enemies.draw();
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

loop();
