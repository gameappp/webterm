import Background from "@/components/chessboard/Background";
import Navbar from "@/components/navbar/Navbar";
import React from "react";
import SearchFriends from "./SearchFriends";

const page = () => {
  return (
    <div className="relative max-w-[450px] flex flex-col items-center gap-5 w-full h-screen bg-primaryDarkTheme overflow-hidden p-5">
      <Navbar />
      <Background />

      <div className="w-full flex flex-col items-center gap-1">
        <h1 className="text-2xl font-black bg-gradient-to-b from-white to-gray-600 bg-clip-text text-transparent">
          دوستان شما
        </h1>

        <p className="text-blueColor text-xs">
          دوستاتو پیدا کن و باهاشون شرطی بزن !
        </p>
      </div>

      <SearchFriends />
    </div>
  );
};

export default page;
