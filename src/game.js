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
  this.start = () => (gameActive = true);
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
      this.newPiece(Shapes.randomShape());
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
    this.newPiece(Shapes.randomShape());
  }
}

Tetris.lockDelay = 30;

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
