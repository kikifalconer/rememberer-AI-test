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
    const generator = new SudokuGenerator();
    this.board = generator.generate(difficulty);
    this.solution = JSON.parse(JSON.stringify(this.board));
    this.fillGrid(0, 0, this.solution);
  }

  isValidMove(row, col, num) {
    return new SudokuGenerator().isValid(row, col, num);
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

  fillGrid(row, col, grid) {
    if (col === 9) {
      row++;
      col = 0;
      if (row === 9) return true;
    }

    if (grid[row][col] !== 0) return this.fillGrid(row, col + 1, grid);

    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    for (let num of numbers) {
      if (new SudokuGenerator().isValid(row, col, num)) {
        grid[row][col] = num;
        if (this.fillGrid(row, col + 1, grid)) return true;
        grid[row][col] = 0;
      }
    }

    return false;
  }
}

// Usage example:
const game = new SudokuGame('medium');
console.log(game.board); // The Sudoku puzzle
console.log(game.isValidMove(0, 0, 5)); // Check if placing 5 at (0,0) is valid
console.log(game.checkWin()); // Check if the puzzle is solved