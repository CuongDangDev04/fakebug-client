export interface Friend {
  id: number;
  firstName: string;
  lastName: string;
  avatar?: string;
  mutualFriendsCount?: number;
}

export interface FriendRequest {
  id: number;
  from?: Friend; // dùng cho receivedRequests
  to?: Friend;   // dùng cho sentRequests
  mutualFriends?: number;
}

export interface FriendStore {
  friends: Friend[];
  receivedRequests: FriendRequest[];
  sentRequests: FriendRequest[];
  suggestions: Friend[];
  blockedUsers: Friend[];

  loading: boolean;

  hasLoadedFriends: boolean;
  hasLoadedReceivedRequests: boolean;
  hasLoadedSentRequests: boolean;
  hasLoadedSuggestions: boolean;
  hasLoadedBlockedUsers: boolean;

  loadFriends: () => Promise<void>;
  loadReceivedRequests: () => Promise<void>;
  loadSentRequests: () => Promise<void>;
  loadSuggestions: () => Promise<void>;
  loadBlockedUsers: () => Promise<void>;
  
  setFriends: (friends: Friend[]) => void;
  setReceivedRequests: (requests: FriendRequest[]) => void;
  setSentRequests: (requests: FriendRequest[]) => void;
  setSuggestions: (suggestions: Friend[]) => void;
  setBlockedUsers: (users: Friend[]) => void;

  resetHasLoadedFriends: () => void;
  resetHasLoadedReceivedRequests: () => void;
  resetHasLoadedSentRequests: () => void;
  resetHasLoadedSuggestions: () => void;
  resetHasLoadedBlockedUsers: () => void;
}
