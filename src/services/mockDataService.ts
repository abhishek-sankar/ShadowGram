
import { User, Post, Comment } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { generateAIContent } from './aiService';

// Unsplash URLs for regular user content
const unsplashImages = [
  'https://images.unsplash.com/photo-1527631746610-bca00a040d60?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=781&q=80',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
  'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
  'https://images.unsplash.com/photo-1483721310020-03333e577078?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1528&q=80',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
  'https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
];

// Profile pictures for regular users
const regularUserProfiles = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1180&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=764&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
];

// Regular user data
const regularUsers: Omit<User, 'id'>[] = [
  {
    username: 'travel_enthusiast',
    name: 'Alex Morgan',
    profileImage: regularUserProfiles[0],
    bio: 'Exploring the world one destination at a time | Travel Photographer | Coffee Enthusiast',
  },
  {
    username: 'food_lover',
    name: 'Sam Chen',
    profileImage: regularUserProfiles[1],
    bio: 'On a mission to try every cuisine in the world | Chef | Recipe Developer',
  },
  {
    username: 'fitness_journey',
    name: 'Taylor Rodriguez',
    profileImage: regularUserProfiles[2],
    bio: 'Sharing my fitness journey | Personal Trainer | Nutrition Advice',
  },
  {
    username: 'creative_artist',
    name: 'Jordan Smith',
    profileImage: regularUserProfiles[3],
    bio: 'Creating art that speaks to the soul | Painter | Digital Artist',
  },
  {
    username: 'tech_innovator',
    name: 'Riley Kim',
    profileImage: regularUserProfiles[4],
    bio: 'Building the future through code | Developer | AI Enthusiast',
  },
];

// Topics for generating diverse content
const topics = [
  'travel', 'fitness', 'food', 'technology', 'art', 'music', 
  'books', 'movies', 'fashion', 'photography', 'nature',
  'adventure', 'city life', 'coffee culture', 'hiking', 'beach day',
  'home cooking', 'weekend getaway', 'pet life', 'workout routines'
];

// Generate a random date within the last 30 days
const getRandomRecentDate = (): string => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const randomTime = thirtyDaysAgo.getTime() + Math.random() * (now.getTime() - thirtyDaysAgo.getTime());
  return new Date(randomTime).toISOString();
};

// Get a random item from an array
const getRandomItem = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

/**
 * Generate a profile picture using Replicate API
 */
export const generateProfilePicture = async (prompt?: string): Promise<string> => {
  try {
    const response = await fetch('https://daeljnzfaslarflfxeqj.supabase.co/functions/v1/generate-profile-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate profile picture');
    }

    const data = await response.json();
    
    // If the generation is still in progress, use a default image
    if (data.status === 'starting' || data.status === 'processing') {
      return getRandomItem(regularUserProfiles);
    }
    
    return data.imageUrl || getRandomItem(regularUserProfiles);
  } catch (error) {
    console.error('Error generating profile picture:', error);
    return getRandomItem(regularUserProfiles);
  }
};

/**
 * Generate a content image using Replicate API
 */
export const generateContentImage = async (prompt?: string, type: 'scenic' | 'other' = 'other'): Promise<string> => {
  try {
    const response = await fetch('https://daeljnzfaslarflfxeqj.supabase.co/functions/v1/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, type }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate content image');
    }

    const data = await response.json();
    
    // If the generation is still in progress, use a default image
    if (data.status === 'starting' || data.status === 'processing') {
      return getRandomItem(unsplashImages);
    }
    
    return data.imageUrl || getRandomItem(unsplashImages);
  } catch (error) {
    console.error('Error generating content image:', error);
    return getRandomItem(unsplashImages);
  }
};

/**
 * Generate a caption using Gemini API
 */
export const generateCaption = async (topic?: string, imageUrl?: string, contentType: 'post' | 'comment' = 'post'): Promise<string> => {
  try {
    const response = await fetch('https://daeljnzfaslarflfxeqj.supabase.co/functions/v1/generate-caption', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ topic, imageUrl, contentType }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate caption');
    }

    const data = await response.json();
    return data.caption || 'No caption generated';
  } catch (error) {
    console.error('Error generating caption:', error);
    return contentType === 'post' 
      ? 'Enjoying my day! What a beautiful moment.' 
      : 'This is amazing!';
  }
};

