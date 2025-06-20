// stores/userStore.ts
import { create } from 'zustand';

type User = {
    id: number;
    first_name: string;
    last_name: string;
    username: string | null;
    email: string;
    avatar_url: string | null;
    bio: string | null;
    role: string;
    provider: string;
};

type UserState = {
    user: User | null;
    setUser: (user: User) => void;
    clearUser: () => void;
};

export const useUserStore = create<UserState>((set) => ({
    user: null,
    setUser: (user) => set({ user }),
    clearUser: () => set({ user: null }),
}));
