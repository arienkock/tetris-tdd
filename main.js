(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const { Tetris } = require("./game");

const game = new Tetris();
const { width, height } = game.getAreaDimensions();

let rows = "";
for (let y = 0; y < height; y++) {
  let columns = "";
  for (let x = 0; x < width; x++) {
    columns += `<td class="block block-${x}-${y}"></td>`;
  }
  rows += "<tr>" + columns + "</tr>";
}

let html = "<table>" + rows + "</table>";

document.getElementById("area").innerHTML = html;

function tick() {
  game.tick();
  paint();
}

function paint() {
  document.querySelectorAll(".block").forEach((td) => {
    td.classList.remove("active");
  });
  const piece = game.getPiece();
  piece.shape.blocks.forEach(([x, y]) => {
    activate(x + piece.x, y + piece.y);
  });
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (game.getAreaContents(x, y)) {
        activate(x, y);
      }
    }
  }
}

function activate(x, y) {
  const td = document.querySelector(`.block-${x}-${y}`);
  if (!td) {
    console.error("No block for", `.block-${x}-${y}`);
  } else {
    td.classList.add("active");
  }
}

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") {
    game.moveLeft();
    paint();
  } else if (event.key === "ArrowRight") {
    game.moveRight();
    paint();
  } else if (event.key === "ArrowUp") {
    game.rotate();
    paint();
  }
});

paint();
setInterval(tick, 100);

},{"./game":2}],2:[function(require,module,exports){
const { parseShape } = require("./parseShape");

function Tetris() {
  const area = {
    width: 10,
    height: 40,
  };
  this.ticksPerDrop = 2;
  let piece;
  let areaContents = new Array(area.width * area.height);

  this.getAreaDimensions = () => area;
  this.getPiece = () => piece;
  this.tick = () => {
    if (--piece.timeToDrop === 0) {
      this.drop();
    }
  };
  this.pieceIsAtBottom = () => {
    return piece.shape.blocks.some(
      ([x, y]) =>
        piece.y + y + 1 >= area.height ||
        this.getAreaContents(piece.x + x, piece.y + y + 1)
    );
  };
  this.newPiece = (shape) => {
    piece = {};
    piece.width = shape.width;
    piece.shape = shape;
    piece.x = Math.floor((area.width - piece.width) / 2);
    piece.y = 0;
    piece.timeToDrop = this.ticksPerDrop;
  };
  this.drop = () => {
    piece.timeToDrop = this.ticksPerDrop;
    if (this.pieceIsAtBottom()) {
      piece.shape.blocks.forEach(([x, y]) => {
        setAreaContents(x + piece.x, y + piece.y, true);
      });
      this.newPiece(randomShape());
    } else {
      piece.y++;
    }
  };
  this.newPiece(Tetris.shapes.T[0]);
  this.moveLeft = () => {
    if (
      !piece.shape.blocks.some(
        ([x, y]) =>
          this.getAreaContents(piece.x + (x - 1), piece.y + y) ||
          piece.x + (x - 1) < 0
      )
    ) {
      piece.x--;
    } else {
      console.log("Thunk left");
    }
  };
  this.moveRight = () => {
    if (
      !piece.shape.blocks.some(
        ([x, y]) =>
          this.getAreaContents(piece.x + (x + 1), piece.y + y) ||
          piece.x + (x + 1) >= area.width
      )
    ) {
      piece.x++;
    }
  };
  this.getAreaContents = (x, y) => {
    return areaContents[y * area.width + x];
  };
  this.rotate = () => {
    for (let rotations of Object.values(Tetris.shapes)) {
      for (let i = 0; i < rotations.length; i++) {
        let shape = rotations[i];
        if (shape === piece.shape) {
          piece.shape = rotations[(i + 1) % rotations.length];
          return;
        }
      }
    }
  };
  function setAreaContents(x, y, value) {
    areaContents[y * area.width + x] = value;
  }
}

function randomShape() {
  const shapeNames = Object.keys(Tetris.shapes);
  const randomIndex = Math.floor(Math.random() * shapeNames.length);
  const shape = shapeNames[randomIndex];
  return Tetris.shapes[shape][0];
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

module.exports = {
  Tetris,
};

},{"./parseShape":3}],3:[function(require,module,exports){
function parseShape(string) {
  let maxX = 0;
  const split = string.split("\n");
  const rows = split.slice(1, split.length - 1);
  const blocks = [];
  rows.forEach((row, y) =>
    [...row].forEach((s, x) => {
      if (s === "#") {
        blocks.push([x, y]);
        maxX = Math.max(x, maxX);
      }
    })
  );
  return { blocks, width: maxX + 1 };
}

module.exports = {
  parseShape,
};

},{}]},{},[1]);
