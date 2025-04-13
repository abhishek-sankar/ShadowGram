
import React from 'react';
import { Post } from '@/components/Post';
import { useAppContext } from '@/contexts/AppContext';
import { getRegularFeed, getShadowbannedFeed } from '@/data/mockData';

export const Feed: React.FC = () => {
  const { feedType, posts } = useAppContext();
  
  const displayPosts = feedType === 'regular' 
    ? getRegularFeed() 
    : getShadowbannedFeed();
  
  return (
    <div>
      {displayPosts.map(post => (
        <Post key={post.id} post={post} />
      ))}
    </div>
  );
};
