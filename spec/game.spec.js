describe("tetris", () => {
  it("has a play area with height and width", () => {
    const game = new Tetris();
    const dimensions = game.getAreaDimensions();
    expect(dimensions.height).toBeGreaterThan(1);
    expect(dimensions.width).toBeGreaterThan(1);
  });
});

function Tetris() {
  const height = 40;
  const width = 10;
  this.getAreaDimensions = () => ({ height, width });
}
