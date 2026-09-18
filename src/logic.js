export const Ship = (len) => {
  const id = crypto.randomUUID();
  const body = Array(len).fill(0);
  const getID = () => id;
  const getBody = () => body;
  const hit = (index) => {
    body[index] = 1;
  };
  const isSunk = () => body.every((value) => !!value);
  return { getID, getBody, hit, isSunk };
};

export const Gameboard = () => {
  const grid = Array.from({ length: 10 }, () => Array(10).fill(null));
  const clear = () => {
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        grid[row][col] = null;
      }
    }
  };
  const isSpaceFree = (row, col) => {
    if (row < 0 || row > 9 || col < 0 || col > 9) return false;
    return !grid[row][col];
  };
  const getShipPresent = (row, col) => {
    if (Array.isArray(grid[row][col])) return grid[row][col][0];
    return !!grid[row][col];
  };
  const placeShip = (ship, orientation, row, col) => {
    const len = ship.getBody().length;
    if (row + len - 1 > 9 || col + len - 1 > 9) {
      const message = `Cannot place ${orientation} ship of length ${len} at ${row} ${col}`;
      throw Error(message);
    }

    if (orientation === "H") {
      if (col !== 0) {
        if (
          (row !== 0 && !isSpaceFree(row - 1, col - 1)) ||
          !isSpaceFree(row, col - 1) ||
          (row !== 9 && !isSpaceFree(row + 1, col - 1))
        ) {
          throw Error("No adjacent space");
        }
      }
      if (col < 10 - len) {
        if (
          (row !== 0 && !isSpaceFree(row - 1, col + len)) ||
          !isSpaceFree(row, col + len) ||
          (row !== 9 && !isSpaceFree(row + 1, col + len))
        ) {
          throw Error("No adjacent space");
        }
      }
      for (let i = 0; i < len; i++) {
        if (getShipPresent(row, col + i)) throw Error("Ship overlap");
        if (
          (row !== 0 && !isSpaceFree(Math.max(0, row - 1), col + i)) ||
          (row !== 9 && !isSpaceFree(Math.min(9, row + 1), col + i))
        )
          throw Error("No adjacent space");
        grid[row][col + i] = [ship.getID(), i];
      }
    } else {
      if (row !== 0) {
        if (
          (col !== 0 && !isSpaceFree(row - 1, col - 1)) ||
          !isSpaceFree(row - 1, col) ||
          (col !== 9 && !isSpaceFree(row - 1, col + 1))
        ) {
          throw Error("No adjacent space");
        }
      }
      if (row < 10 - len) {
        if (
          (col !== 0 && !isSpaceFree(row + len, col - 1)) ||
          !isSpaceFree(row + len, col) ||
          (col !== 9 && !isSpaceFree(row + len, col + 1))
        ) {
          throw Error("No adjacent space");
        }
      }
      for (let i = 0; i < len; i++) {
        if (getShipPresent(row + i, col)) throw Error("Ship overlap");
        if (
          (col !== 0 && !isSpaceFree(row + i, Math.max(0, col - 1))) ||
          (col !== 9 && !isSpaceFree(row + i, Math.min(9, col + 1)))
        )
          throw Error("No adjacent space");
        grid[row + i][col] = [ship.getID(), i];
      }
    }
  };
  const getValue = (row, col) => grid[row][col];
  const receiveAttack = (row, col) => {
    if (row < 0 || row > 9 || col < 0 || col > 9) return;
    const targetVal = getValue(row, col);
    if (Array.isArray(targetVal)) {
      let tr = row - 1 < 0 ? null : row - 1,
        br = row + 1 > 9 ? null : row + 1,
        lc = col - 1 < 0 ? null : col - 1,
        rc = col + 1 > 9 ? null : col + 1;

      if (tr != null && lc != null) grid[tr][lc] = -1;
      if (tr != null && rc != null) grid[tr][rc] = -1;
      if (br != null && lc != null) grid[br][lc] = -1;
      if (br != null && rc != null) grid[br][rc] = -1;

      return targetVal;
    } else grid[row][col] = -1;
  };
  const getShipIDs = () => {
    const IDs = new Set();
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        const value = getValue(row, col);
        if (!Array.isArray(value)) continue;
        IDs.add(value[0]);
      }
    }
    return IDs;
  };
  return {
    isSpaceFree,
    getShipPresent,
    placeShip,
    getValue,
    receiveAttack,
    getShipIDs,
    clear,
  };
};

