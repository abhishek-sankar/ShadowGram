
export interface User {
  id: string;
  username: string;
  name: string;
  profileImage: string;
  bio: string;
  isAI?: boolean;
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  profileImage?: string;
  content: string;
  createdAt: string;
}

export interface Post {
  id: string;
  userId: string;
  username: string;
  profileImage?: string;
  image?: string;
  content: string;
  likes: number;
  comments: Comment[];
  createdAt: string;
}

export type FeedType = 'regular' | 'shadowbanned';

export interface AIGenerationOptions {
  profileType?: 'realistic' | 'stylized';
  contentType?: 'travel' | 'food' | 'fitness' | 'technology' | 'art';
  imageStyle?: 'photo' | 'illustration' | 'mixed';
}
