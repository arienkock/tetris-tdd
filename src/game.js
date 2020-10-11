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
