export function loadPage(logic) {
  // game variables
  let gameActive = false;

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

  const randomGrid = () => {
    logic.populatePlayerBoard();
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        const tile = document.querySelector(`.tile.row-${row}.col-${col}`);
        const value = logic.playerBoard.getValue(row, col);
        if (!Array.isArray(value)) continue;
        tile.classList.add("ship");
      }
    }
  };

  const clearPlayerGrid = () => {
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        const tile = document.querySelector(`.tile.row-${row}.col-${col}`);
        tile.classList.remove("ship", "hit");
      }
    }
  };

  const randomize = document.querySelector("button.randomize");
  randomize.addEventListener("click", () => {
    if (gameActive) return;
    clearPlayerGrid();
    randomGrid();
  });

  // start up
  randomGrid();
}
