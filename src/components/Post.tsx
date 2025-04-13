
import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { Post as PostType } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PostProps {
  post: PostType;
}

export const Post: React.FC<PostProps> = ({ post }) => {
  const { likePost, addComment } = useAppContext();
  const [comment, setComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [liked, setLiked] = useState(false);
  
  const handleLike = () => {
    if (!liked) {
      likePost(post.id);
      setLiked(true);
    }
  };
  
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      addComment(post.id, comment);
      setComment('');
      setShowComments(true);
    }
  };
  
  const toggleComments = () => {
    setShowComments(!showComments);
  };
  
  return (
    <div className="mb-6 rounded-md border border-gray-200 bg-white overflow-hidden">
      {/* Post header */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage src={post.profileImage} alt={post.username} />
            <AvatarFallback>{post.username.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{post.username}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Post image */}
      {post.image && (
        <div className="border-y border-gray-100">
          <img 
            src={post.image} 
            alt={`Post by ${post.username}`} 
            className="w-full object-cover max-h-[500px]" 
          />
        </div>
      )}
      
      {/* Post actions */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className={`h-8 w-8 ${liked ? 'text-instagram-red' : ''}`}
            onClick={handleLike}
          >
            <Heart className={`h-5 w-5 ${liked ? 'fill-instagram-red' : ''}`} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleComments}>
            <MessageCircle className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Send className="h-5 w-5" />
          </Button>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Bookmark className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Post content */}
      <div className="px-3 pb-2">
        <p className="text-sm font-medium">{post.likes} likes</p>
        <div className="mt-1">
          <span className="text-sm font-medium mr-2">{post.username}</span>
          <span className="text-sm">{post.content}</span>
        </div>
        {post.comments.length > 0 && (
          <button 
            className="mt-1 text-sm text-gray-500" 
            onClick={toggleComments}
          >
            View all {post.comments.length} comments
          </button>
        )}
        {showComments && post.comments.map(comment => (
          <div key={comment.id} className="mt-1">
            <span className="text-sm font-medium mr-2">{comment.username}</span>
            <span className="text-sm">{comment.content}</span>
          </div>
        ))}
        <p className="mt-1 text-xs text-gray-500">
          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
        </p>
      </div>
      
      {/* Comment form */}
      <form onSubmit={handleAddComment} className="flex items-center border-t border-gray-100 p-3">
        <Input 
          type="text" 
          placeholder="Add a comment..." 
          className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <Button 
          type="submit" 
          variant="ghost" 
          className="text-instagram-blue font-semibold"
          disabled={!comment.trim()}
        >
          Post
        </Button>
      </form>
    </div>
  );
};
