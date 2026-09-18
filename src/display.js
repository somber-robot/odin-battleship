export function loadPage(logic) {
  let gameActive = false;

  // create tile grids
  const playerGrid = document.querySelector(".grid.player .tiles");
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      const tile = document.createElement("div");
      tile.classList.add("tile", `row-${row}`, `col-${col}`);
      playerGrid.append(tile);
    }
  }

  const cpuGrid = document.querySelector(".grid.cpu .tiles");
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      const tile = document.createElement("div");
      tile.classList.add("tile", `row-${row}`, `col-${col}`);

      // game functionality
      tile.addEventListener("click", () => {
        if (!gameActive || !logic.canAttack(logic.cpuBoard, row, col)) return;
        logic.receiveAttack(logic.cpuBoard, row, col);
        const value = logic.cpuBoard.getValue(row, col);
        if (!Array.isArray(value)) {
          gameActive = false;
          // handle cpu turn
        }
        upgradeBoardUI("cpu");
      });

      cpuGrid.append(tile);
    }
  }

  const randomGrid = (boardName) => {
    const board = boardName == "player" ? logic.playerBoard : logic.cpuBoard;
    logic.populateBoard(board);
    upgradeBoardUI(boardName);
  };

  const upgradeBoardUI = (boardName) => {
    const board = boardName == "player" ? logic.playerBoard : logic.cpuBoard;
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        const tile = document.querySelector(
          `.grid.${boardName} .tile.row-${row}.col-${col}`,
        );
        const value = board.getValue(row, col);
        if (Array.isArray(value)) {
          tile.classList.add("ship");
          const ship = logic.getShipByID(value[0]);
          if (ship.getBody()[value[1]] === 1) {
            tile.classList.add("hit");
          }
        } else if (value === -1) {
          tile.classList.add("hit");
        }
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
      gameActive = true;
    } else if (game.innerText === "Cancel Game") {
      clearGrid("cpu");
      game.innerText = "Start Game";
      randomize.disabled = false;
      gameActive = false;
    }
  });

  // start up
  randomGrid("player");
}
