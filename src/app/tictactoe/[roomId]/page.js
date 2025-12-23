"use client";

import Background from "@/components/chessboard/Background";
import TicTacToeGame from "@/components/games/tictactoe/TicTacToeGame";
import { useUser } from "@/store/useUser";
import { postData } from "@/services/API";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Spinner } from "@heroui/react";

const page = () => {
  const params = useParams();
  const roomId = params.roomId;
  const { user } = useUser();
  const router = useRouter();
  const [roomInfo, setRoomInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      router.push("/auth");
      return;
    }

    const fetchRoom = () => {
      setLoading(true);
      setError(null);

      postData("/tictactoe/get-room", { roomId }, null, null, true)
        .then((response) => {
          if (response.data) {
            setRoomInfo(response.data);
          } else {
            setError("اطلاعات اتاق یافت نشد");
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching room:", err);
          setError(
            err.response?.data?.message ||
              err.response?.data?.error ||
              "خطا در دریافت اطلاعات اتاق"
          );
          setLoading(false);
        });
    };

    fetchRoom();
  }, [roomId, user?._id]);

  if (loading) {
    return (
      <div className="relative max-w-[450px] flex flex-col items-center justify-center gap-5 w-full h-screen bg-primaryDarkTheme overflow-hidden p-5">
        <Background />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <Spinner
            size="lg"
            classNames={{
              circle1: "border-b-purple-500",
              circle2: "border-b-purple-500",
            }}
          />
          <p className="text-white text-sm">در حال بارگذاری اطلاعات اتاق...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative max-w-[450px] flex flex-col items-center justify-center gap-5 w-full h-screen bg-primaryDarkTheme overflow-hidden p-5">
        <Background />
        <div className="relative z-10 text-red-400 text-center">
          <p className="text-lg font-bold mb-2">خطا!</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative max-w-[450px] flex flex-col gap-5 w-full h-screen bg-primaryDarkTheme overflow-hidden p-5 pt-0">
      <Background />

      <div className="w-full flex justify-between items-center bg-primaryDarkTheme relative z-10 py-5 border-b border-primaryLightTheme">
        <h1 className="bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
          بازی دوز
        </h1>

        <div className="flex items-center text-sm gap-2">
          <span className="bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
            شما
          </span>
          <span>🆚</span>
          <span className="bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
            {roomInfo?.opponent?.nickName}
          </span>
        </div>
      </div>

      <TicTacToeGame roomId={roomId} roomInfo={roomInfo} user={user} />
    </div>
  );
};

export default page;

