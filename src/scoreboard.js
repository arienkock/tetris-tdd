function Scoreboard() {
  const entries = [];
  let idGen = 0;
  this.top10 = () => entries;
  this.newEntry = () => {
    let id = ++idGen;
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
