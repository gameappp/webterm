"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/store/useUser";
import { getData } from "@/services/API";
import Background from "@/components/chessboard/Background";
import Navbar from "@/components/navbar/Navbar";
import Image from "next/image";
import { Spinner, Button } from "@heroui/react";
import { toFarsiNumber } from "@/helper/helper";
import { Icon } from "@iconify/react";

const HistoryPage = () => {
  const { user } = useUser();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (user) {
      fetchHistory(1, true);
    }
  }, [user]);

  const fetchHistory = async (pageNum = 1, reset = false) => {
    if (reset) {
      setLoading(true);
      setPage(1);
    } else {
      setLoadingMore(true);
    }

    try {
      const res = await getData(`/games-history?page=${pageNum}&limit=10`);
      if (res.data.success) {
        if (reset) {
          setHistory(res.data.history || []);
        } else {
          setHistory((prev) => [...prev, ...(res.data.history || [])]);
        }
        setHasMore(res.data.pagination?.hasMore || false);
        setStats(res.data.stats);
        setPage(pageNum);
      }
    } catch (err) {
      console.error("خطا در دریافت تاریخچه:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchHistory(page + 1, false);
    }
  };

  const getResultBadge = (winner, userId) => {
    if (!winner || winner === "draw") {
      return (
        <span className="rounded-full border border-gray-400/40 bg-gray-500/10 px-2.5 py-1 text-[10px] font-medium text-gray-400">
          مساوی
        </span>
      );
    }
    if (winner === userId) {
      return (
        <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-medium text-emerald-300">
          برنده
        </span>
      );
    }
    return (
      <span className="rounded-full border border-red-400/40 bg-red-500/10 px-2.5 py-1 text-[10px] font-medium text-red-300">
        بازنده
      </span>
    );
  };

  const getGameIcon = (gameType) => {
    if (gameType === "tictactoe") {
      return "/tic-tac-toe.png";
    }
    return "/rock-paper-scissors.png";
  };

  const formatDate = (date) => {
    const gameDate = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now - gameDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffMinutes < 60) {
      return `${toFarsiNumber(diffMinutes.toString())} دقیقه پیش`;
    } else if (diffHours < 24) {
      return `${toFarsiNumber(diffHours.toString())} ساعت پیش`;
    } else if (diffDays < 7) {
      return `${toFarsiNumber(diffDays.toString())} روز پیش`;
    } else {
      return gameDate.toLocaleDateString("fa-IR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  };

  if (!user) {
    return (
      <div className="relative max-w-[450px] flex flex-col items-center justify-center gap-5 w-full h-screen bg-primaryDarkTheme overflow-hidden p-5">
        <Navbar />
        <Background />
        <div className="text-white text-sm">در حال بارگذاری...</div>
      </div>
    );
  }

  return (
    <div className="relative max-w-[450px] flex flex-col items-center gap-5 w-full min-h-screen pb-24 bg-primaryDarkTheme overflow-hidden p-5">
      <Navbar />
      <Background />

      {/* Header */}
      <div className="w-full flex flex-col items-center gap-1 mt-2 z-10">
        <h1 className="text-2xl font-black bg-gradient-to-b from-white to-gray-600 bg-clip-text text-transparent">
          تاریخچه بازی‌ها
        </h1>
        <p className="text-blueColor text-xs mt-0.5">
          تمام بازی‌های گذشته شما
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="w-full grid grid-cols-3 gap-2 z-10">
          <div className="relative w-full rounded-2xl p-[1px] bg-gradient-to-b from-emerald-400/30 via-emerald-400/10 to-transparent">
            <div className="relative rounded-2xl bg-secondaryDarkTheme/80 backdrop-blur-sm p-3">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-gray-400">برد</span>
                <span className="text-lg font-bold text-emerald-400">
                  {toFarsiNumber(stats.wins.toString())}
                </span>
              </div>
            </div>
          </div>
          <div className="relative w-full rounded-2xl p-[1px] bg-gradient-to-b from-red-400/30 via-red-400/10 to-transparent">
            <div className="relative rounded-2xl bg-secondaryDarkTheme/80 backdrop-blur-sm p-3">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-gray-400">باخت</span>
                <span className="text-lg font-bold text-red-400">
                  {toFarsiNumber(stats.losses.toString())}
                </span>
              </div>
            </div>
          </div>
          <div className="relative w-full rounded-2xl p-[1px] bg-gradient-to-b from-gray-400/30 via-gray-400/10 to-transparent">
            <div className="relative rounded-2xl bg-secondaryDarkTheme/80 backdrop-blur-sm p-3">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-gray-400">مساوی</span>
                <span className="text-lg font-bold text-gray-400">
                  {toFarsiNumber(stats.draws.toString())}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History List */}
      <div className="w-full flex flex-col gap-3 z-10">
        {loading ? (
          <div className="w-full flex justify-center items-center py-20">
            <Spinner
              classNames={{
                circle1: "border-b-blueColor",
                circle2: "border-b-blueColor",
              }}
            />
          </div>
        ) : history.length === 0 ? (
          <div className="relative w-full rounded-3xl p-[1px] bg-gradient-to-b from-blueColor/30 via-blueColor/10 to-transparent">
            <div className="relative flex flex-col items-center justify-center gap-4 rounded-3xl bg-secondaryDarkTheme/95 backdrop-blur-xl p-8">
              <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-3xl">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blueColor/5 blur-3xl" />
                <div className="absolute -left-10 bottom-0 h-28 w-28 rounded-full bg-emerald-400/5 blur-3xl" />
              </div>
              <div className="size-16 rounded-full bg-gray-500/10 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={32}
                  height={32}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  className="text-gray-400"
                >
                  <path d="M12 2v20M2 12h20" />
                </svg>
              </div>
              <p className="text-sm text-gray-400 text-center">
                هنوز بازی‌ای انجام نداده‌اید
              </p>
              <p className="text-xs text-gray-500 text-center">
                بعد از انجام بازی‌ها، تاریخچه آن‌ها اینجا نمایش داده می‌شود
              </p>
            </div>
          </div>
        ) : (
          history.map((game, index) => (
            <div
              key={game.gameId || index}
              className="relative w-full rounded-2xl p-[1px] bg-gradient-to-b from-blueColor/30 via-blueColor/10 to-transparent group hover:from-blueColor/40 hover:via-blueColor/15 transition-all duration-300"
            >
              <div className="relative flex items-center gap-3 rounded-2xl bg-secondaryDarkTheme/80 backdrop-blur-sm p-4">
                {/* Game Icon */}
                <div className="relative flex-shrink-0">
                  <div className="absolute -inset-1 rounded-xl bg-blueColor/20 blur-md group-hover:bg-blueColor/30 transition-colors" />
                  <div className="relative size-12 rounded-xl bg-primaryDarkTheme/50 flex items-center justify-center border border-white/5">
                    <Image
                      src={getGameIcon(game.gameType)}
                      width={40}
                      height={40}
                      alt={game.gameName}
                      className="size-8 object-contain"
                    />
                  </div>
                </div>

                {/* Game Info */}
                <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-white truncate">
                      {game.gameName}
                    </h3>
                    {getResultBadge(game.winner, user._id)}
                  </div>

                  {game.opponent && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <Image
                          src={"/avatar.png"}
                          width={20}
                          height={20}
                          alt={game.opponent.nickName}
                          className="size-5 rounded-lg object-cover"
                        />
                        <span className="text-xs text-gray-300 truncate">
                          {game.opponent.nickName}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-500">vs</span>
                      <span className="text-xs text-blueColor font-medium">
                        شما
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-0.5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={12}
                      height={12}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      className="text-gray-500"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span className="text-[10px] text-gray-400">
                      {formatDate(game.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}

        {/* Load More Button */}
        {hasMore && (
          <div className="w-full flex justify-center mt-2">
            <Button
              onClick={loadMore}
              isLoading={loadingMore}
              className="bg-blueColor text-white font-medium transition-all duration-300"
            >
              {loadingMore ? (
                <>
                  <Spinner size="sm" color="white" className="mr-2" />
                  در حال بارگذاری...
                </>
              ) : (
                <>
                  نمایش بیشتر
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
