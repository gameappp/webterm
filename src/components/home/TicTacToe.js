"use client";

import { baseURL } from "@/services/API";
import { useUser } from "@/store/useUser";
import { Spinner } from "@heroui/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { getSocket } from "@/lib/socket";

const socket = getSocket();

const TicTacToe = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [gameInfo, setGameInfo] = useState({});
  const router = useRouter();

  useEffect(() => {
    socket.emit("userInfo", {
      userId: user?._id,
      userName: user?.userName,
      nickName: user?.nickName,
    });

    socket.on("onlineUsers", (users) => console.log(users));

    socket.on(
      "tttGameFound",
      ({ roomId, opponent, playerTurn, isInvitedGame }) => {
        if (isInvitedGame) {
          return;
        }

        setLoading(false);

        toast.success("حریف شما پیدا شد درحال انتقال به بازی...", {
          duration: 4500,
          style: {
            borderRadius: "10px",
            background: "#040e1c",
            color: "#fff",
            fontSize: "14px",
          },
        });

        router.push(`/tictactoe/${roomId}`);

        setGameInfo({ roomId, opponent, playerTurn });
      }
    );

    return () => socket.off();
  }, []);

  const findGameHandler = () => {
    setLoading(true);
    socket.emit("findTicTacToeGame", { userId: user._id });
  };

  const cancelGameFindingHandler = () => {
    setLoading(false);
    socket.emit("cancelTicTacToeGame");
  };

  const isYou = gameInfo?.playerTurn?.userId === user?._id ? "شما" : "حریف";

  return (
    <>
      <Toaster />

      {(loading || gameInfo?.roomId) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="relative w-[90%] max-w-[420px] rounded-3xl p-[1px] bg-gradient-to-b from-purple-500/60 via-purple-500/20 to-transparent shadow-[0_0_40px_rgba(168,85,247,0.35)]">
            <div className="relative flex flex-col items-center gap-6 rounded-3xl bg-secondaryDarkTheme/95 px-6 py-7 backdrop-blur-xl">
              <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-3xl">
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-purple-500/10 blur-3xl" />
                <div className="absolute -left-16 bottom-0 h-36 w-36 rounded-full bg-emerald-400/10 blur-3xl" />
              </div>

              {loading && (
                <>
                  <div className="flex flex-col items-center gap-3 animate-fade-in">
                    <span className="text-sm text-gray-400">
                      بازی دوز آنلاین
                    </span>
                    <h3 className="text-lg font-bold text-white">
                      در حال پیدا کردن حریف برای شما...
                    </h3>
                    <p className="text-xs text-gray-400 text-center max-w-xs leading-relaxed">
                      بر اساس امتیاز و وضعیت فعلی، در حال جست‌وجو بین بازیکنان
                      آنلاین هستیم. این مرحله معمولا فقط چند ثانیه طول می‌کشد.
                    </p>
                  </div>

                  <div className="flex flex-col items-center gap-4">
                    <Spinner
                      classNames={{
                        label: "text-xs text-gray-300 mt-3",
                        circle1: "border-b-purple-500",
                        circle2: "border-b-purple-500",
                      }}
                    />

                    <div className="flex items-center -mt-2 gap-2 text-[11px] text-gray-400">
                      <span className="inline-flex h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                      در حال اتصال به بازیکنان فعال...
                    </div>

                    <button
                      onClick={cancelGameFindingHandler}
                      className="mt-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-medium text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors"
                    >
                      لغو جستجوی حریف
                    </button>
                  </div>
                </>
              )}

              {gameInfo.roomId && (
                <div className="flex flex-col items-center gap-8 animate-fade-in">
                  <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-1 text-[11px] font-medium text-emerald-300">
                    حریف شما پیدا شد
                  </span>

                  <h3 className="text-2xl font-black text-emerald-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.45)]">
                    شروع یک دوئل جذاب!
                  </h3>

                  <div className="flex items-center gap-8">
                    <div className="flex flex-col items-center gap-2 slide-up-2">
                      <div className="relative">
                        <div className="absolute -inset-1 rounded-2xl bg-purple-500/40 blur-md" />
                        <Image
                          src={"/avatar.png"}
                          width={100}
                          height={100}
                          alt={"player-1-avatar"}
                          className="relative size-16 rounded-2xl border border-white/10 shadow-lg"
                        />
                      </div>
                      <span className="text-[11px] text-gray-400">{isYou}</span>
                      <span className="text-xs font-medium text-white">
                        {gameInfo?.playerTurn?.nickName}
                      </span>
                    </div>

                    <div className="flex flex-col items-center gap-1 text-xs font-semibold text-gray-400">
                      <span className="text-[10px]">VS</span>
                      <div className="h-7 w-px bg-gradient-to-b from-transparent via-gray-500/50 to-transparent" />
                    </div>

                    <div className="flex flex-col items-center gap-2 slide-down-2">
                      <div className="relative">
                        <div className="absolute -inset-1 rounded-2xl bg-emerald-400/40 blur-md" />
                        <Image
                          src={"/avatar.png"}
                          width={100}
                          height={100}
                          alt={"player-2-avatar"}
                          className="relative size-16 rounded-2xl border border-white/10 shadow-lg"
                        />
                      </div>
                      <span className="text-[11px] text-gray-400">{isYou}</span>
                      <span className="text-xs font-medium text-white">
                        {gameInfo?.opponent?.nickName}
                      </span>
                    </div>
                  </div>

                  <p className="mt-2 text-[11px] text-center text-gray-400 leading-relaxed max-w-xs">
                    در حال انتقال به اتاق بازی هستید...
                    <br />
                    لطفا صفحه را نبندید.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <button
        onClick={findGameHandler}
        className="relative w-full h-36 rounded-3xl p-[1px] group bg-gradient-to-b from-blueColor/40 via-blueColor/10 to-transparent hover:from-blueColor/70 hover:via-blueColor/20 transition-all duration-300 shadow-[0_0_25px_rgba(15,23,42,0.9)] hover:shadow-[0_0_35px_rgba(59,130,246,0.7)]"
      >
        <div className="relative w-full h-full flex flex-col justify-center items-center gap-2 rounded-3xl bg-secondaryDarkTheme/95 backdrop-blur-xl transition-all duration-300 group-hover:bg-secondaryDarkTheme group-hover:-translate-y-1 group-hover:text-blueColor">
          <span className="absolute top-2 left-2 rounded-full border border-purple-400/40 bg-purple-500/10 px-2 py-[2px] text-[9px] font-medium text-purple-300">
            آنلاین
          </span>
          <div className="relative size-14 flex items-center justify-center">
            <svg
              width="56"
              height="56"
              viewBox="0 0 56 56"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-[0_0_18px_rgba(168,85,247,0.6)] group-hover:scale-110 transition-transform duration-300"
            >
              <line
                x1="18.67"
                y1="0"
                x2="18.67"
                y2="56"
                stroke="currentColor"
                strokeWidth="2"
                className="text-purple-400"
              />
              <line
                x1="37.33"
                y1="0"
                x2="37.33"
                y2="56"
                stroke="currentColor"
                strokeWidth="2"
                className="text-purple-400"
              />
              <line
                x1="0"
                y1="18.67"
                x2="56"
                y2="18.67"
                stroke="currentColor"
                strokeWidth="2"
                className="text-purple-400"
              />
              <line
                x1="0"
                y1="37.33"
                x2="56"
                y2="37.33"
                stroke="currentColor"
                strokeWidth="2"
                className="text-purple-400"
              />
              <line
                x1="6"
                y1="6"
                x2="13.33"
                y2="13.33"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="text-blueColor"
              />
              <line
                x1="13.33"
                y1="6"
                x2="6"
                y2="13.33"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="text-blueColor"
              />
              <circle
                cx="28"
                cy="28"
                r="5.5"
                stroke="currentColor"
                strokeWidth="2.5"
                fill="none"
                className="text-emerald-400"
              />
              <line
                x1="42.67"
                y1="42.67"
                x2="50"
                y2="50"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="text-blueColor"
              />
              <line
                x1="50"
                y1="42.67"
                x2="42.67"
                y2="50"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="text-blueColor"
              />
            </svg>
          </div>
          <span className="text-xs font-semibold text-white group-hover:text-blueColor">
            دوز
          </span>
          <span className="text-[10px] text-gray-400 group-hover:text-gray-300">
            پیدا کردن حریف تصادفی
          </span>
        </div>
      </button>
    </>
  );
};

export default TicTacToe;

