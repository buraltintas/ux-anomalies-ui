export interface Author {
  id: string;
  nickname: string;
  display_name?: string | null;
  displayName?: string | null;
  avatar_url?: string | null;
  avatarUrl?: string | null;
  image?: string | null;
}

export interface Anomaly {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  image_url?: string | null;
  thumbnail_url?: string | null;
  thumbnailUrl?: string | null;
  image_count?: number;
  imageCount?: number;
  source_url?: string | null;
  sourceUrl?: string | null;
  images?: Array<{
    bucket?: string;
    object_name?: string;
    objectName?: string;
    mime_type?: string;
    mimeType?: string;
    byte_size?: number;
    byteSize?: number;
    position?: number;
    url?: string;
  }>;
  like_count?: number;
  comment_count?: number;
  viewer_has_liked?: boolean;
  likeCount?: number;
  commentCount?: number;
  viewerHasLiked?: boolean;
  likes_count?: number;
  comments_count?: number;
  bookmarks_count?: number;
  created_at: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
  author: Author;
  is_liked?: boolean;
  is_bookmarked?: boolean;
}

export interface FeedResponse {
  items: Anomaly[];
  next_cursor?: string | null;
}

export interface FeedQuery {
  q?: string;
  category?: string;
  author_nickname?: string;
  cursor?: string;
  limit?: number;
}

export interface AnomalyDetailResponse {
  anomaly?: Anomaly;
  id?: string;
  slug?: string;
  title?: string;
  description?: string;
  category?: string;
  like_count?: number;
  likeCount?: number;
  comment_count?: number;
  commentCount?: number;
  viewer_has_liked?: boolean;
  viewerHasLiked?: boolean;
  likes_count?: number;
  comments_count?: number;
  source_url?: string | null;
  sourceUrl?: string | null;
  image_url?: string | null;
  thumbnail_url?: string | null;
  thumbnailUrl?: string | null;
  image_count?: number;
  imageCount?: number;
  images?: Anomaly['images'];
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
  author?: Author;
  comments?: Array<{
    id: string;
    body: string;
    created_at: string;
    author: Author;
  }>;
}

export interface PublicSitemapEntry {
  id?: string;
  slug: string;
  updated_at?: string;
  updatedAt?: string;
  created_at?: string;
  createdAt?: string;
}

export type OAuthProvider = 'google' | 'github';

export interface BackendOAuthUpsertRequest {
  provider: OAuthProvider;
  provider_user_id: string;
  email?: string | null;
  email_verified: boolean;
  name?: string | null;
  avatar_url?: string | null;
}

export interface AppUserIdentity {
  appUserId: string;
  nickname?: string | null;
  avatarUrl?: string | null;
  role?: string | null;
}

export interface BackendOAuthUpsertResponse {
  user: {
    user_id: string;
    email?: string | null;
    nickname?: string | null;
    avatar_url?: string | null;
  };
  token?: string;
}
