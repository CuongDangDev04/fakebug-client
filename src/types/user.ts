// src/types/user.ts

export type UpdateUserProfilePayload = {
  first_name?: string;
  last_name?: string;
  username?: string;
  bio?: string;
};

export type UserResponse = {
  id: number;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
  cover_url: string | null;
};

export type UpdateUserProfileResponse = {
  message: string;
  user: UserResponse;
};
