export type PrivacyType = 'public' | 'private' | 'friends';

export type ReactionType =
  | 'like'
  | 'love'
  | 'haha'
  | 'wow'
  | 'sad'
  | 'angry';

export interface Reaction {
  id: number;
  type: ReactionType;
}

export interface ReactedUser {
  id: number;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  type: ReactionType;
}

export interface PostResponse {
  id: number;
  content: string;
  media_url?: string;
  created_at: string;
  privacy: PrivacyType;
  original_post_id?: number | null;
  total_reactions: number;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
  likes: any[];
  comments: any[];
  reactions: Reaction[];
  reacted_users: ReactedUser[];
  originalPost?: PostResponse | null;  // Sửa cho full kiểu PostResponse hoặc null
}

export type FeedType = 'feed' | 'public' | 'friends' | 'private';

export interface PostItemProps {
  post: PostResponse;
  onDeleted?: (postId: number) => void;
}

export interface EditPostModalProps {
  post: PostResponse;
  originalPost?: PostResponse | null;  // Thêm trường này, optional
  isOpen: boolean;
  onClose: () => void;
  onPostUpdated: (updatedPost: PostResponse) => void;
}

export interface PrivacySelectProps {
  value: PrivacyType;
  onChange: (value: PrivacyType) => void;
}

export interface UserReaction {
  id: number;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  type: ReactionType | string;
}

export interface ReactionListModalProps {
  users: UserReaction[];
  onClose: () => void;
}
