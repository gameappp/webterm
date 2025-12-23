"use client";

import { toFarsiNumber } from "@/helper/helper";
import { Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";
import React from "react";

const TransactionHistory = ({ transactions, isLoading, onBack }) => {
  return (
    <div className="w-full flex flex-col gap-4 z-10">
      {/* Header with back button */}
      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={onBack}
          className="size-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center transition-all"
        >
          <Icon icon="solar:arrow-right-bold" width={20} height={20} className="text-gray-400" />
        </button>
        <div className="flex flex-col">
          <h2 className="text-lg font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
            تاریخچه تراکنش‌ها
          </h2>
          <p className="text-xs text-gray-400">تمام تراکنش‌های شما</p>
        </div>
      </div>

      {/* Transactions List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" color="primary" />
        </div>
      ) : transactions.length === 0 ? (
        <div className="relative w-full rounded-3xl p-[1px] bg-gradient-to-b from-gray-500/20 via-gray-500/10 to-transparent">
          <div className="relative flex flex-col items-center justify-center gap-3 rounded-3xl bg-secondaryDarkTheme/95 backdrop-blur-xl p-8">
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-3xl">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gray-500/5 blur-3xl" />
            </div>
            <div className="size-16 rounded-full bg-gray-500/10 flex items-center justify-center">
              <Icon icon="solar:history-bold" width={32} height={32} className="text-gray-400" />
            </div>
            <p className="text-sm text-gray-400 text-center">
              هنوز تراکنشی ثبت نشده است
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {transactions.map((transaction) => {
            const getTypeInfo = () => {
              switch (transaction.type) {
                case "deposit":
                  return {
                    label: "واریز",
                    icon: "solar:card-add-bold",
                    color: "text-blueColor",
                    bgColor: "bg-blueColor/10",
                    borderColor: "border-blueColor/30",
                    amountColor: "text-blueColor",
                    sign: "+",
                  };
                case "withdraw":
                  return {
                    label: "برداشت",
                    icon: "solar:card-withdraw-bold",
                    color: "text-amber-400",
                    bgColor: "bg-amber-400/10",
                    borderColor: "border-amber-400/30",
                    amountColor: "text-amber-400",
                    sign: "-",
                  };
                default:
                  return {
                    label: "تراکنش",
                    icon: "solar:history-bold",
                    color: "text-gray-400",
                    bgColor: "bg-gray-500/10",
                    borderColor: "border-gray-500/30",
                    amountColor: "text-gray-400",
                    sign: "",
                  };
              }
            };

            const typeInfo = getTypeInfo();
            const date = new Date(transaction.createdAt);
            const formattedDate = date.toLocaleDateString("fa-IR", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={transaction._id}
                className="relative rounded-2xl p-[1px] bg-gradient-to-b from-white/5 to-transparent"
              >
                <div className="relative flex items-center gap-3 rounded-2xl bg-secondaryDarkTheme/50 backdrop-blur-sm p-3">
                  <div
                    className={`size-10 rounded-xl ${typeInfo.bgColor} border ${typeInfo.borderColor} flex items-center justify-center`}
                  >
                    <Icon
                      icon={typeInfo.icon}
                      width={18}
                      height={18}
                      className={typeInfo.color}
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-white">
                        {typeInfo.label}
                      </span>
                      <span
                        className={`text-sm font-bold ${typeInfo.amountColor}`}
                      >
                        {typeInfo.sign}
                        {toFarsiNumber(transaction.amount.toString())} تومان
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        {transaction.description}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formattedDate}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-gray-500">
                        موجودی پس از تراکنش:
                      </span>
                      <span className="text-[10px] text-emerald-400 font-medium">
                        {toFarsiNumber(transaction.balanceAfter.toString())} تومان
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
