/**
 * @file Javascript minesweeper game
 * @author Nicole Wagoner
 * @version 0.1
 */

// TODO these should be able to be set by user
const bombCount = 10;
const gridWidth = 10;

/**
 * A single unit on the minesweeper grid
 *
 * @param {Number} row - The row of this unit
 * @param {Number} column - the column of this unit
 */
const gridUnit = function (row, column) {

  let spec = {
    isFlagged : false,
    adjBombCount : 0,
    isPressed : false,
    row : row,
    column : column
  };

  let exports = {};

  exports.getAdjBombCount = function () {
    return spec.adjBombCount;
  };

  exports.incrementAdjBombCount = function() {
    spec.adjBombCount += 1;
    return spec.adjBombCount;
  };

  exports.setAdjBombCount = function(adjBombCount) {
    spec.adjBombCount = adjBombCount;
    return spec.adjBombCount;
  };

  exports.isBomb = function() {
    return spec.adjBombCount == -1;
  };

  exports.isEmpty = function() {
    return spec.adjBombCount == 0;
  };

  exports.isBombWarning = function() {
    return spec.adjBombCount > 0;
  }

  exports.press = function() {
    spec.isPressed = true;
  }

  exports.isPressed = function() {
    return spec.isPressed;
  }

  exports.getRow = function() {
    return spec.row;
  }

  exports.getColumn = function() {
    return spec.column;
  }

  exports.isFlagged = function() {
    return spec.isFlagged;
  }

  exports.flag = function() {
    spec.isFlagged = true;
    return spec.isFlagged;
  }

  exports.unflag = function() {
    spec.isFlagged = false;
    return spec.isFlagged;
  }

  return exports;
};

/**
 * Keeps track of the entire minesweeper grid
 *
 * @param {Number} bombCount - the total number of bombs on the grid
 * @param {Number} gridWidth - the width of the grid
 */
const Grid = function(bombCount = 10, gridWidth=10) {

  let gridUnits = [];
  initGridUnits();
  initGridBombs();

  function initGridUnits() {
    for (let i=0; i<gridWidth; i++) {
      gridUnits[i] = [];
      for (let j=0; j<gridWidth; j++) {
        gridUnits[i][j] = new gridUnit(i, j);
      }
    }
  }

  // marks the initial bombs
  function initGridBombs() {
    let bombsCreated = 0;

    while (bombsCreated != bombCount) {
      let x = Math.round(Math.random() * 10) % gridWidth;
      let y = Math.round(Math.random() * 10) % gridWidth;

      let unit = gridUnits[x][y];
      if (unit.getAdjBombCount() != -1) {
        bombsCreated += 1;
        unit.setAdjBombCount(-1);

        onAdjUnits(
          x,
          y,
          unit => { return unit.getAdjBombCount() != -1 },
          unit => { unit.incrementAdjBombCount()}
        );
      }
    }
  }

  // helper function to perform any given function on all surrounding units
  function onAdjUnits(row, column, filterFunc, func) {
    let adjUnits = getAdjUnits(row, column);
    let filteredUnits = adjUnits.filter(filterFunc);
    filteredUnits.forEach(func);
  }

  // gets all the adjacent units of the unit at the specified row and column
  function getAdjUnits(row, column) {
    let adjUnits = [];
    for (let i = row-1; i <= row + 1; i++) {
      for (let j = column-1; j <= column + 1; j++) {
        if(i == row && j == column) {
          // skip the center unit
          continue;
        }
        if (i >= 0
            && i < gridWidth
            && j >= 0
            && j < gridWidth) {
              adjUnits.push(getGridUnit(i, j));
            }
      }
    }
    return adjUnits;
  }

  // returns the gridUnit at the specified row and column
  function getGridUnit(row, column) {
    return gridUnits[row][column];
  }

  // helper function for debugging purposes
  function logUnits() {
    onAllUnits( (unit) => {
      console.log(unit.getAdjBombCount());
    });
  };

  // performs a given function on all units
  function onAllUnits(func) {
    for (let i=0; i<gridWidth; i++) {
      for (let j=0; j<gridWidth; j++) {
        func(getGridUnit(i, j));
      }
    }
  }

  return {
    logUnits : logUnits,
    getGridUnit : getGridUnit,
    getAdjUnits : getAdjUnits,
    onAdjUnits : onAdjUnits,
    onAllUnits : onAllUnits,
    initGridUnits : initGridUnits,
    initGridBombs : initGridBombs
  }

};

