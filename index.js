const ROWS = getComputedStyle(document.body).getPropertyValue("--num-rows");
const COLS = getComputedStyle(document.body).getPropertyValue("--num-cols");

// [east, north, west, south]
const DELTA_I = [0, -1, 0, 1];
const DELTA_J = [1, 0, -1, 0];

let grid = document.getElementById("grid");
let gridMatrix = [];

let curRow, curCol, chaserSpawnpoints;

let score, maxScore, neededScore;

let progressBar = document.getElementById("progress-bar");

let curDirection, pokemanTimerId;

let actionElement = document.getElementById("action-element");

let timeButton = document.getElementById("button-time");
let resetButton = document.getElementById("button-reset");

const numChasers = 4;
let chasers = [];
let chaserId;

let pokemanSpriteId, chaserSpriteId;
let pokemanSprite, chaserSpriteIds = [], chaserSprites = [];

let upPanel = document.getElementById("up");
let leftPanel = document.getElementById("left");
let downPanel = document.getElementById("down");
let rightPanel = document.getElementById("right");

let pokemanDisplay = document.getElementById("players-pokeman");
let chasersDisplay = document.getElementById("players-chasers");

let gridGraph = [], graphDistances = [];
let cellNumbers = new Map();

class Chaser {
  constructor(chaserId, curRow, curCol, speed) {
    this.chaserId = chaserId;
    this.curRow = curRow;
    this.curCol = curCol;
    this.speed = speed;
    this.timerId = null;
  }
}

generateGame();

/* Floyd-Warshall stuff starts here */

function floydWarshall() {
  function adjacent([cell_1_row, cell_1_col], [cell_2_row, cell_2_col]) {
    return Math.abs(cell_1_row - cell_2_row) + Math.abs(cell_1_col - cell_2_col) === 1;
  }

  let curCellIndex = 0;

  gridGraph.forEach(([row, col]) => {
    cellNumbers.set(row * COLS + col, curCellIndex++);
  });

  const numberOfCells = curCellIndex;

  for (let i = 0; i < numberOfCells; ++i) {
    graphDistances.push([]);
    for (let j = 0; j < numberOfCells; ++j) {
      graphDistances.at(-1).push(123456789);
    }
  }

  for (let i = 0; i < numberOfCells; ++i) {
    for (let j = 0; j < numberOfCells; ++j) {
      if (i === j) {
        graphDistances[i][j] = 0;
      } else if (adjacent(gridGraph[i], gridGraph[j])) {
        graphDistances[i][j] = 1;
      }
    }
  }

  for (let k = 0; k < numberOfCells; ++k) {
    for (let i = 0; i < numberOfCells; ++i) {
      for (let j = 0; j < numberOfCells; ++j) {
        graphDistances[i][j] = Math.min(graphDistances[i][j], graphDistances[i][k] + graphDistances[k][j]);
      }
    }
  }
}

/* ^ Floyd-Warshall stuff ends here ^ */

function generateGame() {
  resetButton.style.display = "block";
  resetButton.addEventListener("click", generateGame);
  document.addEventListener("keyup", (event) => {
    if (event.key === "f") {
      generateGame();
    }
  });
  timeButton.style.display = "none";
  timeButton.removeEventListener("click", toggleTime);
  document.removeEventListener("keyup", (event) => {
    if (event.key === "e") {
      toggleTime();
    }
  });
  progressBar.style.backgroundImage =
  `linear-gradient(
      to right,
      var(--primary-color),
      var(--primary-color) 0%,
      var(--internal-color) 0%,
      var(--internal-color) 100%
    )`;
  clearInterval(pokemanTimerId);
  document.removeEventListener("keyup", changeDirection);
  chasers.forEach((chaser) => clearInterval(chaser.timerId));
  grid.innerHTML = "";
  gridMatrix = [];
  score = 0;
  curDirection = -1;
  pokemanSpriteId = (Math.floor(Math.random() * 802) + 1).toString().padStart(3, '0');
  pokemanSprite = `url(images/pokemon/Shuffle${pokemanSpriteId}.png)`;
  chaserSpriteIds = [];
  chaserSprites = [];
  for (let i = 0; i < numChasers; ++i) {
    chaserSpriteId = (Math.floor(Math.random() * 802) + 1).toString().padStart(3, "0");
    chaserSpriteIds.push(chaserSpriteId);
    chaserSprites.push(`url(images/pokemon/Shuffle${chaserSpriteId}.png)`);
  }
  generatePlayerInfo();
  gridGraph = [];
  createGrid();
  fillGrid();
  graphDistances = [];
  cellNumbers.clear();
  floydWarshall();
  neededScore = Math.floor(Math.floor(4 * maxScore / 5) / 10) * 10;
  chasers = [];
  chaserId = 0;
  chaserSpawnpoints.forEach(([row, col]) => {
    chasers.push(new Chaser(chaserId, row, col, 200));
    ++chaserId;
  });
  setPokemanSprite();
  chasers.forEach(chaser => setChaserSprite(chaser));
  smoothenGrid();
  progressBar.innerHTML = `
    <p class="progress-bar-text">${score} of ${neededScore}</p>
  `;
  actionElement.textContent = "Press any movement key to start!";
  document.addEventListener("keyup", tryStartingGame);
}

