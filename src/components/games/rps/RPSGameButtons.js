"use client";

import { toFarsiNumber } from "@/helper/helper";
import { Button } from "@heroui/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import toast, { Toaster } from "react-hot-toast";
import { getSocket } from "@/lib/socket";
import GameChat from "@/components/games/GameChat";
import { useUser } from "@/store/useUser";

const socket = getSocket();

const movesHand = {
  rock: "/rps/rock.svg",
  paper: "/rps/paper.svg",
  scissors: "/rps/scissors.svg",
};

const RPSGameButtons = ({ roomId, roomInfo, user }) => {
  const { refreshBalance } = useUser();
  const [gameResult, setGameResult] = useState(null);
  const [selectedMove, setSelectedMove] = useState({});
  const [turn, setTurn] = useState(roomInfo?.host?._id === user._id);
  const [resultMessage, setResultMessage] = useState(null);
  const [playersMoves, setPlayersMoves] = useState([]);
  const [playersMovesImage, setPlayersMovesImage] = useState({
    me: "/rps/hand.svg",
    opponent: "/rps/hand.svg",
    key: 0,
  });

  const [points, setPoints] = useState({
    me: 0,
    opponent: 0,
  });

  const [timer, setTimer] = useState(15);
  const [timerActive, setTimerActive] = useState(false);
  const timerIntervalRef = useRef(null);
  const router = useRouter();

  // Memoize moves array to prevent re-creation on every render
  const moves = useMemo(() => [
    {
      id: 1,
      name: "rock",
      icon: "/rps/r-icon.svg",
      position: "bottom-2 -ml-[100px]",
    },
    {
      id: 2,
      name: "paper",
      icon: "/rps/p-icon.svg",
      position: "bottom-[60px]",
    },
    {
      id: 3,
      name: "scissors",
      icon: "/rps/s-icon.svg",
      position: "bottom-2 ml-[100px]",
    },
  ], []);

  useEffect(() => {
    socket.emit("joinRoom", roomId);

    socket.emit("userInfo", {
      userId: user._id,
      userName: user.userName,
      nickName: user.nickName,
    });

    // Don't start timer here - wait for timerStart event from server
    // This prevents timer from starting before page is fully loaded

    socket.on("waitingForOpponent", ({ currentPlayer }) => {
      // Always clear timer interval first
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      
      if (currentPlayer === user._id) {
        setTurn(true);
        // Don't start timer here - wait for timerStart event
      } else {
        setTurn(false);
        // Stop timer when it's opponent's turn
        setTimerActive(false);
        setTimer(15);
      }
    });

    // Listen for timer start event
    socket.on("timerStart", ({ currentPlayer, timeLeft }) => {
      // Always clear existing timer first
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      
      if (currentPlayer === user._id) {
        // Make sure turn is set to true and result message is cleared
        setResultMessage(null); // Clear result message when new round starts
        setTimer(timeLeft || 15);
        setTurn(true);
        setTimerActive(true);
      } else {
        // Opponent's turn - stop timer
        setTurn(false);
        setTimerActive(false);
        setTimer(15);
      }
    });

    socket.on("gameOver", ({ result, winner, gameMoves, points, gameFinished, timeoutPlayer }) => {
      setSelectedMove({});
      setPlayersMoves((prev) => [...prev, gameMoves]);

      // Stop timer and clear interval
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      setTimerActive(false);
      setTimer(15);

      // Update points from server
      if (points) {
        setPoints({
          me: points[user._id] || 0,
          opponent: points[roomInfo.opponent._id] || 0,
        });
      }

      // set result message
      if (timeoutPlayer === user._id) {
        setResultMessage("timeout");
        toast.error("زمان شما تمام شد! این راند را باختید", {
          duration: 3000,
          style: {
            borderRadius: "10px",
            background: "#040e1c",
            color: "#fff",
            fontSize: "14px",
          },
        });
      } else if (winner === user._id) {
        setResultMessage("win");
      } else if (winner === roomInfo.opponent._id) {
        setResultMessage("lose");
      } else {
        setResultMessage("draw");
      }

      // set players moves (handle timeout case)
      setPlayersMovesImage((prev) => {
        let meMove = "/rps/hand.svg";
        let opponentMove = "/rps/hand.svg";
        
        if (timeoutPlayer === user._id) {
          // User timed out - show opponent's move and default for user
          opponentMove = movesHand[gameMoves[roomInfo.opponent._id]] || "/rps/hand.svg";
          meMove = "/rps/hand.svg";
        } else if (timeoutPlayer === roomInfo.opponent._id) {
          // Opponent timed out - show user's move and default for opponent
          meMove = movesHand[gameMoves[user._id]] || "/rps/hand.svg";
          opponentMove = "/rps/hand.svg";
        } else {
          // Normal case - both players made moves
          meMove = movesHand[gameMoves[user._id]] || "/rps/hand.svg";
          opponentMove = movesHand[gameMoves[roomInfo.opponent._id]] || "/rps/hand.svg";
        }
        
        return {
          me: meMove,
          opponent: opponentMove,
          key: prev.key + 1,
        };
      });

      // Reset hands to default after showing result
      setTimeout(() => {
        setResultMessage(null);
        // Reset hands to default after 4 seconds
        setPlayersMovesImage({
          me: "/rps/hand.svg",
          opponent: "/rps/hand.svg",
          key: Date.now(), // Force re-render
        });
      }, 4000);

      // Check if game is finished
      if (gameFinished) {
        if (points[user._id] >= 100) {
          setGameResult("you win");
        } else {
          setGameResult("you lose");
        }
      }
    });

    // Listen for game finished event from server
    socket.on("gameFinished", async ({ winner, finalPoints, totalMoves, saveError }) => {
      setPlayersMoves(totalMoves);
      setPoints({
        me: finalPoints[user._id] || 0,
        opponent: finalPoints[roomInfo.opponent._id] || 0,
      });

      if (winner === user._id) {
        setGameResult("you win");
      } else {
        setGameResult("you lose");
      }

      // Show error message if save failed
      if (saveError) {
        toast.error("خطا در ذخیره نتیجه بازی", {
          duration: 4000,
          style: {
            borderRadius: "10px",
            background: "#040e1c",
            color: "#fff",
            fontSize: "14px",
          },
        });
      }

      // Refresh balance after game ends
      setTimeout(() => {
        refreshBalance();
      }, 1000);
    });

    // Listen for opponent disconnection
    socket.on("opponentDisconnected", ({ message }) => {
      toast.error(message, {
        duration: 4000,
        style: {
          borderRadius: "10px",
          background: "#040e1c",
          color: "#fff",
          fontSize: "14px",
        },
      });
      // Optionally redirect to home or show reconnection option
      setTimeout(() => {
        router.push("/");
      }, 3000);
    });


    return () => {
      socket.off("waitingForOpponent");
      socket.off("gameOver");
      socket.off("gameFinished");
      socket.off("opponentDisconnected");
      socket.off("timerStart");
    };
  }, [roomId, user._id, roomInfo.opponent._id]);

  // Timer effect - optimized to prevent unnecessary re-renders
  useEffect(() => {
    // Clear any existing interval first
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    // Only start timer if both conditions are met
    if (!timerActive || !turn) {
      return;
    }

    // Start new interval
    timerIntervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setTimerActive(false);
          if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [timerActive, turn]); // Removed timer from dependencies to prevent re-creation

  const userMoveHandler = useCallback((move) => {
    setSelectedMove(move);
    // Clear timer interval first
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    // Then reset timer state - stop timer immediately when user makes a move
    setTimerActive(false);
    setTimer(15);
    socket.emit("makeMove", { roomId, move: move.name, userId: user._id });
  }, [roomId, user._id, socket]);

  const backHomePageHandler = () => {
    // toast.success("درحال انتقال به صفحه اصلی...", {
    //   duration: 4000,
    //   style: {
    //     borderRadius: "10px",
    //     background: "#040e1c",
    //     color: "#fff",
    //     fontSize: "14px",
    //   },
    // });

    router.push("/");
  };

  return (
    <div className="w-full h-full relative max-w-[450px]">
      <Toaster />

      {/* round result message */}
      {!gameResult ? (
        <div
          className={`fixed ${
            resultMessage && !gameResult ? "opacity-100 visible" : "opacity-0 invisible"
          } w-full max-w-[450px] h-full flex justify-center items-center text-2xl font-black z-[60] top-0 right-0 bottom-0 bg-black bg-opacity-75 transition-all duration-300`}
        >
          {resultMessage === "win" ? (
            <span className="text-success">آفرین! این دست و بردی</span>
          ) : resultMessage === "lose" ? (
            <span className="text-red-600">ای وای! این دست و باختی</span>
          ) : resultMessage === "draw" ? (
            <span className="text-gray-200">این دست مساوی شد!</span>
          ) : resultMessage === "timeout" ? (
            <span className="text-red-600">زمان شما تمام شد! این دست و باختی</span>
          ) : (
            ""
          )}
        </div>
      ) : (
        ""
      )}

      {/* game result message */}
      <div
        className={`fixed ${
          gameResult ? "opacity-100 visible" : "opacity-0 invisible"
        } w-full max-w-[450px] h-full flex flex-col gap-4 justify-center items-center z-[60] top-0 right-0 bottom-0 bg-black bg-opacity-85 transition-all duration-300`}
      >
        {gameResult === "you win" ? (
          <span className="text-success text-2xl font-black">
            آفرین! این بازی و بردی
          </span>
        ) : gameResult === "you lose" ? (
          <span className="text-red-600 text-2xl font-black">
            ای وای! این بازی و باختی
          </span>
        ) : (
          ""
        )}

        <div className="w-full flex justify-center items-center gap-16 text-sm text-gray-200">
          <span>امتیاز شما: {toFarsiNumber(points.me / 10)}</span>
          <span>امتیاز حریف: {toFarsiNumber(points.opponent / 10)}</span>
        </div>

        <p className="text-xs font-normal text-gray-300 -mt-1">
          برای بازگشت به صفحه اصلی و شروع بازی جدید کلیک کن
        </p>

        <Button
          onClick={backHomePageHandler}
          className="bg-blueColor"
        >
          صفحه اصلی
        </Button>
      </div>

      <div className="absolute left-2/4 -translate-x-2/4 bottom-36 flex flex-col items-center gap-2">
      <span
        className={`p-2 text-xs ${
          turn ? "bg-success text-success" : "bg-red-600 text-red-600"
          } bg-opacity-15 transition-all duration-300 rounded-xl`}
      >
        {turn ? "نوبت شما" : "نوبت حریف"}
      </span>
        
        {/* Timer - Show when it's user's turn and timer is active */}
        {turn && timerActive && (
          <div className="flex items-center gap-2">
            <div className={`size-12 rounded-full border-2 flex items-center justify-center transition-all ${
              timer <= 5 
                ? "border-red-500 text-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]" 
                : timer <= 8 
                ? "border-yellow-500 text-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.3)]" 
                : "border-blueColor text-blueColor shadow-[0_0_10px_rgba(59,130,246,0.3)]"
            }`}>
              <span className="text-base font-bold">{toFarsiNumber(timer.toString())}</span>
            </div>
            <span className="text-xs text-gray-400 font-medium">ثانیه</span>
          </div>
        )}
      </div>

      <button
        disabled={!turn}
        className="w-32 h-16 flex justify-center items-center bg-secondaryDarkTheme absolute left-2/4 -translate-x-2/4 -bottom-5 disabled:opacity-80 z-50 rounded-t-full"
      >
        <Image
          src={"/rps/random-icon.svg"}
          width={100}
          height={100}
          className="size-7 block -mb-3"
          alt="move"
        />
      </button>

      {moves.map((item) => (
        <button
          onClick={() => userMoveHandler(item)}
          key={item.id}
          disabled={!turn}
          className={`w-16 h-16 flex justify-center items-center rounded-full absolute left-2/4 -translate-x-2/4 ${
            item.position
          } ${
            item.id === selectedMove?.id
              ? "bg-blueColor"
              : "bg-secondaryDarkTheme"
          } hover:bg-blueColor disabled:opacity-80 transition-all duration-300 z-50`}
        >
          <Image
            src={item.icon}
            width={100}
            height={100}
            className="size-8 block"
            alt="move"
          />
        </button>
      ))}

      {/* user move hand */}
      <div className="">
        <Image
          src={playersMovesImage.me}
          width={350}
          height={800}
          className="w-full max-w-20 absolute -bottom-20 right-0 slide-up"
          alt="hand"
          key={playersMovesImage.key}
        />
      </div>

      {/* opponent move hand */}
      <div className="">
        <Image
          src={playersMovesImage.opponent}
          width={350}
          height={800}
          className="w-full max-w-20 absolute -top-20 left-0 -scale-x-100 -scale-y-100 slide-down"
          alt="hand"
          key={playersMovesImage.key}
        />
      </div>

      {/* ponts */}
      <div className="w-3 h-44 bg-secondaryDarkTheme absolute right-4 top-2/4 -translate-y-3/4">
        <div className="relative w-full h-full grid grid-rows-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-4 absolute fill-white top-2/4 -translate-y-2/4 -left-[14px] -scale-x-100"
          >
            <path
              fillRule="evenodd"
              d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
              clipRule="evenodd"
            />
          </svg>

          <span className="text-xs absolute top-2/4 -translate-y-2/4 -left-[86px] block min-w-16 pb-0.5">
            برنده بازی 🎉
          </span>

          <div className="absolute -top-[50px] left-2/4 -translate-x-2/4 flex flex-col gap-1 justify-center items-center">
            <span className="text-xs min-w-10 block text-center">
              {toFarsiNumber(points.opponent / 10)} امتیاز
            </span>

            <Image
              src={"/avatar.png"}
              width={100}
              height={100}
              className="min-w-8 size-8 rounded-full"
              alt="user profile"
            />
          </div>

          <div className="absolute -bottom-[50px] left-2/4 -translate-x-2/4 flex flex-col gap-1 justify-center items-center">
            <Image
              src={"/avatar.png"}
              width={100}
              height={100}
              className="min-w-8 size-8 rounded-full"
              alt="user profile"
            />

            <span className="text-xs min-w-10 block text-center">
              {toFarsiNumber(points.me / 10)} امتیاز
            </span>
          </div>

          {/* point progress */}
          {/* me */}
          <div
            style={{ height: `${points.opponent}%` }}
            className="w-full bg-redColor transition-all duration-300 rounded-b-full"
          ></div>

          {/* opponent */}
          <div className="w-full h-full flex items-end">
            <div
              style={{ height: `${points.me}%` }}
              className="w-full bg-blueColor transition-all duration-300 rounded-t-full"
            ></div>
          </div>
        </div>
      </div>

      {/* Game Chat */}
      <GameChat roomId={roomId} gameType="rps" />
    </div>
  );
};

export default RPSGameButtons;
