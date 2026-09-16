import { Ship, Gameboard, LogicHandler } from "./logic.js";

describe("Ship Object Tests", () => {
  let ship;

  beforeEach(() => {
    ship = Ship(4);
  });

  test("take hit", () => {
    expect(ship.getBody()).toEqual([0, 0, 0, 0]);
    ship.hit(2);
    expect(ship.getBody()).toEqual([0, 0, 1, 0]);
  });

  test("check if ship is sunk", () => {
    expect(ship.isSunk()).toBe(false);
    for (let i = 0; i < ship.getBody().length; i++) ship.hit(i);
    expect(ship.isSunk()).toBe(true);
  });
});

describe("Gameboard Object Tests", () => {
  let board;

  beforeEach(() => {
    board = Gameboard();
  });

  test("check default space status", () => {
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        expect(board.isSpaceFree(col, row)).toBe(true);
      }
    }
  });

  test("place a ship", () => {
    let ship = Ship(4),
      id = ship.getID();

    for (let col = 0; col < 4; col++) {
      expect(board.getShipPresent(1, col)).toBe(false);
      expect(board.isSpaceFree(1, col)).toBe(true);
    }

    board.placeShip(ship, "H", 1, 0);

    for (let col = 0; col < 4; col++) {
      expect(board.getShipPresent(1, col)).toBe(id);
      expect(board.isSpaceFree(1, col)).toBe(false);
    }

    expect(() => board.placeShip(ship, "V", 8, 6)).toThrow();
  });

  test("receive attack input", () => {
    // empty spot
    expect(board.isSpaceFree(9, 9)).toBe(true);
    expect(board.getValue(9, 9)).toBeNull();

    board.receiveAttack(9, 9);

    expect(board.isSpaceFree(9, 9)).toBe(false);
    expect(board.getValue(9, 9)).toBe(-1);

    // ship spot
    const ship = Ship(3),
      id = ship.getID();

    board.placeShip(ship, "V", 2, 1);

    expect(board.receiveAttack(3, 1)).toEqual([id, 1]);

    // attacks should hit empty diagonal surrounding spots
    expect(board.getValue(2, 0)).toBe(-1);
    expect(board.getValue(2, 2)).toBe(-1);
    expect(board.getValue(4, 0)).toBe(-1);
    expect(board.getValue(4, 2)).toBe(-1);
  });

  test("return all ship IDs", () => {
    const ship1 = Ship(3),
      ship2 = Ship(2),
      ship3 = Ship(4),
      id1 = ship1.getID(),
      id2 = ship2.getID(),
      id3 = ship3.getID();

    board.placeShip(ship1, "H", 4, 5);
    board.placeShip(ship2, "V", 1, 7);
    board.placeShip(ship3, "V", 6, 2);

    expect(board.getShipIDs()).toEqual(new Set([id1, id2, id3]));
  });
});

describe("Logic Handler Tests", () => {
  let logic, board;

  beforeEach(() => {
    logic = new LogicHandler();
    board = Gameboard();
  });

  // generate random ship placement
  test("generate valid random ship placement", () => {
    const placements = logic.generateShipPlacements();
    expect(() => logic.placeShips(board, placements)).not.toThrow();
  });

  // receive attack on certain position of a given board
  test("receive attack on a certain position", () => {
    let ids = logic.placeShips(board, [
      [0, 0, 3, "H"],
      [2, 0, 4, "V"],
    ]);

    logic.receiveAttack(board, 0, 0);
    expect(logic.getShipByID(ids[0]).getBody()).toEqual([1, 0, 0]);

    logic.receiveAttack(board, 3, 0);
    expect(logic.getShipByID(ids[1]).getBody()).toEqual([0, 1, 0, 0]);

    // sunk ships should hit all surrounding tiles
    logic.placeShips(board, [
      [7, 7, 1, "H"],
      [4, 3, 3, "V"],
    ]);
    logic.receiveAttack(board, 7, 7);

    expect(board.getValue(6, 7)).toBe(-1);
    expect(board.getValue(8, 7)).toBe(-1);
    expect(board.getValue(7, 6)).toBe(-1);
    expect(board.getValue(7, 8)).toBe(-1);

    logic.receiveAttack(board, 4, 3);
    logic.receiveAttack(board, 5, 3);
    logic.receiveAttack(board, 6, 3);

    expect(board.getValue(3, 3)).toBe(-1);
    expect(board.getValue(7, 3)).toBe(-1);
  });

  // reset game boards
  test("reset game board", () => {
    logic.placeShips(board, logic.generateShipPlacements());

    let occupied = [];
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        if (Array.isArray(board.getValue(row, col)))
          occupied.push(board.getValue(row, col));
      }
    }

    expect(occupied.length).not.toBe(0);

    logic.clearBoard(board);

    occupied = [];
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        if (Array.isArray(board.getValue(row, col)))
          occupied.push(board.getValue(row, col));
      }
    }

    expect(occupied.length).toBe(0);
  });

  // check for space status
  test("check for space status", () => {
    expect(logic.isSpaceFree(board, 0, 0)).toBe(true);
    expect(logic.receiveAttack(board, 0, 0));
    expect(logic.isSpaceFree(board, 0, 0)).toBe(false);
  });

  // check for all sunk in board
  test("check for whether all ships are sunk", () => {
    logic.placeShips(board, logic.generateShipPlacements());
    expect(logic.allSunk(board)).toBe(false);
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        logic.receiveAttack(board, row, col);
      }
    }
    expect(logic.allSunk(board)).toBe(true);
  });
});