function tryStartingGame(event) {
  if (["d", "w", "a", "s", "ArrowRight", "ArrowUp", "ArrowLeft", "ArrowDown"].includes(event.key)) {
    changeDirection(event);
    startGame();
  }
}

async function generatePlayerInfo() {
  const response = await fetch("pokedex.json");
  const data = await response.json();
  const { name: pokemanName } = data[parseInt(pokemanSpriteId) - 1];
  pokemanDisplay.innerHTML = `
    <div class="pokeman-sprite"></div>
    <p class="pokeman-name">${pokemanName}</p>
  `;
  [...document.getElementsByClassName("pokeman-sprite")].forEach(element => {
    element.style.backgroundImage = pokemanSprite;
  });
  let curIndex = 0;
  chasersDisplay.innerHTML = "";
  chaserSpriteIds.forEach(id => {
    const {name: chaserName } = data[parseInt(id) - 1];
    chasersDisplay.innerHTML += `
      <div class="chaser-sprite"></div>
      <p class="chaser-name">${chaserName}</p>
    `;
    const element = [...document.getElementsByClassName("chaser-sprite")][curIndex];
    element.style.backgroundImage = chaserSprites[curIndex];
    ++curIndex;
  });
}

function removePokemanSprite() {
    [...document.getElementsByClassName("pokeman")].forEach((square) => {
      square.style.backgroundImage = "none";
    });
}

function removeChaserSprite(chaser) {
  const square = gridMatrix[chaser.curRow][chaser.curCol];
  square.style.backgroundImage = "none";
}

function fixBerry(row, col) {
  for (let berry of [
    "berry-razz", "berry-razz-silver", "berry-razz-gold",
    "berry-pinap", "berry-pinap-silver", "berry-pinap-gold",
    "berry-nanab", "berry-nanab-silver", "berry-nanab-gold"
  ]) {
    if (hasProperty(row, col, berry)) {
      gridMatrix[row][col].style.backgroundImage = `url(images/berries/${berry.split('-').reverse().join('-')}.webp)`;
    }
  }
}

function setPokemanSprite() {
  [...document.getElementsByClassName("pokeman")].forEach(square => {
    square.style.backgroundImage = pokemanSprite;
  });
}

function setChaserSprite(chaser) {
  const square = gridMatrix[chaser.curRow][chaser.curCol];
  square.style.backgroundImage = chaserSprites[chaser.chaserId];
}

function toggleTime() {
  if (timeButton.textContent === "Pause | E") {
    clearInterval(pokemanTimerId);
    chasers.forEach((chaser) => clearInterval(chaser.timerId));
    document.removeEventListener("keyup", changeDirection);
    actionElement.textContent = "Game paused...";
    timeButton.textContent = "Continue | E";
  } else {
    startMovingPokeman();
    chasers.forEach((chaser) => startMovingChaser(chaser));
    document.addEventListener("keyup", changeDirection);
    actionElement.textContent = "Still alive!";
    timeButton.textContent = "Pause | E";
  }
}

function startGame() {
  resetButton.style.display = "none";
  resetButton.removeEventListener("click", generateGame);
  document.removeEventListener("keyup", (event) => {
    if (event.key === "f") {
      generateGame();
    }
  });
  timeButton.style.display = "block";
  timeButton.addEventListener("click", toggleTime);
  document.addEventListener("keyup", event => {
    if (event.key === "e") {
      toggleTime();
    }
  });
  startMovingPokeman();
  chasers.forEach((chaser) => startMovingChaser(chaser));
  document.addEventListener("keyup", changeDirection);
  actionElement.textContent = "Still alive!";
  document.removeEventListener("keyup", tryStartingGame);
}

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
  addProperty(curRow, curCol, "path");
  gridGraph.push([curRow, curCol]);
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

