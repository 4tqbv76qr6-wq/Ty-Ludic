/* ============================================================
   GAME STATE
   ============================================================ */
let score = 0;
let level = 1;
let enemyFireRate = 0.02;
let gameOverHandled = false;
let waitingForStart = false;

/* ============================================================
   DOM ELEMENTS
   ============================================================ */
const scoreDisplay = document.getElementById("score");
const levelDisplay = document.getElementById("level");
const bestDisplay = document.getElementById("best");

const popup = document.getElementById("level-popup");
const popupTitle = document.getElementById("level-title");
const popupStart = document.getElementById("level-start");
