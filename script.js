class SudokuGenerator {
    constructor() {
        this.grid = Array(9).fill().map(() => Array(9).fill(0));
    }

    generate(difficulty) {
        this.fillGrid(0, 0);
        this.removeNumbers(difficulty);
        return this.grid;
    }

    fillGrid(row, col) {
        if (col === 9) {
            row++;
            col = 0;
            if (row === 9) return true;
        }

        if (this.grid[row][col] !== 0) return this.fillGrid(row, col + 1);

        const numbers = this.shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);

        for (let num of numbers) {
            if (this.isValid(row, col, num)) {
                this.grid[row][col] = num;
                if (this.fillGrid(row, col + 1)) return true;
                this.grid[row][col] = 0;
            }
        }

        return false;
    }

    isValid(row, col, num) {
        for (let x = 0; x < 9; x++) {
            if (this.grid[row][x] === num) return false;
            if (this.grid[x][col] === num) return false;
        }

        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;

        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (this.grid[boxRow + i][boxCol + j] === num) return false;
            }
        }

        return true;
    }

    removeNumbers(difficulty) {
        let cellsToRemove;
        switch (difficulty) {
            case 'easy':
                cellsToRemove = 81 - this.getRandomInt(35, 41);
                break;
            case 'medium':
                cellsToRemove = 81 - this.getRandomInt(30, 35);
                break;
            case 'hard':
                cellsToRemove = 81 - this.getRandomInt(25, 30);
                break;
            default:
                cellsToRemove = 81 - 35;
        }

        while (cellsToRemove > 0) {
            const row = this.getRandomInt(0, 9);
            const col = this.getRandomInt(0, 9);
            if (this.grid[row][col] !== 0) {
                this.grid[row][col] = 0;
                cellsToRemove--;
            }
        }
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }
}

class SudokuGame {
    constructor(difficulty) {
        this.generator = new SudokuGenerator();
        this.board = this.generator.generate(difficulty);
        this.initialBoard = JSON.parse(JSON.stringify(this.board));
        this.solution = JSON.parse(JSON.stringify(this.board));
        this.generator.fillGrid(0, 0, this.solution);
        this.selectedCell = null;
        this.difficulty = difficulty;
    }

    isValidMove(row, col, num) {
        return this.generator.isValid(row, col, num);
    }

    checkWin() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.board[row][col] !== this.solution[row][col]) {
                    return false;
                }
            }
        }
        return true;
    }

    placeNumber(num) {
        if (this.selectedCell) {
            const [row, col] = this.getCellPosition(this.selectedCell);
            if (this.initialBoard[row][col] === 0) {
                this.board[row][col] = num;
                this.selectedCell.textContent = num !== 0 ? num : '';
                console.log(`Placed number ${num} at [${row}, ${col}]`); // Debug log
                if (this.checkWin()) {
                    this.endGame();
                }
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
            if (this.initialBoard[row][col] !== 0) {
                cell.textContent = this.initialBoard[row][col];
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

    endGame() {
        alert('Congratulations! You solved the puzzle!');
    }

    showHint() {
        console.log("showHint method called"); // New debug log
        let emptyCells = [];
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.board[row][col] === 0) {
                    emptyCells.push([row, col]);
                }
            }
        }

        console.log("Empty cells:", emptyCells.length); // Debug log

        if (emptyCells.length === 0) {
            alert("No empty cells left!");
            return;
        }

        const randomIndex = Math.floor(Math.random() * emptyCells.length);
        const [row, col] = emptyCells[randomIndex];
        const correctNumber = this.solution[row][col];

        // Find the cell element and update it
        const cellIndex = row * 9 + col;
        const cellElement = document.querySelector(`.cell[data-index="${cellIndex}"]`);
        if (cellElement) {
            cellElement.textContent = correctNumber;
            cellElement.classList.add('hint');
            console.log(`Hint placed: ${correctNumber} at [${row}, ${col}]`); // Debug log
        } else {
            console.log(`Error: Could not find cell element for index ${cellIndex}`); // New debug log
        }

        // Update the board
        this.board[row][col] = correctNumber;

        if (this.checkWin()) {
            this.endGame();
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
            if (game.checkWin()) {
                alert('Congratulations! The solution is correct!');
            } else {
                alert('The current solution is not correct. Keep trying!');
            }
        }
    });

    document.getElementById('show-hint').addEventListener('click', () => {
        if (game) {
            game.showHint();
        } else {
            alert("Please start a new game first.");
        }
    });

    // Start a new game when the page loads
    game = new SudokuGame('medium');
    game.startGame();
});
