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
    const shape = game.getPiece();
    const { width } = game.getAreaDimensions();
    expect(shape.y).toBe(0);
    expect(shape.x).toBe(Math.floor(width / 2 - shape.width / 2));
  });

  it("drops shapes down one step when enough ticks pass", () => {
    const game = new Tetris();
    tickTilDrop(game);
    const shape = game.getPiece();
    expect(shape.y).toBe(1);
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

  // it("makes current shape part of the play area after it hits the bottom", () => {
  //   const game = new Tetris();
  //   while (!game.getPiece().atBottom()) {
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
  let piece = {};
  piece.width = 4;
  piece.x = Math.floor(area.width / 2 - piece.width / 2);
  piece.y = 0;
  piece.timeToDrop = this.ticksPerDrop;
  this.getAreaDimensions = () => area;
  this.getPiece = () => piece;
  this.tick = () => {
    if (--piece.timeToDrop === 0) {
      piece.timeToDrop = this.ticksPerDrop;
      piece.y++;
    }
  };
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
#
#
#
#
    `),
    parseShape(`
####
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
