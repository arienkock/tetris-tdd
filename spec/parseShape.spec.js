const { parseShape } = require("../src/parseShape");

describe("parseShape", () => {
  it("takes a string representation and returns a shape object", () => {
    expect(
      parseShape(`
#
#
#
#
      `)
    ).toEqual(
      jasmine.objectContaining({
        width: 1,
        height: 4,
        blocks: [
          [0, 0],
          [0, 1],
          [0, 2],
          [0, 3],
        ],
      })
    );
    expect(
      parseShape(`
####
      `)
    ).toEqual(
      jasmine.objectContaining({
        width: 4,
        height: 1,
        blocks: [
          [0, 0],
          [1, 0],
          [2, 0],
          [3, 0],
        ],
      })
    );
    expect(
      parseShape(`
 ##
##
      `)
    ).toEqual(
      jasmine.objectContaining({
        blocks: [
          [1, 0],
          [2, 0],
          [0, 1],
          [1, 1],
        ],
      })
    );
  });
});
