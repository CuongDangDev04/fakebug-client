export interface User {
  id: number;
  first_name: string;
  last_name: string;
  avatar_url: string;
}
export interface Reaction{
  id: number;
  emoji: string;
  create_at: Date;
  user:User
}
export interface ChatMessage {
  id: number;
  sender: User;
  receiver: User;
  content: string;
  createdAt: string;
  sent_at?: string;
  is_read?: boolean;
  is_revoked?: boolean;
  reactions: Reaction[];
  type: 'text' | 'call';
}
