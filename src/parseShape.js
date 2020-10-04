function parseShape(string) {
  let maxX = 0,
    maxY = 0;
  const split = string.split("\n");
  const rows = split.slice(1, split.length - 1);
  const blocks = [];
  rows.forEach((row, y) =>
    [...row].forEach((s, x) => {
      if (s === "#") {
        blocks.push([x, y]);
        maxX = Math.max(x, maxX);
        maxY = Math.max(y, maxY);
      }
    })
  );
  return { blocks, width: maxX + 1, height: maxY + 1 };
}

module.exports = {
  parseShape,
};
