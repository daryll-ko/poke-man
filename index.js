const ROWS = getComputedStyle(document.body).getPropertyValue("--num-rows");
const COLS = getComputedStyle(document.body).getPropertyValue("--num-cols");

// [east, north, west, south]
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

function hasProperty(row, col, property) {
  return gridMatrix[row][col].classList.contains(property);
}

function isPath(row, col) {
  return hasProperty(row, col, "path");
}

function isWall(row, col) {
  return hasProperty(row, col, "wall");
}

function isPokeman(row, col) {
  return hasProperty(row, col, "pokeman");
}

function isChaser(row, col) {
  return hasProperty(row, col, "chaser");
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

function addProperty(row, col, property) {
  gridMatrix[row][col].classList.add(property);
}

function removeProperty(row, col, property) {
  gridMatrix[row][col].classList.remove(property);
}

let curRow, curCol, chaserSpawnpoints;

function fillGrid() {
  // outer path, Poké-Man
  let possiblePokemanSpawnpoints = [];
  for (let row = 0; row < ROWS; ++row) {
    for (let col = 0; col < COLS; ++col) {
      if (row === 0 || row === ROWS - 1 || col === 0 || col === COLS - 1) {
        addProperty(row, col, "path");
        possiblePokemanSpawnpoints.push([row, col]);
      }
    }
  }
  [curRow, curCol] = shuffle(possiblePokemanSpawnpoints).slice(0, 1)[0];
  addProperty(curRow, curCol, "pokeman");
  // walls
  fillInnerGrid();
  for (let col = 2; col < COLS - 2; ++col) {
    if (isPath(2, col) && !isPath(1, col - 1)) {
      addProperty(1, col, "path");
    }
    if (isPath(ROWS - 3, col) && !isPath(ROWS - 2, col - 1)) {
      addProperty(ROWS - 2, col, "path");
    }
  }
  for (let row = 2; row < ROWS - 2; ++row) {
    if (isPath(row, 2) && !isPath(row - 1, 1)) {
      addProperty(row, 1, "path");
    }
    if (isPath(row, COLS - 3) && !isPath(row - 1, COLS - 2)) {
      addProperty(row, COLS - 2, "path");
    }
  }
  for (let row = 0; row < ROWS; ++row) {
    for (let col = 0; col < COLS; ++col) {
      if (!isPath(row, col)) {
        addProperty(row, col, "wall");
      }
    }
  }
  // chasers
  let possibleChaserSpawnpoints = [];
  for (let row = ROWS / 5 * 2; row < ROWS / 5 * 3; ++row) {
    for (let col = COLS / 5 * 2; col < COLS / 5 * 3; ++col) {
      if (isPath(row, col)) {
        possibleChaserSpawnpoints.push([row, col]);
      }
    }
  }
  chaserSpawnpoints = shuffle(possibleChaserSpawnpoints).slice(0, Math.min(4, possibleChaserSpawnpoints.length));
  for (const [row, col] of chaserSpawnpoints) {
    addProperty(row, col, "chaser");
  }
  // berries
  for (let row = 0; row < ROWS; ++row) {
    for (let col = 0; col < COLS; ++col) {
      if (
        isPath(row, col) &&
        !isPokeman(row, col) &&
        !isChaser(row, col)
      ) {
        addProperty(row, col, "berry");
        const randomNumber = Math.floor(Math.random() * 100);
        if (randomNumber < 5) {
          addProperty(row, col, "berry-large");
        } else if (randomNumber < 30) {
          addProperty(row, col, "berry-medium");
        } else {
          addProperty(row, col, "berry-small");
        }
      }
    }
  }
}

fillGrid();

function smoothenGrid() {
  for (let row = 1; row < ROWS - 1; ++row) {
    for (let col = 1; col < COLS - 1; ++col) {
      if (isWall(row, col)) {
        if (isPath(row - 1, col) && isPath(row, col - 1)) {
          addProperty(row, col, "wall-top-left");
        }
        if (isPath(row - 1, col) && isPath(row, col + 1)) {
          addProperty(row, col, "wall-top-right");
        }
        if (isPath(row, col - 1) && isPath(row + 1, col)) {
          addProperty(row, col, "wall-bottom-left");
        }
        if (isPath(row, col + 1) && isPath(row + 1, col)) {
          addProperty(row, col, "wall-bottom-right");
        }
      }
    }
  }
}

smoothenGrid();

let score = 0;
const neededScore = 150;

let progressBar = document.getElementById("progress-bar");
progressBar.innerHTML = `
  <p class="progress-bar-text">${score} of ${neededScore}</p>
`;

let curDirection = 0, pokemanTimerId;

function startMovingPokeman() {
  pokemanTimerId = setInterval(() => {
    removeProperty(curRow, curCol, "pokeman");
    const nextRow = curRow + DELTA_I[curDirection];
    const nextCol = curCol + DELTA_J[curDirection];
    if (
      isWithinGrid(nextRow, nextCol) &&
      isPath(nextRow, nextCol)
    ) {
      curRow = nextRow;
      curCol = nextCol;
    }
    addProperty(curRow, curCol, "pokeman");
    checkForBerry();
    updateScore();
    checkForWin();
    checkForGameOver();
  }, 200);
}

startMovingPokeman();

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

function checkForBerry() {
  if (hasProperty(curRow, curCol, "berry")) {
    removeProperty(curRow, curCol, "berry");
    if (hasProperty(curRow, curCol, "berry-small")) {
      score += 1;
      removeProperty(curRow, curCol, "berry-small");
    } else if (hasProperty(curRow, curCol, "berry-medium")) {
      score += 3;
      removeProperty(curRow, curCol, "berry-medium");
    } else if (hasProperty(curRow, curCol, "berry-large")) {
      score += 5;
      removeProperty(curRow, curCol, "berry-large");
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

let playerStatus = document.getElementById("player-status");

function checkForWin() {
  if (score === neededScore) {
    clearInterval(pokemanTimerId);
    chasers.forEach(chaser => clearInterval(chaser.timerId));
    document.removeEventListener("keyup", changeDirection);
    playerStatus.textContent = "You win!";
  }
}

class Chaser {
  constructor(curRow, curCol, speed) {
    this.curRow = curRow;
    this.curCol = curCol;
    this.speed = speed;
    this.betterStrategyLimit = 10;
    this.timerId = null;
  }
}

const chasers = [];

chaserSpawnpoints.forEach(([row, col]) => chasers.push(new Chaser(row, col, 200)));

function startMovingChaser(chaser) {
  chaser.timerId = setInterval(() => {
    if (![0, 1, 2, 3].every((direction) => {
      const nextRow = chaser.curRow + DELTA_I[direction];
      const nextCol = chaser.curCol + DELTA_J[direction];
      return (
        !isWithinGrid(nextRow, nextCol) ||
        isWall(nextRow, nextCol) ||
        isChaser(nextRow, nextCol)
      );
    })) {
      const strategy = Math.floor(Math.random * 100);
      if (strategy < chaser.betterStrategyLimit) {
        let finalDirection = -1, distanceToBeat = ROWS * COLS;
        for (let direction = 0; direction < 4; ++direction) {
          const nextRow = chaser.curRow + DELTA_I[direction];
          const nextCol = chaser.curCol + DELTA_J[direction];
          if (
            isWithinGrid(nextRow, nextCol) &&
            isPath(nextRow, nextCol) &&
            !isChaser(nextRow, nextCol)
          ) {
            const distance = Math.abs(curRow - nextRow) + Math.abs(curCol - nextCol);
            if (distance < distanceToBeat) {
              finalDirection = direction;
            }
          }
        }
        const nextRow = chaser.curRow + DELTA_I[finalDirection];
        const nextCol = chaser.curCol + DELTA_J[finalDirection];
        gridMatrix[chaser.curRow][chaser.curCol].classList.remove("chaser");
        chaser.curRow = nextRow;
        chaser.curCol = nextCol;
        gridMatrix[chaser.curRow][chaser.curCol].classList.add("chaser");
      } else {
        let direction, nextRow, nextCol;
        do {
          direction = Math.floor(Math.random() * 4);
          nextRow = chaser.curRow + DELTA_I[direction];
          nextCol = chaser.curCol + DELTA_J[direction];
        } while (
          !isWithinGrid(nextRow, nextCol) ||
          !isPath(nextRow, nextCol) ||
          isChaser(nextRow, nextCol)
        );
        gridMatrix[chaser.curRow][chaser.curCol].classList.remove("chaser");
        chaser.curRow = nextRow;
        chaser.curCol = nextCol;
        gridMatrix[chaser.curRow][chaser.curCol].classList.add("chaser");
      }
    }
    checkForGameOver();
  }, chaser.speed);
}

chasers.forEach(chaser => startMovingChaser(chaser));

function checkForGameOver() {
  if (gridMatrix[curRow][curCol].classList.contains("chaser")) {
    clearInterval(pokemanTimerId);
    chasers.forEach(chaser => clearInterval(chaser.timerId));
    document.removeEventListener("keyup", changeDirection);
    playerStatus.textContent = "You lose...";
  }
}