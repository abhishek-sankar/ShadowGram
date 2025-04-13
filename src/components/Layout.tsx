
import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import { FeedType } from '@/types';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { feedType, switchFeedType } = useAppContext();

  const handleSwitchFeed = () => {
    switchFeedType();
    if (feedType === 'regular') {
      toast('Switched to shadowbanned mode', {
        description: 'You will now see AI-generated content in your feed'
      });
    } else {
      toast('Switched to regular mode', {
        description: 'You will now see the normal feed'
      });
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2">
          <h1 className="text-xl font-semibold">InstaClone</h1>
          <Button 
            variant="outline" 
            className={
              feedType === 'shadowbanned' 
                ? 'bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700' 
                : 'bg-green-100 text-green-600 hover:bg-green-200 hover:text-green-700'
            }
            onClick={handleSwitchFeed}
          >
            {feedType === 'regular' ? 'Switch to Shadowbanned' : 'Switch to Regular'}
          </Button>
        </div>
        <div className="mx-auto max-w-2xl px-4 py-6">
          {children}
        </div>
      </main>
    </div>
  );
};
