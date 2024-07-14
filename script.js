class SudokuGenerator {
    // ... [Keep the SudokuGenerator class as is]
}

class SudokuGame {
    constructor(difficulty) {
        this.generator = new SudokuGenerator();
        this.board = this.generator.generate(difficulty);
        this.solution = JSON.parse(JSON.stringify(this.board));
        this.generator.fillGrid(0, 0, this.solution);
        this.selectedCell = null;
        this.difficulty = difficulty;
    }

    placeNumber(num) {
        if (this.selectedCell) {
            const [row, col] = this.getCellPosition(this.selectedCell);
            if (this.board[row][col] === 0) {
                this.board[row][col] = num;
                this.selectedCell.textContent = num !== 0 ? num : '';
            }
        }
    }

    getCellPosition(cell) {
        const index = parseInt(cell.dataset.index);
        return [Math.floor(index / 9), index % 9];
    }

    startGame() {
        this.renderBoard();
    }

    renderBoard() {
        const gameBoard = document.getElementById('game-board');
        gameBoard.innerHTML = '';
        for (let i = 0; i < 81; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.index = i;
            const [row, col] = this.getCellPosition(cell);
            if (this.board[row][col] !== 0) {
                cell.textContent = this.board[row][col];
                cell.classList.add('initial');
            } else {
                cell.addEventListener('click', () => this.selectCell(cell));
            }
            gameBoard.appendChild(cell);
        }
    }

    selectCell(cell) {
        if (this.selectedCell) {
            this.selectedCell.classList.remove('selected');
        }
        this.selectedCell = cell;
        cell.classList.add('selected');
    }

    showHint() {
        let emptyCells = [];
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.board[row][col] === 0) {
                    emptyCells.push([row, col]);
                }
            }
        }

        if (emptyCells.length === 0) {
            alert("No empty cells left!");
            return;
        }

        const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const correctNumber = this.solution[row][col];

        const cellIndex = row * 9 + col;
        const cellElement = document.querySelector(`.cell[data-index="${cellIndex}"]`);
        if (cellElement) {
            cellElement.textContent = correctNumber;
            cellElement.classList.add('hint');
            this.board[row][col] = correctNumber;
        }
    }
}

let game;

document.addEventListener('DOMContentLoaded', () => {
    const difficultyButtons = document.querySelectorAll('#difficulty-selector button');
    difficultyButtons.forEach(button => {
        button.addEventListener('click', () => {
            game = new SudokuGame(button.dataset.difficulty);
            game.startGame();
        });
    });

    document.addEventListener('keydown', (event) => {
        if (game && game.selectedCell) {
            const key = parseInt(event.key);
            if (key >= 1 && key <= 9) {
                game.placeNumber(key);
            } else if (event.key === 'Backspace' || event.key === 'Delete') {
                game.placeNumber(0);
            }
        }
    });

    document.getElementById('new-game').addEventListener('click', () => {
        if (game) {
            game = new SudokuGame(game.difficulty);
            game.startGame();
        }
    });

    document.getElementById('check-solution').addEventListener('click', () => {
        if (game) {
            let correct = true;
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    if (game.board[row][col] !== game.solution[row][col]) {
                        correct = false;
                        break;
                    }
                }
                if (!correct) break;
            }
            alert(correct ? 'Congratulations! The solution is correct!' : 'The current solution is not correct. Keep trying!');
        }
    });

    document.getElementById('show-hint').addEventListener('click', () => {
        if (game) {
            game.showHint();
        }
    });

    // Start a new game when the page loads
    game = new SudokuGame('medium');
    game.startGame();
});
