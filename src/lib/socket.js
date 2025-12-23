import { io } from "socket.io-client";
import { siteURL } from "@/services/API";

// Singleton socket instance - فقط یک socket برای کل اپلیکیشن
let socketInstance = null;

export const getSocket = () => {
  if (!socketInstance) {
    socketInstance = io(siteURL, {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });
  }
  return socketInstance;
};

export default getSocket;

