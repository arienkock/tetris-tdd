const Score = require("../src/score");
const { Tetris } = require("../src/game");
const { fullyDropPiece } = require("./game-helpers");
const { parseShape } = require("../src/parseShape");

describe("scoring", () => {
  it("is the classic scoring", () => {
    let score = new Score(0);
    score.tallyLines(1);
    expect(score.value).toBe(40);
    score.tallyLines(1);
    expect(score.value).toBe(80);
    score.tallyLines(2);
    expect(score.value).toBe(180);
    score.tallyLines(3);
    expect(score.value).toBe(480);
    // level 1
    score = new Score(1);
    score.tallyLines(1);
    expect(score.value).toBe(80);
    score.tallyLines(2);
    expect(score.value).toBe(280);
    // level 2
    score = new Score(2);
    score.tallyLines(3);
    expect(score.value).toBe(900);
    score.tallyLines(4);
    expect(score.value).toBe(4500);
  });

  it(`when the player line clear 
       (startLevel × 10 + 10) or 
       max(100, (startLevel × 10 - 50)) lines, whatever comes first, 
       the level advances by 1. 
       
       After this, the level advances by 1 for every 10 lines.`, () => {
    let score = new Score(5);
    score.tallyLines(60);
    expect(score.level).toBe(6);
    score.tallyLines(10);
    expect(score.level).toBe(7);
  });

  it("is part of the game", () => {
    const game = new Tetris();
    expect(game.score.value).toBe(0);
    game.newPiece(
      parseShape(`
##########
      `)
    );
    fullyDropPiece(game);
    expect(game.score.value).toBe(40);
    game.newPiece(
      parseShape(`
##########
##########
      `)
    );
    fullyDropPiece(game);
    expect(game.score.value).toBe(140);
  });
});
