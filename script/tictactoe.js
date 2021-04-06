"use strict";

const Player = (symbol, playerType) => {
    let _symbol = symbol;
    let _playerType = playerType;

    function getSymbol() {
        return _symbol;
    }

    function getPlayerType() {
        return _playerType;
    }

    return {getSymbol, getPlayerType}
};

const AiPlayer =(() => {
    
    function _randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function randomAiMove() {
        let move = _randomInt(0, 8);
        while (!gameBoard.isCellEmpty(move)) {
            move = _randomInt(0, 8)
        }
        return move;
    }

    return {randomAiMove};
})();

const gameBoard = (() => {
    const _board = ["", "", "", "", "", "", "", "", ""];
    function setCell(index, symbol) {
        _board[index] = symbol;
    }

    function getCell(index) {
        return _board[index]
    }

    function isCellEmpty(index) {
        return _board[index] === "";
    }

    function isFilled() {
        return _board.every(cell => cell !== "");
    }

    function init() {
        for (let i = 0; i < _board.length; i++) {
            _board[i] = "";
        }
    }

    function getBoard() {
        return _board;
    }

    return {setCell, getCell, init, isFilled, isCellEmpty, getBoard};
})();

const gameLogic = (() => {
    let _isRunning = true;
    let _winner = null;

    function makeMove(player, index) {
        const symbol = player.getSymbol();
        gameBoard.setCell(index, symbol);
        if (_checkWinState(symbol)) {
            console.log(`${symbol} is winner`);
            _winner = symbol;
            _isRunning = false;
        } else {
            if (_checkDrawState()) {
                console.log('a draw!');
                _winner = "draw";
                _isRunning = false;
            }
        }
    }

    function isGameRunning() {
        return _isRunning;
    }

    function getWinner() {
        return _winner;
    }

    function reset() {
        _isRunning = true;
        _winner = null;
        gameBoard.init();
    }

    function _checkDrawState() {
        if (gameBoard.isFilled()) {
            return true;
        } else {
            return false;
        }
    }

    function _checkWinState(symbol) {
        const winStates = [
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [6, 4, 2],
            [0, 4, 8]
        ];
        return winStates.some(state => state.every(idx => gameBoard.getCell(idx) === symbol))
    }

    return {makeMove, isGameRunning, getWinner, reset}
})();

const gameController = (() => {
    const _players = [Player('X', "human"), Player('O', "ai")]
    let _currentPlayer = 0;

    function _toggleCurrentPlayer() {
        _currentPlayer = 1 - _currentPlayer;
    }

    function _aiMove(player) {
        let newMove = AiPlayer.randomAiMove();
        gameLogic.makeMove(player, newMove);
        displayController.drawGameBoard();
    }

    function _aiVsAi() {
        while (gameLogic.isGameRunning()) {
            _aiMove(_players[_currentPlayer]);
            _toggleCurrentPlayer();
        }
    }

    function init() {
        const player = _players[_currentPlayer];
        const otherPlayer = _players[1 - _currentPlayer];
        if (player.getPlayerType() === "ai") {
            _aiMove(player);
            _toggleCurrentPlayer();
            if (otherPlayer.getPlayerType() === "ai") {
                _aiVsAi();
            }
        }
    }

    function move(index) {
        if (!gameBoard.isCellEmpty(index)) {
            return;
        }
        const player = _players[_currentPlayer];
        const otherPlayer = _players[1 - _currentPlayer];
        if (player.getPlayerType() === "human") {
            gameLogic.makeMove(_players[_currentPlayer], index);
            if (otherPlayer.getPlayerType() === "ai" && gameLogic.isGameRunning()) {
                _aiMove(otherPlayer);
                _toggleCurrentPlayer();
            }
        }
        _toggleCurrentPlayer();
    }

    function restart() {
        _currentPlayer = 0;
        gameLogic.reset();
        init();
    }

    return {move, init, restart}
})();

const displayController = (() => {
    const _cells = document.querySelectorAll(".cell");
    const _restartButton = document.querySelector(".restart-btn");
    const _statusBox = document.querySelector(".game-status");

    _restartButton.addEventListener("click", _restart);
    _statusBox.addEventListener("click", _handleStatusClick);

    _cells.forEach(cell => {
        cell.addEventListener("click", _handleCellClick);
    });
    
    function _handleCellClick() {
        if (gameLogic.isGameRunning()) {
            const cellIndex = this.dataset.index;
            gameController.move(cellIndex);
            drawGameBoard();
        }
    }

    function _handleStatusClick() {
        _hideStatusMessage();
        _restart();
    }

    function _restart() {
        gameController.restart();
        drawGameBoard();
    }

    function _showStatusMessage() {
        let classes = _statusBox.classList;
        classes.remove("hide");
        classes.add("show");
    }

    function _hideStatusMessage() {
        let classes = _statusBox.classList;
        classes.remove("show");
        classes.add("hide");        
    }

    function _setStatusMessage(gameStatus) {
        const msgElement = _statusBox.querySelector("h1");
        const xWonMsg = "X won!";
        const oWonMsg = "O won!";
        const drawMsg = "It's a draw!"; 

        switch (gameStatus) {
            case "X":
                msgElement.textContent = xWonMsg;
                break;
            case "O":
                msgElement.textContent = oWonMsg;
                break;
            case "draw":
                msgElement.textContent = drawMsg;
                break;
            default:
                msgElement.textContent = "";                      
        }
    }

    function drawGameBoard() {
        _cells.forEach(cell => {
            let index = cell.dataset.index;
            cell.textContent = gameBoard.getCell(index);
        })
        if (!gameLogic.isGameRunning()) {
            _setStatusMessage(gameLogic.getWinner());
            _showStatusMessage();
        }
    }
    
    return {drawGameBoard}
})();

gameController.init();