(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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

},{"./game":2}],2:[function(require,module,exports){
const Score = require("./score");
const Shapes = require("./shapes");

function Tetris({
  startOnCreation = true,
  areaWidth = 10,
  areaHeight = 40,
  startLevel = 0,
} = {}) {
  let gameActive = startOnCreation;
  let gameOver = false;
  this.score = new Score(startLevel);
  const area = {
    width: areaWidth,
    height: areaHeight,
  };
  let levelBasedTicksPerDrop = gameSpeeds[gameSpeeds.length - 1][1];
  this.ticksPerDrop = levelBasedTicksPerDrop;
  let piece;
  let areaContents = new Array(area.width * area.height);

  this.getAreaDimensions = () => area;
  this.getPiece = () => piece;
  this.start = () => {
    gameActive = true;
    this.newPiece(Shapes.randomShape());
    this.nextShape = Shapes.randomShape();
  };
  this.isGameOver = () => gameOver;
  this.tick = () => {
    if (gameActive) {
      if (--piece.timeToDrop <= 0) {
        this.drop();
        applyLockDelay();
      }
    }
  };
  this.fastDrop = (on) => {
    if (on) {
      this.ticksPerDrop = 1;
      piece.timeToDrop = 1;
    } else {
      this.ticksPerDrop = levelBasedTicksPerDrop;
      piece.timeToDrop = levelBasedTicksPerDrop;
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
      this.fastDrop(false);
      this.newPiece(this.nextShape);
      this.nextShape = Shapes.randomShape();
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
    const previousShape = piece.shape;
    piece.shape = Shapes.nextRotation(piece.shape);
    if (pieceCollidesIfMovedBy(0, 0)) {
      // Try moving piece in three directions until no collision
      [
        ["y", -1],
        ["x", -1],
        ["x", +1],
      ].forEach(([axis, sign]) => {
        for (let delta = 1; delta < 3; delta++) {
          const diff = sign * delta;
          const collides =
            axis === "x"
              ? pieceCollidesIfMovedBy(diff, 0)
              : pieceCollidesIfMovedBy(0, diff);
          if (!collides) {
            piece[axis] += diff;
            break;
          }
        }
      });
    }
    // If we weren't able to move piece, rollback the rotation
    if (pieceCollidesIfMovedBy(0, 0)) {
      piece.shape = previousShape;
    } else {
      applyLockDelay();
    }
  };
  this.getNextShape = () => this.nextShape;
  const setAreaContents = (x, y, value) => {
    areaContents[y * area.width + x] = value;
  };
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
    let linesCleared = 0;
    for (let lineNum = 0; lineNum < area.height; lineNum++) {
      if (isLineComplete(lineNum)) {
        linesCleared++;
        spliceLine(lineNum);
        prependEmptyLine();
      }
    }
    this.score.tallyLines(linesCleared);
    setGameSpeed();
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
  const setGameSpeed = () => {
    if (this.score.level > 28) {
      levelBasedTicksPerDrop = 1;
    } else {
      const [, speed] = gameSpeeds.find(([level]) => this.score.level >= level);
      levelBasedTicksPerDrop = speed;
    }
    this.ticksPerDrop = levelBasedTicksPerDrop;
  };
  const applyLockDelay = () => {
    if (this.pieceIsAtBottom()) {
      piece.timeToDrop = Math.max(Tetris.lockDelay, levelBasedTicksPerDrop);
    }
  };
  setGameSpeed();
  if (gameActive) {
    this.start();
  }
}

Tetris.lockDelay = 48;

const gameSpeeds = [
  [0, 48],
  [1, 43],
  [2, 38],
  [3, 33],
  [4, 28],
  [5, 23],
  [6, 18],
  [7, 13],
  [8, 8],
  [9, 6],
  [10, 5],
  [13, 4],
  [16, 3],
  [19, 2],
].reverse();

module.exports = {
  Tetris,
};

},{"./score":4,"./shapes":5}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
function Score(startLevel = 0) {
  const base = [0, 40, 100, 300, 1200];
  this.level = startLevel;
  this.value = 0;
  let linesToNextLevel = Math.min(
    startLevel * 10 + 10,
    Math.max(100, startLevel * 10 - 50)
  );
  this.tallyLines = (lines) => {
    linesToNextLevel -= lines;
    if (linesToNextLevel <= 0) {
      this.level++;
      linesToNextLevel += 10;
    }
    this.value += base[lines] * (this.level + 1);
  };
}

module.exports = Score;

},{}],5:[function(require,module,exports){
const { parseShape } = require("./parseShape");

const forms = {
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

const nextRotation = (currentShape) => {
  for (let rotations of Object.values(forms)) {
    for (let i = 0; i < rotations.length; i++) {
      let shape = rotations[i];
      if (shape === currentShape) {
        return rotations[(i + 1) % rotations.length];
      }
    }
  }
};

const randomShape = () => {
  const shapeNames = Object.keys(forms);
  const randomIndex = Math.floor(Math.random() * shapeNames.length);
  const shape = shapeNames[randomIndex];
  return forms[shape][0];
};

const getForm = (name, index) => forms[name][index];

const getNumRotations = (name) => forms[name].length;

module.exports = {
  getForm,
  getNumRotations,
  nextRotation,
  randomShape,
};

},{"./parseShape":3}]},{},[1]);
