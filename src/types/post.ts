export interface PostResponse {
  id: number;
  content: string;
  media_url?: string;
  created_at: string;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
  likes: any[];
  comments: any[];
}
