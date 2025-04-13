
import { v4 as uuidv4 } from 'uuid';
import { User, Message } from '@/types';
import { mockUsers } from '@/data/mockData';
import { supabase } from "@/integrations/supabase/client";

// Mock conversations data
const mockConversations: Record<string, Message[]> = {
  // Conversation with Maya
  'maya-convo': [
    {
      id: '1',
      senderId: '2', // Maya
      receiverId: '1', // User
      content: 'Hi there! I saw your post about sustainable living. Have you tried composting at home?',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      isRead: true,
    },
    {
      id: '2',
      senderId: '1', // User
      receiverId: '2', // Maya
      content: 'I have a small composting bin on my balcony! It works great for apartment living.',
      createdAt: new Date(Date.now() - 3500000).toISOString(),
      isRead: true,
    },
  ],
  // Conversation with Aiden
  'aiden-convo': [
    {
      id: '3',
      senderId: '3', // Aiden
      receiverId: '1', // User
      content: 'Hey! Just checking in - how's your fitness routine going this week?',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      isRead: true,
    },
  ],
};

// Get all users the current user can message
export const getChatUsers = (): User[] => {
  // Return all users except the current user
  return mockUsers.filter(user => user.id !== '1');
};

// Get conversation between current user and another user
export const getConversation = (userId: string): Message[] => {
  const conversationKey = userId === '2' 
    ? 'maya-convo' 
    : userId === '3' 
      ? 'aiden-convo' 
      : `${userId}-convo`;
      
  return mockConversations[conversationKey] || [];
};

// Add a new message to a conversation
export const sendMessage = async (
  receiverId: string,
  content: string
): Promise<Message> => {
  const newMessage: Message = {
    id: uuidv4(),
    senderId: '1', // Current user
    receiverId,
    content,
    createdAt: new Date().toISOString(),
    isRead: false,
  };
  
  const conversationKey = receiverId === '2' 
    ? 'maya-convo' 
    : receiverId === '3' 
      ? 'aiden-convo' 
      : `${receiverId}-convo`;
  
  if (!mockConversations[conversationKey]) {
    mockConversations[conversationKey] = [];
  }
  
  mockConversations[conversationKey].push(newMessage);
  
  // If receiving user is AI, generate a response
  if (mockUsers.find(user => user.id === receiverId)?.isAI) {
    try {
      // Call the Supabase edge function to get AI response
      const { data, error } = await supabase.functions.invoke('generate-chat-message', {
        body: { 
          message: content,
          persona: mockUsers.find(user => user.id === receiverId)?.name || ''
        }
      });
      
      if (error) {
        console.error('Error generating AI response:', error);
      } else if (data?.message) {
        // Add AI response to conversation
        const aiResponse: Message = {
          id: uuidv4(),
          senderId: receiverId,
          receiverId: '1', // Current user
          content: data.message,
          createdAt: new Date().toISOString(),
          isRead: true,
        };
        
        mockConversations[conversationKey].push(aiResponse);
      }
    } catch (error) {
      console.error('Error calling AI service:', error);
    }
  }
  
  return newMessage;
};
