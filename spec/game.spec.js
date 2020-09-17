const { parseShape } = require("./parseShape");

describe("Tetris", () => {
  it("has a play area with height and width", () => {
    const game = new Tetris();
    const dimensions = game.getAreaDimensions();
    expect(dimensions.height).toBeGreaterThan(1);
    expect(dimensions.width).toBeGreaterThan(1);
  });

  it("has a shape at the top and center when the game starts", () => {
    const game = new Tetris();
    const piece = game.getPiece();
    const { width } = game.getAreaDimensions();
    expect(piece.shape).toBeTruthy();
    expect(piece.y).toBe(0);
    expect(piece.x).toBe(Math.floor(width / 2 - piece.shape.width / 2));
  });

  it("drops shapes down one step when enough ticks pass", () => {
    const game = new Tetris();
    tickTilDrop(game);
    const piece = game.getPiece();
    expect(piece.y).toBe(1);
  });

  it("has all the classic shapes composed of 4 blocks, in all their rotations", () => {
    const shapeNames = Object.keys(Tetris.shapes);
    expect(shapeNames).toEqual(
      jasmine.arrayContaining(["I", "O", "T", "S", "Z", "J", "L"])
    );
    shapeNames.forEach((name) => {
      const rotations = Tetris.shapes[name];
      rotations.forEach((rotation) => {
        expect(rotation.blocks.length).toBe(4);
        expect(rotation.width).toBeGreaterThan(0);
        rotation.blocks.forEach((coordinate) =>
          expect(coordinate.length).toBe(2)
        );
      });
    });
    expect(Tetris.shapes["O"].length).toBe(1);
  });

  it("considers piece at the bottom if the next drop puts the piece beyond the bottom of the play area", () => {
    const game = new Tetris();
    game.newPiece(Tetris.shapes.I[0]);
    const { height } = game.getAreaDimensions();
    while (game.getPiece().y < height - 1) {
      expect(game.pieceIsAtBottom()).toBeFalse(game.getPiece());
      game.drop();
    }
    expect(game.pieceIsAtBottom()).toBeTrue();
  });

  // it("makes current shape part of the play area after it hits the bottom", () => {
  //   const game = new Tetris();
  //   while (!game.pieceIsAtBottom()) {
  //     game.tick();
  //   }
  //   tickTilDrop(game);
  // });
});

function tickTilDrop(game) {
  for (let i = 0; i < game.ticksPerDrop; i++) {
    game.tick();
  }
}

function Tetris() {
  const area = {
    width: 10,
    height: 40,
  };
  this.ticksPerDrop = 5;
  let piece;

  this.getAreaDimensions = () => area;
  this.getPiece = () => piece;
  this.tick = () => {
    if (--piece.timeToDrop === 0) {
      this.drop();
    }
  };
  this.pieceIsAtBottom = () => {
    return piece.shape.blocks.some(([x, y]) => piece.y + y + 1 >= area.height);
  };
  this.newPiece = (shape) => {
    piece = {};
    piece.width = 4;
    piece.shape = shape;
    piece.x = Math.floor(area.width / 2 - piece.width / 2);
    piece.y = 0;
    piece.timeToDrop = this.ticksPerDrop;
  };
  this.drop = () => {
    piece.timeToDrop = this.ticksPerDrop;
    piece.y++;
  };
  this.newPiece(Tetris.shapes.T[0]);
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
