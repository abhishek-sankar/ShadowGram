
import React, { useState } from 'react';
import { Image, X } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/sonner';

export const CreatePostForm: React.FC = () => {
  const { currentUser, addPost } = useAppContext();
  const [content, setContent] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          setImage(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const removeImage = () => {
    setImage(null);
    setImageFile(null);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() && !image) {
      toast.error('Please add some content or an image to your post');
      return;
    }
    
    const newPost = {
      id: Math.random().toString(),
      userId: currentUser.id,
      username: currentUser.username,
      profileImage: currentUser.profileImage,
      content,
      image: image || undefined,
      likes: 0,
      comments: [],
      createdAt: new Date().toISOString(),
    };
    
    addPost(newPost);
    toast.success('Post created successfully!');
    setContent('');
    setImage(null);
    setImageFile(null);
    
    // Close dialog
    const closeButton = document.querySelector('[data-dialog-close="true"]');
    if (closeButton instanceof HTMLElement) {
      closeButton.click();
    }
  };
  
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Create new post</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <Textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full resize-none"
            rows={4}
          />
        </div>
        
        {image ? (
          <div className="relative mb-4">
            <img 
              src={image} 
              alt="Preview" 
              className="w-full rounded-md max-h-[300px] object-cover" 
            />
            <Button 
              type="button"
              variant="destructive" 
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 rounded-full"
              onClick={removeImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="mb-4">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-md cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Image className="w-8 h-8 mb-3 text-gray-400" />
                <p className="text-sm text-gray-500">
                  Click to upload an image
                </p>
              </div>
              <input 
                type="file" 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageChange} 
              />
            </label>
          </div>
        )}
        
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" data-dialog-close="true">
            Cancel
          </Button>
          <Button type="submit" className="bg-instagram-blue hover:bg-blue-600">
            Post
          </Button>
        </div>
      </form>
    </div>
  );
};