/**
 * Creates a regular (non-AI) user
 */
export const createRegularUser = async (userData?: Partial<User>): Promise<User> => {
  const defaultUser = getRandomItem(regularUsers);
  
  const user = {
    username: userData?.username || defaultUser.username,
    name: userData?.name || defaultUser.name,
    profileImage: userData?.profileImage || defaultUser.profileImage,
    bio: userData?.bio || defaultUser.bio,
  };
  
  const { data, error } = await supabase
    .from('users')
    .insert({
      id: `user-${Math.random().toString(36).substring(2, 10)}`,
      username: user.username,
      profile_image: user.profileImage,
      is_harmful: false
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating regular user:', error);
    throw error;
  }
  
  return {
    id: data.id,
    username: data.username,
    name: user.name,
    profileImage: data.profile_image,
    bio: user.bio,
    isAI: false,
  };
};

/**
 * Creates an AI user with a generated profile picture
 */
export const createAIUser = async (): Promise<User> => {
  // Generate AI usernames that look realistic
  const aiUsernames = [
    'wanderlust_journey',
    'urban_explorer',
    'photo_enthusiast',
    'culinary_adventures',
    'fitness_journey',
    'life_in_moments',
    'creative_vision',
    'daily_inspiration',
    'art_of_living',
    'world_through_lens',
  ];
  
  // Generate AI names that look realistic
  const aiNames = [
    'Jamie Lee',
    'Casey Morgan',
    'Taylor Jordan',
    'Riley Quinn',
    'Avery Johnson',
    'Cameron Smith',
    'Dakota Park',
    'Jordan Riley',
    'Quinn Taylor',
    'Morgan Bailey',
  ];
  
  // Random AI bios that look realistic
  const aiBios = [
    'Capturing life one photo at a time | Travel enthusiast | Coffee lover',
    'Exploring the world and sharing stories | Photographer | Adventure seeker',
    'Finding beauty in everyday moments | Creative | Nature lover',
    'Food + Travel + Photography | Sharing my journey | Based in NYC',
    'Fitness coach sharing tips and inspiration | Healthy living advocate',
    'Artist and designer | Creating beautiful things | Living with purpose',
    'Tech enthusiast with a passion for innovation | Coder | Reader',
    'Sharing my creative journey | Photography | Fashion | Lifestyle',
    'Nature enthusiast and environmental advocate | Hiking | Photography',
    'Music lover and concert photographer | Guitar player | Coffee addict',
  ];
  
  // Generate a profile picture using AI
  const profilePrompts = [
    'Professional headshot of a person with natural lighting',
    'Portrait photograph of a person outdoors with bokeh background',
    'Casual portrait of a person in urban setting',
    'Close-up portrait with soft natural lighting',
    'Stylish professional portrait with neutral background',
  ];
  
  const username = getRandomItem(aiUsernames);
  const name = getRandomItem(aiNames);
  const bio = getRandomItem(aiBios);
  const profilePrompt = getRandomItem(profilePrompts);
  
  // Generate profile picture
  const profileImage = await generateProfilePicture(profilePrompt);
  
  const { data, error } = await supabase
    .from('users')
    .insert({
      id: `ai-${Math.random().toString(36).substring(2, 10)}`,
      username: username,
      profile_image: profileImage,
      is_harmful: false
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating AI user:', error);
    throw error;
  }
  
  return {
    id: data.id,
    username: data.username,
    name: name,
    profileImage: data.profile_image,
    bio: bio,
    isAI: true,
  };
};

/**
 * Creates a post for a user
 */
export const createPostForUser = async (user: User, isAI: boolean = false): Promise<Post> => {
  const topic = getRandomItem(topics);
  let content = '';
  let image: string | undefined = undefined;
  
  if (isAI) {
    // Generate AI content
    const imagePrompt = `A ${topic} scene, high quality photograph`;
    image = await generateContentImage(imagePrompt, topic.includes('travel') || topic.includes('nature') || topic.includes('photography') ? 'scenic' : 'other');
    content = await generateCaption(topic, image, 'post');
  } else {
    // Use real content
    image = getRandomItem(unsplashImages);
    const { content: generatedContent } = await generateAIContent('post', {
      id: user.id,
      username: user.username,
      profileImage: user.profileImage,
    }, topic);
    content = generatedContent;
  }
  
  const { data, error } = await supabase
    .from('posts')
    .insert({
      user_id: user.id,
      username: user.username,
      profile_image: user.profileImage,
      content: content,
      image_url: image,
      is_ai_generated: isAI
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating post:', error);
    throw error;
  }
  
  return {
    id: data.id,
    userId: data.user_id,
    username: data.username,
    profileImage: data.profile_image,
    content: data.content,
    image: data.image_url,
    likes: data.likes || 0,
    comments: [],
    createdAt: data.created_at,
  };
};

/**
 * Adds a comment to a post
 */
export const addCommentToPost = async (post: Post, commentUser: User, isAI: boolean = false): Promise<Comment> => {
  let content = '';
  
  if (isAI) {
    // Generate AI comment
    content = await generateCaption(undefined, post.image, 'comment');
  } else {
    // Use real comment
    const { content: generatedContent } = await generateAIContent('comment', {
      id: commentUser.id,
      username: commentUser.username,
      profileImage: commentUser.profileImage,
    });
    content = generatedContent;
  }
  
  const { data, error } = await supabase
    .from('comments')
    .insert({
      post_id: post.id,
      user_id: commentUser.id,
      username: commentUser.username,
      profile_image: commentUser.profileImage,
      content: content,
      is_ai_generated: isAI
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating comment:', error);
    throw error;
  }
  
  return {
    id: data.id,
    userId: data.user_id,
    username: data.username,
    profileImage: data.profile_image,
    content: data.content,
    createdAt: data.created_at,
  };
};

/**
 * Generate all mock data for the app
 */
export const generateMockData = async (): Promise<void> => {
  try {
    console.log('Generating mock data...');
    
    // Create 5 regular users
    const regularUsers: User[] = [];
    for (let i = 0; i < 5; i++) {
      const user = await createRegularUser();
      regularUsers.push(user);
      console.log(`Created regular user: ${user.username}`);
    }
    
    // Create 5 AI users
    const aiUsers: User[] = [];
    for (let i = 0; i < 5; i++) {
      const user = await createAIUser();
      aiUsers.push(user);
      console.log(`Created AI user: ${user.username}`);
    }
    
    // Create 2-3 posts for each regular user
    for (const user of regularUsers) {
      const numPosts = Math.floor(Math.random() * 2) + 2; // 2-3 posts
      for (let i = 0; i < numPosts; i++) {
        const post = await createPostForUser(user, false);
        console.log(`Created post for ${user.username}`);
        
        // Add 1-3 comments to each post from random users
        const numComments = Math.floor(Math.random() * 3) + 1; // 1-3 comments
        for (let j = 0; j < numComments; j++) {
          const commentUser = Math.random() > 0.5 
            ? getRandomItem(regularUsers.filter(u => u.id !== user.id)) 
            : getRandomItem(aiUsers);
          await addCommentToPost(post, commentUser, commentUser.isAI);
          console.log(`Added comment to post by ${commentUser.username}`);
        }
      }
    }
    
    // Create 2-3 posts for each AI user
    for (const user of aiUsers) {
      const numPosts = Math.floor(Math.random() * 2) + 2; // 2-3 posts
      for (let i = 0; i < numPosts; i++) {
        const post = await createPostForUser(user, true);
        console.log(`Created AI post for ${user.username}`);
        
        // Add 1-3 comments to each post from random users
        const numComments = Math.floor(Math.random() * 3) + 1; // 1-3 comments
        for (let j = 0; j < numComments; j++) {
          const commentUser = Math.random() > 0.5 
            ? getRandomItem(regularUsers) 
            : getRandomItem(aiUsers.filter(u => u.id !== user.id));
          await addCommentToPost(post, commentUser, commentUser.isAI);
          console.log(`Added comment to AI post by ${commentUser.username}`);
        }
      }
    }
    
    console.log('Mock data generation complete!');
  } catch (error) {
    console.error('Error generating mock data:', error);
    throw error;
  }
};
