function Scoreboard(db) {
  let entries = [];
  const tetrisScores = db.collection("tetris-scores");
  tetrisScores
    .orderBy("score", "desc")
    .limit(10)
    .onSnapshot((querySnapshot) => {
      entries = querySnapshot
        .docs()
        .map((queryDocSnapshot) => queryDocSnapshot.data());
    });
  this.top10 = () => entries;
  this.newEntry = () => {
    const docRef = tetrisScores.doc();
    docRef.set(
      {
        name: "anonymous",
        score: 0,
        level: 0,
      },
      { merge: true }
    );
    return docRef.id;
  };
  this.updateScore = (id, name, score, level) => {
    return tetrisScores.doc(id).update({
      name,
      score,
      level,
    });
  };
}

module.exports = Scoreboard;
