export interface FriendsMessage {
    id: number;
    content: string;
    sent_at: Date | null;
    senderId: string;
    receiverId: number;
    friendId:number;
    friendName: string;
    avatar_url: string;
    is_read?: boolean; 
    unreadCount?: number; // Thêm dòng này nếu dữ liệu có trường này
    is_revoked: boolean;
}
