const Scoreboard = require("../src/scoreboard");

describe("scoreboard", () => {
  it("starts off as an empty list", () => {
    const scoreboard = new Scoreboard();
    expect(scoreboard.top10()).toEqual([]);
  });

  it("can create a new entry without a player name", () => {
    const scoreboard = new Scoreboard();
    const entryId = scoreboard.newEntry();
    expect(entryId).toBeTruthy();
    expect(scoreboard.top10()).toEqual([
      {
        id: entryId,
        name: "anonymous",
        score: 0,
      },
    ]);
  });

  it("updates the score of an entry", () => {
    const scoreboard = new Scoreboard();
    const entryId = scoreboard.newEntry();
    scoreboard.updateScore(entryId, 100);
    expect(scoreboard.top10()).toEqual([
      {
        id: entryId,
        name: "anonymous",
        score: 100,
      },
    ]);
  });

  it("generates unique ids", () => {
    const knownIds = new Set();
    const scoreboard = new Scoreboard();
    for (let i = 0; i < 10000; i++) {
      const entryId = scoreboard.newEntry();
      knownIds.add(entryId);
    }
    expect(knownIds.size).toBe(10000);
  });
});
