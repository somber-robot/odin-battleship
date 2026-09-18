export function loadPage(logic) {
  // create tile grids
  const playerGrid = document.querySelector(".grid.player .tiles");
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      const tile = document.createElement("div");
      tile.classList.add("tile", `row-${row}`, `col-${col}`);

      // game functionality

      playerGrid.append(tile);
    }
  }

  const cpuGrid = document.querySelector(".grid.cpu .tiles");
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      const tile = document.createElement("div");
      tile.classList.add("tile", `row-${row}`, `col-${col}`);

      // game functionality

      cpuGrid.append(tile);
    }
  }

  const randomGrid = (boardName) => {
    const board = boardName == "player" ? logic.playerBoard : logic.cpuBoard;
    logic.populateBoard(board);

    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        const tile = document.querySelector(
          `.grid.${boardName} .tile.row-${row}.col-${col}`,
        );
        const value = board.getValue(row, col);
        if (!Array.isArray(value)) continue;
        tile.classList.add("ship");
      }
    }
  };

  const clearGrid = (boardName) => {
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        const tile = document.querySelector(
          `.grid.${boardName} .tile.row-${row}.col-${col}`,
        );
        tile.classList.remove("ship", "hit");
      }
    }
  };

  const randomize = document.querySelector("button.randomize");
  randomize.addEventListener("click", () => {
    clearGrid("player");
    randomGrid("player");
  });

  const game = document.querySelector("button.game");
  game.addEventListener("click", () => {
    if (game.innerText === "Start Game") {
      randomGrid("cpu");
      game.innerText = "Cancel Game";
      randomize.disabled = true;
    } else if (game.innerText === "Cancel Game") {
      clearGrid("cpu");
      game.innerText = "Start Game";
      randomize.disabled = false;
    }
  });

  // start up
  randomGrid("player");
}
