function Score(startLevel = 0) {
  const base = [0, 40, 100, 300, 1200];
  this.level = startLevel;
  this.value = 0;
  let linesToNextLevel = Math.min(
    startLevel * 10 + 10,
    Math.max(100, startLevel * 10 - 50)
  );
  this.tallyLines = (lines) => {
    linesToNextLevel -= lines;
    if (linesToNextLevel <= 0) {
      this.level++;
      linesToNextLevel += 10;
    }
    this.value += base[lines] * (this.level + 1);
  };
}

module.exports = Score;
