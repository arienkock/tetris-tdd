(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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

const areaEl = document.getElementById("area");
areaEl.innerHTML = html;

function tick() {
  game.tick();
  paint();
  if (game.isGameOver()) {
    areaEl.insertAdjacentHTML(
      "beforeend",
      "<h1 class='game-over'>Game Over</h1>"
    );
  }
}

function paint() {
  document.querySelectorAll(".block").forEach((td) => {
    td.classList.remove("active");
  });
  const piece = game.getPiece();
  piece.shape.blocks.forEach(([x, y]) => {
    activate(x + piece.x, y + piece.y);
  });
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (game.getAreaContents(x, y)) {
        activate(x, y);
      }
    }
  }
}

function activate(x, y) {
  const td = document.querySelector(`.block-${x}-${y}`);
  if (!td) {
    console.error("No block for", `.block-${x}-${y}`);
  } else {
    td.classList.add("active");
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
  }
});

paint();
setInterval(tick, 1 / 60);

},{"./game":2}],2:[function(require,module,exports){
const { parseShape } = require("./parseShape");

function Tetris({
  startOnCreation = true,
  areaWidth = 10,
  areaHeight = 40,
  ticksPerDrop = 60,
} = {}) {
  let gameActive = startOnCreation;
  let gameOver = false;
  const area = {
    width: areaWidth,
    height: areaHeight,
  };
  this.ticksPerDrop = ticksPerDrop;
  let piece;
  let areaContents = new Array(area.width * area.height);

  this.getAreaDimensions = () => area;
  this.getPiece = () => piece;
  this.start = () => (gameActive = true);
  this.isGameOver = () => gameOver;
  this.tick = () => {
    if (gameActive) {
      if (--piece.timeToDrop <= 0) {
        this.drop();
      }
    }
  };
  this.pieceIsAtBottom = () => pieceCollidesIfMovedBy(0, 1);
  this.newPiece = (shape) => {
    piece = {};
    piece.shape = shape;
    piece.x = Math.floor((area.width - shape.width) / 2);
    piece.y = 0;
    piece.timeToDrop = this.ticksPerDrop;
    if (pieceCollidesIfMovedBy(0, 0)) {
      gameOver = true;
      gameActive = false;
    }
  };
  this.drop = () => {
    resetTimeToDrop();
    if (this.pieceIsAtBottom()) {
      putPieceInArea();
      clearCompletedLines();
      this.newPiece(randomShape());
    } else {
      piece.y++;
    }
  };
  this.moveLeft = () => {
    if (!pieceCollidesIfMovedBy(-1, 0)) {
      piece.x--;
    }
  };
  this.moveRight = () => {
    if (!pieceCollidesIfMovedBy(1, 0)) {
      piece.x++;
    }
  };
  this.getAreaContents = (x, y) => {
    return areaContents[y * area.width + x];
  };
  this.rotate = () => {
    for (let rotations of Object.values(Tetris.shapes)) {
      for (let i = 0; i < rotations.length; i++) {
        let shape = rotations[i];
        if (shape === piece.shape) {
          piece.shape = rotations[(i + 1) % rotations.length];
          return;
        }
      }
    }
  };
  function setAreaContents(x, y, value) {
    areaContents[y * area.width + x] = value;
  }
  const pieceCollidesIfMovedBy = (deltax, deltay) => {
    return piece.shape.blocks.some(([blockx, blocky]) => {
      const x = piece.x + blockx + deltax;
      const y = piece.y + blocky + deltay;
      return (
        this.getAreaContents(x, y) ||
        x >= area.width ||
        x < 0 ||
        y >= area.height
      );
    });
  };
  const putPieceInArea = () => {
    piece.shape.blocks.forEach(([x, y]) => {
      setAreaContents(x + piece.x, y + piece.y, true);
    });
  };
  const resetTimeToDrop = () => {
    piece.timeToDrop = this.ticksPerDrop;
  };
  const clearCompletedLines = () => {
    for (let lineNum = 0; lineNum < area.height; lineNum++) {
      if (isLineComplete(lineNum)) {
        spliceLine(lineNum);
        prependEmptyLine();
      }
    }
  };
  const isLineComplete = (lineNum) => {
    for (let x = 0; x < area.width; x++) {
      if (!this.getAreaContents(x, lineNum)) {
        return false;
      }
    }
    return true;
  };
  const spliceLine = (lineNum) => {
    areaContents.splice(lineNum * area.width, area.width);
  };
  const prependEmptyLine = () => {
    for (let i = 0; i < area.width; i++) {
      areaContents.unshift(undefined);
    }
  };
  if (gameActive) {
    this.newPiece(randomShape());
  }
}

function randomShape() {
  const shapeNames = Object.keys(Tetris.shapes);
  const randomIndex = Math.floor(Math.random() * shapeNames.length);
  const shape = shapeNames[randomIndex];
  return Tetris.shapes[shape][0];
}

Tetris.shapes = {
  J: [
    parseShape(`
#
###
      `),
    parseShape(`
 ##
 #
 #
      `),
    parseShape(`

###
  #
      `),
    parseShape(`
 #
 #
##
      `),
  ],
  I: [
    parseShape(`
####
      `),
    parseShape(`
 #
 #
 #
 #
      `),
  ],
  O: [
    parseShape(`
##
##
      `),
  ],
  T: [
    parseShape(`
 #
###
      `),
    parseShape(`
 #
 ##
 #
      `),
    parseShape(`
  
###
 #
      `),
    parseShape(`
 #
##
 #
      `),
  ],
  S: [
    parseShape(`
 ##
##
      `),
    parseShape(`
#
##
 #
      `),
  ],
  Z: [
    parseShape(`
##
 ##
      `),
    parseShape(`
 #
##
#
      `),
  ],
  L: [
    parseShape(`
  #
###
      `),
    parseShape(`
 #
 #
 ##
      `),
    parseShape(`
###
#
      `),
    parseShape(`
##
 #
 #
      `),
  ],
};

module.exports = {
  Tetris,
};

},{"./parseShape":3}],3:[function(require,module,exports){
function parseShape(string) {
  let maxX = 0;
  const split = string.split("\n");
  const rows = split.slice(1, split.length - 1);
  const blocks = [];
  rows.forEach((row, y) =>
    [...row].forEach((s, x) => {
      if (s === "#") {
        blocks.push([x, y]);
        maxX = Math.max(x, maxX);
      }
    })
  );
  return { blocks, width: maxX + 1 };
}

module.exports = {
  parseShape,
};

},{}]},{},[1]);
