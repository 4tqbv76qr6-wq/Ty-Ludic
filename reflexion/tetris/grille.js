/* ============================================================
   MODULE GRILLE — TETRIS (TY‑LUDIC)
   ============================================================ */

window.Grille = {
    grid: [],

    init() {
        this.grid = [];
        for (let r = 0; r < ROWS; r++) {
            this.grid[r] = new Array(COLS).fill(0);
        }
    },

    collides(shape, x, y) {
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (!shape[r][c]) continue;

                const nx = c + x;
                const ny = r + y;

                if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
                if (ny >= 0 && this.grid[ny][nx]) return true;
            }
        }
        return false;
    },

    mergePiece(piece) {
        const shape = piece.shape;
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (!shape[r][c]) continue;

                const x = piece.x + c;
                const y = piece.y + r;

                if (y >= 0 && y < ROWS && x >= 0 && x < COLS) {
                    this.grid[y][x] = piece.color;
                }
            }
        }
    },

    clearLines() {
        let lines = 0;

        for (let r = ROWS - 1; r >= 0; r--) {
            if (this.grid[r].every(cell => cell !== 0)) {
                this.grid.splice(r, 1);
                this.grid.unshift(new Array(COLS).fill(0));
                lines++;
                r++;
            }
        }

        return lines;
    }
};
