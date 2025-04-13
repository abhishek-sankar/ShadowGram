
import React, { useState } from 'react';
import { Post } from '@/components/Post';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { generateMockData } from '@/services/mockDataService';
import { LoaderCircle, UserPlus, Sparkles } from 'lucide-react';

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
      toast.info('Generating realistic users and content...', {
        description: 'This may take a few minutes. Please wait.'
      });
      
      await generateMockData();
      
      toast.success('Content generated successfully!', {
        description: 'Refresh the page to see all the new users and posts.'
      });
    } catch (error) {
      console.error('Error generating mock data:', error);
      toast.error('Failed to generate content', {
        description: 'Please try again later.'
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <div>
      <div className="mb-6 flex flex-col space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
        <h2 className="text-lg font-semibold">Generate Content</h2>
        <p className="text-sm text-gray-600">
          Create realistic users and content to populate your feed.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={handleGenerateMockData}
            className="bg-purple-500 hover:bg-purple-600 text-white flex-1"
            disabled={isGenerating}
            size="lg"
          >
            {isGenerating ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Generating Content...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Generate Realistic Users & Posts
              </>
            )}
          </Button>
          
          <Button 
            onClick={createAIContent}
            className="bg-blue-500 hover:bg-blue-600 text-white flex-1"
            disabled={isGenerating}
            size="lg"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Generate Single AI Post
          </Button>
        </div>
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
