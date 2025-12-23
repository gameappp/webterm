import Background from "@/components/chessboard/Background";
import Navbar from "@/components/navbar/Navbar";
import React from "react";
import SearchFriends from "./SearchFriends";
import FriendItem from "./FriendItem";
import { Spinner } from "@heroui/react";
import FriendRequests from "./FriendRequests";
import { baseURL } from "@/services/API";
import { cookies } from "next/headers";
import { toFarsiNumber } from "@/helper/helper";

const page = async () => {
  const token = (await cookies()).get("token")?.value;

  const res = await fetch(`${baseURL}/friends/get-all`, {
    method: "GET",
    credentials: "include",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  return (
    <div className="relative max-w-[450px] flex flex-col items-center gap-5 w-full min-h-screen pb-24 bg-primaryDarkTheme overflow-hidden p-5">
      <Navbar />
      <Background />

      {/* Header */}
      <div className="w-full flex flex-col items-center gap-1 mt-2 z-10">
        <h1 className="text-2xl font-black bg-gradient-to-b from-white to-gray-600 bg-clip-text text-transparent">
          دوستان شما
        </h1>
        <p className="text-blueColor text-xs mt-0.5">
          دوستاتو پیدا کن و باهاشون شرطی بزن !
        </p>
      </div>

      <SearchFriends />

      <div className="w-full flex flex-col gap-4 z-10">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
              دوستان شما
            </h2>
            <div className="size-6 text-xs bg-blueColor/20 border border-blueColor/40 text-blueColor flex justify-center items-center rounded-lg font-medium">
              {toFarsiNumber(data?.friendsList?.length || 0)}
            </div>
          </div>

          <FriendRequests data={data?.friendshipRequests} />
        </div>

        {data?.friendsList?.length ? (
          <div className="w-full flex flex-col gap-3">
            {data.friendsList.map((item) => (
            <FriendItem key={item._id} userInfo={item} />
            ))}
          </div>
        ) : (
          <div className="relative w-full rounded-3xl p-[1px] bg-gradient-to-b from-blueColor/30 via-blueColor/10 to-transparent">
            <div className="relative flex flex-col items-center justify-center gap-3 rounded-3xl bg-secondaryDarkTheme/95 backdrop-blur-xl p-6">
              <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-3xl">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blueColor/5 blur-3xl" />
                <div className="absolute -left-10 bottom-0 h-28 w-28 rounded-full bg-emerald-400/5 blur-3xl" />
              </div>
              <div className="size-12 rounded-full bg-gray-500/10 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={24}
                  height={24}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  className="text-gray-400"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <p className="text-sm text-gray-400 text-center">
                هنوز دوستی اضافه نکرده‌اید
              </p>
              <p className="text-xs text-gray-500 text-center">
                از قسمت جست‌وجو دوستان جدید پیدا کنید
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default page;
