
import React, { useEffect, useState } from 'react';
import { Post } from '@/components/Post';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';

export const Feed: React.FC = () => {
  const { posts, feedType, createAIContent } = useAppContext();
  
  // Filter posts based on feed type
  const displayPosts = feedType === 'regular' 
    ? posts.filter(post => !post.username.includes('ai-user')) 
    : posts;
  
  return (
    <div>
      <div className="mb-6 flex justify-end">
        <Button 
          onClick={createAIContent}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          Generate AI Content
        </Button>
      </div>
      
      {displayPosts.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">No posts to display.</p>
          <p className="text-gray-500 mt-2">
            Create a post or generate some AI content to get started.
          </p>
        </div>
      ) : (
        displayPosts.map(post => (
          <Post key={post.id} post={post} />
        ))
      )}
    </div>
  );
};
