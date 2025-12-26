"use client";

import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Spinner,
} from "@heroui/react";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useUser } from "@/store/useUser";
import { toFarsiNumber } from "@/helper/helper";
import { postData, getData } from "@/services/API";
import toast from "react-hot-toast";

const BET_AMOUNTS = [50000, 100000, 200000, 300000, 400000, 500000];

const games = [
  {
    id: "rps",
    name: "سنگ کاغذ قیچی",
    icon: "/rock-paper-scissors.png",
    defaultMessage: "بیا بازی کنیم! 🎮",
  },
  {
    id: "chess",
    name: "شطرنج",
    icon: "/chess.png",
    defaultMessage: "بیا شطرنج بازی کنیم! ♟️",
  },
  {
    id: "tictactoe",
    name: "دوز",
    icon: "/tic-tac-toe.png",
    defaultMessage: "بیا دوز بازی کنیم! ⭕❌",
  },
];

const GameInviteModal = ({ isOpen, onClose, friendName, onSendInvite }) => {
  const { user, setUser } = useUser();
  const [selectedGame, setSelectedGame] = useState(games[0]);
  const [message, setMessage] = useState(games[0].defaultMessage);
  const [loading, setLoading] = useState(false);
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

  const handleGameSelect = (game) => {
    setSelectedGame(game);
    setMessage(game.defaultMessage);
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

  const canAfford = (amount) => {
    return userBalance >= amount;
  };

  const handleSend = () => {
    if (!selectedGame || !message.trim()) return;
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

    setLoading(true);
    onSendInvite({
      gameType: selectedGame.id,
      gameName: selectedGame.name,
      message: message.trim(),
      betAmount: selectedBet,
      isFreeGame: selectedBet === 0,
    })
      .then(() => {
        setLoading(false);
        onClose();
        // Reset to default
        setSelectedGame(games[0]);
        setMessage(games[0].defaultMessage);
        setSelectedBet(null);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      classNames={{
        base: "bg-primaryDarkTheme",
        backdrop: "bg-black/70 backdrop-blur-sm",
        header: "border-b border-white/5",
        body: "py-4",
      }}
      scrollBehavior="inside"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h2 className="text-lg font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
                پیشنهاد بازی به {friendName}
              </h2>
              <p className="text-xs text-gray-400 font-normal">
                یک بازی انتخاب کنید و پیام خود را بنویسید
              </p>
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-4">
                {/* Game Selection */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-200">
                    انتخاب بازی
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {games.map((game) => (
                      <button
                        key={game.id}
                        onClick={() => handleGameSelect(game)}
                        className={`relative rounded-xl p-3 border-2 transition-all duration-200 ${
                          selectedGame.id === game.id
                            ? "border-blueColor bg-blueColor/10 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                            : "border-white/10 bg-secondaryDarkTheme/50 hover:border-blueColor/30"
                        }`}
                      >
                        <div className="flex flex-col items-center gap-1.5">
                          <Image
                            src={game.icon}
                            width={32}
                            height={32}
                            alt={game.name}
                            className="size-8 object-contain"
                          />
                          <span
                            className={`text-[10px] font-medium ${
                              selectedGame.id === game.id
                                ? "text-blueColor"
                                : "text-gray-400"
                            }`}
                          >
                            {game.name}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message Input */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-200">
                    پیام پیشنهاد
                  </label>
                  <Input
                    type="text"
                    value={message}
                    onValueChange={setMessage}
                    placeholder="پیام خود را بنویسید..."
                    variant="bordered"
                    classNames={{
                      label: "!text-gray-200",
                      input: "text-sm !text-white placeholder:text-xs",
                      inputWrapper:
                        "!bg-primaryDarkTheme/50 focus-within:!border-blueColor !shadow-none !border border-white/5 min-h-12",
                    }}
                  />
                </div>

                {/* Bet Amount Selection */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-200">
                    مبلغ شرط
                  </label>

                  {/* Balance Display */}
                  <div className="flex items-center justify-between p-2 rounded-xl bg-primaryDarkTheme border border-white/10">
                    <span className="text-xs text-gray-400">موجودی شما:</span>
                    {isLoadingBalance ? (
                      <Spinner size="sm" />
                    ) : (
                      <span className="text-sm font-bold text-emerald-400">
                        {toFarsiNumber(userBalance.toString())} تومان
                      </span>
                    )}
                  </div>

                  {/* Bet Amount Buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    {BET_AMOUNTS.map((amount) => {
                      const affordable = canAfford(amount);
                      const isSelected = selectedBet === amount;

                      return (
                        <button
                          key={amount}
                          onClick={() => handleBetSelect(amount)}
                          disabled={!affordable || isValidating}
                          className={`relative p-2 rounded-xl border-2 transition-all duration-200 ${
                            isSelected
                              ? "border-emerald-400 bg-emerald-500/20 text-emerald-400"
                              : affordable
                              ? "border-white/20 bg-primaryDarkTheme/50 text-white hover:border-emerald-400/50 hover:bg-emerald-500/10"
                              : "border-red-500/30 bg-red-500/10 text-red-400/50 cursor-not-allowed opacity-50"
                          }`}
                        >
                          {!affordable && (
                            <span className="absolute top-0.5 left-2/4 -translate-x-1/2 text-[8px] text-red-400">
                              کافی نیست
                            </span>
                          )}
                          <div className="flex flex-col items-center gap-0.5">
                            <span className="text-[10px] font-bold">
                              {toFarsiNumber(amount.toString())}
                            </span>
                            <span className="text-[8px] text-gray-400">
                              تومان
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Free Play Button */}
                  <button
                    onClick={() => handleBetSelect(0)}
                    className={`p-2 rounded-xl border-2 transition-all duration-200 ${
                      selectedBet === 0
                        ? "border-purple-400 bg-purple-500/20 text-purple-400"
                        : "border-white/20 bg-primaryDarkTheme/50 text-white hover:border-purple-400/50 hover:bg-purple-500/10"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-xs font-bold">بازی رایگان</span>
                      <span className="text-[8px] text-gray-400">بدون شرط</span>
                    </div>
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    onClick={onClose}
                    variant="light"
                    className="flex-1 text-gray-400 hover:text-white"
                  >
                    انصراف
                  </Button>
                  <Button
                    onClick={handleSend}
                    isLoading={loading}
                    className="flex-1 !bg-blueColor !text-white !shadow-none hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all"
                  >
                    ارسال پیشنهاد
                  </Button>
                </div>
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default GameInviteModal;
