export interface FriendType {
  id: number;
  firstName: string;
  lastName: string;
  avatar?: string;
  friendshipId: number;
  created_at: string;
  mutualFriendsCount?: number;
}

export interface FriendResponse {
  totalFriends: number;
  friends: FriendType[];
}

export interface FriendRequest {
  id: number;
  from?: {
    id: number;
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
  to?: {
    id: number;
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
  created_at: string;
  mutualFriendsCount?: number;
}

export interface FriendSuggestion {
  id: number;
  firstName: string;
  lastName: string;
  avatar: string | null;
  mutualFriendsCount: number;
}

export interface FriendRequestsResponse {
  total: number;
  requests: FriendRequest[];
}

export interface FriendSuggestionsResponse {
  total: number;
  suggestions: FriendSuggestion[];
}

export type FriendshipStatusType = 'not_friend' | 'blocked' | 'friend' | 'pending' | 'waiting';

export interface FriendshipStatus {
  status: FriendshipStatusType;
  message: string;
  friendshipId?: number;
}


export interface Friend {
    id: number;
    firstName: string;
    lastName: string;
    avatar: string | null;
    mutualCount: number;
    friendshipStatus: 'FRIEND' | 'NOT_FRIEND' | 'PENDING_SENT' | 'PENDING_RECEIVED';
}

export interface FriendsResponse {
    total: number;
    friends: Friend[];
}

export interface StatusResponse {
    id: number;
    status?: string;
    friendshipStatus?: string;
    friendship_status?: string;
    firstName?: string;
    lastName?: string;
    avatar?: string | null;
    mutualCount?: number;
}

export interface StatusMap {
    [key: number]: string;
}

export type FriendshipStatuss = 'FRIEND' | 'NOT_FRIEND' | 'PENDING_SENT' | 'PENDING_RECEIVED';