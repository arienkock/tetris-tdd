describe("Tetris", () => {
  it("has a play area with height and width", () => {
    const game = new Tetris();
    const dimensions = game.getAreaDimensions();
    expect(dimensions.height).toBeGreaterThan(1);
    expect(dimensions.width).toBeGreaterThan(1);
  });

  it("has a shape at the top and center when the game starts", () => {
    const game = new Tetris();
    const shape = game.getCurrentShape();
    const { width } = game.getAreaDimensions();
    expect(shape.y).toBe(0);
    expect(shape.x).toBe(Math.floor(width / 2 - shape.width / 2));
  });

  it("drops shapes down one step every tick", () => {
    const game = new Tetris();
    game.tick();
    const shape = game.getCurrentShape();
    expect(shape.y).toBe(1);
  });
});

function Tetris() {
  const area = {
    width: 10,
    height: 40,
  };
  let currentShape = {};
  currentShape.width = 4;
  currentShape.x = Math.floor(area.width / 2 - currentShape.width / 2);
  currentShape.y = 0;
  this.getAreaDimensions = () => area;
  this.getCurrentShape = () => currentShape;
  this.tick = () => {
    currentShape.y++;
  };
}
