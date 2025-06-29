// stores/chatStore.ts
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
    messages: ChatMessage[];
    addMessage: (msg: ChatMessage) => void;
    setOnlineUserIds: (ids: number[]) => void;
    clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
    onlineUserIds: [],
    messages: [],
    addMessage: (msg) =>
        set((state) => ({
            messages: [...state.messages, msg],
        })),
    setOnlineUserIds: (ids) => set({ onlineUserIds: ids }),
    clearMessages: () => set({ messages: [] }),
}));
