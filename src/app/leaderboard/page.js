"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/store/useUser";
import { getData } from "@/services/API";
import Background from "@/components/chessboard/Background";
import Navbar from "@/components/navbar/Navbar";
import Image from "next/image";
import { Spinner } from "@heroui/react";
import { toFarsiNumber } from "@/helper/helper";
import { ranks } from "@/components/header/Header";

const LeaderboardPage = () => {
  const { user } = useUser();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userPosition, setUserPosition] = useState(null);

  useEffect(() => {
    getData("/ranking/leaderboard")
      .then((res) => {
        if (res.data.success) {
          setLeaderboard(res.data.leaderboard || []);
          
          // Find user position
          if (user) {
            const position = res.data.leaderboard.findIndex(
              (u) => u._id === user._id || u.userName === user.userName
            );
            if (position !== -1) {
              setUserPosition(position + 1);
            }
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("خطا در دریافت لیدربورد:", err);
        setLoading(false);
      });
  }, [user]);

  const getRankIcon = (rank) => {
    return ranks[rank - 1]?.icon || ranks[0].icon;
  };

  const getRankName = (rank) => {
    return ranks[rank - 1]?.name || ranks[0].name;
  };

  const getMedalIcon = (position) => {
    if (position === 1) return "🥇";
    if (position === 2) return "🥈";
    if (position === 3) return "🥉";
    return null;
  };

  return (
    <div className="relative max-w-[450px] flex flex-col items-center gap-5 w-full min-h-screen pb-24 bg-primaryDarkTheme overflow-hidden p-5">
      <Navbar />
      <Background />

      {/* Header */}
      <div className="w-full flex flex-col items-center gap-1 mt-2 z-10">
        <h1 className="text-2xl font-black bg-gradient-to-b from-white to-gray-600 bg-clip-text text-transparent">
          جدول رده‌بندی
        </h1>
        <p className="text-blueColor text-xs mt-0.5">
          برترین بازیکنان
        </p>
      </div>

      {/* User Position Card */}
      {user && userPosition && (
        <div className="w-full relative rounded-2xl p-[1px] bg-gradient-to-b from-blueColor/40 via-blueColor/20 to-blueColor/40 shadow-[0_0_20px_rgba(15,23,42,0.8)] z-10">
          <div className="flex items-center justify-between rounded-2xl bg-secondaryDarkTheme/95 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Image
                  src={"/avatar.png"}
                  width={100}
                  height={100}
                  className="size-12 object-cover rounded-2xl border border-white/15"
                  alt={`${user?.nickName} - پروفایل`}
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <h3 className="text-sm font-semibold text-white">
                  {user?.nickName}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">
                    رتبه {toFarsiNumber(userPosition.toString())}
                  </span>
                  <span className="text-xs text-gray-500">•</span>
                  <span className="text-xs text-emerald-400">
                    {toFarsiNumber((user?.totalScore || 0).toString())} امتیاز
                  </span>
                </div>
              </div>
            </div>
            <div className="relative w-12 h-12">
              <Image
                src={getRankIcon(user?.rank || 1)}
                width={100}
                height={100}
                className="w-10 left-0 absolute top-2/4 -translate-y-2/4 z-[2]"
                alt="user rank"
              />
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard List */}
      <div className="w-full flex flex-col gap-2 z-10">
        {loading ? (
          <div className="w-full flex justify-center items-center py-20">
            <Spinner
              classNames={{
                circle1: "border-b-blueColor",
                circle2: "border-b-blueColor",
              }}
            />
          </div>
        ) : leaderboard.length === 0 ? (
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
                هنوز بازیکنی وجود ندارد
              </p>
            </div>
          </div>
        ) : (
          leaderboard.map((player, index) => {
            const isCurrentUser = user && (player._id === user._id || player.userName === user.userName);
            const medal = getMedalIcon(index + 1);
            
            return (
              <div
                key={player._id || index}
                className={`relative w-full rounded-2xl p-[1px] ${
                  isCurrentUser
                    ? "bg-gradient-to-b from-blueColor/50 via-blueColor/30 to-blueColor/50 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                    : "bg-gradient-to-b from-blueColor/30 via-blueColor/10 to-transparent"
                } group hover:from-blueColor/40 hover:via-blueColor/15 transition-all duration-300`}
              >
                <div className="relative flex items-center gap-3 rounded-2xl bg-secondaryDarkTheme/80 backdrop-blur-sm p-4">
                  {/* Position */}
                  <div className="flex-shrink-0 w-10 flex items-center justify-center">
                    {medal ? (
                      <span className="text-2xl">{medal}</span>
                    ) : (
                      <span
                        className={`text-sm font-bold ${
                          index < 3
                            ? "text-blueColor"
                            : isCurrentUser
                            ? "text-emerald-400"
                            : "text-gray-400"
                        }`}
                      >
                        {toFarsiNumber((index + 1).toString())}
                      </span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="absolute -inset-1 rounded-xl bg-blueColor/20 blur-md group-hover:bg-blueColor/30 transition-colors" />
                    <Image
                      src={"/avatar.png"}
                      width={40}
                      height={40}
                      className="relative size-10 object-cover rounded-xl border border-white/5"
                      alt={player.nickName}
                    />
                  </div>

                  {/* Player Info */}
                  <div className="flex-1 flex flex-col gap-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3
                        className={`text-sm font-semibold truncate ${
                          isCurrentUser ? "text-emerald-400" : "text-white"
                        }`}
                      >
                        {player.nickName}
                      </h3>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-emerald-400 font-medium">
                          {toFarsiNumber((player.totalScore || 0).toString())}
                        </span>
                        <span className="text-[10px] text-gray-500">امتیاز</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-gray-500">برد:</span>
                        <span className="text-[10px] text-emerald-400 font-medium">
                          {toFarsiNumber((player.wins || 0).toString())}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-gray-500">باخت:</span>
                        <span className="text-[10px] text-red-400 font-medium">
                          {toFarsiNumber((player.losses || 0).toString())}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-gray-500">مساوی:</span>
                        <span className="text-[10px] text-gray-400 font-medium">
                          {toFarsiNumber((player.draws || 0).toString())}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Rank Badge */}
                  <div className="relative w-10 h-10 flex-shrink-0">
                    <Image
                      src={getRankIcon(player.rank || 1)}
                      width={100}
                      height={100}
                      className="w-8 left-0 absolute top-2/4 -translate-y-2/4 z-[2]"
                      alt={getRankName(player.rank || 1)}
                    />
                    <Image
                      src={getRankIcon(player.rank || 1)}
                      width={200}
                      height={200}
                      className="min-w-10 absolute -top-0 -left-0.5 z-[1] blur-sm opacity-50"
                      alt={getRankName(player.rank || 1)}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;

