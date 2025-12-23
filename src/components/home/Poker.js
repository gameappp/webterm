import Image from "next/image";
import React from "react";

const Poker = () => {
  return (
    <div className="relative w-full h-36 rounded-3xl p-[1px] group bg-gradient-to-b from-blueColor/40 via-blueColor/10 to-transparent hover:from-blueColor/70 hover:via-blueColor/20 transition-all duration-300 shadow-[0_0_25px_rgba(15,23,42,0.9)] hover:shadow-[0_0_35px_rgba(59,130,246,0.7)]">
      <div className="relative w-full h-full flex flex-col justify-center items-center gap-2 rounded-3xl bg-secondaryDarkTheme/95 backdrop-blur-xl transition-all duration-300 group-hover:bg-secondaryDarkTheme group-hover:-translate-y-1 group-hover:text-blueColor">
        <span className="absolute top-2 left-2 rounded-full border border-fuchsia-400/40 bg-fuchsia-500/10 px-2 py-[2px] text-[9px] font-medium text-fuchsia-300">
          هیجانی
        </span>
        <Image
          src={"/poker.png"}
          width={100}
          height={100}
          alt={"poker"}
          className="size-14 drop-shadow-[0_0_18px_rgba(244,114,182,0.6)] group-hover:scale-110 transition-transform duration-300"
        />
        <span className="text-xs font-semibold text-white group-hover:text-blueColor">
          پوکر
        </span>
        <span className="text-[10px] text-gray-400 group-hover:text-gray-300">
          میزهای رقابتی و دوستانه
        </span>
      </div>
    </div>
  );
};

export default Poker;
