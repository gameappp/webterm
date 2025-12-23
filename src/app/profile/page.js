"use client";

import { useState } from "react";
import { useUser } from "@/store/useUser";
import { putData } from "@/services/API";
import ProfileEditForm from "./ProfileEditForm";
import Background from "@/components/chessboard/Background";
import Navbar from "@/components/navbar/Navbar";
import Image from "next/image";
import { toFarsiNumber } from "@/helper/helper";

const ProfilePage = () => {
  const { user, setUser } = useUser();
  const [loading, setLoading] = useState(false);

  const handleSave = (updatedData) => {
    setLoading(true);

    putData("/user/update-profile", updatedData)
      .then((res) => {
        if (res.data.success) {
          setUser(res.data.user);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("خطا در به‌روزرسانی پروفایل:", err);
        setLoading(false);
      });
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

  const joinDate = new Date(user.createdAt);
  const daysSinceJoin = Math.floor((Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="relative max-w-[450px] flex flex-col items-center gap-5 w-full min-h-screen pb-24 bg-primaryDarkTheme overflow-hidden p-5">
      <Navbar />
      <Background />

      {/* Profile Header Card */}
      <div className="w-full mt-2 z-10">
        <div className="relative w-full rounded-3xl p-[1px] bg-gradient-to-b from-blueColor/50 via-blueColor/20 to-transparent shadow-[0_0_30px_rgba(59,130,246,0.3)]">
          <div className="relative flex flex-col items-center gap-4 rounded-3xl bg-secondaryDarkTheme/95 backdrop-blur-xl p-6">
            {/* Background glow effects */}
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-3xl">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blueColor/5 blur-3xl" />
              <div className="absolute -left-10 bottom-0 h-28 w-28 rounded-full bg-emerald-400/5 blur-3xl" />
            </div>

            {/* Avatar */}
            <div className="relative">
              <div className="absolute -inset-2 rounded-2xl bg-blueColor/30 blur-xl animate-pulse" />
              <div className="relative">
                <Image
                  src={"/avatar.png"}
                  width={100}
                  height={100}
                  alt="پروفایل کاربر"
                  className="size-20 rounded-3xl border-2 border-white/10 shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                />
                <div className="absolute -bottom-1 -right-1 size-5 rounded-full bg-emerald-400 border-2 border-secondaryDarkTheme shadow-lg">
                  <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
                </div>
              </div>
            </div>

            {/* User Info */}
            <div className="flex flex-col items-center gap-1">
              <h1 className="text-xl font-black bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
                {user.nickName}
              </h1>
              <span dir="ltr" className="text-xs text-blueColor font-medium">@{user.userName}</span>
            </div>

            {/* Join Date Badge */}
            <div className="flex items-center gap-2 mt-1">
              <span className="rounded-full border border-blueColor/40 bg-blueColor/10 px-3 py-1 text-[10px] font-medium text-blueColor">
                عضو شده از {new Date(user.createdAt).toLocaleDateString("fa-IR", { year: "numeric", month: "long" })}
              </span>
              {daysSinceJoin > 0 && (
                <span className="text-[10px] text-gray-400">
                  ({toFarsiNumber(daysSinceJoin.toString())} روز)
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="w-full flex flex-col gap-4 z-10">
        <div className="w-full flex flex-col gap-1 mb-1">
          <h2 className="text-lg font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
            ویرایش اطلاعات
          </h2>
          <p className="text-xs text-gray-400">
            اطلاعات خود را به‌روزرسانی کنید
          </p>
        </div>

        <ProfileEditForm
          user={user}
          onSave={handleSave}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default ProfilePage;
