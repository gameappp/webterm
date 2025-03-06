import Background from "@/components/chessboard/Background";
import Header from "@/components/header/Header";
import React from "react";

const page = () => {
  return (
    <div className="relative max-w-[450px] flex flex-col gap-5 w-full h-screen bg-blackColor overflow-hidden p-6">
      <Background />

      <Header />
    </div>
  );
};

export default page;
