const { Server } = require("socket.io");

let io;
// Shared onlineUsers from rpsSocket
let onlineUsers = {};
let waitingPlayer = null;
const gameBoards = {};
const playerTurn = {};
const baseURL = "http://localhost:3000";

const gameStates = {};
const roomTimers = {};

const startTurnTimer = (roomId, currentPlayer) => {
  if (roomTimers[roomId]) {
    clearTimeout(roomTimers[roomId]);
  }

  roomTimers[roomId] = setTimeout(() => {
    console.log(`⏰ Timer expired for player ${currentPlayer} in room ${roomId}`);
    delete roomTimers[roomId];

    const gameState = gameStates[roomId];
    if (!gameState || gameState.gameFinished) {
      return;
    }

    const opponent =
      gameState.player1 === currentPlayer ? gameState.player2 : gameState.player1;

    // Switch turn only, don't end the round
    playerTurn[roomId] = opponent;
    startTurnTimer(roomId, opponent);
    
    io.to(roomId).emit("tttTimerStart", {
      currentPlayer: opponent,
      timeLeft: 30,
    });
    
    io.to(roomId).emit("tttMoveMade", {
      board: gameBoards[roomId],
      currentPlayer: opponent,
      winner: null,
      isDraw: false,
    });
  }, 30000);
};

const checkWinner = (board) => {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (let line of lines) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  if (board.every((cell) => cell !== null)) {
    return "draw";
  }

  return null;
};

const saveGameResult = async (roomId, winner, moves) => {
  try {
    const response = await fetch(`${baseURL}/api/tictactoe/save-result`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomId,
        moves,
        winner,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to save game result");
    }
  } catch (error) {
    console.error("Error saving game result:", error);
    throw error;
  }
};

const tictactoeSocket = (httpServer, sharedIO, sharedOnlineUsers) => {
  // Use shared io and onlineUsers
  if (sharedIO) {
    io = sharedIO;
  }
  
  if (sharedOnlineUsers) {
    onlineUsers = sharedOnlineUsers;
  }
  
  // If io already exists, just add event listeners
  if (io) {
    io.on("connection", (socket) => {
      setupTicTacToeHandlers(socket);
    });
  } else if (!io) {
    io = new Server(httpServer, { cors: { origin: "*" } });

    io.on("connection", (socket) => {
      setupTicTacToeHandlers(socket);
    });
  }
};

const setupTicTacToeHandlers = (socket) => {
  console.log(`🟣 TicTacToe user connected: ${socket.id}`);

      socket.on("findTicTacToeGame", () => handleFindGame(socket));
      socket.on("tttMakeMove", ({ roomId, index, symbol, userId }) =>
        handleMakeMove(socket, roomId, index, symbol, userId)
      );
      socket.on("joinTicTacToeRoom", (roomId) => socket.join(roomId));
      socket.on("cancelTicTacToeGame", () => {
        if (waitingPlayer && waitingPlayer.id === socket.id) {
          waitingPlayer = null;
        }
      });
      socket.on("tttTimeout", ({ roomId, userId }) => {
        const gameState = gameStates[roomId];
        if (!gameState || gameState.gameFinished) return;

        const opponent =
          gameState.player1 === userId ? gameState.player2 : gameState.player1;

        if (roomTimers[roomId]) {
          clearTimeout(roomTimers[roomId]);
          delete roomTimers[roomId];
        }

        // Switch turn only, don't end the round
        playerTurn[roomId] = opponent;
        startTurnTimer(roomId, opponent);
        
        io.to(roomId).emit("tttTimerStart", {
          currentPlayer: opponent,
          timeLeft: 30,
        });
        
        io.to(roomId).emit("tttMoveMade", {
          board: gameBoards[roomId],
          currentPlayer: opponent,
          winner: null,
          isDraw: false,
        });
      });

      socket.on("disconnect", () => {
        if (waitingPlayer && waitingPlayer.id === socket.id) {
          waitingPlayer = null;
        }

        Object.keys(gameStates).forEach((roomId) => {
          const gameState = gameStates[roomId];
          if (
            gameState &&
            !gameState.gameFinished &&
            (gameState.player1 === userId || gameState.player2 === userId)
          ) {
            const opponent =
              gameState.player1 === userId ? gameState.player2 : gameState.player1;

            io.to(roomId).emit("tttOpponentDisconnected", {
              message: "حریف شما از بازی خارج شد",
            });

            delete gameStates[roomId];
            delete gameBoards[roomId];
            delete playerTurn[roomId];
            if (roomTimers[roomId]) {
              clearTimeout(roomTimers[roomId]);
              delete roomTimers[roomId];
            }
          }
        });
      });
};

