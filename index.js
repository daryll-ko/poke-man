const ROWS = getComputedStyle(document.body).getPropertyValue("--num-rows");
const COLS = getComputedStyle(document.body).getPropertyValue("--num-cols");

const DELTA_I = [0, -1, 0, 1];
const DELTA_J = [1, 0, -1, 0];

let grid = document.querySelector(".grid");
let gridMatrix = [];

function createGrid() {
  for (let i = 0; i < ROWS * COLS; ++i) {
    const square = document.createElement("div");
    grid.appendChild(square);
    if (i % COLS === 0) {
      gridMatrix.push([]);
    }
    gridMatrix[gridMatrix.length - 1].push(square);
  }
}

createGrid();

function shuffle(array) {
  let curIndex = array.length - 1;
  while (curIndex > 0) {
    const randomIndex = Math.floor(Math.random() * curIndex);
    [array[curIndex], array[randomIndex]] = [array[randomIndex], array[curIndex]];
    --curIndex;
  }
  return array;
}

function isWithinGrid(row, col) {
  return 0 <= row && row < ROWS && 0 <= col && col < COLS;
}

function isWithinInnerGrid(row, col) {
  return 2 <= row && row < ROWS - 2 && 2 <= col && col < COLS - 2;
}

function isPath(row, col) {
  return gridMatrix[row][col].classList.contains("path");
}

function isNewTerritory(row, col) {
  let score = 0;
  for (let direction = 0; direction < 4; ++direction) {
    const adjRow = row + DELTA_I[direction];
    const adjCol = col + DELTA_J[direction];
    score += !isWithinInnerGrid(adjRow, adjCol) || !isPath(adjRow, adjCol);
  }
  return score === 3;
}

function fillInnerGrid(curRow=2, curCol=2) {
  gridMatrix[curRow][curCol].classList.add("path");
  for (const direction of shuffle([0, 1, 2, 3])) {
    const nextRow = curRow + DELTA_I[direction];
    const nextCol = curCol + DELTA_J[direction];
    if (
      isWithinInnerGrid(nextRow, nextCol) &&
      !isPath(nextRow, nextCol) &&
      isNewTerritory(nextRow, nextCol)
    ) {
      fillInnerGrid(nextRow, nextCol);
    }
  }
}

let curRow, curCol, ghostSpawnpoints;

function fillGrid() {
  // outer path, pacman
  let possPacmanSpawnpoints = [];
  for (let row = 0; row < ROWS; ++row) {
    for (let col = 0; col < COLS; ++col) {
      if (row === 0 || row === ROWS - 1 || col === 0 || col === COLS - 1) {
        gridMatrix[row][col].classList.add("path");
        possPacmanSpawnpoints.push([row, col]);
      }
    }
  }
  [curRow, curCol] = shuffle(possPacmanSpawnpoints).slice(0, 1)[0];
  gridMatrix[curRow][curCol].classList.add("pacman");
  // walls
  fillInnerGrid();
  for (let col = 2; col < COLS - 2; ++col) {
    if (isPath(2, col) && !isPath(1, col - 1)) {
      gridMatrix[1][col].classList.add("path");
    }
    if (isPath(ROWS - 3, col) && !isPath(ROWS - 2, col - 1)) {
      gridMatrix[ROWS - 2][col].classList.add("path");
    }
  }
  for (let row = 2; row < ROWS - 2; ++row) {
    if (isPath(row, 2) && !isPath(row - 1, 1)) {
      gridMatrix[row][1].classList.add("path");
    }
    if (isPath(row, COLS - 3) && !isPath(row - 1, COLS - 2)) {
      gridMatrix[row][COLS - 2].classList.add("path");
    }
  }
  for (let row = 0; row < ROWS; ++row) {
    for (let col = 0; col < COLS; ++col) {
      if (!isPath(row, col)) {
        gridMatrix[row][col].classList.add("wall");
      }
    }
  }
  // ghosts
  let possGhostSpawnpoints = [];
  for (let row = ROWS / 5 * 2; row < ROWS / 5 * 3; ++row) {
    for (let col = COLS / 5 * 2; col < COLS / 5 * 3; ++col) {
      if (isPath(row, col)) {
        possGhostSpawnpoints.push([row, col]);
      }
    }
  }
  ghostSpawnpoints = shuffle(possGhostSpawnpoints).slice(0, Math.min(4, possGhostSpawnpoints.length));
  for (const [row, col] of ghostSpawnpoints) {
    gridMatrix[row][col].classList.add("ghost");
  }
  // pellets
  for (let row = 0; row < ROWS; ++row) {
    for (let col = 0; col < COLS; ++col) {
      if (
        isPath(row, col) &&
        !gridMatrix[row][col].classList.contains("pacman") &&
        !gridMatrix[row][col].classList.contains("ghost")
      ) {
        gridMatrix[row][col].classList.add("pellet");
        const randomNumber = Math.floor(Math.random() * 100);
        if (randomNumber < 5) {
          gridMatrix[row][col].classList.add("pellet-large");
        } else if (randomNumber < 30) {
          gridMatrix[row][col].classList.add("pellet-medium");
        } else {
          gridMatrix[row][col].classList.add("pellet-small");
        }
      }
    }
  }
}

fillGrid();

let score = 0;
const neededScore = 350;

let progressBar = document.getElementById("progress-bar");
progressBar.innerHTML = `
  <p class="progress-bar-text">${score} of ${neededScore}</p>
`;

let curDirection = 0, pacmanTimerId;

