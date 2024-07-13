class SudokuGame {
    constructor(difficulty) {
        this.generator = new SudokuGenerator();
        this.board = this.generator.generate(difficulty);
        this.solution = JSON.parse(JSON.stringify(this.board));
        this.generator.fillGrid(0, 0, this.solution);
        this.selectedCell = null;
        this.timer = 0;
        this.timerInterval = null;
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

    // New method to place a number
    placeNumber(num) {
        if (this.selectedCell) {
            const [row, col] = this.getCellPosition(this.selectedCell);
            if (this.board[row][col] === 0) {
                if (this.isValidMove(row, col, num)) {
                    this.board[row][col] = num;
                    this.selectedCell.textContent = num;
                    this.selectedCell.classList.remove('conflicting');
                    if (this.checkWin()) {
                        this.endGame();
                    }
                } else {
                    this.selectedCell.classList.add('conflicting');
                }
            }
        }
    }

    // Helper method to get row and column from cell index
    getCellPosition(cell) {
        const index = parseInt(cell.dataset.index);
        return [Math.floor(index / 9), index % 9];
    }

    // New method to start the game
    startGame() {
        this.renderBoard();
        this.startTimer();
    }

    // New method to render the board
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

    // New method to select a cell
    selectCell(cell) {
        if (this.selectedCell) {
            this.selectedCell.classList.remove('selected');
        }
        this.selectedCell = cell;
        cell.classList.add('selected');
    }

    // New method to start the timer
    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.updateTimerDisplay();
        }, 1000);
    }

    // New method to update the timer display
    updateTimerDisplay() {
        const minutes = Math.floor(this.timer / 60);
        const seconds = this.timer % 60;
        document.getElementById('timer').textContent = 
            `Time: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // New method to end the game
    endGame() {
        clearInterval(this.timerInterval);
        alert('Congratulations! You solved the puzzle!');
        // TODO: Implement win animation
    }
}

// Game initialization
let game;

document.addEventListener('DOMContentLoaded', () => {
    const difficultyButtons = document.querySelectorAll('#difficulty-selector button');
    difficultyButtons.forEach(button => {
        button.addEventListener('click', () => {
            game = new SudokuGame(button.dataset.difficulty);
            game.startGame();
        });
    });

    const numberButtons = document.querySelectorAll('#number-pad .num-btn');
    numberButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (game) {
                game.placeNumber(parseInt(button.dataset.num));
            }
        });
    });

    document.getElementById('erase-btn').addEventListener('click', () => {
        if (game && game.selectedCell) {
            const [row, col] = game.getCellPosition(game.selectedCell);
            if (game.board[row][col] !== 0) {
                game.board[row][col] = 0;
                game.selectedCell.textContent = '';
                game.selectedCell.classList.remove('conflicting');
            }
        }
    });

    document.getElementById('new-game').addEventListener('click', () => {
        if (game) {
            const difficulty = game.difficulty;
            game = new SudokuGame(difficulty);
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
            // TODO: Implement hint functionality
            alert('Hint functionality not yet implemented');
        }
    });
});
