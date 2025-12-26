"use client";

import { toFarsiNumber } from "@/helper/helper";
import { Button } from "@heroui/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useRef, useCallback } from "react";
import toast, { Toaster } from "react-hot-toast";
import { getSocket } from "@/lib/socket";
import { useUser } from "@/store/useUser";
import GameChat from "@/components/games/GameChat";

const socket = getSocket();

const TicTacToeGame = ({ roomId, roomInfo, user }) => {
  const { refreshBalance } = useUser();
  if (!roomInfo || !roomInfo.opponent || !user) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-white">در حال بارگذاری اطلاعات اتاق...</div>
      </div>
    );
  }

  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXTurn, setIsXTurn] = useState(roomInfo?.host?._id === user._id);
  const [gameResult, setGameResult] = useState(null);
  const [resultMessage, setResultMessage] = useState(null);
  const [scores, setScores] = useState({
    me: 0,
    opponent: 0,
  });
  const [timer, setTimer] = useState(30);
  const [timerActive, setTimerActive] = useState(false);
  const timerIntervalRef = useRef(null);
  const router = useRouter();

  const mySymbol = roomInfo?.host?._id === user._id ? "X" : "O";
  const opponentSymbol = mySymbol === "X" ? "O" : "X";

  useEffect(() => {
    socket.emit("joinTicTacToeRoom", roomId);

    socket.emit("userInfo", {
      userId: user._id,
      userName: user.userName,
      nickName: user.nickName,
    });

    if (isXTurn) {
      setTimer(30);
      setTimerActive(true);
    }

    socket.on("tttWaitingForOpponent", ({ currentPlayer }) => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }

      if (currentPlayer === user._id) {
        setIsXTurn(true);
      } else {
        setIsXTurn(false);
        setTimerActive(false);
        setTimer(30);
      }
    });

    socket.on("tttTimerStart", ({ currentPlayer, timeLeft }) => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }

      if (currentPlayer === user._id) {
        setIsXTurn(true);
        setResultMessage(null);
        setTimer(timeLeft || 30);
        setTimerActive(true);
      } else {
        setIsXTurn(false);
        setTimerActive(false);
        setTimer(30);
      }
    });

    socket.on(
      "tttMoveMade",
      ({ board: newBoard, currentPlayer, winner, isDraw }) => {
        setBoard(newBoard);
        setIsXTurn(currentPlayer === user._id);

        if (winner) {
          handleGameEnd(winner, isDraw);
        }
      }
    );

    socket.on("tttGameOver", ({ winner, isDraw, scores: newScores }) => {
      handleGameEnd(winner, isDraw);
      if (newScores && roomInfo?.opponent?._id) {
        setScores({
          me: newScores[user._id] || 0,
          opponent: newScores[roomInfo.opponent._id] || 0,
        });
      }
    });

    socket.on("tttGameFinished", ({ winner, finalScores }) => {
      if (finalScores && roomInfo?.opponent?._id) {
        setScores({
          me: finalScores[user._id] || 0,
          opponent: finalScores[roomInfo.opponent._id] || 0,
        });
      }

      if (winner === user._id) {
        setGameResult("you win");
      } else {
        setGameResult("you lose");
      }

      // Refresh balance after game ends
      setTimeout(() => {
        refreshBalance();
      }, 1000);
    });

    socket.on("tttOpponentDisconnected", ({ message }) => {
      toast.error(message, {
        duration: 4000,
        style: {
          borderRadius: "10px",
          background: "#040e1c",
          color: "#fff",
          fontSize: "14px",
        },
      });
      setTimeout(() => {
        router.push("/");
      }, 3000);
    });

    return () => {
      socket.off("tttWaitingForOpponent");
      socket.off("tttMoveMade");
      socket.off("tttGameOver");
      socket.off("tttGameFinished");
      socket.off("tttOpponentDisconnected");
      socket.off("tttTimerStart");
    };
  }, [roomId, user._id, roomInfo?.opponent?._id]);

  useEffect(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (!timerActive || !isXTurn) {
      return;
    }

    timerIntervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setTimerActive(false);
          if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
          }
          socket.emit("tttTimeout", { roomId, userId: user._id });
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
  }, [timerActive, isXTurn]);

  const handleGameEnd = (winner, isDraw) => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setTimerActive(false);
    setTimer(30);

    if (isDraw) {
      setResultMessage("draw");
    } else if (winner === user._id) {
      setResultMessage("win");
    } else {
      setResultMessage("lose");
    }

    setTimeout(() => {
      setResultMessage(null);
      setBoard(Array(9).fill(null));
    }, 3000);
  };

  const handleCellClick = useCallback(
    (index) => {
      if (board[index] || !isXTurn || gameResult) return;

      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      setTimerActive(false);
      setTimer(30);

      const newBoard = [...board];
      newBoard[index] = mySymbol;

      setBoard(newBoard);
      setIsXTurn(false);

      socket.emit("tttMakeMove", {
        roomId,
        index,
        symbol: mySymbol,
        userId: user._id,
      });
    },
    [board, isXTurn, mySymbol, roomId, user._id, gameResult]
  );

  const backHomePageHandler = () => {
    router.push("/");
  };

  const renderCell = (index) => {
    const value = board[index];
    return (
      <button
        key={index}
        onClick={() => handleCellClick(index)}
        disabled={!isXTurn || !!value || !!gameResult}
        className={`w-[100px] h-[100px] rounded-xl bg-secondaryDarkTheme/80 border-2 border-white/10 flex items-center justify-center text-4xl font-black transition-all duration-200 ${
          value === "X"
            ? "text-blueColor hover:bg-blueColor/10"
            : value === "O"
            ? "text-emerald-400 hover:bg-emerald-400/10"
            : "hover:bg-white/5 hover:border-purple-400/30"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {value === "X" ? (
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          >
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="18" y1="6" x2="6" y2="18" />
          </svg>
        ) : value === "O" ? (
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          >
            <circle cx="12" cy="12" r="8" />
          </svg>
        ) : null}
      </button>
    );
  };

  // Calculate progress bar percentages (max 5 rounds, each point = 10% of bar, max 50% per player)
  const maxScore = 5;
  const myPercentage = Math.min((scores.me / maxScore) * 50, 50);
  const opponentPercentage = Math.min((scores.opponent / maxScore) * 50, 50);

  return (
    <div className="w-full h-full relative max-w-[450px] flex flex-col items-center">
      <Toaster />

      {!gameResult && resultMessage && (
        <div className="fixed w-full max-w-[450px] h-full flex justify-center items-center text-2xl font-black z-[60] top-0 right-0 bottom-0 bg-black bg-opacity-75 transition-all duration-300">
          {resultMessage === "win" ? (
            <span className="text-emerald-400">آفرین! این دست و بردی</span>
          ) : resultMessage === "lose" ? (
            <span className="text-red-400">ای وای! این دست و باختی</span>
          ) : resultMessage === "draw" ? (
            <span className="text-gray-200">این دست مساوی شد!</span>
          ) : (
            ""
          )}
        </div>
      )}

      {gameResult && (
        <div className="fixed w-full max-w-[450px] h-full flex flex-col gap-4 justify-center items-center z-[60] top-0 right-0 bottom-0 bg-black bg-opacity-85 transition-all duration-300">
          {gameResult === "you win" ? (
            <span className="text-emerald-400 text-2xl font-black">
              آفرین! این بازی و بردی
            </span>
          ) : gameResult === "you lose" ? (
            <span className="text-red-400 text-2xl font-black">
              ای وای! این بازی و باختی
            </span>
          ) : (
            ""
          )}

          <div className="w-full flex justify-center items-center gap-16 text-sm text-gray-200">
            <span>امتیاز شما: {toFarsiNumber(scores.me.toString())}</span>
            <span>
              امتیاز حریف: {toFarsiNumber(scores.opponent.toString())}
            </span>
          </div>

          <p className="text-xs font-normal text-gray-300 -mt-1">
            برای بازگشت به صفحه اصلی و شروع بازی جدید کلیک کن
          </p>

          <Button onClick={backHomePageHandler} className="bg-purple-500">
            صفحه اصلی
          </Button>
        </div>
      )}

      <div className="relative pb-5 w-full bg-secondaryDarkTheme rounded-2xl p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Image
              src={"/avatar.png"}
              width={32}
              height={32}
              className="size-8 rounded-full border border-emerald-400/30"
              alt="opponent"
            />
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400">
                {roomInfo?.opponent?.nickName}
              </span>
              <span className="text-xs font-bold text-emerald-400">
                {toFarsiNumber(scores.opponent.toString())} امتیاز
              </span>
            </div>
          </div>

          <span
            className={`p-2 text-xs ${
              isXTurn
                ? "bg-emerald-500 text-emerald-500"
                : "bg-red-600 text-red-600"
            } bg-opacity-15 transition-all duration-300 rounded-xl`}
          >
            {isXTurn ? "نوبت شما" : "نوبت حریف"}
          </span>

          <div className="flex items-center gap-2">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-gray-400">شما</span>
              <span className="text-xs font-bold text-blueColor">
                {toFarsiNumber(scores.me.toString())} امتیاز
              </span>
            </div>
            <Image
              src={"/avatar.png"}
              width={32}
              height={32}
              className="size-8 rounded-full border border-blueColor/30"
              alt="me"
            />
          </div>
        </div>

        <div className="relative w-full h-4 bg-primaryDarkTheme rounded-full overflow-hidden">
          <div className="absolute left-1/2 -translate-x-1/2 w-[1px] h-full bg-white/15 z-10"></div>
          <div
            style={{ width: `${Math.min(opponentPercentage, 50)}%` }}
            className="absolute right-0 top-0 h-full bg-redColor transition-all duration-300 rounded-l-full"
          />
          <div
            style={{ width: `${Math.min(myPercentage, 50)}%` }}
            className="absolute left-0 top-0 h-full bg-blueColor transition-all duration-300 rounded-r-full"
          />
        </div>

        <span className="text-[10px] text-gray-400 font-medium absolute left-1/2 -translate-x-1/2 bottom-0.5">
          بازی تا {toFarsiNumber("5")} دست
        </span>

        {scores.me >= 5 || scores.opponent >= 5 ? (
          <div className="absolute -top-2 left-2/4 -translate-x-2/4">
            <span className="text-[10px] text-yellow-400 font-medium">
              برنده بازی 🎉
            </span>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-3 gap-3 mt-4">
        {Array.from({ length: 9 }).map((_, index) => renderCell(index))}
      </div>

      <div className="flex flex-col items-center gap-2 mt-4">
        {isXTurn && timerActive && !resultMessage && (
          <div className="flex items-center gap-2 mt-3">
            <div
              className={`size-12 rounded-full border-2 flex items-center justify-center transition-all ${
                timer <= 5
                  ? "border-red-500 text-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                  : timer <= 10
                  ? "border-yellow-500 text-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.3)]"
                  : "border-purple-500 text-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.3)]"
              }`}
            >
              <span className="text-base font-bold">
                {toFarsiNumber(timer.toString())}
              </span>
            </div>
            <span className="text-xs text-gray-400 font-medium">ثانیه</span>
          </div>
        )}
      </div>

      {/* Game Chat */}
      <GameChat roomId={roomId} gameType="tictactoe" />
    </div>
  );
};

export default TicTacToeGame;
