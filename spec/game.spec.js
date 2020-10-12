const { Tetris } = require("../src/game");
const { parseShape } = require("../src/parseShape");
const Score = require("../src/score");
const Shapes = require("../src/shapes");
const { fullyDropPiece } = require("./game-helpers");

describe("Tetris", () => {
  it("has a play area with height and width", () => {
    const game = new Tetris();
    const dimensions = game.getAreaDimensions();
    expect(dimensions.height).toBeGreaterThan(1);
    expect(dimensions.width).toBeGreaterThan(1);
  });

  it("has a shape at the top and center when the game starts", () => {
    const game = new Tetris();
    game.newPiece(Shapes.getForm("I", 0));
    const iPiece = game.getPiece();
    expect(iPiece.shape).toBeTruthy();
    expect(iPiece.y).toBe(0);
    expect(iPiece.x).toBe(3);
    game.newPiece(Shapes.getForm("O", 0));
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

  it("considers piece at the bottom if the next drop puts the piece beyond the bottom of the play area", () => {
    const game = new Tetris();
    game.newPiece(Shapes.getForm("O", 0));
    const { height } = game.getAreaDimensions();
    let iterations = 0,
      tooMany = 100;
    while (game.getPiece().y < height - 2 || iterations > tooMany) {
      expect(game.pieceIsAtBottom()).toBeFalse();
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
    game.newPiece(Shapes.getForm("I", 0));
    game.rotate();
    expect(game.getPiece().shape).toEqual(Shapes.getForm("I", 1));
  });

  it("stacks the blocks", () => {
    const game = new Tetris();
    game.newPiece(Shapes.getForm("I", 0));
    fullyDropPiece(game);
    game.newPiece(Shapes.getForm("O", 0));
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

  it("ends in Game Over when no space left for newPiece", () => {
    const game = new Tetris({ startOnCreation: false, areaHeight: 2 });
    game.newPiece(Shapes.getForm("O", 0));
    game.start();
    expect(game.isGameOver()).toBeFalse();
    fullyDropPiece(game);
    expect(game.isGameOver()).toBeTrue();
  });

  it("if rotation causes a collision, moves the piece up/left/right", () => {
    const game = new Tetris({ startOnCreation: false, areaHeight: 3 });
    game.start();
    game.newPiece(Shapes.getForm("L", 0));
    game.drop();
    expect(game.getPiece().y).toBe(1);
    game.rotate();
    expect(game.getPiece().y).toBe(0);
    game.rotate();
    game.rotate();
    game.moveRight();
    game.moveRight();
    game.moveRight();
    game.moveRight();
    game.moveRight();
    expect(game.getPiece().x).toBe(8);
    game.rotate();
    expect(game.getPiece().x).toBe(7);
    game.rotate();
    game.moveLeft();
    game.moveLeft();
    game.moveLeft();
    game.moveLeft();
    game.moveLeft();
    game.moveLeft();
    game.moveLeft();
    game.moveLeft();
    expect(game.getPiece().x).toBe(-1);
    game.rotate();
    expect(game.getPiece().x).toBe(0);
  });

  it("can drop the piece faster than normal", () => {
    const game = new Tetris();
    expect(game.getPiece().y).toBe(0);
    game.tick();
    expect(game.getPiece().y).toBe(0);
    game.fastDrop(true);
    game.tick();
    expect(game.getPiece().y).toBe(1);
    game.tick();
    expect(game.getPiece().y).toBe(2);
    game.fastDrop(false);
    expect(game.getPiece().y).toBe(2);
    for (let i = 0; i < 47; i++) {
      game.tick();
      expect(game.getPiece().y).toBe(2);
    }
    game.tick();
    expect(game.getPiece().y).toBe(3);
  });

  it("speed is set according to level", () => {
    const game = new Tetris();
    expect(game.ticksPerDrop).toBe(48);
    game.score.tallyLines(10);
    fullyDropPiece(game);
    expect(game.score.level).toBe(1);
    expect(game.ticksPerDrop).toBe(43);
    game.score.level = 28;
    fullyDropPiece(game);
    expect(game.ticksPerDrop).toBe(2);
    game.score.level = 29;
    fullyDropPiece(game);
    expect(game.ticksPerDrop).toBe(1);
  });

  it("has lock delay", () => {
    [29, 0].forEach((startLevel) => {
      const game = new Tetris({ startLevel });
      expect(game.score.level).toBe(startLevel);
      game.newPiece(Shapes.getForm("I", 0));
      while (!game.pieceIsAtBottom()) {
        game.tick();
      }
      expect(game.pieceIsAtBottom()).toBeTrue();
      expect(game.getPiece().timeToDrop).toBe(Tetris.lockDelay);
      game.tick();
      expect(game.getPiece().timeToDrop).toBe(Tetris.lockDelay - 1);
      game.rotate();
      expect(game.getPiece().shape).toEqual(Shapes.getForm("I", 1));
      expect(game.getPiece().timeToDrop).toBe(Tetris.lockDelay);
    });
  });

  it("has a next shape preview", () => {
    const game = new Tetris();
    for (let i = 0; i < 4; i++) {
      const nextShape = game.getNextShape();
      expect(nextShape).toBeTruthy();
      fullyDropPiece(game);
      expect(game.getPiece().shape).toEqual(nextShape);
    }
  });
});

function tickTilDrop(game) {
  for (let i = 0; i < game.ticksPerDrop; i++) {
    game.tick();
  }
}
