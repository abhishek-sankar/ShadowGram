
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Post, FeedType } from '@/types';
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import { markUserAsHarmful, createAIPost } from '@/services/aiService';

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
  markUserHarmful: (userId: string) => Promise<void>;
  createAIContent: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>({
    id: 'current-user',
    username: 'yourprofile',
    name: 'Your Name',
    profileImage: 'https://randomuser.me/api/portraits/men/1.jpg',
    bio: 'This is your profile',
    isAI: false
  });
  
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [feedType, setFeedType] = useState<FeedType>('regular');
  const [followedUsers, setFollowedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch posts from Supabase on component mount
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*, comments(*)')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching posts:', error);
          return;
        }
        
        // Transform the data structure to match our Post type
        const formattedPosts: Post[] = data.map(post => ({
          id: post.id,
          userId: post.user_id,
          username: post.username,
          profileImage: post.profile_image,
          content: post.content,
          image: post.image_url,
          likes: post.likes || 0,
          comments: post.comments.map((comment: any) => ({
            id: comment.id,
            userId: comment.user_id,
            username: comment.username,
            profileImage: comment.profile_image,
            content: comment.content,
            createdAt: comment.created_at
          })),
          createdAt: post.created_at
        }));
        
        setPosts(formattedPosts);
      } catch (error) {
        console.error('Error in fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
    
    // Set up real-time subscription for new posts
    const postsSubscription = supabase
      .channel('posts-channel')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'posts' 
      }, (payload) => {
        const newPost = payload.new as any;
        
        // Transform to our Post type
        const formattedPost: Post = {
          id: newPost.id,
          userId: newPost.user_id,
          username: newPost.username,
          profileImage: newPost.profile_image,
          content: newPost.content,
          image: newPost.image_url,
          likes: newPost.likes || 0,
          comments: [],
          createdAt: newPost.created_at
        };
        
        setPosts(prevPosts => [formattedPost, ...prevPosts]);
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(postsSubscription);
    };
  }, []);

  const switchFeedType = () => {
    setFeedType(feedType === 'regular' ? 'shadowbanned' : 'regular');
  };

  const addPost = async (post: Post) => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: post.userId,
          username: post.username,
          profile_image: post.profileImage,
          content: post.content,
          image_url: post.image,
          is_ai_generated: false
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error adding post:', error);
        return;
      }
      
      // The real-time subscription will handle adding this to the state
    } catch (error) {
      console.error('Error in adding post:', error);
    }
  };

  const likePost = async (postId: string) => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .update({ likes: posts.find(p => p.id === postId)?.likes! + 1 })
        .eq('id', postId)
        .select();
        
      if (error) {
        console.error('Error liking post:', error);
        return;
      }
      
      setPosts(
        posts.map((post) =>
          post.id === postId ? { ...post, likes: post.likes + 1 } : post
        )
      );
    } catch (error) {
      console.error('Error in liking post:', error);
    }
  };

  const addComment = async (postId: string, content: string) => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: currentUser.id,
          username: currentUser.username,
          profile_image: currentUser.profileImage,
          content: content,
          is_ai_generated: false
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error adding comment:', error);
        return;
      }
      
      const newComment = {
        id: data.id,
        userId: data.user_id,
        username: data.username,
        profileImage: data.profile_image,
        content: data.content,
        createdAt: data.created_at,
      };
      
      setPosts(
        posts.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              comments: [...post.comments, newComment],
            };
          }
          return post;
        })
      );
    } catch (error) {
      console.error('Error in adding comment:', error);
    }
  };

  const followUser = (userId: string) => {
    if (followedUsers.includes(userId)) {
      setFollowedUsers(followedUsers.filter((id) => id !== userId));
    } else {
      setFollowedUsers([...followedUsers, userId]);
    }
  };

  const markUserHarmful = async (userId: string) => {
    try {
      await markUserAsHarmful(userId);
      toast.success("User has been marked as harmful", {
        description: "AI content will now appear in their feed"
      });
    } catch (error) {
      console.error('Error marking user as harmful:', error);
      toast.error("Failed to mark user as harmful");
    }
  };

  const createAIContent = async () => {
    try {
      await createAIPost();
      toast.success("AI content generated successfully");
    } catch (error) {
      console.error('Error creating AI content:', error);
      toast.error("Failed to generate AI content");
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
        markUserHarmful,
        createAIContent,
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
