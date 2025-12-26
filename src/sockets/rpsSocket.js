const { Server } = require("socket.io");

let io;
const onlineUsers = {}; // online users - shared between all game sockets
let waitingPlayer = null;
const gameMoves = {};
const playerTurn = {}; // نگهداری نوبت هر بازیکن
const baseURL = "http://localhost:3000";
// process.env.NODE_ENV === "development"
//   ? "http://localhost:3000"
//   : "https://chess-production-9ba7.up.railway.app";

// New: Store pending invitations
const pendingInvitations = {};

// Game state tracking
const gameStates = {}; // Store game state for each room

// Timer tracking for each room
const roomTimers = {}; // Store timeout timers for each room

// Function to start timer for a player's turn
const startTurnTimer = (roomId, currentPlayer) => {
  // Clear existing timer if any
  if (roomTimers[roomId]) {
    clearTimeout(roomTimers[roomId]);
  }

  // Start 15 second timer
  roomTimers[roomId] = setTimeout(() => {
    console.log(`⏰ Timer expired for player ${currentPlayer} in room ${roomId}`);
    
    // Delete timer reference first
    delete roomTimers[roomId];
    
    // Check if player has made a move
    if (!gameMoves[roomId] || gameMoves[roomId][currentPlayer] === undefined) {
      // Player didn't make a move
      const gameState = gameStates[roomId];
      if (!gameState || gameState.gameFinished) {
        return;
      }

      // Get opponent
      const opponent = gameState.player1 === currentPlayer ? gameState.player2 : gameState.player1;
      
      // Check if opponent has made a move or timed out
      const opponentHasMoved = gameMoves[roomId] && gameMoves[roomId][opponent] !== undefined && gameMoves[roomId][opponent] !== null;
      const opponentHasTimedOut = gameMoves[roomId] && gameMoves[roomId][opponent] === null;
      
      if (!gameMoves[roomId]) {
        gameMoves[roomId] = {};
      }
      
      // Mark current player as timeout
      gameMoves[roomId][currentPlayer] = null;
      
      if (opponentHasMoved) {
        // Opponent has moved, current player loses - announce result immediately
        const result = "timeout";
        const winner = opponent;
        
        // Update game state
        const roundData = {
          round: gameState.moves.length + 1,
          moves: { ...gameMoves[roomId] },
          result,
          winner
        };
        gameState.moves.push(roundData);

        // Update points
        gameState.points[winner] += 10;

        // Check if game is finished
        const maxPoints = 100;
        const player1Points = gameState.points[gameState.player1];
        const player2Points = gameState.points[gameState.player2];

        let gameWinner = null;
        if (player1Points >= maxPoints || player2Points >= maxPoints) {
          gameState.gameFinished = true;
          gameWinner = player1Points >= maxPoints ? gameState.player1 : gameState.player2;
        }

        // Save game result
        saveGameResult(roomId, gameWinner, gameState.moves).catch(err => {
          console.error("Failed to save timeout round result:", err);
        });

        // Notify clients
        if (gameState.gameFinished && gameWinner) {
          io.to(roomId).emit("gameFinished", {
            winner: gameWinner,
            finalPoints: gameState.points,
            totalMoves: gameState.moves
          });
        }

        io.to(roomId).emit("gameOver", {
          result,
          winner,
          gameMoves: gameMoves[roomId],
          points: gameState.points,
          gameFinished: gameState.gameFinished,
          timeoutPlayer: currentPlayer
        });

        // Reset moves for next round
        gameMoves[roomId] = {};

        // Set next turn
        playerTurn[roomId] = opponent;
        
        // Emit waitingForOpponent but delay timer start
        io.to(roomId).emit("waitingForOpponent", {
          message: "منتظر حرکت حریف باشید!",
          currentPlayer: opponent,
        });

        // Start timer after 4 seconds (when frontend finishes showing result)
        if (!gameState.gameFinished) {
          setTimeout(() => {
            // Check if game is still active
            if (gameStates[roomId] && !gameStates[roomId].gameFinished) {
              startTurnTimer(roomId, opponent);
              // Emit timer start event
              io.to(roomId).emit("timerStart", {
                currentPlayer: opponent,
                timeLeft: 15
              });
            }
          }, 4000);
        }
      } else if (opponentHasTimedOut) {
        // Both players timed out - draw
        const result = "draw";
        const winner = "draw";
        
        // Update game state
        const roundData = {
          round: gameState.moves.length + 1,
          moves: { ...gameMoves[roomId] },
          result,
          winner
        };
        gameState.moves.push(roundData);

        // No points for draw

        // Check if game is finished (shouldn't happen with draw, but check anyway)
        const maxPoints = 100;
        const player1Points = gameState.points[gameState.player1];
        const player2Points = gameState.points[gameState.player2];

        let gameWinner = null;
        if (player1Points >= maxPoints || player2Points >= maxPoints) {
          gameState.gameFinished = true;
          gameWinner = player1Points >= maxPoints ? gameState.player1 : gameState.player2;
        }

        // Save game result
        saveGameResult(roomId, gameWinner, gameState.moves).catch(err => {
          console.error("Failed to save timeout round result:", err);
        });

        // Notify clients
        if (gameState.gameFinished && gameWinner) {
          io.to(roomId).emit("gameFinished", {
            winner: gameWinner,
            finalPoints: gameState.points,
            totalMoves: gameState.moves
          });
        }

        io.to(roomId).emit("gameOver", {
          result,
          winner,
          gameMoves: gameMoves[roomId],
          points: gameState.points,
          gameFinished: gameState.gameFinished,
          timeoutPlayer: null // Both timed out
        });

        // Reset moves for next round
        gameMoves[roomId] = {};

        // Set next turn
        playerTurn[roomId] = opponent;
        
        // Emit waitingForOpponent but delay timer start
        io.to(roomId).emit("waitingForOpponent", {
          message: "منتظر حرکت حریف باشید!",
          currentPlayer: opponent,
        });

        // Start timer after 4 seconds (when frontend finishes showing result)
        if (!gameState.gameFinished) {
          setTimeout(() => {
            // Check if game is still active
            if (gameStates[roomId] && !gameStates[roomId].gameFinished) {
              startTurnTimer(roomId, opponent);
              // Emit timer start event
              io.to(roomId).emit("timerStart", {
                currentPlayer: opponent,
                timeLeft: 15
              });
            }
          }, 4000);
        }
      } else {
        // Opponent hasn't moved yet - wait for opponent to move or timeout
        // Start timer for opponent immediately (they need to move or timeout)
        playerTurn[roomId] = opponent;
        
        // Notify that we're waiting for opponent's move
        io.to(roomId).emit("waitingForOpponent", {
          message: "منتظر حرکت حریف باشید!",
          currentPlayer: opponent,
        });
        
        // Start timer for opponent (will check if both timeout in next timeout)
        startTurnTimer(roomId, opponent);
        // Emit timer start event
        io.to(roomId).emit("timerStart", {
          currentPlayer: opponent,
          timeLeft: 15
        });
      }
    }
  }, 15000); // 15 seconds
};

