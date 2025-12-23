"use client";
import { toFarsiNumber } from "@/helper/helper";
import React, { useState } from "react";
import FriendRequestItem from "./FriendRequestItem";

const FriendRequests = ({ data }) => {
  const [openDrawer, setOpenDrawer] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpenDrawer(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blueColor text-white transition-colors group"
      >
        <span className="text-sm font-semibold">درخواست‌ها</span>
        {data?.length > 0 && (
          <div className="size-5 text-[10px] bg-red-500 text-white flex justify-center items-center rounded-lg font-semibold group-hover:scale-110 transition-transform">
            {toFarsiNumber(data.length)}
          </div>
        )}
      </button>

      <div
        onClick={() => setOpenDrawer(false)}
        className={`${
          openDrawer ? "opacity-100 visible" : "opacity-0 invisible"
        } bg-black/70 backdrop-blur-sm w-full h-full fixed top-0 bottom-0 right-0 z-40 transition-all duration-300`}
      ></div>

      <div
        className={`${
          openDrawer ? "bottom-0" : "-bottom-full"
        } w-full max-h-[80vh] right-0 bg-primaryDarkTheme absolute z-50 rounded-t-3xl transition-all duration-300 shadow-[0_0_30px_rgba(0,0,0,0.5)]`}
      >
        <div className="w-full h-full p-5 relative flex flex-col gap-4 pt-12 overflow-y-auto">
          <span className="w-20 h-1.5 rounded-full bg-gray-600 absolute top-4 left-2/4 -translate-x-2/4 block"></span>

          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
              درخواست‌های دوستی
            </h2>
            {data?.length > 0 && (
              <span className="text-xs text-gray-400">
                {toFarsiNumber(data.length)} درخواست
              </span>
            )}
          </div>

          {data?.length ? (
            <div className="w-full flex flex-col gap-3">
              {data.map((item) => (
                <FriendRequestItem key={item._id} userInfo={item} />
              ))}
            </div>
          ) : (
            <div className="relative w-full rounded-2xl p-[1px] bg-gradient-to-b from-blueColor/30 via-blueColor/10 to-transparent">
              <div className="relative flex flex-col items-center justify-center gap-3 rounded-2xl bg-secondaryDarkTheme/95 backdrop-blur-xl p-6">
                <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-2xl">
                  <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blueColor/5 blur-3xl" />
                </div>
                <p className="text-sm text-gray-400 text-center">
                  درخواستی وجود ندارد
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FriendRequests;
