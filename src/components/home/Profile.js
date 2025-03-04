import Image from "next/image";
import React from "react";

export const ranks = [
  { id: 1, name: "کهربا", icon: "/ranks/rank-1.png" },
  { id: 2, name: "اوپال", icon: "/ranks/rank-2.png" },
  { id: 3, name: "یشم", icon: "/ranks/rank-3.png" },
  { id: 4, name: "مرمر", icon: "/ranks/rank-4.png" },
  { id: 5, name: "فیروزه", icon: "/ranks/rank-5.png" },
  { id: 6, name: "زمرد", icon: "/ranks/rank-6.png" },
  { id: 7, name: "یاقوت", icon: "/ranks/rank-7.png" },
  { id: 8, name: "الماس", icon: "/ranks/rank-8.png" },
];

// position: absolute;
// width: 120px;
// height: 120px;
// top: 10px;
// z-index: 1;
// filter: blur(60px);

const Profile = () => {
  const userRank = ranks[0];

  return (
    <div className="flex items-center gap-3">
      {/* profile image */}
      <div className="min-w-24 size-24 bg-gray-50 bg-opacity-5 backdrop-blur border border-gray-50 border-opacity-5 rounded-3xl shadow-xl p-3">
        <Image
          src={"/avatar.png"}
          width={100}
          height={100}
          className="w-full h-full object-cover rounded-2xl"
        />
      </div>

      <div className="w-full flex flex-col gap-0.5">
        <span className="w-full">شهیاد کریمی</span>

        <div className="flex items-center">
          <div className="relative w-10 h-10">
            <Image
              src={userRank.icon}
              width={100}
              height={100}
              className="w-8 absolute top-2/4 -translate-y-2/4 z-[2]"
            />

            <Image
              src={userRank.icon}
              width={200}
              height={200}
              className="min-w-10 absolute -top-0 left-0.5 z-[1] blur opacity-50"
            />
          </div>

          <span className="text-xs block -mt-1 -mr-1">سطح {userRank.name}</span>
        </div>

        <div className="w-full p-0.5 bg-gray-50 bg-opacity-5 backdrop-blur border border-gray-50 border-opacity-5 rounded-3xl">
          <div
            style={{ width: "50%" }}
            className="bg-blueColor h-2 rounded-full"
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
