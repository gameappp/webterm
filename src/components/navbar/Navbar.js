"use client";

import { SocketContextData } from "@/context/SocketContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useContext } from "react";
import { Icon } from "@iconify/react";

const Navbar = () => {
  const route = usePathname();

  const menu = [
    {
      id: 1,
      name: "دوستان",
      link: "/friends",
      icon: <Icon icon="solar:users-group-rounded-linear" width={20} height={20} />,
    },
    {
      id: 2,
      name: "تاریخچه",
      link: "/history",
      icon: <Icon icon="solar:history-linear" width={20} height={20} />,
    },
    {
      id: 3,
      name: "خانه",
      link: "/",
      icon: <Icon icon="solar:home-linear" width={20} height={20} />,
    },
    {
      id: 5,
      name: "کیف پول",
      link: "/wallet",
      icon: <Icon icon="solar:wallet-linear" width={20} height={20} />,
    },
    {
      id: 4,
      name: "پروفایل",
      link: "/profile",
      icon: <Icon icon="solar:user-linear" width={20} height={20} />,
    },
  ];

  return (
    <div className="w-full max-w-[450px] fixed left-0 right-0 bottom-0 px-4 pb-4">
      <div className="relative w-full h-16 rounded-3xl px-6 flex justify-between items-center bg-secondaryDarkTheme/95 backdrop-blur-xl border border-white/5 shadow-[0_0_30px_rgba(15,23,42,0.9)]">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-3xl">
          <div className="absolute -left-6 -top-6 h-20 w-20 rounded-full bg-blueColor/10 blur-3xl" />
          <div className="absolute -right-10 bottom-0 h-24 w-24 rounded-full bg-emerald-400/10 blur-3xl" />
        </div>

      {menu.map((item) => (
        <Link
          key={item.id}
          href={item.link}
          className={`relative flex flex-col gap-1 text-[11px] items-center transition-all duration-300 ${
            item.link === route
              ? "text-blueColor scale-110 drop-shadow-[0_0_12px_rgba(59,130,246,0.8)]"
              : "text-gray-400 hover:text-blueColor"
          }`}
        >
          {item.icon}
          <span className="mt-0.5">{item.name}</span>
        </Link>
      ))}
      </div>
    </div>
  );
};

export default Navbar;
