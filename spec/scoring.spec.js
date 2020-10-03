const Score = require("../src/score");

describe("scoring", () => {
  it("is the classic scoring", () => {
    const score = new Score();
    score.tallyLinesForLevel(0, 1);
    expect(score.value).toBe(40);
    score.tallyLinesForLevel(0, 1);
    expect(score.value).toBe(80);
    score.tallyLinesForLevel(0, 2);
    expect(score.value).toBe(180);
    score.tallyLinesForLevel(0, 3);
    expect(score.value).toBe(480);
    score.tallyLinesForLevel(0, 4);
    expect(score.value).toBe(1680);
    // level 1
    score.tallyLinesForLevel(1, 1);
    expect(score.value).toBe(1760);
    score.tallyLinesForLevel(1, 2);
    expect(score.value).toBe(1960);
    // level 2
    score.tallyLinesForLevel(2, 3);
    expect(score.value).toBe(2860);
    score.tallyLinesForLevel(2, 4);
    expect(score.value).toBe(6460);
  });
});
