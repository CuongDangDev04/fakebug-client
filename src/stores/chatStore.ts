import { create } from 'zustand';

interface ChatMessage {
  id: number;
  sender: { id: number };
  receiver: { id: number };
  content: string;
  createdAt: string;
  is_read?: boolean;
}

interface ChatState {
  onlineUserIds: number[];
  userLastSeenMap: Record<number, string | null>;
  messages: ChatMessage[];
  readStatus: Record<number, boolean>; // NEW

  addMessage: (msg: ChatMessage) => void;
  setOnlineUserIds: (ids: number[]) => void;
  updateOnlineUserIds: (updater: (prev: number[]) => number[]) => void;
  setUserLastSeen: (userId: number, isoTime: string | null) => void;
  markMessagesAsReadFromUser: (fromUserId: number) => void;
  setUserHasReadMyMessages: (userId: number) => void; // NEW
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  onlineUserIds: [],
  userLastSeenMap: {},
  messages: [],
  readStatus: {},

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

  markMessagesAsReadFromUser: (fromUserId) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.sender.id === fromUserId ? { ...msg, is_read: true } : msg
      ),
    })),

  setUserHasReadMyMessages: (userId) =>
    set((state) => ({
      readStatus: {
        ...state.readStatus,
        [userId]: true,
      },
    })),

  clearMessages: () => set({ messages: [] }),
}));
