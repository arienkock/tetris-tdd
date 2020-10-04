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

let rows = "";
for (let y = 0; y < height; y++) {
  let columns = "";
  for (let x = 0; x < width; x++) {
    columns += `<td class="block block-${x}-${y}"></td>`;
  }
  rows += "<tr>" + columns + "</tr>";
}

const table = "<table class='area'>" + rows + "</table>";
const status =
  'Level:<span class="level"></span> Score:<span class="score"></span>';

let html = `
<div class="status-and-area">
  <div class="status">${status}</div>
  <div class="area-container">
    ${table}
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
      setActive(x, y, !!game.getAreaContents(x, y));
    }
  }
  piece.shape.blocks.forEach(([x, y]) => {
    setActive(x + piece.x, y + piece.y, true);
  });
  levelEl.textContent = game.score.level.toString().padStart(3, "0").slice(-3);
  scoreEl.textContent = game.score.value.toString().padStart(7, "0").slice(-7);
  if (game.isGameOver() && !document.querySelector("h1.game-over")) {
    gameEl.querySelector(".game-over").classList.remove("hidden");
  }
  videoContainerEl.style.backgroundColor =
    colorPalette[game.score.level % colorPalette.length];
}

function setActive(x, y, isActive) {
  const td = document.querySelector(`.block-${x}-${y}`);
  if (!td) {
    console.error("No block for", `.block-${x}-${y}`);
  } else if (isActive) {
    td.classList.add("active");
  } else {
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
