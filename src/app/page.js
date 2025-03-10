import Background from "@/components/chessboard/Background";
import Header from "@/components/header/Header";
import React from "react";

const page = () => {
  const boxes = new Array(3).fill(true);

  return (
    <div className="relative max-w-[450px] flex flex-col gap-5 w-full h-screen bg-primaryDarkTheme overflow-hidden p-5">
      <Background />

      <Header />

      {/* boxes */}
      <div className="w-full grid grid-cols-3 gap-3">
        {boxes.map((item, index) => (
          <div key={index} className="w-full h-36 rounded-2xl p-0.5 bg-gradient-to-b from-gray-600 hover:from-blueColor">
            <div className="w-full h-full bg-secondaryDarkTheme rounded-2xl">

            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default page;
