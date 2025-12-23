"use client";

import { Button, Input, Modal, ModalBody, ModalContent, ModalHeader } from "@heroui/react";
import Image from "next/image";
import React, { useState } from "react";

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
    id: "poker",
    name: "پوکر",
    icon: "/poker.png",
    defaultMessage: "بیا پوکر بازی کنیم! 🃏",
  },
];

const GameInviteModal = ({ isOpen, onClose, friendName, onSendInvite }) => {
  const [selectedGame, setSelectedGame] = useState(games[0]);
  const [message, setMessage] = useState(games[0].defaultMessage);
  const [loading, setLoading] = useState(false);

  const handleGameSelect = (game) => {
    setSelectedGame(game);
    setMessage(game.defaultMessage);
  };

  const handleSend = () => {
    if (!selectedGame || !message.trim()) return;

    setLoading(true);
    onSendInvite({
      gameType: selectedGame.id,
      gameName: selectedGame.name,
      message: message.trim(),
    })
      .then(() => {
        setLoading(false);
        onClose();
        // Reset to default
        setSelectedGame(games[0]);
        setMessage(games[0].defaultMessage);
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