// Function to save game result to database
const saveGameResult = async (roomId, winner, moves) => {
  try {
    const gameState = gameStates[roomId];
    const betAmount = gameState?.betAmount || 0;
    const isFreeGame = gameState?.isFreeGame || false;

    // Save game result
    const response = await fetch(`${baseURL}/api/rps/save-result`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomId,
        winner,
        moves,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to save game result:", errorText);
      throw new Error(`Failed to save game result: ${errorText}`);
    }

    // Process payout if it's a paid game and there's a winner
    if (!isFreeGame && betAmount > 0 && winner) {
      const loser = gameState.player1 === winner ? gameState.player2 : gameState.player1;

      try {
        const payoutResponse = await fetch(`${baseURL}/api/games/payout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomId,
            winnerId: winner,
            loserId: loser,
            betAmount,
            gameType: "rps",
          }),
        });

        if (!payoutResponse.ok) {
          console.error("Failed to process payout");
        }
      } catch (payoutError) {
        console.error("Error processing payout:", payoutError);
      }
    }

    console.log("Game result saved successfully");
    return true;
  } catch (error) {
    console.error("Error saving game result:", error);
    throw error;
  }
};

const rpsSocket = (httpServer) => {
  if (!io) {
    io = new Server(httpServer, { cors: { origin: "*" } });
    
    // Export io برای استفاده در socket های دیگر
    module.exports.io = io;

    io.on("connection", (socket) => {
      console.log(`🔵 User connected: ${socket.id}`);

      socket.on("userInfo", async ({ userId, userName, nickName }) => {
        socket.userId = userId; // userId رو توی سوکت ذخیره کن
        console.log(
          `Set socket.userId to ${socket.userId} for socket ${socket.id}`
        );
        onlineUsers[userId] = {
          socketId: socket.id,
          userName,
          nickName,
          userId,
        };
        io.emit("onlineUsers", Object.values(onlineUsers));

        // Send any pending invitations to the user
        if (pendingInvitations[userId]) {
          pendingInvitations[userId].forEach((invitation) => {
            socket.emit("gameInvitation", {
              from: invitation.from,
              invitationId: invitation.invitationId,
            });
          });
        }
      });

      socket.on("findGame", ({ betAmount, isFreeGame }) => handleFindGame(socket, betAmount, isFreeGame));
      socket.on("makeMove", ({ roomId, move }) =>
        handleMakeMove(socket, roomId, move)
      );
      socket.on("joinRoom", (roomId) => socket.join(roomId));
      socket.on("cancelGame", () => handleDisconnect(socket));

      // New: Handle game invitations
      socket.on("inviteFriend", ({ friendId, gameType, gameName, message, betAmount, isFreeGame }) =>
        handleInviteFriend(socket, friendId, gameType, gameName, message, betAmount, isFreeGame)
      );
      socket.on("acceptInvitation", ({ invitationId }) =>
        handleAcceptInvitation(socket, invitationId)
      );
      socket.on("rejectInvitation", ({ invitationId }) =>
        handleRejectInvitation(socket, invitationId)
      );

      // Handle game messages
      socket.on("gameMessage", ({ roomId, gameType, message }) => {
        if (gameType === "rps" && roomId) {
          io.to(roomId).emit("gameMessage", {
            message,
            from: socket.userId,
            timestamp: new Date().toISOString(),
          });
        }
      });
    });
    
    // Export io برای استفاده در socket های دیگر
    module.exports.io = io;
  }
};

// New: Handle friend invitation
const handleInviteFriend = (socket, friendId, gameType = "rps", gameName = "سنگ کاغذ قیچی", message = "بیا بازی کنیم! 🎮", betAmount = 0, isFreeGame = false) => {
  const inviterId = socket.userId;

  // Check if friend is online
  if (!onlineUsers[friendId]) {
    socket.emit("invitationError", { message: "دوست شما آنلاین نیست!" });
    return;
  }

  // Create invitation ID
  const invitationId = `inv-${inviterId}-${friendId}-${Date.now()}`;

  // Store invitation
  if (!pendingInvitations[friendId]) {
    pendingInvitations[friendId] = [];
  }

  pendingInvitations[friendId].push({
    invitationId,
    from: {
      userId: inviterId,
      userName: onlineUsers[inviterId].userName,
      nickName: onlineUsers[inviterId].nickName,
    },
    gameType,
    gameName,
    message,
    betAmount: Number(betAmount) || 0,
    isFreeGame: Boolean(isFreeGame),
    timestamp: Date.now(),
  });

  // Send invitation to friend
  console.log("📨 Sending invitation to friend:", {
    friendId,
    friendSocketId: onlineUsers[friendId].socketId,
    inviterId,
    invitationId,
    gameType,
    gameName,
    message,
    betAmount,
    isFreeGame,
  });

  io.to(onlineUsers[friendId].socketId).emit("gameInvitation", {
    invitationId,
    from: {
      userId: inviterId,
      userName: onlineUsers[inviterId].userName,
      nickName: onlineUsers[inviterId].nickName,
    },
    gameType,
    gameName,
    message,
    betAmount: Number(betAmount) || 0,
    isFreeGame: Boolean(isFreeGame),
  });

  console.log("✅ Invitation sent to socket:", onlineUsers[friendId].socketId);

  // Notify inviter that invitation was sent
  socket.emit("invitationSent", {
    to: friendId,
    invitationId,
  });

  // Set timeout to automatically remove invitation after 2 minutes
  setTimeout(() => {
    if (pendingInvitations[friendId]) {
      pendingInvitations[friendId] = pendingInvitations[friendId].filter(
        (inv) => inv.invitationId !== invitationId
      );

      if (pendingInvitations[friendId].length === 0) {
        delete pendingInvitations[friendId];
      }

      // Notify both users that invitation expired
      if (onlineUsers[inviterId]) {
        io.to(onlineUsers[inviterId].socketId).emit("invitationExpired", {
          invitationId,
        });
      }

      if (onlineUsers[friendId]) {
        io.to(onlineUsers[friendId].socketId).emit("invitationExpired", {
          invitationId,
        });
      }
    }
  }, 120000); // 2 minutes
};

// New: Handle invitation acceptance
const handleAcceptInvitation = async (socket, invitationId) => {
  const accepterId = socket.userId;

  // Find the invitation
  let invitation = null;
  let inviterUserId = null;

  if (pendingInvitations[accepterId]) {
    invitation = pendingInvitations[accepterId].find(
      (inv) => inv.invitationId === invitationId
    );
    if (invitation) {
      inviterUserId = invitation.from.userId;
    }
  }

  if (!invitation) {
    socket.emit("invitationError", {
      message: "دعوت نامه معتبر نیست یا منقضی شده است!",
    });
    return;
  }

  // Check if inviter is still online
  if (!onlineUsers[inviterUserId]) {
    socket.emit("invitationError", { message: "دعوت کننده آنلاین نیست!" });

    // Remove invitation
    pendingInvitations[accepterId] = pendingInvitations[accepterId].filter(
      (inv) => inv.invitationId !== invitationId
    );

    if (pendingInvitations[accepterId].length === 0) {
      delete pendingInvitations[accepterId];
    }

    return;
  }

  // Create a room for the game
  const roomId = `room-${inviterUserId}-${accepterId}-${Date.now()}`;

  try {
    const createRoomRes = await fetch(`${baseURL}/api/rps/create-room`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomId,
        player1: inviterUserId,
        player2: accepterId,
        betAmount: invitation.betAmount || 0,
        isFreeGame: invitation.isFreeGame || false,
        isInvitation: true,
      }),
    });

    if (createRoomRes.ok) {
      // Join both sockets to the room
      const inviterSocket = io.sockets.sockets.get(
        onlineUsers[inviterUserId].socketId
      );
      inviterSocket.join(roomId);
      socket.join(roomId);

      // Notify both players that game is starting
      io.to(onlineUsers[inviterUserId].socketId).emit("gameFound", {
        roomId,
        opponent: onlineUsers[accepterId],
        playerTurn: onlineUsers[inviterUserId],
        isInvitedGame: true,
      });

      io.to(socket.id).emit("gameFound", {
        roomId,
        opponent: onlineUsers[inviterUserId],
        playerTurn: onlineUsers[inviterUserId],
        isInvitedGame: true,
      });

      gameMoves[roomId] = {};
      playerTurn[roomId] = inviterUserId; // نوبت بازیکن اول (دعوت کننده)
      
      // Initialize game state
      gameStates[roomId] = {
        player1: inviterUserId,
        player2: accepterId,
        points: { [inviterUserId]: 0, [accepterId]: 0 },
        moves: [],
        gameFinished: false,
        betAmount: invitation.betAmount || 0,
        isFreeGame: invitation.isFreeGame || false,
      };

      // Start timer for first player
      startTurnTimer(roomId, inviterUserId);
      // Emit timer start event
      io.to(roomId).emit("timerStart", {
        currentPlayer: inviterUserId,
          timeLeft: 15
      });

      // Remove invitation
      pendingInvitations[accepterId] = pendingInvitations[accepterId].filter(
        (inv) => inv.invitationId !== invitationId
      );

      if (pendingInvitations[accepterId].length === 0) {
        delete pendingInvitations[accepterId];
      }
    }
  } catch (error) {
    console.error("❌ Error creating invited game room:", error);
    socket.emit("invitationError", { message: "خطا در ایجاد اتاق بازی!" });
  }
};

// New: Handle invitation rejection
const handleRejectInvitation = (socket, invitationId) => {
  const rejecterId = socket.userId;

  // Find the invitation
  let invitation = null;
  let inviterUserId = null;

  if (pendingInvitations[rejecterId]) {
    invitation = pendingInvitations[rejecterId].find(
      (inv) => inv.invitationId === invitationId
    );
    if (invitation) {
      inviterUserId = invitation.from.userId;
    }
  }

  if (!invitation) {
    return; // Invitation doesn't exist or already expired
  }

  // Remove invitation
  pendingInvitations[rejecterId] = pendingInvitations[rejecterId].filter(
    (inv) => inv.invitationId !== invitationId
  );

  if (pendingInvitations[rejecterId].length === 0) {
    delete pendingInvitations[rejecterId];
  }

  // Notify inviter that invitation was rejected
  if (onlineUsers[inviterUserId]) {
    io.to(onlineUsers[inviterUserId].socketId).emit("invitationRejected", {
      invitationId,
      by: {
        userId: rejecterId,
        userName: onlineUsers[rejecterId]?.userName || "کاربر",
        nickName: onlineUsers[rejecterId]?.nickName,
      },
    });
  }

  // Confirm to rejecter
  socket.emit("invitationRejected", { invitationId, status: "success" });
};

// find opponent & create a room
const handleFindGame = async (socket, betAmount = 0, isFreeGame = false) => {
  if (waitingPlayer) {
    // Check if both players have the same bet amount
    const waitingPlayerBet = Number(waitingPlayer.betAmount) || 0;
    const waitingPlayerIsFree = Boolean(waitingPlayer.isFreeGame);
    const currentPlayerBet = Number(betAmount) || 0;
    const currentPlayerIsFree = Boolean(isFreeGame);

    // Both players must have the same bet settings
    if (waitingPlayerBet !== currentPlayerBet || waitingPlayerIsFree !== currentPlayerIsFree) {
      socket.emit("betMismatch", {
        message: "مبلغ شرط با حریف مطابقت ندارد",
      });
      return;
    }

    const roomId = `room-${waitingPlayer.userId}-${
      socket.userId
    }-${Date.now()}`;

    try {
      const createRoomRes = await fetch(`${baseURL}/api/rps/create-room`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          player1: waitingPlayer.userId,
          player2: socket.userId,
          betAmount: currentPlayerBet,
          isFreeGame: currentPlayerIsFree,
        }),
      });

      if (createRoomRes.ok) {
        const responseData = await createRoomRes.json();
        
        // Check if there's an error in the response
        if (responseData.error) {
          throw new Error(responseData.error);
        }
        
        // Get the actual socket for waiting player
        const waitingPlayerSocket = io.sockets.sockets.get(waitingPlayer.id);
        if (!waitingPlayerSocket) {
          throw new Error("Waiting player socket not found");
        }
        
        waitingPlayerSocket.join(roomId);
        socket.join(roomId);

        io.to(waitingPlayer.id).emit("gameFound", {
          roomId,
          opponent: onlineUsers[socket.userId],
          playerTurn: onlineUsers[waitingPlayer.userId],
        });
        io.to(socket.id).emit("gameFound", {
          roomId,
          opponent: onlineUsers[socket.userId],
          playerTurn: onlineUsers[waitingPlayer.userId],
        });

        gameMoves[roomId] = {};
        playerTurn[roomId] = waitingPlayer.userId;
        
        // Initialize game state
        gameStates[roomId] = {
          player1: waitingPlayer.userId,
          player2: socket.userId,
          points: { [waitingPlayer.userId]: 0, [socket.userId]: 0 },
          moves: [],
          gameFinished: false,
          betAmount: currentPlayerBet,
          isFreeGame: currentPlayerIsFree,
        };

      // Start timer for first player
      startTurnTimer(roomId, waitingPlayer.userId);
      // Emit timer start event
      io.to(roomId).emit("timerStart", {
        currentPlayer: waitingPlayer.userId,
          timeLeft: 15
      });
      }

      waitingPlayer = null;
    } catch (error) {
      console.error("❌ Error creating game room:", error);
      socket.emit("gameError", {
        message: "خطا در ایجاد اتاق بازی",
      });
    }
  } else {
    console.log("waitingPlayer");
    waitingPlayer = {
      ...socket,
      betAmount: Number(betAmount) || 0,
      isFreeGame: Boolean(isFreeGame),
    };
    socket.emit("waiting");
  }
};

// save moves(analyse) & game result
const handleMakeMove = async (socket, roomId, move) => {
  console.log(`Received move from ${socket.userId} in room ${roomId}: ${move}`);

  if (!gameMoves[roomId] || !gameStates[roomId]) {
    console.log(`Room ${roomId} not found in gameMoves or gameStates`);
    return;
  }

  const currentPlayer = socket.userId;
  console.log(`Current player: ${currentPlayer}`);

  // Clear timer since player made a move
  if (roomTimers[roomId]) {
    clearTimeout(roomTimers[roomId]);
    delete roomTimers[roomId];
    console.log(`⏰ Timer cleared for room ${roomId}`);
  }

  // ذخیره حرکت بازیکن فعلی
  gameMoves[roomId][currentPlayer] = move;
  console.log(`Updated gameMoves[${roomId}]:`, gameMoves[roomId]);

  // چک کردن اینکه هر دو بازیکن تصمیم گرفتن (حرکت یا timeout)
  const gameState = gameStates[roomId];
  const player1 = gameState.player1;
  const player2 = gameState.player2;
  
  const player1Decision = gameMoves[roomId][player1] !== undefined; // move or null (timeout)
  const player2Decision = gameMoves[roomId][player2] !== undefined; // move or null (timeout)
  
  console.log(`Player decisions - ${player1}: ${gameMoves[roomId][player1]}, ${player2}: ${gameMoves[roomId][player2]}`);

  if (player1Decision && player2Decision) {
    const move1 = gameMoves[roomId][player1];
    const move2 = gameMoves[roomId][player2];
    console.log(`Moves - ${player1}: ${move1}, ${player2}: ${move2}`);

    let result, winner, timeoutPlayer = null;
    
    // Check for timeout cases
    if (move1 === null && move2 === null) {
      // Both timed out - draw
      result = "draw";
      winner = "draw";
    } else if (move1 === null) {
      // Player1 timed out, player2 wins
      result = "timeout";
      winner = player2;
      timeoutPlayer = player1;
    } else if (move2 === null) {
      // Player2 timed out, player1 wins
      result = "timeout";
      winner = player1;
      timeoutPlayer = player2;
    } else {
      // Both made moves - normal game
      result = determineWinner(move1, move2);
      winner = result === "draw" ? "draw" : result === "player1" ? player1 : player2;
    }
    
    console.log(`Game result: ${result}, Winner: ${winner}`);

    // Update game state
    const roundData = {
      round: gameState.moves.length + 1,
      moves: { ...gameMoves[roomId] },
      result,
      winner
    };
    gameState.moves.push(roundData);

    // Update points (only if there's a winner, not draw)
    if (winner !== "draw") {
      gameState.points[winner] += 10;
    }

    // Check if game is finished
    const maxPoints = 100;
    const player1Points = gameState.points[gameState.player1];
    const player2Points = gameState.points[gameState.player2];

    let gameWinner = null;
    if (player1Points >= maxPoints || player2Points >= maxPoints) {
      gameState.gameFinished = true;
      gameWinner = player1Points >= maxPoints ? gameState.player1 : gameState.player2;
    }

    // Save game result after each round
    try {
      await saveGameResult(roomId, gameWinner, gameState.moves);
      console.log(`Round ${roundData.round} result saved successfully${gameWinner ? ' (Game finished)' : ''}`);
    } catch (error) {
      console.error("Failed to save round result:", error);
    }

    // If game is finished, notify clients
    if (gameState.gameFinished && gameWinner) {
      try {
        // Notify clients about game finish
        io.to(roomId).emit("gameFinished", {
          winner: gameWinner,
          finalPoints: gameState.points,
          totalMoves: gameState.moves
        });
      } catch (error) {
        console.error("Failed to emit game finished event:", error);
        // Still notify clients but with error flag
        io.to(roomId).emit("gameFinished", {
          winner: gameWinner,
          finalPoints: gameState.points,
          totalMoves: gameState.moves,
          saveError: true
        });
      }
    }

    io.to(roomId).emit("gameOver", {
      result,
      winner,
      gameMoves: gameMoves[roomId],
      points: gameState.points,
      gameFinished: gameState.gameFinished,
      timeoutPlayer: timeoutPlayer || undefined
    });
    console.log(`Sent gameOver to room ${roomId}`);
    gameMoves[roomId] = {};

    // Determine next player
    const nextPlayer = currentPlayer === gameState.player1 ? gameState.player2 : gameState.player1;
    playerTurn[roomId] = nextPlayer;

    // Emit waitingForOpponent first
    io.to(roomId).emit("waitingForOpponent", {
      message: "منتظر حرکت حریف باشید!",
      currentPlayer: nextPlayer,
    });

    // Start timer after 4 seconds (when frontend finishes showing result)
    if (!gameState.gameFinished) {
      setTimeout(() => {
        // Check if game is still active
        if (gameStates[roomId] && !gameStates[roomId].gameFinished) {
          startTurnTimer(roomId, nextPlayer);
          // Emit timer start event
          io.to(roomId).emit("timerStart", {
            currentPlayer: nextPlayer,
            timeLeft: 15
          });
        }
      }, 4000);
    }
  } else {
    // Determine next player
    const gameState = gameStates[roomId];
    if (gameState) {
      const nextPlayer = currentPlayer === gameState.player1 ? gameState.player2 : gameState.player1;
      playerTurn[roomId] = nextPlayer;

    io.to(roomId).emit("waitingForOpponent", {
      message: "منتظر حرکت حریف باشید!",
        currentPlayer: nextPlayer,
      });

      // Start timer for next player
      startTurnTimer(roomId, nextPlayer);
      // Emit timer start event
      io.to(roomId).emit("timerStart", {
        currentPlayer: nextPlayer,
          timeLeft: 15
    });
  } else {
    io.to(roomId).emit("waitingForOpponent", {
      message: "منتظر حرکت حریف باشید!",
      currentPlayer,
    });
    }
    console.log(`Sent waitingForOpponent to ${socket.userId}`);
  }
};

// user disconnect handler
const handleDisconnect = (socket) => {
  console.log(`🔴 User disconnected: ${socket.id}`);
  if (socket.userId) {
    delete onlineUsers[socket.userId];
    
    // Clean up game states for disconnected user
    for (const roomId in gameStates) {
      const gameState = gameStates[roomId];
      if (gameState.player1 === socket.userId || gameState.player2 === socket.userId) {
        // Notify opponent about disconnection
        const opponentId = gameState.player1 === socket.userId ? gameState.player2 : gameState.player1;
        if (onlineUsers[opponentId]) {
          io.to(onlineUsers[opponentId].socketId).emit("opponentDisconnected", {
            message: "حریف شما از بازی خارج شد"
          });
        }
        
        // Clean up game state
        delete gameStates[roomId];
        delete gameMoves[roomId];
        delete playerTurn[roomId];
      }
    }
  } else {
    // حذف با socketId در صورتی که userId نداشته باشه
    for (const key in onlineUsers) {
      if (onlineUsers[key].socketId === socket.id) {
        delete onlineUsers[key];
      }
    }
  }

  if (waitingPlayer && waitingPlayer.userId === socket.userId) {
    waitingPlayer = null;
  }
  io.emit("onlineUsers", Object.values(onlineUsers));
};

// match result function
const determineWinner = (move1, move2) => {
  const rules = { rock: "scissors", paper: "rock", scissors: "paper" };
  if (move1 === move2) return "draw";
  return rules[move1] === move2 ? "player1" : "player2";
};

module.exports = { rpsSocket, io, onlineUsers };
