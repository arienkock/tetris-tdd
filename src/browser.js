const { Tetris } = require("./game");

const game = new Tetris();
const { width, height } = game.getAreaDimensions();

const colorPalette = [
  "white",
  "CornflowerBlue",
  "coral",
  "aquamarine",
  "DarkOrchid",
  "DarkOrange",
  "DeepPink",
  "Gold",
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
<div class="status-and-area">
  <div class="status">${status}</div>
  <div class="area-container">
    <div class="area-and-preview">${playArea}${previewArea}</div>
    <div class='game-over hidden'><h1 class='game-over-label'>Game Over</h1><div>
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
    colorPalette[game.score.level % colorPalette.length];
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

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") {
    game.moveLeft();
    paint();
  } else if (event.key === "ArrowRight") {
    game.moveRight();
    paint();
  } else if (event.key === "ArrowUp") {
    game.rotate();
    paint();
  } else if (event.key === "ArrowDown") {
    game.fastDrop(true);
    paint();
  }
});

document.addEventListener("keyup", (event) => {
  if (event.key === "ArrowDown") {
    game.fastDrop(false);
    paint();
  }
});

paint();
setInterval(tick, 1 / 60);
