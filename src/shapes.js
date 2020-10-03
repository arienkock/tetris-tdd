const { parseShape } = require("./parseShape");

const forms = {
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
####
      `),
    parseShape(`
 #
 #
 #
 #
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

const nextRotation = (currentShape) => {
  for (let rotations of Object.values(forms)) {
    for (let i = 0; i < rotations.length; i++) {
      let shape = rotations[i];
      if (shape === currentShape) {
        return rotations[(i + 1) % rotations.length];
      }
    }
  }
};

const randomShape = () => {
  const shapeNames = Object.keys(forms);
  const randomIndex = Math.floor(Math.random() * shapeNames.length);
  const shape = shapeNames[randomIndex];
  return forms[shape][0];
};

const getForm = (name, index) => forms[name][index];

const getNumRotations = (name) => forms[name].length;

module.exports = {
  getForm,
  getNumRotations,
  nextRotation,
  randomShape,
};
