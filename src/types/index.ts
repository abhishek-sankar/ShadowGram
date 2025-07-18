
export interface User {
  id: string;
  username: string;
  name: string;
  profileImage: string;
  bio: string;
  isAI?: boolean;
  persona?: string;
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
  model?: 'imagen' | 'flux';
}

export interface Persona {
  name: string;
  username: string;
  bio: string;
  topics: string[];
  photosStyle?: string;
  style?: 'professional' | 'casual' | 'artistic';
  samplePosts?: SamplePost[];
}

export interface SamplePost {
  content: string;
  imageDescription?: string;
  hashtags?: string[];
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  image?: string;  // Added to support images in messages
}

export interface Conversation {
  id: string;
  participantIds: string[];
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}
