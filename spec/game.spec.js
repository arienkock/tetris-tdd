const { Tetris } = require("../src/game");
const { parseShape } = require("../src/parseShape");

describe("Tetris", () => {
  it("has a play area with height and width", () => {
    const game = new Tetris();
    const dimensions = game.getAreaDimensions();
    expect(dimensions.height).toBeGreaterThan(1);
    expect(dimensions.width).toBeGreaterThan(1);
  });

  it("has a shape at the top and center when the game starts", () => {
    const game = new Tetris();
    game.newPiece(Tetris.shapes.I[0]);
    const iPiece = game.getPiece();
    expect(iPiece.shape).toBeTruthy();
    expect(iPiece.y).toBe(0);
    expect(iPiece.x).toBe(3);
    game.newPiece(Tetris.shapes.O[0]);
    const oPiece = game.getPiece();
    expect(oPiece.y).toBe(0);
    expect(oPiece.x).toBe(4);
    expect(oPiece.shape.width).toBe(2);
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

  it("moves the piece left and right until it hits the edges", () => {
    const game = new Tetris();
    game.newPiece(
      parseShape(`
 #
    `)
    );
    const previousX = game.getPiece().x;
    game.moveLeft();
    expect(game.getPiece().x).toBe(previousX - 1);
    game.moveLeft();
    expect(game.getPiece().x).toBe(2);
    game.moveLeft();
    expect(game.getPiece().x).toBe(1);
    game.moveLeft();
    expect(game.getPiece().x).toBe(0);
    game.moveLeft();
    expect(game.getPiece().x).toBe(-1);

    game.moveRight();
    expect(game.getPiece().x).toBe(0);
    game.moveRight();
    expect(game.getPiece().x).toBe(1);
    game.moveRight();
    game.moveRight();
    game.moveRight();
    game.moveRight();
    game.moveRight();
    game.moveRight();
    game.moveRight();
    expect(game.getPiece().x).toBe(8);
    game.moveRight();
    expect(game.getPiece().x).toBe(8);
  });

  it("makes current shape part of the play area after it hits the bottom", () => {
    const game = new Tetris();
    while (!game.pieceIsAtBottom()) {
      game.drop();
    }
    const pieceBeforeFinalDrop = game.getPiece();
    const { x: pieceX, y: pieceY } = pieceBeforeFinalDrop;
    game.drop();
    const { width, height } = game.getAreaDimensions();
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const isCoordFromLastPiece = pieceBeforeFinalDrop.shape.blocks.some(
          ([bx, by]) => bx + pieceX === x && by + pieceY === y
        );
        if (isCoordFromLastPiece) {
          expect(game.getAreaContents(x, y)).toBeTruthy();
        } else {
          expect(game.getAreaContents(x, y)).toBeFalsy();
        }
      }
    }
  });

  it("cycles through all rotations of a shape", () => {
    const game = new Tetris();
    game.newPiece(Tetris.shapes.I[0]);
    game.rotate();
    expect(game.getPiece().shape).toEqual(Tetris.shapes.I[1]);
  });

  it("stacks the blocks", () => {
    const game = new Tetris();
    game.newPiece(Tetris.shapes.I[0]);
    fullyDropPiece(game);
    game.newPiece(Tetris.shapes.O[0]);
    fullyDropPiece(game);
    const { height } = game.getAreaDimensions();
    const expectedShape = parseShape(`
    ##
    ##
   ####
    `);
    expectedShape.blocks.forEach(([x, y]) => {
      expect(game.getAreaContents(x, y + height - 3)).toBeTruthy();
    });
  });

  it("clears completed lines", () => {
    const initialContents = parseShape(`
##########
#
##########
    `);
    const game = new Tetris();
    game.newPiece(initialContents);
    fullyDropPiece(game);
    expect(game.getAreaContents(0, 37)).toBeFalsy();
    expect(game.getAreaContents(0, 38)).toBeFalsy();
    expect(game.getAreaContents(0, 39)).toBeTruthy();
    for (let i = 1; i < 10; i++) {
      expect(game.getAreaContents(i, 37)).toBeFalsy();
      expect(game.getAreaContents(i, 38)).toBeFalsy();
      expect(game.getAreaContents(i, 39)).toBeFalsy();
    }
  });
});
function fullyDropPiece(game) {
  while (!game.pieceIsAtBottom()) {
    game.drop();
  }
  game.drop();
}
function tickTilDrop(game) {
  for (let i = 0; i < game.ticksPerDrop; i++) {
    game.tick();
  }
}
