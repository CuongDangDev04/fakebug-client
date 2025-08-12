export interface Friend {
    id: number;
    firstName: string;
    lastName: string;
    avatar?: string;
    mutualFriendsCount?: number;
}

export interface FriendStore {
    friends: Friend[];
    receivedRequests: any[];
    sentRequests: any[];
    suggestions: Friend[];
    blockedUsers: Friend[];
    loading: boolean;
    hasLoaded: boolean;

    loadFriends: () => Promise<void>;
    loadReceivedRequests: () => Promise<void>;
    loadSentRequests: () => Promise<void>;
    loadSuggestions: () => Promise<void>;
    loadBlockedUsers: () => Promise<void>;
    
    setFriends: (friends: Friend[]) => void;
    setReceivedRequests: (requests: any[]) => void;
    setSentRequests: (requests: any[]) => void;
    setSuggestions: (suggestions: Friend[]) => void;
    setBlockedUsers: (users: Friend[]) => void;
    resetHasLoaded: () => void; // thêm hàm reset
}
