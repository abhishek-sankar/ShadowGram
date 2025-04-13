
import React from 'react';
import { Home, PlusSquare, User, Settings } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { CreatePostForm } from '@/components/CreatePostForm';

export const Sidebar: React.FC = () => {
  const { currentUser } = useAppContext();

  return (
    <div className="w-16 md:w-64 border-r border-gray-200 bg-white flex flex-col">
      <div className="p-5">
        <h1 className="text-xl font-bold hidden md:block">InstaClone</h1>
        <h1 className="text-xl font-bold md:hidden">IC</h1>
      </div>
      
      <div className="flex-1 pt-5">
        <Button variant="ghost" className="w-full justify-start mb-2 px-3 py-2">
          <Home className="h-5 w-5 mr-2" />
          <span className="hidden md:inline">Home</span>
        </Button>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" className="w-full justify-start mb-2 px-3 py-2">
              <PlusSquare className="h-5 w-5 mr-2" />
              <span className="hidden md:inline">Create</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <CreatePostForm />
          </DialogContent>
        </Dialog>
        
        <Button variant="ghost" className="w-full justify-start mb-2 px-3 py-2">
          <User className="h-5 w-5 mr-2" />
          <span className="hidden md:inline">Profile</span>
        </Button>
        
        <Button variant="ghost" className="w-full justify-start mb-2 px-3 py-2">
          <Settings className="h-5 w-5 mr-2" />
          <span className="hidden md:inline">Settings</span>
        </Button>
      </div>
      
      <div className="p-5">
        <div className="flex items-center">
          <img 
            src={currentUser.profileImage} 
            alt={currentUser.username} 
            className="h-8 w-8 rounded-full object-cover mr-2" 
          />
          <div className="hidden md:block">
            <p className="text-sm font-medium">{currentUser.username}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
