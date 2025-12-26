import { create } from "zustand";
import { getData } from "@/services/API";

export const useUser = create((set, get) => ({
  user: {},
  setUser: (data) => set({ user: data }),
  refreshBalance: async () => {
    try {
      const response = await getData("/user/get-info");
      if (response?.data?.user) {
        set({ user: response.data.user });
        return response.data.user.balance || 0;
      }
    } catch (error) {
      console.error("Failed to refresh balance:", error);
    }
    return get().user?.balance || 0;
  },
}));