/**
 * Keeps track the Flag counter
 *
 * @param {Number} bombCount - the total number of bombs on the grid
 */
const Flag = function(bombCount) {

  let flagCount = 0;
  let exports = {};

  exports.getFlagCount = function() {
    return flagCount;
  }

  exports.incrementFlagCount = function() {
    flagCount += 1;
    return flagCount;
  }

  exports.decrementFlagCount = function() {
    flagCount -= 1;
    return flagCount;
  }

  exports.getRemainingBombs = function() {
    return bombCount - flagCount;
  }

  exports.canFlag = function() {
    return exports.getRemainingBombs() > 0;
  }

  return exports;
};


/**
 * Helper class for the DOM
 */
const domDisplay = function() {

  function createElem(type, parent, attributes, classes, eventListeners) {
    let elem = document.createElement(type);

    for (let attr in attributes) {
      if (attributes.hasOwnProperty(attr)) {
        elem.setAttribute(attr, attributes[attr]);
      }
    }

    if (classes)
      elem.className = classes;

    if (eventListeners)
      eventListeners.forEach(
        (eventListener) => {
          elem.addEventListener(eventListener.type, eventListener.func);
        }
      );

    parent.appendChild(elem);
    return elem;
  }

  return {
    createElem : createElem
  };

}();

/**
 * Handles the drawing and interaction of the game itself
 */
