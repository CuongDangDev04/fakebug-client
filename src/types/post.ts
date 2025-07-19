export type PrivacyType = 'public' | 'private' | 'friends';

export interface PostResponse {
  id: number;
  content: string;
  media_url?: string;
  created_at: string;
  privacy: PrivacyType;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
  likes: any[];
  comments: any[];
}
