"use client";

import { toFarsiNumber } from "@/helper/helper";
import { useUser } from "@/store/useUser";
import { Button, Modal, ModalContent, ModalHeader, ModalBody, Spinner } from "@heroui/react";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { postData, getData } from "@/services/API";

const BET_AMOUNTS = [50000, 100000, 200000, 300000, 400000, 500000];

const BetSelectionModal = ({ isOpen, onClose, onBetSelected, gameType = "tictactoe" }) => {
  const { user, setUser } = useUser();
  const [selectedBet, setSelectedBet] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [userBalance, setUserBalance] = useState(user?.balance || 0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchBalance();
      setSelectedBet(null);
    }
  }, [isOpen]);

  const fetchBalance = async () => {
    setIsLoadingBalance(true);
    try {
      const response = await getData("/user/get-info");
      if (response?.data?.user) {
        const balance = response.data.user.balance || 0;
        setUserBalance(balance);
        setUser(response.data.user);
      }
    } catch (error) {
      console.error("Failed to fetch balance:", error);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const handleBetSelect = async (betAmount) => {
    if (betAmount === 0) {
      setSelectedBet(0);
      return;
    }

    setIsValidating(true);
    try {
      const response = await postData(
        "/games/validate-bet",
        { betAmount },
        null,
        null,
        true
      );

      if (response?.data?.valid) {
        setSelectedBet(betAmount);
        toast.success("مبلغ شرط معتبر است", {
          duration: 2000,
          style: {
            borderRadius: "10px",
            background: "#040e1c",
            color: "#fff",
            fontSize: "14px",
          },
        });
      } else {
        toast.error(response?.data?.message || "موجودی کافی نیست", {
          duration: 3000,
          style: {
            borderRadius: "10px",
            background: "#040e1c",
            color: "#fff",
            fontSize: "14px",
          },
        });
        setSelectedBet(null);
      }
    } catch (error) {
      console.error("Error validating bet:", error);
      toast.error("خطا در بررسی موجودی", {
        duration: 3000,
        style: {
          borderRadius: "10px",
          background: "#040e1c",
          color: "#fff",
          fontSize: "14px",
        },
      });
      setSelectedBet(null);
    } finally {
      setIsValidating(false);
    }
  };

  const handleConfirm = () => {
    if (selectedBet === null) {
      toast.error("لطفا مبلغ شرط را انتخاب کنید", {
        duration: 2000,
        style: {
          borderRadius: "10px",
          background: "#040e1c",
          color: "#fff",
          fontSize: "14px",
        },
      });
      return;
    }

    onBetSelected(selectedBet, selectedBet === 0);
    onClose();
  };

  const canAfford = (amount) => {
    return userBalance >= amount;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      classNames={{
        base: "bg-secondaryDarkTheme",
        header: "border-b border-white/10",
        body: "py-6",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 text-white">
          <h2 className="text-xl font-bold">انتخاب مبلغ شرط</h2>
          <p className="text-sm text-gray-400 font-normal">
            مبلغ شرط را انتخاب کنید یا بازی رایگان را انتخاب کنید
          </p>
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-4">
            {/* Balance Display */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-primaryDarkTheme border border-white/10">
              <span className="text-sm text-gray-400">موجودی شما:</span>
              {isLoadingBalance ? (
                <Spinner size="sm" />
              ) : (
                <span className="text-lg font-bold text-emerald-400">
                  {toFarsiNumber(userBalance.toString())} تومان
                </span>
              )}
            </div>

            {/* Bet Amount Buttons */}
            <div className="grid grid-cols-3 gap-3">
              {BET_AMOUNTS.map((amount) => {
                const affordable = canAfford(amount);
                const isSelected = selectedBet === amount;

                return (
                  <button
                    key={amount}
                    onClick={() => handleBetSelect(amount)}
                    disabled={!affordable || isValidating}
                    className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
                      isSelected
                        ? "border-emerald-400 bg-emerald-500/20 text-emerald-400"
                        : affordable
                        ? "border-white/20 bg-primaryDarkTheme/50 text-white hover:border-emerald-400/50 hover:bg-emerald-500/10"
                        : "border-red-500/30 bg-red-500/10 text-red-400/50 cursor-not-allowed opacity-50"
                    }`}
                  >
                    {!affordable && (
                      <span className="absolute top-1 left-2/4 -translate-x-1/2 text-[10px] text-red-400">
                        کافی نیست
                      </span>
                    )}
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-sm font-bold">
                        {toFarsiNumber(amount.toString())}
                      </span>
                      <span className="text-[10px] text-gray-400">تومان</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Free Play Button */}
            <button
              onClick={() => handleBetSelect(0)}
              className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                selectedBet === 0
                  ? "border-purple-400 bg-purple-500/20 text-purple-400"
                  : "border-white/20 bg-primaryDarkTheme/50 text-white hover:border-purple-400/50 hover:bg-purple-500/10"
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-base font-bold">بازی رایگان</span>
                <span className="text-xs text-gray-400">بدون شرط</span>
              </div>
            </button>

            {/* Confirm Button */}
            <Button
              onClick={handleConfirm}
              disabled={selectedBet === null || isValidating}
              className="w-full bg-blueColor text-white font-bold py-6 disabled:opacity-80"
            >
              {isValidating ? (
                <Spinner size="sm" color="white" />
              ) : selectedBet === 0 ? (
                "شروع بازی رایگان"
              ) : selectedBet ? (
                `شروع بازی با شرط ${toFarsiNumber(selectedBet.toString())} تومان`
              ) : (
                "لطفا نوع بازی را انتخاب کنید"
              )}
            </Button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default BetSelectionModal;

