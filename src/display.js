export function loadPage(logic) {
  let mx = 0,
    my = 0;

  document.addEventListener("mousemove", (e) => {
    mx = e.clientX;
    my = e.clientY;
  });

  let gameActive = false;

  const message = document.querySelector(".message");

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

      // hover functionality
      tile.addEventListener("mouseenter", () => {
        if (!gameActive || !logic.canAttack(logic.cpuBoard, row, col)) return;
        tile.classList.add("hover");
      });

      tile.addEventListener("mouseleave", () => {
        tile.classList.remove("hover");
      });

      // game functionality
      tile.addEventListener("click", () => {
        if (!gameActive || !logic.canAttack(logic.cpuBoard, row, col)) return;
        tile.classList.remove("hover");
        logic.receiveAttack(logic.cpuBoard, row, col);
        updateBoardUI("cpu");
        const value = logic.cpuBoard.getValue(row, col);
        if (!Array.isArray(value)) {
          playerGrid.classList.remove("dull");
          gameActive = false;
          cpuTurn();
          return;
        }

        //check for win
        if (!logic.allSunk(logic.cpuBoard)) return;
        playerGrid.classList.remove("dull");
        message.innerText = "YOU WIN!";
        message.classList.add("win");
        gameActive = false;
        game.innerText = "New Game";
        randomize.disabled = false;
        cpuGrid.classList.add("dull");
      });

      cpuGrid.append(tile);
    }
  }

  const cpuTurn = () => {
    message.innerText = "Cpu's turn";
    message.classList.remove("win", "lose");

    cpuGrid.classList.add("dull");

    const findPosition = () => {
      let row = Math.trunc(Math.random() * 9),
        col = Math.trunc(Math.random() * 9),
        attempts = 0;
      while (!logic.canAttack(logic.playerBoard, row, col)) {
        row = Math.trunc(Math.random() * 9);
        col = Math.trunc(Math.random() * 9);
        attempts++;
        if (attempts <= 30000) continue;
        for (let r = 0; r < 10; r++) {
          for (let c = 0; c < 10; c++) {
            if (!logic.canAttack(logic.playerBoard, r, c)) continue;
            return [r, c];
          }
        }
      }
      return [row, col];
    };

    const playPosition = (row, col) => {
      const tile = document.querySelector(
        `.grid.player .tile.row-${row}.col-${col}`,
      );
      tile.classList.add("hover");
      setTimeout(() => {
        tile.classList.remove("hover");
        if (game.innerText !== "Cancel Game") {
          cpuGrid.classList.remove("dull");
          return;
        }

        const feedback = logic.receiveAttack(logic.playerBoard, row, col);
        updateBoardUI("player");

        if (feedback === -1) {
          gameActive = true;
          message.innerText = "Your turn...";
          message.classList.remove("win", "lose");
          const hovered = document.elementFromPoint(mx, my);
          const tile = hovered?.closest(".cpu .tile");
          if (tile && !tile.classList.contains("hit"))
            tile.classList.add("hover");
          cpuGrid.classList.remove("dull");
          playerGrid.classList.add("dull");
          return;
        }

        if (logic.allSunk(logic.playerBoard)) {
          // cpu wins
          message.innerText = "YOU LOSE!";
          message.classList.add("lose");
          game.innerText = "New Game";
          randomize.disabled = false;
          gameActive = false;
          cpuGrid.classList.remove("dull");
          playerGrid.classList.add("dull");
          return;
        }

        const surrounding = logic.getSurroundingTiles(
          logic.playerBoard,
          row,
          col,
        );

        if (!surrounding.length) [row, col] = findPosition();
        else
          [row, col] =
            surrounding[Math.trunc(Math.random() * surrounding.length)];
        playPosition(row, col);
      }, 1000);
    };

    playPosition(...findPosition());
  };

  const randomGrid = (boardName) => {
    clearGrid(boardName);
    const board = boardName == "player" ? logic.playerBoard : logic.cpuBoard;
    logic.populateBoard(board);
    updateBoardUI(boardName);
  };

  const updateBoardUI = (boardName) => {
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

  const clearGrid = (boardName, keepShips = false) => {
    const board = boardName == "player" ? logic.playerBoard : logic.cpuBoard;
    logic.clearBoard(board, keepShips);
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        const tile = document.querySelector(
          `.grid.${boardName} .tile.row-${row}.col-${col}`,
        );
        tile.classList.remove("hit");
        if (!keepShips) tile.classList.remove("ship");
      }
    }
  };

  const randomize = document.querySelector("button.randomize");
  randomize.addEventListener("click", () => {
    randomGrid("player");
    clearGrid("cpu");
    message.innerText = "Click start to play!";
    game.innerText = "Start Game";
    playerGrid.classList.remove("dull");
    message.classList.remove("win", "lose");
  });

  const game = document.querySelector("button.game");
  game.addEventListener("click", () => {
    if (game.innerText === "Start Game" || game.innerText === "New Game") {
      clearGrid("player", true);
      randomGrid("cpu");
      game.innerText = "Cancel Game";
      randomize.disabled = true;
      gameActive = true;
      message.innerText = "Your turn...";
      playerGrid.classList.add("dull");
    } else if (game.innerText === "Cancel Game") {
      clearGrid("cpu");
      game.innerText = "Start Game";
      randomize.disabled = false;
      gameActive = false;
      message.innerText = "Click start to play!";
      clearGrid("player", true);
      for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
          const tile = document.querySelector(
            `.grid.player .tile.row-${row}.col-${col}`,
          );
          tile.classList.remove("hover");
        }
      }
      playerGrid.classList.remove("dull");
    }
    message.classList.remove("win", "lose");
    cpuGrid.classList.remove("dull");
  });

  // start up
  cpuGrid.classList.add("dull");
  randomGrid("player");
}
