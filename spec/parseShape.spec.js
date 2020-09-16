const { parseShape } = require("./parseShape");

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
