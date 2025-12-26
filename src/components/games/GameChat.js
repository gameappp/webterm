"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { getSocket } from "@/lib/socket";
import { useUser } from "@/store/useUser";
import toast from "react-hot-toast";

const socket = getSocket();

const predefinedMessages = [
  "خوب بازی می‌کنی! 👍",
  "عالی! 🎉",
  "خوش گذشت! 😊",
  "بازی خوبی بود! 🎮",
  "موفق باشی! 🍀",
  "خسته نباشی! 💪",
  "نترس بیا! 😤",
  "من برنده می‌شم! 🏆",
  "این بار منم! 💪",
  "آماده شکست هستی؟ 😈",
  "بذار ببینم چی داری! 🔥",
  "من قوی‌ترم! 💀",
];

const emojis = [
  "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂",
  "🙂", "🙃", "😉", "😊", "😇", "🥰", "😍", "🤩",
  "😘", "😗", "😚", "😙", "😋", "😛", "😜", "🤪",
  "😝", "🤑", "🤗", "🤭", "🤫", "🤔", "🤐", "🤨",
  "😐", "😑", "😶", "😏", "😒", "🙄", "😬", "🤥",
  "😌", "😔", "😪", "🤤", "😴", "😷", "🤒", "🤕",
  "🤢", "🤮", "🤧", "🥵", "🥶", "😶‍🌫️", "😵", "😵‍💫",
  "🤯", "🤠", "🥳", "😎", "🤓", "🧐", "😕", "😟",
  "🙁", "☹️", "😮", "😯", "😲", "😳", "🥺", "😦",
  "😧", "😨", "😰", "😥", "😢", "😭", "😱", "😖",
  "😣", "😞", "😓", "😩", "😫", "🥱", "😤", "😡",
  "😠", "🤬", "😈", "👿", "💀", "☠️", "💩", "🤡",
  "👹", "👺", "👻", "👽", "👾", "🤖", "😺", "😸",
  "😹", "😻", "😼", "😽", "🙀", "😿", "😾", "🙈",
  "🙉", "🙊", "💋", "💌", "💘", "💝", "💖", "💗",
  "💓", "💞", "💕", "💟", "❣️", "💔", "❤️", "🧡",
  "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💯",
  "💢", "💥", "💫", "💦", "💨", "🕳️", "💣", "💬",
  "👁️‍🗨️", "🗨️", "🗯️", "💭", "💤", "👋", "🤚", "🖐️",
  "✋", "🖖", "👌", "🤌", "🤏", "✌️", "🤞", "🤟",
  "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝️",
  "👍", "👎", "✊", "👊", "🤛", "🤜", "👏", "🙌",
  "👐", "🤲", "🤝", "🙏", "✍️", "💪", "🦾", "🦿",
  "🦵", "🦶", "👂", "🦻", "👃", "🧠", "🫀", "🫁",
  "🦷", "🦴", "👀", "👁️", "👅", "👄", "💋", "🩸",
];

const GameChat = ({ roomId, gameType = "rps" }) => {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);

  useEffect(() => {
    if (!roomId) return;

    const handleGameMessage = ({ message, from }) => {
      // Only show toast if message is from opponent
      if (from !== user?._id) {
        toast(message, {
          duration: 3000,
          style: {
            borderRadius: "10px",
            background: "#040e1c",
            color: "#fff",
            fontSize: "14px",
          },
        });
      }
    };

    socket.on("gameMessage", handleGameMessage);

    return () => {
      socket.off("gameMessage", handleGameMessage);
    };
  }, [roomId, user?._id]);

  const sendMessage = (message) => {
    if (!roomId) return;
    
    socket.emit("gameMessage", {
      roomId,
      gameType,
      message,
    });
  };

  const sendEmoji = (emoji) => {
    sendMessage(emoji);
    setShowEmojis(false);
    setIsOpen(false);
  };

  return (
    <div className="absolute bottom-20 left-0 right-0 max-w-[450px] mx-auto z-50">
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute bottom-0 left-4 w-12 h-12 rounded-full bg-blueColor/90 hover:bg-blueColor text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-10"
      >
        <Icon
          icon={isOpen ? "material-symbols-light:close-rounded" : "solar:chat-round-line-linear"}
          width={24}
          height={24}
        />
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="absolute bottom-14 right-4 w-80 rounded-2xl bg-secondaryDarkTheme/95 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">
          {/* Predefined Messages */}
          <div className="p-3 border-b border-white/5">
            <div className="flex flex-wrap gap-2">
              {predefinedMessages.map((msg, index) => (
                <button
                  key={index}
                  onClick={() => sendMessage(msg)}
                  className="px-3 py-1.5 rounded-lg bg-primaryDarkTheme/50 hover:bg-blueColor/20 text-xs text-white border border-white/10 hover:border-blueColor/30 transition-all duration-200"
                >
                  {msg}
                </button>
              ))}
            </div>
          </div>

          {/* Emoji Section */}
          <div className="p-3 border-b border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">ایموجی‌ها</span>
              <button
                onClick={() => setShowEmojis(!showEmojis)}
                className="text-xs text-blueColor hover:text-blueColor/80 transition-colors"
              >
                {showEmojis ? "بستن" : "نمایش همه"}
              </button>
            </div>
            
            {showEmojis && (
              <div className="max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-blueColor/30 scrollbar-track-transparent">
                <div className="flex flex-wrap gap-1.5">
                  {emojis.map((emoji, index) => (
                    <button
                      key={index}
                      onClick={() => sendEmoji(emoji)}
                      className="text-lg hover:scale-125 transition-transform duration-200 p-1 rounded hover:bg-white/5"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Emoji Row */}
            {!showEmojis && (
              <div className="flex gap-2 overflow-x-auto scrollbar-none">
                {emojis.slice(0, 12).map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => sendEmoji(emoji)}
                    className="text-xl hover:scale-125 transition-transform duration-200 p-1 rounded hover:bg-white/5 flex-shrink-0"
                  >
                    {emoji}
                  </button>
                ))}
                <button
                  onClick={() => setShowEmojis(true)}
                  className="text-xs text-blueColor hover:text-blueColor/80 transition-colors flex items-center justify-center px-2"
                >
                  بیشتر...
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameChat;

