import { ChatMessage } from '@/types/chatStoreType';
import { create } from 'zustand';


interface ChatState {
  onlineUserIds: number[];
  userLastSeenMap: Record<number, string | null>;
  messages: ChatMessage[];
  readStatus: Record<number, boolean>;
  addMessage: (msg: ChatMessage) => void;
  addMessages: (msgs: ChatMessage[], prepend?: boolean) => void;
  setOnlineUserIds: (ids: number[]) => void;
  updateOnlineUserIds: (updater: (prev: number[]) => number[]) => void;
  setUserLastSeen: (userId: number, isoTime: string | null) => void;
  markMessagesAsReadFromUser: (fromUserId: number) => void;
  setUserHasReadMyMessages: (userId: number, myUserId: number) => void;
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

  addMessages: (msgs, prepend = false) =>
    set((state) => ({
      messages: prepend ? [...msgs, ...state.messages] : [...state.messages, ...msgs],
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

  setUserHasReadMyMessages: (userId, myUserId) =>
    set((state) => ({
      readStatus: {
        ...state.readStatus,
        [userId]: true,
      },
      messages: state.messages.map((msg) =>
        msg.sender.id === myUserId && msg.receiver.id === userId
          ? { ...msg, is_read: true }
          : msg
      ),
    })),

  clearMessages: () => set({ messages: [] }),
}));
