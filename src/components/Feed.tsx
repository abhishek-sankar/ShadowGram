
import React, { useState } from 'react';
import { Post } from '@/components/Post';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { generateMockData } from '@/services/mockDataService';
import { LoaderCircle } from 'lucide-react';

export const Feed: React.FC = () => {
  const { posts, feedType, createAIContent } = useAppContext();
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Filter posts based on feed type
  const displayPosts = feedType === 'regular' 
    ? posts.filter(post => !post.username.includes('ai-')) 
    : posts;
  
  const handleGenerateMockData = async () => {
    try {
      setIsGenerating(true);
      toast.info('Generating mock data...', {
        description: 'This may take a few minutes. Please wait.'
      });
      
      await generateMockData();
      
      toast.success('Mock data generated successfully!', {
        description: 'Refresh the page to see the new content.'
      });
    } catch (error) {
      console.error('Error generating mock data:', error);
      toast.error('Failed to generate mock data', {
        description: 'Please try again later.'
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <div>
      <div className="mb-6 flex justify-between">
        <Button 
          onClick={handleGenerateMockData}
          className="bg-purple-500 hover:bg-purple-600 text-white"
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate Mock Data'
          )}
        </Button>
        
        <Button 
          onClick={createAIContent}
          className="bg-blue-500 hover:bg-blue-600 text-white"
          disabled={isGenerating}
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
