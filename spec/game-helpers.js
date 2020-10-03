function fullyDropPiece(game) {
  while (!game.pieceIsAtBottom()) {
    game.drop();
  }
  game.drop();
}

module.exports = {
  fullyDropPiece,
};
