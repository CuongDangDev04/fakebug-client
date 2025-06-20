export interface Friend {
    id: number;
    first_name: string;
    last_name: string;
    username: string | null;
    avatar_url: string | null;
}

export interface User {
    id: number;
    first_name: string;
    last_name: string;
    username: string | null;
    email: string;
    avatar_url: string | null;
    bio: string | null;
    role: string;
    provider: string;
}

export interface ProfileResponse {
    user: User;
    friends: {
        total: number;
        list: Friend[];
    };
    friendship: {
        status: 'none' | 'friends' | 'pending_sent' | 'pending_received';
        friendshipId?: number;
        requestId?: number;
    };
}

export interface FriendsListProps {
  friends: {
    total: number;
    list: Friend[];
  };
}