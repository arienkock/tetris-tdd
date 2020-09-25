const { parseShape } = require("./parseShape");

function Tetris() {
  const area = {
    width: 10,
    height: 40,
  };
  this.ticksPerDrop = 2;
  let piece;
  let areaContents = new Array(area.width * area.height);

  this.getAreaDimensions = () => area;
  this.getPiece = () => piece;
  this.tick = () => {
    if (--piece.timeToDrop === 0) {
      this.drop();
    }
  };
  this.pieceIsAtBottom = () => {
    return piece.shape.blocks.some(
      ([x, y]) =>
        piece.y + y + 1 >= area.height ||
        this.getAreaContents(piece.x + x, piece.y + y + 1)
    );
  };
  this.newPiece = (shape) => {
    piece = {};
    piece.width = shape.width;
    piece.shape = shape;
    piece.x = Math.floor((area.width - piece.width) / 2);
    piece.y = 0;
    piece.timeToDrop = this.ticksPerDrop;
  };
  this.drop = () => {
    piece.timeToDrop = this.ticksPerDrop;
    if (this.pieceIsAtBottom()) {
      piece.shape.blocks.forEach(([x, y]) => {
        setAreaContents(x + piece.x, y + piece.y, true);
      });
      this.newPiece(randomShape());
    } else {
      piece.y++;
    }
  };
  this.newPiece(Tetris.shapes.T[0]);
  this.moveLeft = () => {
    if (
      !piece.shape.blocks.some(
        ([x, y]) =>
          this.getAreaContents(piece.x + (x - 1), piece.y + y) ||
          piece.x + (x - 1) < 0
      )
    ) {
      piece.x--;
    } else {
      console.log("Thunk left");
    }
  };
  this.moveRight = () => {
    if (
      !piece.shape.blocks.some(
        ([x, y]) =>
          this.getAreaContents(piece.x + (x + 1), piece.y + y) ||
          piece.x + (x + 1) >= area.width
      )
    ) {
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
