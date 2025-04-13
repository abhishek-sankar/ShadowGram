
import React, { useState, useEffect, useRef } from 'react';
import { User, Message } from '@/types';
import { getChatUsers, getConversation, sendMessage } from '@/services/chatService';
import { useAppContext } from '@/contexts/AppContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, User as UserIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const DirectMessages = () => {
  const { currentUser } = useAppContext();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Load chat users
  useEffect(() => {
    const chatUsers = getChatUsers();
    setUsers(chatUsers);
    
    // Select first user by default
    if (chatUsers.length > 0 && !selectedUserId) {
      setSelectedUserId(chatUsers[0].id);
    }
  }, []);
  
  // Load conversation when selected user changes
  useEffect(() => {
    if (selectedUserId) {
      const conversation = getConversation(selectedUserId);
      setMessages(conversation);
    }
  }, [selectedUserId]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newMessage.trim() === '' || !selectedUserId) return;
    
    setIsLoading(true);
    
    try {
      await sendMessage(selectedUserId, newMessage);
      setNewMessage('');
      
      // Reload conversation
      const updatedConversation = getConversation(selectedUserId);
      setMessages(updatedConversation);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };
  
  const selectedUser = users.find(user => user.id === selectedUserId);
  
  return (
    <div className="flex h-full border rounded-lg overflow-hidden">
      {/* Users sidebar */}
      <div className="w-1/4 border-r bg-gray-50">
        <div className="p-4 border-b bg-white">
          <h2 className="font-semibold">Messages</h2>
        </div>
        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="p-2">
            {users.map(user => (
              <div
                key={user.id}
                className={`flex items-center gap-3 p-3 rounded-md cursor-pointer hover:bg-gray-100 transition-colors ${
                  selectedUserId === user.id ? 'bg-gray-100' : ''
                }`}
                onClick={() => setSelectedUserId(user.id)}
              >
                <Avatar>
                  <AvatarImage src={user.profileImage} alt={user.name} />
                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {user.isAI ? 'AI Assistant' : '@' + user.username}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
      
      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* Chat header */}
            <div className="p-4 border-b flex items-center gap-3">
              <Avatar>
                <AvatarImage src={selectedUser.profileImage} alt={selectedUser.name} />
                <AvatarFallback>{getInitials(selectedUser.name)}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-semibold">{selectedUser.name}</h2>
                <p className="text-xs text-gray-500">
                  {selectedUser.isAI ? 'AI Assistant' : '@' + selectedUser.username}
                </p>
              </div>
            </div>
            
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                  <UserIcon className="h-12 w-12 mb-2 text-gray-300" />
                  <p>No messages yet</p>
                  <p className="text-sm">Send a message to start the conversation</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map(message => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.senderId === currentUser.id
                          ? 'justify-end'
                          : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.senderId === currentUser.id
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100'
                        }`}
                      >
                        <p>{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.senderId === currentUser.id
                            ? 'text-blue-100'
                            : 'text-gray-500'
                        }`}>
                          {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>
            
            {/* Message input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={isLoading}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-500">
            <UserIcon className="h-12 w-12 mb-2 text-gray-300" />
            <p>Select a conversation</p>
          </div>
        )}
      </div>
    </div>
  );
};
