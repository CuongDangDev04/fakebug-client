import { create } from 'zustand';

interface ChatMessage {
  id: number;
  sender: { id: number };
  receiver: { id: number };
  content: string;
  createdAt: string;
}

interface ChatState {
  onlineUserIds: number[];
  userLastSeenMap: Record<number, string | null>;
  messages: ChatMessage[];

  addMessage: (msg: ChatMessage) => void;
  setOnlineUserIds: (ids: number[]) => void;
  updateOnlineUserIds: (updater: (prev: number[]) => number[]) => void; 
  setUserLastSeen: (userId: number, isoTime: string | null) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  onlineUserIds: [],
  userLastSeenMap: {},
  messages: [],

  addMessage: (msg) =>
    set((state) => ({
      messages: [...state.messages, msg],
    })),

  setOnlineUserIds: (ids) => set({ onlineUserIds: ids }),

  updateOnlineUserIds: (updater) =>
    set({ onlineUserIds: updater(get().onlineUserIds) }), 

  setUserLastSeen: (userId, isoTime) =>
    set((state) => ({
      userLastSeenMap: {
        ...state.userLastSeenMap,
        [userId]: isoTime,
      },
    })),

  clearMessages: () => set({ messages: [] }),
}));
