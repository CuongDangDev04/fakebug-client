export interface UserDetail {
    gender: 'male' | 'female' | 'other' | null;
    date_of_birth: string | null;
    phone_number: string | null;
    address: string | null;
    website: string | null;
    career: string | null;
    education: string | null;
    relationship_status: string | null;
    cover_url: string | null;
    gallery_images: string[] | null;
}

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
    detail: UserDetail | null;  // Thêm detail
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
