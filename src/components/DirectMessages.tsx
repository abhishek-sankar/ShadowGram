
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
      // Send user message
      await sendMessage(selectedUserId, newMessage);
      const updatedConversation = getConversation(selectedUserId);
      setMessages(updatedConversation);
      setNewMessage('');
      
      // If it's Maya, get AI response
      if (selectedUserId === '2') {
        setIsGeneratingResponse(true);
        toast.info("Maya is thinking...");
        
        try {
          // Get Maya's response using the Maya agent
          const mayaResponse = await getMayaResponse(newMessage, updatedConversation);
          
          // Add Maya's response to the conversation
          const conversationKey = 'maya-convo';
          const mockConversations = (window as any).mockConversations || {};
          if (!mockConversations[conversationKey]) {
            mockConversations[conversationKey] = [];
          }
          mockConversations[conversationKey].push(mayaResponse);
          (window as any).mockConversations = mockConversations;
          
          // Update UI with the new message
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
    <div className="flex h-[calc(100vh-100px)] w-full max-w-7xl mx-auto border rounded-xl overflow-hidden shadow-lg">
      {/* Users sidebar */}
      <div className="w-1/4 min-w-[250px] border-r bg-gray-50">
        <div className="p-5 border-b bg-white">
          <h2 className="text-2xl font-bold text-gray-800">Messages</h2>
        </div>
        <ScrollArea className="h-[calc(100vh-180px)]">
          <div className="p-3">
            {users.map(user => (
              <div
                key={user.id}
                className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors ${
                  selectedUserId === user.id ? 'bg-gray-100 shadow-sm' : ''
                }`}
                onClick={() => setSelectedUserId(user.id)}
              >
                <Avatar className="w-14 h-14">
                  <AvatarImage src={user.profileImage} alt={user.name} />
                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-gray-800 truncate">{user.name}</p>
                  <p className="text-sm text-gray-500 truncate">
                    {user.isAI ? 'AI Assistant' : '@' + user.username}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
      
      {/* Chat area */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {selectedUser ? (
          <>
            {/* Chat header */}
            <div className="p-6 border-b flex items-center gap-4 bg-white shadow-sm">
              <Avatar className="w-16 h-16">
                <AvatarImage src={selectedUser.profileImage} alt={selectedUser.name} />
                <AvatarFallback>{getInitials(selectedUser.name)}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{selectedUser.name}</h2>
                <p className="text-sm text-gray-500">
                  {selectedUser.isAI ? 'AI Assistant' : '@' + selectedUser.username}
                </p>
              </div>
            </div>
            
            {/* Messages */}
            <ScrollArea className="flex-1 p-6">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                  <UserIcon className="h-16 w-16 mb-4 text-gray-300" />
                  <p className="text-lg">No messages yet</p>
                  <p className="text-sm">Send a message to start the conversation</p>
                </div>
              ) : (
                <div className="space-y-8">
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
                        className={`max-w-[75%] rounded-xl p-5 shadow-sm ${
                          message.senderId === currentUser.id
                            ? 'bg-blue-500 text-white'
                            : 'bg-white border'
                        }`}
                      >
                        {/* Message content */}
                        <p className="text-base">{message.content}</p>
                        
                        {/* Message image if present */}
                        {message.image && (
                          <div className="mt-3 rounded-lg overflow-hidden">
                            <img 
                              src={message.image} 
                              alt="Shared content" 
                              className="w-full h-auto max-h-[300px] object-cover"
                            />
                          </div>
                        )}
                        
                        {/* Message timestamp */}
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
                      <div className="bg-white border rounded-xl p-4 shadow-sm flex items-center space-x-2">
                        <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                        <p className="text-sm text-gray-500">Maya is typing...</p>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>
            
            {/* Message input */}
            <form onSubmit={handleSendMessage} className="p-6 border-t bg-white flex gap-4">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                disabled={isLoading || isGeneratingResponse}
                className="flex-1 h-14 text-base px-4"
              />
              <Button 
                type="submit" 
                size="lg" 
                disabled={isLoading || isGeneratingResponse} 
                className="px-8 h-14 text-base"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <Send className="h-5 w-5 mr-2" />
                )}
                Send
              </Button>
            </form>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-500">
            <UserIcon className="h-16 w-16 mb-4 text-gray-300" />
            <p className="text-lg">Select a conversation</p>
          </div>
        )}
      </div>
    </div>
  );
};
