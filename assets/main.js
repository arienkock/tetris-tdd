(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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

},{"./game":2,"./scoreboard":5}],2:[function(require,module,exports){
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
  let ticksPerDropAccordingToLevel = gameSpeeds[gameSpeeds.length - 1][1];
  this.ticksPerDrop = ticksPerDropAccordingToLevel;
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
      this.ticksPerDrop = ticksPerDropAccordingToLevel;
      piece.timeToDrop = ticksPerDropAccordingToLevel;
    }
  };
  this.pieceIsAtBottom = () => this.pieceCollidesIfMovedBy(0, 1);
  this.newPiece = (shape) => {
    piece = {};
    piece.shape = shape;
    piece.x = Math.floor((area.width - shape.width) / 2);
    piece.y = 0;
    piece.timeToDrop = this.ticksPerDrop;
    checkGameOver();
  };
  const checkGameOver = () => {
    if (collision() && piece.y === 0) {
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
    if (!this.pieceCollidesIfMovedBy(-1, 0)) {
      piece.x--;
    }
  };
  this.moveRight = () => {
    if (!this.pieceCollidesIfMovedBy(1, 0)) {
      piece.x++;
    }
  };
  this.getAreaContents = (x, y) => {
    return areaContents[y * area.width + x];
  };
  this.rotate = () => {
    const previousShape = piece.shape;
    piece.shape = Shapes.nextRotation(piece.shape);
    if (collision()) {
      tryMovingPieceIntoAvailableSpace();
    }
    // If we weren't able to move piece, rollback the rotation
    if (collision()) {
      piece.shape = previousShape;
    } else {
      applyLockDelay();
    }
  };
  const tryMovingPieceIntoAvailableSpace = () => {
    // Try moving piece in three directions until no collision
    [
      ["x", -1],
      ["x", +1],
      ["y", -1],
    ].forEach(([axis, sign]) => {
      for (let delta = 1; delta < 3; delta++) {
        const amount = sign * delta;
        if (!collidesWhenMovedInDirection(axis, amount)) {
          piece[axis] += amount;
          break;
        }
      }
    });
  };
  const collidesWhenMovedInDirection = (axis, diff) =>
    axis === "x"
      ? this.pieceCollidesIfMovedBy(diff, 0)
      : this.pieceCollidesIfMovedBy(0, diff);
  const collision = () => this.pieceCollidesIfMovedBy(0, 0);
  this.getNextShape = () => this.nextShape;
  const setAreaContents = (x, y, value) => {
    areaContents[y * area.width + x] = value;
  };
  this.pieceCollidesIfMovedBy = (deltax, deltay) =>
    piece.shape.blocks.some(collideWhenMovedBy(deltax, deltay));
  const collideWhenMovedBy = (deltax, deltay) => ([blockx, blocky]) => {
    const x = piece.x + blockx + deltax;
    const y = piece.y + blocky + deltay;
    return (
      this.getAreaContents(x, y) || x >= area.width || x < 0 || y >= area.height
    );
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
      ticksPerDropAccordingToLevel = 1;
    } else {
      const [, speed] = gameSpeeds.find(([level]) => this.score.level >= level);
      ticksPerDropAccordingToLevel = speed;
    }
    this.ticksPerDrop = ticksPerDropAccordingToLevel;
  };
  const applyLockDelay = () => {
    if (this.pieceIsAtBottom()) {
      piece.timeToDrop = Tetris.lockDelay;
    }
  };
  setGameSpeed();
  if (gameActive) {
    this.start();
  }
}

Tetris.lockDelay = 15;

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

},{"./score":4,"./shapes":6}],3:[function(require,module,exports){
function parseShape(string) {
  let maxX = 0,
    maxY = 0;
  const split = string.split("\n");
  const rows = split.slice(1, split.length - 1);
  const blocks = [];
  rows.forEach((row, y) =>
    [...row].forEach((s, x) => {
      if (s === "#") {
        blocks.push([x, y]);
        maxX = Math.max(x, maxX);
        maxY = Math.max(y, maxY);
      }
    })
  );
  return { blocks, width: maxX + 1, height: maxY + 1 };
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
function Scoreboard(db) {
  let entries = [];
  const tetrisScores = db.collection("tetris-scores");
  tetrisScores
    .orderBy("score", "desc")
    .limit(10)
    .onSnapshot((querySnapshot) => {
      entries = querySnapshot.docs.map((queryDocSnapshot) =>
        queryDocSnapshot.data()
      );
    });
  this.top10 = () => entries;
  this.newEntry = () => {
    const docRef = tetrisScores.doc();
    docRef.set(
      {
        name: "anonymous",
        score: 0,
        level: 0,
      },
      { merge: true }
    );
    return docRef.id;
  };
  this.updateScore = (id, name, score, level) => {
    return tetrisScores.doc(id).update({
      name,
      score,
      level,
    });
  };
}

module.exports = Scoreboard;

},{}],6:[function(require,module,exports){
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
