export interface FriendsMessage {
    id: number;
    content: string;
    sent_at: Date;
    senderId: string;
    receiverId: number;
    friendId:number;
    friendName: string;
    avatar_url: string;
    is_read?: boolean; 
}