function startMovingPacman() {
  pacmanTimerId = setInterval(() => {
    gridMatrix[curRow][curCol].classList.remove("pacman");
    const nextRow = curRow + DELTA_I[curDirection];
    const nextCol = curCol + DELTA_J[curDirection];
    if (
      isWithinGrid(nextRow, nextCol) &&
      isPath(nextRow, nextCol)
    ) {
      curRow = nextRow;
      curCol = nextCol;
    }
    gridMatrix[curRow][curCol].classList.add("pacman");
    checkForPellet();
    updateScore();
    checkForWin();
    checkForGameOver();
  }, 200);
}

startMovingPacman();

function changeDirection(event) {
  switch (event.key) {
    case "d":
    case "ArrowRight":
      curDirection = 0;
      break;
    case "w":
    case "ArrowUp":
      curDirection = 1;
      break;
    case "a":
    case "ArrowLeft":
      curDirection = 2;
      break;
    case "s":
    case "ArrowDown":
      curDirection = 3;
      break;
  }
}

document.addEventListener("keyup", changeDirection);

function checkForPellet() {
  if (gridMatrix[curRow][curCol].classList.contains("pellet")) {
    gridMatrix[curRow][curCol].classList.remove("pellet");
    if (gridMatrix[curRow][curCol].classList.contains("pellet-small")) {
      score += 1;
      gridMatrix[curRow][curCol].classList.remove("pellet-small");
    } else if (gridMatrix[curRow][curCol].classList.contains("pellet-medium")) {
      score += 3;
      gridMatrix[curRow][curCol].classList.remove("pellet-medium");
    } else if (gridMatrix[curRow][curCol].classList.contains("pellet-large")) {
      score += 5;
      gridMatrix[curRow][curCol].classList.remove("pellet-large");
    }
  }
}

function updateScore() {
  score = Math.min(score, neededScore);
  progressBar.innerHTML = `
    <p class="progress-bar-text">${score} of ${neededScore}</p>
  `;
  progressBar.style.backgroundImage = `
    linear-gradient(to right, var(--primary-color), var(--primary-color) ${(score / neededScore) * 100}%, white ${(score / neededScore) * 100}%, white 100%)
  `;
}

let statusElement = document.querySelector(".info-status");

function checkForWin() {
  if (score === neededScore) {
    clearInterval(pacmanTimerId);
    ghosts.forEach(ghost => clearInterval(ghost.timerId));
    document.removeEventListener("keyup", changeDirection);
    statusElement.textContent = "You win!";
  }
}

class Ghost {
  constructor(curRow, curCol, speed) {
    this.curRow = curRow;
    this.curCol = curCol;
    this.speed = speed;
    this.betterStrategyLimit = 10;
    this.timerId = null;
  }
}

const ghosts = [];

ghostSpawnpoints.forEach(([row, col]) => ghosts.push(new Ghost(row, col, 200)));

function startMovingGhost(ghost) {
  ghost.timerId = setInterval(() => {
    if (![0, 1, 2, 3].every((direction) => {
      const nextRow = ghost.curRow + DELTA_I[direction];
      const nextCol = ghost.curCol + DELTA_J[direction];
      return (
        !isWithinGrid(nextRow, nextCol) ||
        !isPath(nextRow, nextCol) ||
        gridMatrix[nextRow][nextCol].classList.contains("ghost")
      );
    })) {
      const strategy = Math.floor(Math.random * 100);
      if (strategy < ghost.betterStrategyLimit) {
        let finalDirection = -1, distanceToBeat = ROWS * COLS;
        for (let direction = 0; direction < 4; ++direction) {
          const nextRow = ghost.curRow + DELTA_I[direction];
          const nextCol = ghost.curCol + DELTA_J[direction];
          if (
            isWithinGrid(nextRow, nextCol) &&
            isPath(nextRow, nextCol) &&
            !gridMatrix[nextRow][nextCol].classList.contains("ghost")
          ) {
            const distance = Math.abs(curRow - nextRow) + Math.abs(curCol - nextCol);
            if (distance < distanceToBeat) {
              finalDirection = direction;
            }
          }
        }
        const nextRow = ghost.curRow + DELTA_I[finalDirection];
        const nextCol = ghost.curCol + DELTA_J[finalDirection];
        gridMatrix[ghost.curRow][ghost.curCol].classList.remove("ghost");
        ghost.curRow = nextRow;
        ghost.curCol = nextCol;
        gridMatrix[ghost.curRow][ghost.curCol].classList.add("ghost");
      } else {
        let direction, nextRow, nextCol;
        do {
          direction = Math.floor(Math.random() * 4);
          nextRow = ghost.curRow + DELTA_I[direction];
          nextCol = ghost.curCol + DELTA_J[direction];
        } while (
          !isWithinGrid(nextRow, nextCol) ||
          !isPath(nextRow, nextCol) ||
          gridMatrix[nextRow][nextCol].classList.contains("ghost")
        );
        gridMatrix[ghost.curRow][ghost.curCol].classList.remove("ghost");
        ghost.curRow = nextRow;
        ghost.curCol = nextCol;
        gridMatrix[ghost.curRow][ghost.curCol].classList.add("ghost");
      }
    }
    checkForGameOver();
  }, ghost.speed);
}

ghosts.forEach(ghost => startMovingGhost(ghost));

function checkForGameOver() {
  if (gridMatrix[curRow][curCol].classList.contains("ghost")) {
    clearInterval(pacmanTimerId);
    ghosts.forEach(ghost => clearInterval(ghost.timerId));
    document.removeEventListener("keyup", changeDirection);
    statusElement.textContent = "You lose...";
  }
}