export class LogicHandler {
  #ships = [];

  constructor() {
    this.playerBoard = Gameboard();
    this.cpuBoard = Gameboard();
  }

  populateBoard = (board) => {
    this.clearBoard(board);
    this.placeShips(board, this.generateShipPlacements());
  };

  createShip = (len) => {
    const ship = Ship(len);
    return ship;
  };

  generateShipPlacements = () => {
    const placements = [];
    const orientations = [];
    const positions = [];

    let board = Gameboard();

    for (const len of [4, 3, 3, 2, 2, 2, 1, 1, 1, 1]) {
      let orientation = ["V", "H"][Math.round(Math.random())];
      if (len === 5)
        if (orientations.every((o) => o === "H")) orientation = "V";
        else if (orientations.every((o) => o === "V")) orientation = "H";

      let row, col;
      while (true) {
        row = Math.trunc(Math.random() * 9);
        col = Math.trunc(Math.random() * 9);

        for (const [R, C] of positions) {
          if (row !== R || col !== C) continue;
          row = Math.trunc(Math.random() * 9);
          col = Math.trunc(Math.random() * 9);
          break;
        }

        try {
          board.placeShip(this.createShip(len), orientation, row, col);
        } catch (e) {
          orientation = orientation === "H" ? "V" : "H";
          continue;
        }

        break;
      }

      placements.push([row, col, len, orientation]);
      orientations.push(orientation);
      positions.push([row, col]);
    }

    return placements;
  };

  canAttack = (board, row, col) => {
    const value = board.getValue(row, col);
    if (!Array.isArray(value)) {
      return value === null;
    }
    const ship = this.getShipByID(value[0]);
    return !ship.getBody()[value[1]];
  };

  receiveAttack = (board, row, col) => {
    const feedback = board.receiveAttack(row, col);
    if (!Array.isArray(feedback)) return;
    const [shipID, hurtIndex] = feedback;
    for (const ship of this.#ships) {
      if (ship.getID() != shipID) continue;
      ship.hit(hurtIndex);
      if (!ship.isSunk()) return;
      const len = ship.getBody().length;
      for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
          const value = board.getValue(row, col);
          if (!Array.isArray(value)) continue;
          if (value[0] != shipID) continue;

          if (len === 1) {
            if (col != 0) board.receiveAttack(row, col - 1);
            if (col + len - 1 != 9) board.receiveAttack(row, col + 1);
            if (row != 0) board.receiveAttack(row - 1, col);
            if (row + len - 1 != 9) board.receiveAttack(row + 1, col);
            break;
          }

          const H =
            col + len <= 9 &&
            Array.isArray(board.getValue(row, col + 1)) &&
            board.getValue(row, col + 1)[0] == shipID;

          if (H) {
            if (col != 0) board.receiveAttack(row, col - 1);
            if (col + len - 1 != 9) board.receiveAttack(row, col + len);
          } else {
            if (row != 0) board.receiveAttack(row - 1, col);
            if (row + len - 1 != 9) board.receiveAttack(row + 1, col);
          }
          break;
        }
      }
    }
  };

  placeShips = (board, placements) => {
    for (const data of placements) {
      const ship = this.createShip(data[2]);
      this.#ships.push(ship);
      board.placeShip(ship, data[3], data[0], data[1]);
    }
    return this.#ships.map((ship) => ship.getID());
  };

  getShipByID = (id) => {
    for (const ship of this.#ships) {
      if (ship.getID() != id) continue;
      return ship;
    }
  };

  clearBoard = (board) => {
    board.clear();
  };

  isSpaceFree = (board, row, col) => {
    return board.isSpaceFree(row, col);
  };

  allSunk = (board) => {
    for (const id of board.getShipIDs()) {
      if (!this.getShipByID(id).isSunk()) return false;
    }
    return true;
  };
}