function fillGrid() {
  // outer path, Poké-Man
  let possiblePokemanSpawnpoints = [];
  for (let row = 0; row < ROWS; ++row) {
    for (let col = 0; col < COLS; ++col) {
      if (row === 0 || row === ROWS - 1 || col === 0 || col === COLS - 1) {
        addProperty(row, col, "path");
        gridGraph.push([row, col]);
        possiblePokemanSpawnpoints.push([row, col]);
      }
    }
  }
  [curRow, curCol] = shuffle(possiblePokemanSpawnpoints).slice(0, 1)[0];
  addProperty(curRow, curCol, "pokeman");
  fillInnerGrid();
  for (let col = 2; col < COLS - 2; ++col) {
    if (isPath(2, col) && !isPath(1, col - 1)) {
      addProperty(1, col, "path");
      gridGraph.push([1, col]);
    }
    if (isPath(ROWS - 3, col) && !isPath(ROWS - 2, col - 1)) {
      addProperty(ROWS - 2, col, "path");
      gridGraph.push([ROWS - 2, col]);
    }
  }
  for (let row = 2; row < ROWS - 2; ++row) {
    if (isPath(row, 2) && !isPath(row - 1, 1)) {
      addProperty(row, 1, "path");
      gridGraph.push([row, 1]);
    }
    if (isPath(row, COLS - 3) && !isPath(row - 1, COLS - 2)) {
      addProperty(row, COLS - 2, "path");
      gridGraph.push([row, COLS - 2]);
    }
  }
  // walls
  for (let row = 0; row < ROWS; ++row) {
    for (let col = 0; col < COLS; ++col) {
      if (!isPath(row, col)) {
        addProperty(row, col, "wall");
      }
    }
  }
  // chasers
  let possibleChaserSpawnpoints = [];
  for (let row = (ROWS / 5) * 2; row < (ROWS / 5) * 3; ++row) {
    for (let col = (COLS / 5) * 2; col < (COLS / 5) * 3; ++col) {
      if (isPath(row, col)) {
        possibleChaserSpawnpoints.push([row, col]);
      }
    }
  }
  chaserSpawnpoints = shuffle(possibleChaserSpawnpoints).slice(
    0,
    Math.min(numChasers, possibleChaserSpawnpoints.length)
  );
  for (const [row, col] of chaserSpawnpoints) {
    addProperty(row, col, "chaser");
  }
  // berries
  maxScore = 0;
  for (let row = 0; row < ROWS; ++row) {
    for (let col = 0; col < COLS; ++col) {
      if (isPath(row, col) && !isPokeman(row, col) && !isChaser(row, col)) {
        addProperty(row, col, "berry");
        let randomNumber = Math.floor(Math.random() * 100);
        if (randomNumber < 5) {
          maxScore += 5;
          randomNumber = Math.floor(Math.random() * 3);
          addProperty(
            row,
            col,
            `berry-${["razz", "pinap", "nanab"][randomNumber]}-golden`
          );
        } else if (randomNumber < 25) {
          maxScore += 3;
          randomNumber = Math.floor(Math.random() * 3);
          addProperty(
            row,
            col,
            `berry-${["razz", "pinap", "nanab"][randomNumber]}-silver`
          );
        } else {
          ++maxScore;
          randomNumber = Math.floor(Math.random() * 3);
          addProperty(
            row,
            col,
            `berry-${["razz", "pinap", "nanab"][randomNumber]}`
          );
        }
      }
    }
  }
}

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

function startMovingPokeman() {
  pokemanTimerId = setInterval(() => {
    removeProperty(curRow, curCol, "pokeman");
    removePokemanSprite();
    fixBerry(curRow, curCol);
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
    setPokemanSprite();
    checkForBerry();
    updateScore();
    checkForWin();
    checkForGameOver();
  }, 200);
}

function clearMovementPanel() {
  rightPanel.classList.remove("active-direction");
  upPanel.classList.remove("active-direction");
  leftPanel.classList.remove("active-direction");
  downPanel.classList.remove("active-direction");
}

function updateMovementPanel() {
  if (curDirection === 0) {
    rightPanel.classList.add("active-direction");
  } else if (curDirection === 1) {
    upPanel.classList.add("active-direction");
  } else if (curDirection === 2) {
    leftPanel.classList.add("active-direction");
  } else {
    downPanel.classList.add("active-direction");
  }
}

function changeDirection(event) {
  if (curDirection !== -1) {
    clearMovementPanel();
  }
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
  updateMovementPanel();
}

