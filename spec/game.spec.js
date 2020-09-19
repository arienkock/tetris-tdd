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

  it("moves the piece left and right until it hits the edges", () => {
    const game = new Tetris();
    game.newPiece(Tetris.shapes.I[0]);
    const previousX = game.getPiece().x;
    game.moveLeft();
    expect(game.getPiece().x).toBe(previousX - 1);
    game.moveLeft();
    expect(game.getPiece().x).toBe(1);
    game.moveLeft();
    expect(game.getPiece().x).toBe(0);
    game.moveLeft();
    expect(game.getPiece().x).toBe(0);

    game.moveRight();
    expect(game.getPiece().x).toBe(1);
    game.moveRight();
    expect(game.getPiece().x).toBe(2);
    game.moveRight();
    game.moveRight();
    game.moveRight();
    game.moveRight();
    expect(game.getPiece().x).toBe(6);
    game.moveRight();
    expect(game.getPiece().x).toBe(6);
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
