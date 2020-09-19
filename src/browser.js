const { Tetris } = require("./game");

const game = new Tetris();
const { width, height } = game.getAreaDimensions();

let rows = "";
for (let y = 0; y < height; y++) {
  let columns = "";
  for (let x = 0; x < width; x++) {
    columns += `<td class="block block-${x}-${y}"></td>`;
  }
  rows += "<tr>" + columns + "</tr>";
}

let html = "<table>" + rows + "</table>";

document.getElementById("area").innerHTML = html;

function tick() {
  game.tick();
  paint();
}

function paint() {
  document.querySelectorAll(".block").forEach((td) => {
    td.classList.remove("active");
  });
  const piece = game.getPiece();
  piece.shape.blocks.forEach(([x, y]) => {
    const td = document.querySelector(`.block-${x + piece.x}-${y + piece.y}`);
    if (!td) {
      console.error("No block for", `.block-${x + piece.x}-${y + piece.y}`);
    } else {
      td.classList.add("active");
    }
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") {
    game.moveLeft();
  } else if (event.key === "ArrowRight") {
    game.moveRight();
  }
});

paint();
setInterval(tick, 100);