const handleFindGame = async (socket) => {
  if (waitingPlayer) {
    const roomId = `ttt-room-${waitingPlayer.userId}-${socket.userId}-${Date.now()}`;

    try {
      const createRoomRes = await fetch(`${baseURL}/api/tictactoe/create-room`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          player1: waitingPlayer.userId,
          player2: socket.userId,
        }),
      });

      if (createRoomRes.ok) {
        waitingPlayer.join(roomId);
        socket.join(roomId);

        const initialBoard = Array(9).fill(null);

        gameBoards[roomId] = initialBoard;
        playerTurn[roomId] = waitingPlayer.userId;

        gameStates[roomId] = {
          player1: waitingPlayer.userId,
          player2: socket.userId,
          scores: {
            [waitingPlayer.userId]: 0,
            [socket.userId]: 0,
          },
          moves: [],
          gameFinished: false,
          currentRound: 1,
        };

        io.to(waitingPlayer.id).emit("tttGameFound", {
          roomId,
          opponent: onlineUsers[socket.userId],
          playerTurn: onlineUsers[waitingPlayer.userId],
        });
        io.to(socket.id).emit("tttGameFound", {
          roomId,
          opponent: onlineUsers[waitingPlayer.userId],
          playerTurn: onlineUsers[waitingPlayer.userId],
        });

        startTurnTimer(roomId, waitingPlayer.userId);
        io.to(roomId).emit("tttTimerStart", {
          currentPlayer: waitingPlayer.userId,
          timeLeft: 30,
        });
      }

      waitingPlayer = null;
    } catch (error) {
      console.error("❌ Error creating TicTacToe room:", error);
    }
  } else {
    waitingPlayer = socket;
    socket.emit("waiting");
  }
};

const handleMakeMove = async (socket, roomId, index, symbol, userId) => {
  if (!gameBoards[roomId] || !gameStates[roomId]) {
    return;
  }

  const gameState = gameStates[roomId];
  const currentPlayer = userId;

  // Validate that it's the current player's turn
  if (playerTurn[roomId] !== currentPlayer) {
    return;
  }

  if (roomTimers[roomId]) {
    clearTimeout(roomTimers[roomId]);
    delete roomTimers[roomId];
  }

  if (gameBoards[roomId][index] !== null) {
    return;
  }

  const newBoard = [...gameBoards[roomId]];
  newBoard[index] = symbol;
  gameBoards[roomId] = newBoard;

  const winner = checkWinner(newBoard);
  const isDraw = winner === "draw";
  const hasWinner = winner && winner !== "draw";

  const moveData = {
    round: gameState.currentRound,
    index,
    symbol,
    player: currentPlayer,
    board: [...newBoard],
  };
  gameState.moves.push(moveData);

  const nextPlayer =
    currentPlayer === gameState.player1 ? gameState.player2 : gameState.player1;

  if (hasWinner) {
    gameState.scores[currentPlayer] += 1;
    gameState.currentRound += 1;

    const moveData = {
      round: gameState.currentRound - 1,
      winner: currentPlayer,
      board: [...newBoard],
    };

    io.to(roomId).emit("tttGameOver", {
      winner: currentPlayer,
      isDraw: false,
      scores: gameState.scores,
    });

    gameBoards[roomId] = Array(9).fill(null);
    playerTurn[roomId] = gameState.player1;

    setTimeout(() => {
      if (!gameState.gameFinished) {
        startTurnTimer(roomId, gameState.player1);
        io.to(roomId).emit("tttTimerStart", {
          currentPlayer: gameState.player1,
          timeLeft: 30,
        });
        io.to(roomId).emit("tttMoveMade", {
          board: Array(9).fill(null),
          currentPlayer: gameState.player1,
          winner: null,
          isDraw: false,
        });
      }
    }, 3000);
  } else if (isDraw) {
    gameState.currentRound += 1;

    io.to(roomId).emit("tttGameOver", {
      winner: null,
      isDraw: true,
      scores: gameState.scores,
    });

    gameBoards[roomId] = Array(9).fill(null);
    playerTurn[roomId] = gameState.player1;

    setTimeout(() => {
      if (!gameState.gameFinished) {
        startTurnTimer(roomId, gameState.player1);
        io.to(roomId).emit("tttTimerStart", {
          currentPlayer: gameState.player1,
          timeLeft: 30,
        });
        io.to(roomId).emit("tttMoveMade", {
          board: Array(9).fill(null),
          currentPlayer: gameState.player1,
          winner: null,
          isDraw: false,
        });
      }
    }, 3000);
  } else {
    playerTurn[roomId] = nextPlayer;
    startTurnTimer(roomId, nextPlayer);
    io.to(roomId).emit("tttTimerStart", {
      currentPlayer: nextPlayer,
      timeLeft: 30,
    });
  }

  io.to(roomId).emit("tttMoveMade", {
    board: newBoard,
    currentPlayer: nextPlayer,
    winner: hasWinner ? currentPlayer : isDraw ? "draw" : null,
    isDraw,
  });

  if (gameState.scores[gameState.player1] >= 5 || gameState.scores[gameState.player2] >= 5) {
    gameState.gameFinished = true;
    const finalWinner =
      gameState.scores[gameState.player1] >= 5 ? gameState.player1 : gameState.player2;

    saveGameResult(roomId, finalWinner, gameState.moves).catch((err) => {
      console.error("Failed to save game result:", err);
    });

    io.to(roomId).emit("tttGameFinished", {
      winner: finalWinner,
      finalScores: gameState.scores,
    });
  }
};

module.exports = { tictactoeSocket, io };

