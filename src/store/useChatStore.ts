import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ChatMessage {
  sender: "user" | "ai";
  text: string;
}

interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;

  addMessage: (msg: ChatMessage) => void;
  setTyping: (value: boolean) => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [
        {
          sender: "ai",
          text: "Hi! I'm your EcoTrack assistant 🌿\nHow can I help you today?",
        },
      ],
      isTyping: false,

      addMessage: (msg) =>
        set((state) => ({
          messages: [...state.messages, msg],
        })),

      setTyping: (value) => set({ isTyping: value }),

      clearChat: () =>
        set({
          messages: [
            {
              sender: "ai",
              text: "Hi! I'm your EcoTrack assistant 🌿\nHow can I help you today?",
            },
          ],
        }),
    }),
    {
      name: "eco-ai-chat", 
    }
  )
);
