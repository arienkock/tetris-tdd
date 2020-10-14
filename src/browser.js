const { Tetris } = require("./game");
const Scoreboard = require("./scoreboard");

const game = new Tetris();
const { width, height } = game.getAreaDimensions();

const bgColorPalette = [
  "white",
  "D5D6EA",
  "F6F6EB",
  "D7ECD9",
  "F5D5CB",
  "F6ECF5",
  "F3DDF2",
];
const PREVIEW_AREA_SIZE = 6;

function generateTableGrid(width, height) {
  let rows = "";
  for (let y = 0; y < height; y++) {
    let columns = "";
    for (let x = 0; x < width; x++) {
      columns += `<td class="block block-${x}-${y}"></td>`;
    }
    rows += "<tr>" + columns + "</tr>";
  }
  return rows;
}

const playArea =
  '<table class="area">' + generateTableGrid(width, height) + "</table>";
const previewArea =
  '<table class="preview-area">' +
  generateTableGrid(PREVIEW_AREA_SIZE, PREVIEW_AREA_SIZE) +
  "</table>";
const status =
  'Level:<span class="level"></span> Score:<span class="score"></span>';

let html = `
<div class="game-and-scoreboard">
  <div class="status-and-area">
    <div class="status">${status}</div>
    <div class="area-container">
      <div class="area-and-preview">${playArea}${previewArea}</div>
      <div class="game-over hidden"><h1 class="game-over-label">Game Over</h1>Reload page to play again</div>
    </div>
  </div>
  <div class="scoreboard">
    <h1>scores</h1>
    <label>Your name: <input class="name-input"/></label>
    <div class="score-entries"></div>
  </div>
</div>`;

const gameEl = document.getElementById("game");
gameEl.innerHTML = html;
const levelEl = gameEl.querySelector(".level");
const scoreEl = gameEl.querySelector(".score");
const videoContainerEl = document.querySelector(".video-container");

function tick() {
  game.tick();
  paint();
}

function paint() {
  const piece = game.getPiece();
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      setActive(".area", x, y, !!game.getAreaContents(x, y));
    }
  }
  let rowsTilPieceCollides = 1;
  while (!game.pieceCollidesIfMovedBy(0, rowsTilPieceCollides)) {
    rowsTilPieceCollides++;
  }
  piece.shape.blocks.forEach(([x, y]) => {
    setActive(
      ".area",
      x + piece.x,
      y + piece.y + rowsTilPieceCollides - 1,
      true,
      true
    );
  });
  piece.shape.blocks.forEach(([x, y]) => {
    setActive(".area", x + piece.x, y + piece.y, true);
  });
  for (let y = 0; y < PREVIEW_AREA_SIZE; y++) {
    for (let x = 0; x < PREVIEW_AREA_SIZE; x++) {
      setActive(".preview-area", x, y, false);
    }
  }
  const offsetX = Math.floor((PREVIEW_AREA_SIZE - game.nextShape.width) / 2);
  const offsetY = Math.floor((PREVIEW_AREA_SIZE - game.nextShape.height) / 2);
  game.nextShape.blocks.forEach(([x, y]) => {
    setActive(".preview-area", x + offsetX, y + offsetY, true);
  });
  levelEl.textContent = game.score.level.toString().padStart(3, "0").slice(-3);
  scoreEl.textContent = game.score.value.toString().padStart(7, "0").slice(-7);
  if (game.isGameOver() && !document.querySelector("h1.game-over")) {
    gameEl.querySelector(".game-over").classList.remove("hidden");
  }
  videoContainerEl.style.backgroundColor =
    bgColorPalette[game.score.level % bgColorPalette.length];
}

function setActive(scopeSelector, x, y, isActive, isPreview) {
  const td = document.querySelector(`${scopeSelector} .block-${x}-${y}`);
  if (!td) {
    console.error("No block for", `.block-${x}-${y}`);
  } else if (isActive) {
    td.classList.add(isPreview ? "preview" : "active");
    if (!isPreview) {
      td.classList.remove("preview");
    }
  } else {
    td.classList.remove("preview");
    td.classList.remove("active");
  }
}
const scoreboard = new Scoreboard(window.firebase.firestore());
let previousScore = {
  value: 0,
  name: "Anonymous",
};
const scoreId = scoreboard.newEntry();
const nameInput = document.querySelector(".name-input");
nameInput.value = previousScore.name;
const scoreEntries = document.querySelector(".score-entries");
function updateScoreBoard() {
  if (
    previousScore.value !== game.score.value ||
    previousScore.name !== nameInput.value
  ) {
    previousScore.value = game.score.value;
    previousScore.name = nameInput.value;
    scoreboard.updateScore(
      scoreId,
      nameInput.value,
      game.score.value,
      game.score.level
    );
  }
  // Render scores
  scoreEntries.innerHTML = `
<table>
  <tr><th>Name</th><th>Score</th><th>Max level</th></tr>
  ${scoreboard
    .top10()
    .map(
      (s) => `<tr><td>${s.name}</td><td>${s.score}</td><td>${s.level}</td></tr>`
    )
    .join("")}
</table>`;
}
setInterval(updateScoreBoard, 100);
let alreadyPressingDown = false;
let leftMoveInterval;
let rightMoveInterval;
const moveInterval = 1000 / 12;
document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") {
    if (!leftMoveInterval) {
      game.moveLeft();
      let first = true;
      leftMoveInterval = setInterval(() => {
        if (first) {
          first = false;
          return;
        }
        game.moveLeft();
      }, moveInterval);
    }
  } else if (event.key === "ArrowRight") {
    if (!rightMoveInterval) {
      game.moveRight();
      let first = true;
      rightMoveInterval = setInterval(() => {
        if (first) {
          first = false;
          return;
        }
        game.moveRight();
      }, moveInterval);
    }
  } else if (event.key === "ArrowUp") {
    game.rotate();
  } else if (event.key === "ArrowDown") {
    if (!alreadyPressingDown) {
      alreadyPressingDown = true;
      game.fastDrop(true);
    }
  }
  paint();
});

document.addEventListener("keyup", (event) => {
  if (event.key === "ArrowDown") {
    alreadyPressingDown = false;
    game.fastDrop(false);
  } else if (event.key === "ArrowLeft") {
    clearInterval(leftMoveInterval);
    leftMoveInterval = undefined;
  } else if (event.key === "ArrowRight") {
    clearInterval(rightMoveInterval);
    rightMoveInterval = undefined;
  }
  paint();
});

paint();
setInterval(tick, 1000 / 60);
