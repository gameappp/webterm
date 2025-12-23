"use client";

import { toFarsiNumber } from "@/helper/helper";
import { useUser } from "@/store/useUser";
import { Button, Input, Modal, ModalContent, ModalHeader, ModalBody, Spinner } from "@heroui/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getData, postData } from "@/services/API";
import Navbar from "@/components/navbar/Navbar";
import Background from "@/components/chessboard/Background";
import Header from "@/components/header/Header";
import TransactionHistory from "@/components/wallet/TransactionHistory";
import { Icon } from "@iconify/react";

const Wallet = () => {
  const { user, setUser } = useUser();
  const router = useRouter();
  const [balance, setBalance] = useState(user?.balance || 0);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);

  useEffect(() => {
    // Fetch latest balance
    fetchBalance();
  }, []);

  const fetchBalance = () => {
    getData("/user/get-info")
      .then((response) => {
        if (response.data?.user) {
          setBalance(response.data.user.balance || 0);
          setUser(response.data.user);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch balance:", error);
      });
  };

  const fetchTransactions = () => {
    setIsLoadingTransactions(true);
    getData("/wallet/transactions")
      .then((response) => {
        if (response.data?.success) {
          setTransactions(response.data.transactions || []);
        }
        setIsLoadingTransactions(false);
      })
      .catch((error) => {
        console.error("Failed to fetch transactions:", error);
        toast.error("خطا در دریافت تاریخچه تراکنش‌ها", {
          duration: 3000,
          style: {
            borderRadius: "10px",
            background: "#040e1c",
            color: "#fff",
            fontSize: "14px",
          },
        });
        setIsLoadingTransactions(false);
      });
  };

  const handleOpenHistory = () => {
    setShowHistory(true);
    fetchTransactions();
  };

  const handleBackFromHistory = () => {
    setShowHistory(false);
  };

  const handleDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) {
      toast.error("مبلغ باید بیشتر از صفر باشد", {
        duration: 3000,
        style: {
          borderRadius: "10px",
          background: "#040e1c",
          color: "#fff",
          fontSize: "14px",
        },
      });
      return;
    }

    setIsLoading(true);
    postData("/wallet/deposit", { amount })
      .then((response) => {
        if (response.data?.success) {
          toast.success("موجودی با موفقیت افزایش یافت", {
            duration: 3000,
            style: {
              borderRadius: "10px",
              background: "#040e1c",
              color: "#fff",
              fontSize: "14px",
            },
          });
          setBalance(response.data.balance);
          setUser((prev) => ({ ...prev, balance: response.data.balance }));
          setDepositAmount("");
          setIsDepositModalOpen(false);
          if (showHistory) {
            fetchTransactions();
          }
        }
        setIsLoading(false);
      })
      .catch((error) => {
        toast.error(
          error.response?.data?.message || "خطا در افزایش موجودی",
          {
            duration: 3000,
            style: {
              borderRadius: "10px",
              background: "#040e1c",
              color: "#fff",
              fontSize: "14px",
            },
          }
        );
        setIsLoading(false);
      });
  };

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      toast.error("مبلغ باید بیشتر از صفر باشد", {
        duration: 3000,
        style: {
          borderRadius: "10px",
          background: "#040e1c",
          color: "#fff",
          fontSize: "14px",
        },
      });
      return;
    }

    setIsLoading(true);
    postData("/wallet/withdraw", { amount })
      .then((response) => {
        if (response.data?.success) {
          toast.success("برداشت با موفقیت انجام شد", {
            duration: 3000,
            style: {
              borderRadius: "10px",
              background: "#040e1c",
              color: "#fff",
              fontSize: "14px",
            },
          });
          setBalance(response.data.balance);
          setUser((prev) => ({ ...prev, balance: response.data.balance }));
          setWithdrawAmount("");
          setIsWithdrawModalOpen(false);
          if (showHistory) {
            fetchTransactions();
          }
        }
        setIsLoading(false);
      })
      .catch((error) => {
        toast.error(
          error.response?.data?.message || "خطا در برداشت موجودی",
          {
            duration: 3000,
            style: {
              borderRadius: "10px",
              background: "#040e1c",
              color: "#fff",
              fontSize: "14px",
            },
          }
        );
        setIsLoading(false);
      });
  };


  return (
    <div className="relative max-w-[450px] flex flex-col items-center gap-5 w-full min-h-screen pb-24 bg-primaryDarkTheme overflow-hidden p-5">
      <Navbar />
      <Background />


      {/* Header */}
      <div className="w-full flex flex-col items-center gap-1 mt-2 z-10">
        <h1 className="text-2xl font-black bg-gradient-to-b from-white to-gray-600 bg-clip-text text-transparent">
          کیف پول
        </h1>
        <p className="text-blueColor text-xs mt-0.5">
          مدیریت موجودی و شارژ کیف پول
        </p>
      </div>

      {/* Balance Card */}
      <div className="w-full z-10">
        <div className="relative w-full rounded-3xl p-[1px] bg-gradient-to-b from-emerald-400/50 via-emerald-400/20 to-transparent">
          <div className="relative flex flex-col items-center gap-5 rounded-3xl bg-secondaryDarkTheme/95 backdrop-blur-xl p-6">
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-3xl">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-400/5 blur-3xl" />
              <div className="absolute -left-10 bottom-0 h-28 w-28 rounded-full bg-blueColor/5 blur-3xl" />
            </div>

            <div className="flex flex-col items-center gap-2">
              <span className="text-sm text-gray-400">موجودی شما</span>
              <div className="flex items-center gap-2">
                <span className="text-4xl font-black text-emerald-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                  {toFarsiNumber((balance || 0).toString())}
                </span>
                <span className="text-lg text-gray-400">تومان</span>
              </div>
            </div>

            <div className="grid grid-cols-2 w-full gap-3 mt-2">
              <button
                onClick={() => setIsDepositModalOpen(true)}
                className="h-14 rounded-2xl bg-gradient-to-r from-blueColor/20 to-blueColor/30 text-white text-xs font-semibold flex flex-col items-center justify-center gap-1.5 border border-blueColor/30 hover:border-blueColor/50 transition-all"
              >
                <Icon icon="solar:add-circle-bold" width={18} height={18} className="text-blueColor" />
                <span className="text-[10px]">افزایش</span>
              </button>

              <button
                onClick={() => setIsWithdrawModalOpen(true)}
                className="h-14 rounded-2xl bg-gradient-to-r from-amber-400/20 to-orange-500/25 text-white text-xs font-semibold flex flex-col items-center justify-center gap-1.5 border border-amber-400/30 hover:border-amber-400/50 transition-all"
              >
                <Icon icon="solar:minus-circle-bold" width={18} height={18} className="text-amber-400" />
                <span className="text-[10px]">برداشت</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {!showHistory ? (
        <>
          {/* Action Cards */}
          <div className="w-full flex flex-col gap-3 z-10">
            {/* Deposit Card */}
            <div className="relative w-full rounded-3xl p-[1px] bg-gradient-to-b from-blueColor/30 via-blueColor/10 to-transparent">
              <div className="relative flex items-center justify-between rounded-3xl bg-secondaryDarkTheme/95 backdrop-blur-xl p-4">
                <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-3xl">
                  <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blueColor/5 blur-3xl" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-2xl bg-blueColor/10 border border-blueColor/30 flex items-center justify-center">
                    <Icon icon="solar:card-add-bold" width={20} height={20} className="text-blueColor" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
                      افزایش موجودی
                    </span>
                    <span className="text-xs text-gray-400">شارژ کیف پول</span>
                  </div>
                </div>
                <Button
                  onClick={() => setIsDepositModalOpen(true)}
                  className="bg-blueColor/10 border border-blueColor/30 text-blueColor hover:bg-blueColor/20 text-xs font-medium px-4 h-9"
                >
                  افزایش
                </Button>
              </div>
            </div>

            {/* Withdraw Card */}
            <div className="relative w-full rounded-3xl p-[1px] bg-gradient-to-b from-amber-400/30 via-orange-500/15 to-transparent">
              <div className="relative flex items-center justify-between rounded-3xl bg-secondaryDarkTheme/95 backdrop-blur-xl p-4">
                <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-3xl">
                  <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-400/5 blur-3xl" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center">
                    <Icon icon="solar:card-withdraw-bold" width={20} height={20} className="text-amber-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
                      برداشت موجودی
                    </span>
                    <span className="text-xs text-gray-400">درخواست برداشت</span>
                  </div>
                </div>
                <Button
                  onClick={() => setIsWithdrawModalOpen(true)}
                  className="bg-amber-400/10 border border-amber-400/30 text-amber-400 hover:bg-amber-400/20 text-xs font-medium px-4 h-9"
                >
                  برداشت
                </Button>
              </div>
            </div>
          </div>

          {/* History Button */}
          <div className="w-full z-10">
            <button
              onClick={handleOpenHistory}
              className="relative w-full rounded-3xl p-[1px] bg-gradient-to-b from-purple-500/40 via-purple-500/20 to-transparent"
            >
              <div className="relative flex items-center justify-center gap-3 rounded-3xl bg-secondaryDarkTheme/95 backdrop-blur-xl p-4">
                <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-3xl">
                  <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-purple-500/5 blur-3xl" />
                  <div className="absolute -left-10 bottom-0 h-28 w-28 rounded-full bg-blueColor/5 blur-3xl" />
                </div>
                <Icon icon="solar:history-bold" width={22} height={22} className="text-purple-400" />
                <span className="text-sm font-semibold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
                  تاریخچه تراکنش‌ها
                </span>
              </div>
            </button>
          </div>
        </>
      ) : (
        <TransactionHistory
          transactions={transactions}
          isLoading={isLoadingTransactions}
          onBack={handleBackFromHistory}
        />
      )}

      {/* Deposit Modal */}
      <Modal
        isOpen={isDepositModalOpen}
        onClose={() => {
          setIsDepositModalOpen(false);
          setDepositAmount("");
        }}
        classNames={{
          base: "bg-secondaryDarkTheme/95 backdrop-blur-xl",
          header: "border-b border-white/10",
          body: "py-6",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h2 className="text-xl font-bold text-white bg-gradient-to-r from-blueColor to-emerald-400 bg-clip-text text-transparent">
                  افزایش موجودی
                </h2>
                <p className="text-sm text-gray-400 font-normal">
                  مبلغ مورد نظر برای شارژ کیف پول را وارد کنید
                </p>
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-4">
                  <Input
                    label="مبلغ (تومان)"
                    placeholder="مبلغ را وارد کنید"
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    classNames={{
                      label: "text-gray-400",
                      input: "text-white",
                      inputWrapper: "bg-white/5 border-white/10 hover:border-blueColor/50",
                    }}
                  />

                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      onClick={onClose}
                      className="flex-1 bg-white/5 text-gray-400 hover:bg-white/10"
                    >
                      انصراف
                    </Button>
                    <Button
                      onClick={handleDeposit}
                      disabled={isLoading}
                      className="flex-1 bg-gradient-to-r from-blueColor to-emerald-400 text-white"
                    >
                      {isLoading ? (
                        <Spinner size="sm" color="white" />
                      ) : (
                        "افزایش موجودی"
                      )}
                    </Button>
                  </div>
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Withdraw Modal */}
      <Modal
        isOpen={isWithdrawModalOpen}
        onClose={() => {
          setIsWithdrawModalOpen(false);
          setWithdrawAmount("");
        }}
        classNames={{
          base: "bg-secondaryDarkTheme/95 backdrop-blur-xl",
          header: "border-b border-white/10",
          body: "py-6",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h2 className="text-xl font-bold text-white bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                  برداشت موجودی
                </h2>
                <p className="text-sm text-gray-400 font-normal">
                  مبلغ برداشت را وارد کنید. (برداشت در صورت کافی بودن موجودی انجام می‌شود)
                </p>
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-4">
                  <Input
                    label="مبلغ (تومان)"
                    placeholder="مبلغ را وارد کنید"
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    classNames={{
                      label: "text-gray-400",
                      input: "text-white",
                      inputWrapper: "bg-white/5 border-white/10 hover:border-amber-400/60",
                    }}
                  />

                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      onClick={onClose}
                      className="flex-1 bg-white/5 text-gray-400 hover:bg-white/10"
                    >
                      انصراف
                    </Button>
                    <Button
                      onClick={handleWithdraw}
                      disabled={isLoading}
                      className="flex-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white"
                    >
                      {isLoading ? (
                        <Spinner size="sm" color="white" />
                      ) : (
                        "درخواست برداشت"
                      )}
                    </Button>
                  </div>
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

    </div>
  );
};

export default Wallet;
