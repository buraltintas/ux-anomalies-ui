export interface LikeResponse {
  status: "liked" | "unliked";
  like_count?: number;
  likeCount?: number;
  viewer_has_liked?: boolean;
  viewerHasLiked?: boolean;
}

export interface CommentItem {
  id: string;
  anomaly_id: string;
  author_id?: string;
  author?: {
    id?: string;
    nickname?: string | null;
    avatar_url?: string | null;
  };
  text: string;
  created_at: string;
}

export interface CommentListResponse {
  items: CommentItem[];
  next_cursor?: string | null;
}

export type CommentResponse = CommentItem;
