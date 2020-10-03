function Score() {
  const base = [0, 40, 100, 300, 1200];
  this.value = 0;
  this.tallyLinesForLevel = (level, lines) => {
    this.value += base[lines] * (level + 1);
  };
}

module.exports = Score;
