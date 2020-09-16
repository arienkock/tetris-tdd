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

  it("drops shapes down one step when enough ticks pass", () => {
    const game = new Tetris();
    for (let i = 0; i < game.ticksPerDrop; i++) {
      game.tick();
    }
    const shape = game.getCurrentShape();
    expect(shape.y).toBe(1);
  });

  it("has all the classic shapes composed of 4 blocks, in all their rotations", () => {
    const shapeNames = Object.keys(Tetris.shapes);
    expect(shapeNames).toEqual(
      jasmine.arrayContaining(["I", "O", "T", "S", "Z", "J", "L"])
    );
    shapeNames.forEach((name) => {
      const rotations = Tetris.shapes[name];
      // expect(rotations.length).toBeGreaterThan(0);
      rotations.forEach(
        (rotation) =>
          expect(rotation.blocks.length).toBe(4) &&
          rotation.blocks.forEach((coordinate) =>
            expect(coordinate.length).toBe(2)
          )
      );
    });

    expect(Tetris.shapes["O"].length).toBe(1);
  });
});

describe("parseShape", () => {
  it("takes a string representation and returns a shape object", () => {
    expect(
      parseShape(`
#
#
#
#
    `)
    ).toEqual({
      blocks: [
        [0, 0],
        [0, 1],
        [0, 2],
        [0, 3],
      ],
    });
    expect(
      parseShape(`
####
    `)
    ).toEqual({
      blocks: [
        [0, 0],
        [1, 0],
        [2, 0],
        [3, 0],
      ],
    });
    expect(
      parseShape(`
 ##
##
    `)
    ).toEqual({
      blocks: [
        [1, 0],
        [2, 0],
        [0, 1],
        [1, 1],
      ],
    });
  });
});

function parseShape(string) {
  const split = string.split("\n");
  const rows = split.slice(1, split.length - 1);
  const blocks = [];
  rows.forEach((row, y) =>
    [...row].forEach((s, x) => {
      if (s === "#") {
        blocks.push([x, y]);
      }
    })
  );
  return { blocks };
}

function Tetris() {
  const area = {
    width: 10,
    height: 40,
  };
  this.ticksPerDrop = 5;
  let currentShape = {};
  currentShape.width = 4;
  currentShape.x = Math.floor(area.width / 2 - currentShape.width / 2);
  currentShape.y = 0;
  currentShape.timeToDrop = this.ticksPerDrop;
  this.getAreaDimensions = () => area;
  this.getCurrentShape = () => currentShape;
  this.tick = () => {
    if (--currentShape.timeToDrop === 0) {
      currentShape.timeToDrop = this.ticksPerDrop;
      currentShape.y++;
    }
  };
}

Tetris.shapes = {
  J: [
    parseShape(`
#
###
    `),
    parseShape(`
 ##
 #
 #
    `),
    parseShape(`

###
  #
    `),
    parseShape(`
 #
 #
##
    `),
  ],
  I: [
    parseShape(`
#
#
#
#
    `),
    parseShape(`
####
    `),
  ],
  O: [
    parseShape(`
##
##
    `),
  ],
  T: [
    parseShape(`
 #
###
    `),
    parseShape(`
 #
 ##
 #
    `),
    parseShape(`

###
 #
    `),
    parseShape(`
 #
##
 #
    `),
  ],
  S: [
    parseShape(`
 ##
##
    `),
    parseShape(`
#
##
 #
    `),
  ],
  Z: [
    parseShape(`
##
 ##
    `),
    parseShape(`
 #
##
#
    `),
  ],
  L: [
    parseShape(`
  #
###
    `),
    parseShape(`
 #
 #
 ##
    `),
    parseShape(`
###
#
    `),
    parseShape(`
##
 #
 #
    `),
  ],
};
