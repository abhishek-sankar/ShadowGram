import React, { useState, useEffect, useRef } from 'react';
import { User, Message } from '@/types';
import { getChatUsers, getConversation, sendMessage, getMayaResponse } from '@/services/chatService';
import { useAppContext } from '@/contexts/AppContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, User as UserIcon, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

export const DirectMessages = () => {
  const { currentUser } = useAppContext();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const chatUsers = getChatUsers();
    setUsers(chatUsers);
    
    if (chatUsers.length > 0 && !selectedUserId) {
      setSelectedUserId(chatUsers[0].id);
    }
  }, []);
  
  useEffect(() => {
    if (selectedUserId) {
      const conversation = getConversation(selectedUserId);
      setMessages(conversation);
    }
  }, [selectedUserId]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newMessage.trim() === '' || !selectedUserId) return;
    
    setIsLoading(true);
    
    try {
      await sendMessage(selectedUserId, newMessage);
      const updatedConversation = getConversation(selectedUserId);
      setMessages(updatedConversation);
      setNewMessage('');
      
      if (selectedUserId === '2') {
        setIsGeneratingResponse(true);
        toast.info("Maya is thinking...");
        
        try {
          const mayaResponse = await getMayaResponse(newMessage, updatedConversation);
          const conversationKey = 'maya-convo';
          const mockConversations = (window as any).mockConversations || {};
          if (!mockConversations[conversationKey]) {
            mockConversations[conversationKey] = [];
          }
          mockConversations[conversationKey].push(mayaResponse);
          (window as any).mockConversations = mockConversations;
          setMessages(prev => [...prev, mayaResponse]);
        } catch (error) {
          console.error('Error with Maya agent:', error);
          toast.error("Something went wrong with Maya's response");
        } finally {
          setIsGeneratingResponse(false);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Failed to send message");
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
    <div className="flex h-[calc(100vh-80px)] min-w-lg max-w-[95vw] mx-auto border rounded-xl overflow-hidden shadow-lg">
      <div className="w-[220px] min-w-[220px] border-r bg-gray-50">
        <div className="p-4 border-b bg-white">
          <h2 className="text-xl font-bold text-gray-800">Messages</h2>
        </div>
        <ScrollArea className="h-[calc(100vh-140px)]">
          <div className="p-2">
            {users.map(user => (
              <div
                key={user.id}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors ${
                  selectedUserId === user.id ? 'bg-gray-100 shadow-sm' : ''
                }`}
                onClick={() => setSelectedUserId(user.id)}
              >
                <Avatar className="w-12 h-12">
                  <AvatarImage src={user.profileImage} alt={user.name} />
                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {user.isAI ? 'AI Assistant' : '@' + user.username}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
      
      <div className="flex-1 flex flex-col bg-gray-50">
        {selectedUser ? (
          <>
            <div className="p-4 border-b flex items-center gap-4 bg-white shadow-sm">
              <Avatar className="w-12 h-12">
                <AvatarImage src={selectedUser.profileImage} alt={selectedUser.name} />
                <AvatarFallback>{getInitials(selectedUser.name)}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-lg font-bold text-gray-800">{selectedUser.name}</h2>
                <p className="text-xs text-gray-500">
                  {selectedUser.isAI ? 'AI Assistant' : '@' + selectedUser.username}
                </p>
              </div>
            </div>
            
            <ScrollArea className="flex-1 p-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                  <UserIcon className="h-16 w-16 mb-4 text-gray-300" />
                  <p className="text-base">No messages yet</p>
                  <p className="text-sm">Send a message to start the conversation</p>
                </div>
              ) : (
                <div className="space-y-6">
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
                        className={`max-w-[75%] rounded-xl p-4 shadow-sm ${
                          message.senderId === currentUser.id
                            ? 'bg-blue-500 text-white'
                            : 'bg-white border'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        {message.image && (
                          <div className="mt-3 rounded-lg overflow-hidden">
                            <img 
                              src={message.image} 
                              alt="Shared content" 
                              className="w-full h-auto max-h-[300px] object-cover"
                            />
                          </div>
                        )}
                        <p className={`text-xs mt-2 ${
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
                  {isGeneratingResponse && (
                    <div className="flex justify-start">
                      <div className="bg-white border rounded-xl p-3 shadow-sm flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                        <p className="text-xs text-gray-500">Maya is typing...</p>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>
            
            <form onSubmit={handleSendMessage} className="p-4 border-t bg-white flex gap-4">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                disabled={isLoading || isGeneratingResponse}
                className="flex-1 h-14 min-w-20 text-sm px-4 w-full"
              />
              <Button 
                type="submit" 
                size="sm" 
                disabled={isLoading || isGeneratingResponse} 
                className="px-6 h-14"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Send
              </Button>
            </form>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-500">
            <UserIcon className="h-16 w-16 mb-4 text-gray-300" />
            <p className="text-base">Select a conversation</p>
          </div>
        )}
      </div>
    </div>
  );
};
