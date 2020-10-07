function Scoreboard() {
  const entries = [];
  this.top10 = () => entries;
  this.newEntry = () => {
    let id = 1;
    entries.push({
      id,
      name: "anonymous",
      score: 0,
    });
    return id;
  };
  this.updateScore = (id, score) => {
    entries.forEach((entry) => {
      if (entry.id === id) {
        entry.score = score;
      }
    });
  };
}

module.exports = Scoreboard;
