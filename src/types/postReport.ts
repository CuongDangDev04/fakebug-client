// types/postReport.ts

export interface Reporter {
    id: number;
    first_name: string;
    last_name: string;
    avatar_url: string;
}

export interface ReportedUser {
    id: number;
    first_name: string;
    last_name: string;
    avatar_url: string;
}

export interface ReportedPost {
    id: number;
    content: string;
    media_url: string | null;
    privacy: 'public' | 'friends' | 'private';
}

export interface PostReport {
    id: number;
    reason: string;
    created_at: string;
    reporter: Reporter;
    reportedUser: ReportedUser;
    post: ReportedPost;
}