function checkForBerry() {
  if (hasProperty(curRow, curCol, "berry")) {
    removeProperty(curRow, curCol, "berry");
    for (let property of ["berry-razz", "berry-pinap", "berry-nanab"]) {
      if (hasProperty(curRow, curCol, property)) {
        score += 1;
        removeProperty(curRow, curCol, property);
      }
    }
    for (let property of ["berry-razz-silver", "berry-pinap-silver", "berry-nanab-silver"]) {
      if (hasProperty(curRow, curCol, property)) {
        score += 3;
        removeProperty(curRow, curCol, property);
      }
    }
    for (let property of ["berry-razz-golden", "berry-pinap-golden", "berry-nanab-golden"]) {
      if (hasProperty(curRow, curCol, property)) {
        score += 5;
        removeProperty(curRow, curCol, property);
      }
    }
  }
}

function updateScore() {
  score = Math.min(score, neededScore);
  progressBar.innerHTML = `
    <p class="progress-bar-text">${score} of ${neededScore}</p>
  `;
  progressBar.style.backgroundImage = `
    linear-gradient(
      to right,
      var(--primary-color),
      var(--primary-color) ${(score / neededScore) * 100}%,
      var(--internal-color) ${(score / neededScore) * 100}%,
      var(--internal-color) 100%
    )
  `;
}

function checkForWin() {
  if (score === neededScore) {
    clearMovementPanel();
    timeButton.style.display = "none";
    timeButton.removeEventListener("click", toggleTime);
    document.removeEventListener("keyup", (event) => {
      if (event.key === "e") {
        toggleTime();
      }
    });
    resetButton.style.display = "block";
    resetButton.addEventListener("click", generateGame);
    document.addEventListener("keyup", (event) => {
      if (event.key === "f") {
        generateGame();
      }
    });
    clearInterval(pokemanTimerId);
    chasers.forEach(chaser => clearInterval(chaser.timerId));
    document.removeEventListener("keyup", changeDirection);
    actionElement.textContent = "You win!";
  }
}

function startMovingChaser(chaser) {
  chaser.timerId = setInterval(() => {
    const playerIndex = cellNumbers.get(curRow * COLS + curCol);

    let finalDirection = -1, distanceToBeat = graphDistances[cellNumbers.get(chaser.curRow * COLS + chaser.curCol)][playerIndex];

    for (let direction = 0; direction < 4; ++direction) {
      const possNextRow = chaser.curRow + DELTA_I[direction];
      const possNextCol = chaser.curCol + DELTA_J[direction];
      if (
        isWithinGrid(possNextRow, possNextCol) &&
        isPath(possNextRow, possNextCol) &&
        !isChaser(possNextRow, possNextCol)
      ) {
        const distance = graphDistances[cellNumbers.get(possNextRow * COLS + possNextCol)][playerIndex];
        if (distance < distanceToBeat) {
          finalDirection = direction;
          distanceToBeat = distance;
        }
      }
    }
    
    if (finalDirection !== -1) {
      const nextRow = chaser.curRow + DELTA_I[finalDirection];
      const nextCol = chaser.curCol + DELTA_J[finalDirection];
      if (
        isWithinGrid(nextRow, nextCol) &&
        isPath(nextRow, nextCol) &&
        !isChaser(nextRow, nextCol)
      ) {
        removeProperty(chaser.curRow, chaser.curCol, "chaser");
        removeChaserSprite(chaser);
        fixBerry(chaser.curRow, chaser.curCol);
        chaser.curRow = nextRow;
        chaser.curCol = nextCol;
        addProperty(chaser.curRow, chaser.curCol, "chaser");
        setChaserSprite(chaser);
        checkForGameOver();
      }
    }
  }, chaser.speed);
}

function checkForGameOver() {
  if (gridMatrix[curRow][curCol].classList.contains("chaser")) {
    chasers.forEach(chaser => {
      if (chaser.curRow === curRow && chaser.curCol === curCol) {
        setChaserSprite(chaser);
      }
    });
    clearMovementPanel();
    timeButton.style.display = "none";
    timeButton.removeEventListener("click", toggleTime);
    document.removeEventListener("keyup", (event) => {
      if (event.key === "e") {
        toggleTime();
      }
    });
    resetButton.style.display = "block";
    resetButton.addEventListener("click", generateGame);
    document.addEventListener("keyup", (event) => {
      if (event.key === "f") {
        generateGame();
      }
    });
    clearInterval(pokemanTimerId);
    chasers.forEach(chaser => clearInterval(chaser.timerId));
    document.removeEventListener("keyup", changeDirection);
    actionElement.textContent = "You lost...";
  }
}