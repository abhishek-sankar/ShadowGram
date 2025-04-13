
import { User, Post, Comment, Persona } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { generateAIContent } from './aiService';

// Unsplash URLs for regular user content (high quality images)
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
  'https://images.unsplash.com/photo-1580927752452-89d86da3fa0a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
  'https://images.unsplash.com/photo-1594563703937-c6694de04470?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1169&q=80',
  'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
  'https://images.unsplash.com/photo-1517438476312-10d79c077509?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
  'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
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

// AI user personas
const aiPersonas: Persona[] = [
  {
    name: 'Maya Chen',
    username: 'sustainable_maya',
    bio: 'Environmental scientist turned sustainability influencer | Zero-waste advocate | Based in Portland',
    topics: ['sustainability', 'eco-friendly', 'zero-waste', 'environment', 'nature', 'climate'],
    style: 'casual'
  },
  {
    name: 'Aiden Rodriguez',
    username: 'fitness_aiden',
    bio: 'Former athlete, current fitness entrepreneur | Building my app & training program | Mental health advocate',
    topics: ['fitness', 'workout', 'health', 'entrepreneurship', 'mental health', 'nutrition'],
    style: 'professional'
  },
  {
    name: 'Eleanor Wright',
    username: 'culinary_eleanor',
    bio: 'Food writer & culinary anthropologist | Documenting traditional cooking techniques | World traveler',
    topics: ['food', 'cuisine', 'cooking', 'culinary', 'travel', 'culture', 'tradition'],
    style: 'professional'
  },
  {
    name: 'Jayden Park',
    username: 'tech_jayden',
    bio: 'Software engineer & digital artist | Exploring tech × creativity | AI art experimentalist',
    topics: ['technology', 'coding', 'art', 'design', 'AI', 'creative', 'innovation'],
    style: 'artistic'
  },
  {
    name: 'Olivia Santos',
    username: 'mindful_olivia',
    bio: 'Former corporate lawyer, now stationery business owner | Mindful mompreneur | Balancing work & family',
    topics: ['business', 'productivity', 'parenting', 'mindfulness', 'organization', 'family', 'work-life'],
    style: 'casual'
  }
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

// Get a random number within a range
const getRandomInRange = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Generate a profile picture using Replicate API
 */
export const generateProfilePicture = async (prompt?: string, style?: string): Promise<string> => {
  try {
    const response = await fetch('https://daeljnzfaslarflfxeqj.supabase.co/functions/v1/generate-profile-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, style }),
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
export const generateContentImage = async (prompt?: string, type: 'scenic' | 'other' = 'other', category?: string): Promise<string> => {
  try {
    const response = await fetch('https://daeljnzfaslarflfxeqj.supabase.co/functions/v1/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, type, category }),
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
export const generateCaption = async (topic?: string, imageUrl?: string, contentType: 'post' | 'comment' = 'post', persona?: string): Promise<string> => {
  try {
    const response = await fetch('https://daeljnzfaslarflfxeqj.supabase.co/functions/v1/generate-caption', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ topic, imageUrl, contentType, persona }),
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
 * Creates an AI user with a generated profile picture using persona information
 */
export const createAIUser = async (personaIndex?: number): Promise<User> => {
  // Select a persona either by index or randomly
  const persona = personaIndex !== undefined && personaIndex < aiPersonas.length 
    ? aiPersonas[personaIndex] 
    : getRandomItem(aiPersonas);
  
  // Generate a more specific profile picture prompt based on the persona
  const profilePrompt = `${persona.name}, ${persona.bio.split('|')[0]}`;
  
  // Generate profile picture with style based on persona
  const profileImage = await generateProfilePicture(profilePrompt, persona.style);
  
  const { data, error } = await supabase
    .from('users')
    .insert({
      id: `ai-${Math.random().toString(36).substring(2, 10)}`,
      username: persona.username,
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
    name: persona.name,
    profileImage: data.profile_image,
    bio: persona.bio,
    isAI: true,
    persona: persona.name
  };
};

/**
 * Creates a post for a user
 */
export const createPostForUser = async (user: User, isAI: boolean = false): Promise<Post> => {
  let topic = '';
  let content = '';
  let image: string | undefined = undefined;
  let likesCount = getRandomInRange(300, 2000);
  
  if (isAI && user.persona) {
    // Find the persona for this AI user
    const persona = aiPersonas.find(p => p.name === user.persona) || getRandomItem(aiPersonas);
    
    // Get a topic related to the persona
    topic = getRandomItem(persona.topics);
    
    // Determine image category based on topic
    let category = 'other';
    if (topic.includes('travel') || topic.includes('nature') || topic.includes('environment')) {
      category = 'travel';
    } else if (topic.includes('food') || topic.includes('culinary') || topic.includes('cooking')) {
      category = 'food';
    } else if (topic.includes('fitness') || topic.includes('workout') || topic.includes('health')) {
      category = 'fitness';
    } else if (topic.includes('art') || topic.includes('creative') || topic.includes('design')) {
      category = 'art';
    } else if (topic.includes('tech') || topic.includes('coding') || topic.includes('innovation')) {
      category = 'technology';
    }
    
    // Generate image with appropriate type and category
    const imagePrompt = `A ${topic} scene related to ${persona.name}'s interests`;
    const imageType = category === 'travel' || category === 'nature' ? 'scenic' : 'other';
    image = await generateContentImage(imagePrompt, imageType, category);
    
    // Generate caption with persona info
    content = await generateCaption(topic, image, 'post', persona.name);
  } else {
    // Use regular content
    topic = getRandomItem(topics);
    image = getRandomItem(unsplashImages);
    
    // Generate caption without persona info
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
      likes: likesCount,
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
  
  if (isAI && commentUser.persona) {
    // Find the persona for this AI user
    const persona = aiPersonas.find(p => p.name === commentUser.persona);
    
    // Generate AI comment with persona
    content = await generateCaption(undefined, post.image, 'comment', persona?.name);
  } else {
    // Use regular comment
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
    
    // Create 5 AI users with specified personas
    const aiUsers: User[] = [];
    for (let i = 0; i < 5; i++) {
      const user = await createAIUser(i);
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
