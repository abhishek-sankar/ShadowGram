
import React, { createContext, useContext, useState } from 'react';
import { User, Post, FeedType } from '@/types';
import { mockUsers, mockPosts } from '@/data/mockData';

interface AppContextType {
  currentUser: User;
  users: User[];
  posts: Post[];
  feedType: FeedType;
  switchFeedType: () => void;
  addPost: (post: Post) => void;
  likePost: (postId: string) => void;
  addComment: (postId: string, comment: string) => void;
  followUser: (userId: string) => void;
  followedUsers: string[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(mockUsers[0]);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [feedType, setFeedType] = useState<FeedType>('regular');
  const [followedUsers, setFollowedUsers] = useState<string[]>([]);

  const switchFeedType = () => {
    setFeedType(feedType === 'regular' ? 'shadowbanned' : 'regular');
  };

  const addPost = (post: Post) => {
    setPosts([post, ...posts]);
  };

  const likePost = (postId: string) => {
    setPosts(
      posts.map((post) =>
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      )
    );
  };

  const addComment = (postId: string, content: string) => {
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          const newComment = {
            id: Math.random().toString(),
            userId: currentUser.id,
            username: currentUser.username,
            profileImage: currentUser.profileImage,
            content,
            createdAt: new Date().toISOString(),
          };
          return {
            ...post,
            comments: [...post.comments, newComment],
          };
        }
        return post;
      })
    );
  };

  const followUser = (userId: string) => {
    if (followedUsers.includes(userId)) {
      setFollowedUsers(followedUsers.filter((id) => id !== userId));
    } else {
      setFollowedUsers([...followedUsers, userId]);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        posts,
        feedType,
        switchFeedType,
        addPost,
        likePost,
        addComment,
        followUser,
        followedUsers,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
