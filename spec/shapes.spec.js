const Shapes = require("../src/shapes");

describe("shapes", () => {
  it("has all the classic shapes composed of 4 blocks, in all their rotations", () => {
    const shapeNames = ["I", "O", "T", "S", "Z", "J", "L"];
    shapeNames.forEach((name) => {
      for (let i = 0; i < Shapes.getNumRotations(name); i++) {
        const rotation = Shapes.getForm(name, i);
        expect(rotation.blocks.length).toBe(4);
        expect(rotation.width).toBeGreaterThan(0);
        rotation.blocks.forEach((coordinate) =>
          expect(coordinate.length).toBe(2)
        );
      }
    });
  });
});
