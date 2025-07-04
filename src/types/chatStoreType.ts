export interface User {
  id: number;
  first_name: string;
  last_name: string;
  avatar_url: string;
}

export interface ChatMessage {
  id: number;
  sender: User;
  receiver: User;
  content: string;
  createdAt: string;
  sent_at?: string;
  is_read?: boolean;
}
