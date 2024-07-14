class SudokuGenerator {
    constructor() {
        this.grid = Array(9).fill().map(() => Array(9).fill(0));
    }

    generate(difficulty) {
        const numToRemove = {
            'easy': 30,
            'medium': 40,
            'hard': 50
        }[difficulty];

        this.solve(0, 0);
        const solution = JSON.parse(JSON.stringify(this.grid));

        let removed = 0;
        while (removed < numToRemove) {
            const row = Math.floor(Math.random() * 9);
            const col = Math.floor(Math.random() * 9);
            if (this.grid[row][col] !== 0) {
                this.grid[row][col] = 0;
                removed++;
            }
        }

        return { puzzle: this.grid, solution: solution };
    }

    solve(row, col) {
        if (col === 9) {
            row++;
            col = 0;
        }
        if (row === 9) return true;

        if (this.grid[row][col] !== 0) return this.solve(row, col + 1);

        for (let num = 1; num <= 9; num++) {
            if (this.isValid(row, col, num)) {
                this.grid[row][col] = num;
                if (this.solve(row, col + 1)) return true;
                this.grid[row][col] = 0;
            }
        }

        return false;
    }

    isValid(row, col, num) {
        for (let i = 0; i < 9; i++) {
            if (this.grid[row][i] === num) return false;
            if (this.grid[i][col] === num) return false;
        }

        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let i = boxRow; i < boxRow + 3; i++) {
            for (let j = boxCol; j < boxCol + 3; j++) {
                if (this.grid[i][j] === num) return false;
            }
        }

        return true;
    }
}

class SudokuGame {
    constructor(difficulty) {
        const generator = new SudokuGenerator();
        const { puzzle, solution } = generator.generate(difficulty);
        this.board = puzzle;
        this.solution = solution;
        this.selectedCell = null;
        this.difficulty = difficulty;
    }

    placeNumber(num) {
        if (this.selectedCell && num >= 0 && num <= 9) {
            const [row, col] = this.getCellPosition(this.selectedCell);
            if (this.board[row][col] === 0 || !this.selectedCell.classList.contains('initial')) {
                this.board[row][col] = num;
                this.selectedCell.textContent = num !== 0 ? num : '';
                this.checkConflicts(row, col);
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
            }
            cell.addEventListener('click', () => this.selectCell(cell));
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

    checkConflicts(row, col) {
        this.clearHighlights();
        const num = this.board[row][col];
        if (num === 0) return;

        for (let i = 0; i < 9; i++) {
            if (i !== col && this.board[row][i] === num) {
                this.highlightConflict(row, i);
            }
            if (i !== row && this.board[i][col] === num) {
                this.highlightConflict(i, col);
            }
        }

        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let i = boxRow; i < boxRow + 3; i++) {
            for (let j = boxCol; j < boxCol + 3; j++) {
                if (i !== row && j !== col && this.board[i][j] === num) {
                    this.highlightConflict(i, j);
                }
            }
        }
    }

    highlightConflict(row, col) {
        const cellIndex = row * 9 + col;
        const cell = document.querySelector(`.cell[data-index="${cellIndex}"]`);
        if (cell) {
            cell.classList.add('conflicting');
        }
    }

    clearHighlights() {
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('conflicting');
        });
    }

    checkSolution() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.board[row][col] !== this.solution[row][col]) {
                    return false;
                }
            }
        }
        this.showCongratulations();
        return true;
    }

    showCongratulations() {
        const congratsModal = document.createElement('div');
        congratsModal.className = 'congrats-modal';
        congratsModal.innerHTML = `
            <div class="congrats-content">
                <h2>Congratulations!</h2>
                <p>You've solved the puzzle!</p>
                <img src="https://i.pinimg.com/originals/44/1a/d4/441ad464bf8681ececd5bb41230142d6.gif" alt="Congratulations">
                <button id="close-congrats">Close</button>
            </div>
        `;
        document.body.appendChild(congratsModal);

        document.getElementById('close-congrats').addEventListener('click', () => {
            congratsModal.remove();
        });
    }

    moveSelection(direction) {
        if (!this.selectedCell) return;
        
        let index = parseInt(this.selectedCell.dataset.index);
        switch(direction) {
            case 'ArrowUp': index -= 9; break;
            case 'ArrowDown': index += 9; break;
            case 'ArrowLeft': index--; break;
            case 'ArrowRight': index++; break;
        }
        
        if (index >= 0 && index < 81) {
            const newCell = document.querySelector(`.cell[data-index="${index}"]`);
            if (newCell) this.selectCell(newCell);
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
            } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
                game.moveSelection(event.key);
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
            const correct = game.checkSolution();
            if (!correct) {
                alert('The current solution is not correct. Keep trying!');
            }
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
