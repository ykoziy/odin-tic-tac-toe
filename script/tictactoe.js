"use strict";
(() => {

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

    function _getPossibleMoves(board) {
        let possibleMoves = [];
        board.forEach((cell, index) => {
            if (cell === "") {
                possibleMoves.push(index);
            }
        });
        return possibleMoves;
    }

    function findBestMove(board, symbol) {
        let bestScore = -Infinity;
        let bestMove = -1;
        let player = symbol;
        let opponent = "";
        if (player === "X") {
            opponent = "O"
        } else {
            opponent = "X"
        }

        _getPossibleMoves(board).forEach(move => {
            let newBoard = [...board];
            newBoard[move] = player;
            let score = minimax(newBoard, false, player, opponent, -Infinity, Infinity);
            if (score > bestScore) {
                bestMove = move;
                bestScore = score;
            }
        });
        return bestMove;
    }
    
    function minimax(board, maximizing, player, opponent, alpha, beta) {
        if (gameLogic.checkWinState(player, board)) {
            return 10;
        } else if (gameLogic.checkWinState(opponent, board)) {
            return -10;
        } else if (gameLogic.checkDrawState(board)) {
            return 0;
        }

        if (maximizing) {
            let bestValue = -Infinity;
            let moves = _getPossibleMoves(board);
            for (let i = 0; i < moves.length; i++) {
                let newBoard = [...board];
                newBoard[moves[i]] = player;
                let value = minimax(newBoard, false, player, opponent, alpha, beta);
                bestValue = Math.max(bestValue, value);
                alpha = Math.max(bestValue, alpha);
                if (alpha >= beta) {
                    break;
                }
            }
            return bestValue;
        }
        if (!maximizing) {
            let bestValue = Infinity;
            let moves = _getPossibleMoves(board);
            for (let i = 0; i < moves.length; i++) {
                let newBoard = [...board];
                newBoard[moves[i]] = opponent;
                let value = minimax(newBoard, true, player, opponent, alpha, beta);
                bestValue = Math.min(bestValue, value);
                beta = Math.min(bestValue, beta);
                if (alpha >= beta) {
                    break;
                }
            }
            return bestValue;
        }

    }

    return {randomAiMove, minimax, findBestMove};
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

    function init() {
        for (let i = 0; i < _board.length; i++) {
            _board[i] = "";
        }
    }

    function getBoard() {
        return _board;
    }

    return {setCell, getCell, init, isCellEmpty, getBoard};
})();

const gameLogic = (() => {
    let _isRunning = true;
    let _winner = null;

    function makeMove(player, index) {
        const symbol = player.getSymbol();
        gameBoard.setCell(index, symbol);
        if (checkWinState(symbol, gameBoard.getBoard())) {
            console.log(`${symbol} is winner`);
            _winner = symbol;
            _isRunning = false;
        } else if (checkDrawState(gameBoard.getBoard())) {
                console.log('a draw!');
                _winner = "draw";
                _isRunning = false;
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

    function checkDrawState(board) {
        return board.every(cell => cell !== "");
    }

    function checkWinState(symbol, board) {
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
        return winStates.some(state => state.every(idx => board[idx] === symbol));
    }

    return {makeMove, isGameRunning, getWinner, reset, checkDrawState, checkWinState}
})();

const gameController = (() => {
    let _players = [Player('X', "human"), Player('O', "ai")]
    let _currentPlayer = 0;

    function _toggleCurrentPlayer() {
        _currentPlayer = 1 - _currentPlayer;
        displayController.markPlayer(_currentPlayer);
    }

    function _humanMove(player, index) {
        gameLogic.makeMove(player, index);
        _toggleCurrentPlayer();
    }

    function _aiMove(player) {
        if (!gameLogic.isGameRunning()) {
            return;
        }
        let newMove = AiPlayer.findBestMove(gameBoard.getBoard(), player.getSymbol());
        gameLogic.makeMove(player, newMove);
        displayController.drawGameBoard();
        _toggleCurrentPlayer();
    }

    async function _aiVsAi() {
        while (gameLogic.isGameRunning()) {
            await _resolveAfterMs(1000);
            _aiMove(_players[_currentPlayer]);
        }
    }

    function _resolveAfterMs(ms) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve('resolved');
            }, ms);
        });
    }

    function firstMove() {
        const player = _players[_currentPlayer];
        const otherPlayer = _players[1 - _currentPlayer];
        displayController.markPlayer(_currentPlayer);
        if (player.getPlayerType() === "ai") {
            _aiMove(player);
            if (otherPlayer.getPlayerType() === "ai") {
                _aiVsAi();
            }
        }
    }

    function setPlayers(playerX, playerO) {
        _players = [Player('X', playerX), Player('O', playerO)]
    }

    async function move(index) {
        if (!gameBoard.isCellEmpty(index) || !gameLogic.isGameRunning()) {
            return;
        }
        const player = _players[_currentPlayer];
        const otherPlayer = _players[1 - _currentPlayer];

        if (player.getPlayerType() === "human") {
            _humanMove(player, index);
        }

        if (otherPlayer.getPlayerType() === "ai") {
            await _resolveAfterMs(1000);
            _aiMove(otherPlayer);
        }
    }

    function restart() {
        _currentPlayer = 0;
        gameLogic.reset();
        firstMove();
    }

    return {move, firstMove, restart, setPlayers}
})();

const displayController = (() => {
    const _cells = document.querySelectorAll(".cell");
    const _playButton = document.querySelector(".play-btn");
    const _statusBox = document.querySelector(".game-status");

    let _player1 = document.getElementById("p1");
    let _player2 = document.getElementById("p2");

    _playButton.addEventListener("click", _newGame);
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

    function _newGame() {
        const playerX = document.getElementById("playerX").value;
        const playerO = document.getElementById("playerO").value;
        gameController.setPlayers(playerX, playerO);
        _hideStatusMessage();
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

    function _setCellStyle(cell, index) {
        let symbol = gameBoard.getCell(index);
        if (!gameBoard.isCellEmpty(index)) {
            cell.classList.add("noHover");
            if (symbol.toUpperCase() === "X") {
                cell.style.color = "indianred";
            } else {
                cell.style.color = "cornflowerblue";
            }
            
        } else {
            cell.classList.remove("noHover");
            cell.removeAttribute("style");
        }
        cell.textContent = symbol;
    }

    function markPlayer(player) {
        if (player === 0) {
            _player2.classList.remove("current");
            _player1.classList.add("current");
        } else if (player === 1) {
            _player1.classList.remove("current");
            _player2.classList.add("current");
        }

    }    

    function drawGameBoard() {
        _cells.forEach(cell => {
            let index = cell.dataset.index;
            _setCellStyle(cell, index);
        })
        if (!gameLogic.isGameRunning()) {
            _setStatusMessage(gameLogic.getWinner());
            _showStatusMessage();
        }
    }
    
    return {drawGameBoard, markPlayer}
})();

gameController.firstMove();

})();