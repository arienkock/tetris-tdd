const Scoreboard = require("../src/scoreboard");

describe("scoreboard", () => {
  it("starts off as an empty list", () => {
    const scoreboard = new Scoreboard(createMockDb());
    expect(scoreboard.top10()).toEqual([]);
  });

  it("can create a new entry without a player name", () => {
    const scoreboard = new Scoreboard(createMockDb());
    const entryId = scoreboard.newEntry();
    expect(entryId).toBeTruthy();
    expect(scoreboard.top10()).toEqual([
      {
        name: "anonymous",
        score: 0,
        level: 0,
      },
    ]);
  });

  it("updates the score of an entry", async () => {
    const scoreboard = new Scoreboard(createMockDb());
    const entryId = scoreboard.newEntry();
    const updatePromise = scoreboard.updateScore(entryId, "newName", 100, 1);
    expect(updatePromise).toBeInstanceOf(Promise);
    await updatePromise;
    expect(scoreboard.top10()).toEqual([
      {
        name: "newName",
        score: 100,
        level: 1,
      },
    ]);
  });

  it("generates unique ids", () => {
    const knownIds = new Set();
    const scoreboard = new Scoreboard(createMockDb());
    for (let i = 0; i < 100; i++) {
      const entryId = scoreboard.newEntry();
      knownIds.add(entryId);
    }
    expect(knownIds.size).toBe(100);
  });
});

// Couldn't find a Firestore mock with all the functionality (dummy functions) I needed.
function createMockDb() {
  let idGen = 0;
  function newId() {
    return "ID" + ++idGen;
  }
  const data = {};
  const db = {
    collection: (collectionPath) => {
      let collectionRef = data[collectionPath];
      if (!collectionRef) {
        const docs = {};
        let listener;
        collectionRef = {
          orderBy: () => collectionRef,
          limit: () => collectionRef,
          onSnapshot: (onNext) => {
            listener = onNext;
            return () => {};
          },
          doc: (path) => {
            if (!path) {
              const id = newId();
              let data = {};
              const docRef = {
                id,
                _data: () => data,
                update: (updateData) => {
                  Object.assign(data, updateData);
                  return Promise.resolve();
                },
                set: (updateData, options) => {
                  if (options.merge) {
                    Object.assign(data, updateData);
                  } else {
                    data = updateData;
                  }
                  listener({
                    docs: Object.values(docs).map((docRef) => {
                      return {
                        data: () => docRef._data(),
                      };
                    }),
                  });
                },
              };
              docs[id] = docRef;
              return docRef;
            } else {
              return docs[path];
            }
          },
        };
        data[collectionPath] = collectionRef;
      }
      return collectionRef;
    },
  };
  return db;
}