const minesweeperGame = function() {

  let grid = new Grid(bombCount, gridWidth);
  let flag = new Flag(bombCount);

  // draws out the dislay
  function drawDisplay() {
    const container = document.getElementById("minesweeper");
    drawBombDisplay(container);
    drawGrid(container);
  }

  function drawBombDisplay(container) {
    // TODO implement this instead of doing it from html
    // elem = domDisplay.createElem( "div",
    //             container,
    //             null, //attributes
    //             "bomb-countdown");
    // elem.textContent = grid.getBombCount();
  }

  // draws the grid onto the DOM
  function drawGrid(container) {
    for (let row=0; row<gridWidth; row++) {
      for (let column=0; column<gridWidth; column++) {

        let unit = grid.getGridUnit(row, column);

        domDisplay.createElem(
          "div",
          container,
          {"data-column": column, "data-row": row},
          getClassListFromGridUnit(unit),
          [{"type" : "click", "func" : handleLeftClick},
           {"type" : "contextmenu", "func" : handleRightClick},]
         );
      }
      domDisplay.createElem("br", container);
    }
  }

  // Given a unit's state, determine what its content should look like
  function getTextContentFromGridUnit(unit) {
    if (unit.isPressed() && unit.isBombWarning())
      return unit.getAdjBombCount();
    if (unit.isPressed() && unit.isBomb())
      return "Boom!";
    if(unit.isFlagged())
      return "?";

    return "";
  }

  // Given a unit's state, determine what classes the unit should use
  function getClassListFromGridUnit(unit) {
    let classList = "unit";

    if (!unit.isPressed() && !unit.isFlagged())
      classList += " unpressed";
    else if (!unit.isPressed() && unit.isFlagged())
      classList += " flagged";
    else {
      if (unit.isEmpty())
        classList += " empty";
      else if (unit.isBomb())
        classList += " bomb";
      else
        classList += " empty warn-" + unit.getAdjBombCount();
    }

    if (unit.getColumn() == gridWidth-1)
      classList += " row-last";
    else
      classList += " row-not-last";

    return classList;
  }

  // Handles the left click of a unit
  function handleLeftClick(event) {
    const column = event.target.getAttribute("data-column");
    const row = event.target.getAttribute("data-row");
    const unit = grid.getGridUnit(row, column);

    if (unit.isBomb()) {
      grid.onAllUnits( (unit) => {
        domUnit = getDomUnitFromGridUnit(unit);
        domUnit.removeEventListener("click", handleLeftClick);
        domUnit.removeEventListener("contextmenu", handleRightClick);
      });
      gameOver(false);
    }
    else if (unit.isEmpty()) {
      handleEmptyGridClick(unit);
    }

    pressGridUnit(unit);
    if(isGameWon()) {
      gameOver(true);
    }
  }

  // Handles ending the Game
  function gameOver(won) {
    const gameOver = document.getElementById("game-over");
    if (won) {
      // TODO winning should look less ominous
      gameOver.textContent = "You Won!";
    }
    else {
      gameOver.textContent = "You Lose!";
    }
    // TODO game over overlay should have a button for this instead
    gameOver.addEventListener("click", playAgain);

    setTimeout( function() {
       gameOver.classList = "game-over";
    }, 400);
  }

  function playAgain() {
    // TODO play again doesn't bind click handlers correctly
    // TODO play again doesn't display bomb or flag counters
    const container = document.getElementById("minesweeper");
    container.parentNode.removeChild(container);

    const gameOver = document.getElementById("game-over");
    gameOver.classList = "game-over hidden";

    domDisplay.createElem("div", document.body, {"id" : "minesweeper"});
    grid.initGridUnits();
    grid.initGridBombs();
    drawDisplay();
  }

  // handles right clicking on a unit
  function handleRightClick(event) {
    const column = event.target.getAttribute("data-column");
    const row = event.target.getAttribute("data-row");
    const unit = grid.getGridUnit(row, column);

    flagGridUnit(unit);
    event.preventDefault();

    return false;
  }

  // flags a unit
  function flagGridUnit(unit) {
    let el = null;
    if (unit.isFlagged()) {
      flag.decrementFlagCount();
      unit.unflag();
      el = (domUnit) => { domUnit.addEventListener("click", handleLeftClick) };
    }
    else if(flag.canFlag()) {
      flag.incrementFlagCount();
      unit.flag();
      el = (domUnit) => {domUnit.removeEventListener("click", handleLeftClick) };
      if(isGameWon()) {
        gameOver(true);
      }
    }

    document.getElementById("flag-count").textContent = flag.getFlagCount();

    let domUnit = refreshGridUnit(unit);
    el(domUnit);
  }

  // determines if the game has been won
  function isGameWon() {
    const totalMoves = gridWidth * gridWidth;
    let pressedOrFlagged = 0;
    let movesMade = grid.onAllUnits(
      (unit) => {
        if(unit.isPressed() || unit.isFlagged()) {
          pressedOrFlagged += 1;
        }
      }
    );

    return totalMoves - pressedOrFlagged == 0;
  }

  function pressGridUnit(unit) {
    unit.press();

    let domUnit = refreshGridUnit(unit);
    domUnit.removeEventListener("click", handleLeftClick);
    domUnit.removeEventListener("contextmenu", handleRightClick);
  }

  function getDomUnitFromGridUnit(unit) {
    return document.querySelector("[data-row='" + unit.getRow() + "'][data-column='" + unit.getColumn() + "']");
  }

  function refreshGridUnit(unit) {
    let domUnit = getDomUnitFromGridUnit(unit);
    domUnit.textContent = getTextContentFromGridUnit(unit);
    domUnit.className = getClassListFromGridUnit(unit);

    return domUnit;
  }

  // handles the case where an empty grid unit is clicked, we need to press down
  // all surrounding units
  function handleEmptyGridClick(firstUnit) {
    let queue = [];
    queue.push(firstUnit);

    while(queue.length > 0) {
       let unit = queue.shift();

       // we need to examine the adjacent grid units to see if they are also empty
       if (unit.isEmpty()) {

         let mapped = queue.map(
           (u) => { return u.getRow() + "-" + u.getColumn() }
         );

         grid.onAdjUnits(
           unit.getRow(),
           unit.getColumn(),
           (gunit) => {
            return !gunit.isPressed()
                && !gunit.isFlagged()
                && !mapped.includes(gunit.getRow() + "-" + gunit.getColumn());
           },
           gunit => { queue.push(gunit) }
         );
       }

       pressGridUnit(unit);
     }
  }

  return {
    drawDisplay : drawDisplay
  }

}();

//initializes the game
function initGame() {
  minesweeperGame.drawDisplay();
}

window.addEventListener("load", initGame);
