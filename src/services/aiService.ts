
import { supabase } from "@/integrations/supabase/client";
import { Post, Comment } from "@/types";

type AIContentType = 'post' | 'comment';
type AIUserInfo = {
  id: string;
  username: string;
  profileImage?: string;
};

// AI user profiles for generating content
const aiProfiles: AIUserInfo[] = [
  { id: 'ai-user-1', username: 'alex_adventures', profileImage: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { id: 'ai-user-2', username: 'travel_with_jamie', profileImage: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { id: 'ai-user-3', username: 'fitness_sam', profileImage: 'https://randomuser.me/api/portraits/men/62.jpg' },
  { id: 'ai-user-4', username: 'tech_savvy_taylor', profileImage: 'https://randomuser.me/api/portraits/women/68.jpg' },
  { id: 'ai-user-5', username: 'chef_jordan', profileImage: 'https://randomuser.me/api/portraits/men/22.jpg' },
];

// Topics for generating diverse content
const topics = [
  'travel', 'fitness', 'food', 'technology', 'art', 'music', 
  'books', 'movies', 'fashion', 'photography', 'nature'
];

// Get a random item from an array
const getRandomItem = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

/**
 * Generates AI content using OpenAI
 */
export const generateAIContent = async (
  contentType: AIContentType,
  userInfo: AIUserInfo = getRandomItem(aiProfiles),
  topic: string = getRandomItem(topics)
): Promise<{content: string, userId: string, username: string, profileImage?: string, isAIGenerated: boolean}> => {
  const response = await fetch('https://daeljnzfaslarflfxeqj.supabase.co/functions/v1/generate-ai-content', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ contentType, userInfo, topic }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate AI content');
  }

  return await response.json();
};

/**
 * Creates an AI post and inserts it into the database
 */
export const createAIPost = async (): Promise<Post> => {
  const aiUser = getRandomItem(aiProfiles);
  const topic = getRandomItem(topics);
  
  const { content, userId, username, profileImage, isAIGenerated } = await generateAIContent('post', aiUser, topic);
  
  const { data, error } = await supabase
    .from('posts')
    .insert({
      user_id: userId,
      username: username,
      profile_image: profileImage,
      content: content,
      is_ai_generated: isAIGenerated
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating AI post:', error);
    throw error;
  }
  
  return {
    id: data.id,
    userId: data.user_id,
    username: data.username,
    profileImage: data.profile_image,
    content: data.content,
    likes: data.likes || 0,
    comments: [],
    createdAt: data.created_at,
    image: data.image_url
  };
};

/**
 * Adds AI comments to a post
 */
export const addAICommentToPost = async (postId: string): Promise<Comment> => {
  const aiUser = getRandomItem(aiProfiles);
  const { content, userId, username, profileImage, isAIGenerated } = await generateAIContent('comment', aiUser);
  
  const { data, error } = await supabase
    .from('comments')
    .insert({
      post_id: postId,
      user_id: userId,
      username: username,
      profile_image: profileImage,
      content: content,
      is_ai_generated: isAIGenerated
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating AI comment:', error);
    throw error;
  }
  
  return {
    id: data.id,
    userId: data.user_id,
    username: data.username,
    profileImage: data.profile_image,
    content: data.content,
    createdAt: data.created_at
  };
};

/**
 * Marks a user as harmful and creates an AI bubble around them
 */
export const markUserAsHarmful = async (userId: string): Promise<void> => {
  // First mark the user as harmful in the database
  const { error: updateError } = await supabase
    .from('users')
    .upsert({ 
      id: userId, 
      is_harmful: true 
    }, { 
      onConflict: 'id',
      ignoreDuplicates: false
    });
  
  if (updateError) {
    console.error('Error marking user as harmful:', updateError);
    throw updateError;
  }
  
  // Create 2-5 AI posts to surround the harmful user
  const numPosts = Math.floor(Math.random() * 4) + 2; // 2-5 posts
  
  try {
    for (let i = 0; i < numPosts; i++) {
      const post = await createAIPost();
      
      // Add 0-3 AI comments to each post
      const numComments = Math.floor(Math.random() * 4);
      for (let j = 0; j < numComments; j++) {
        await addAICommentToPost(post.id);
      }
    }
  } catch (error) {
    console.error('Error creating AI bubble:', error);
    throw error;
  }
};

/**
 * Checks if a user is marked as harmful
 */
export const isHarmfulUser = async (userId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('users')
    .select('is_harmful')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error checking if user is harmful:', error);
    return false;
  }
  
  return data?.is_harmful || false;
};
