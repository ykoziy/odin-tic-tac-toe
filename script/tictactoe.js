"use strict";
const gameBoard = (() => {
    const _board = ["", "", "", "", "", "", "", "", ""];
    function setCell(index, symbol) {
        _board[index] = symbol;
    }

    function getCell(index) {
        return _board[index]
    }

    function init() {
        for (let i = 0; i < _board.length; i++) {
            _board[i] = "";
        }
    }
    return {setCell, getCell, init};
})();

const displayController = (() => {
    const _cells = document.querySelectorAll(".cell");

    _cells.forEach(cell => {
        cell.addEventListener("click", _handleCellClick);
    });

    function _handleCellClick(event) {
        const cellIndex = event.target.dataset.index
        // placeholder......
        console.log(`You clicked on a cell with index: ${cellIndex}`)
    }
})();

const Player = (symbol) => {
    let _symbol = symbol;
    //Should we be able to change the player symbol?
    function getSymbol() {
        return _symbol;
    }
    return {getSymbol}
};