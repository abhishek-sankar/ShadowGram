
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
      content: 'Hey! Just checking in - how\'s your fitness routine going this week?',
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
  
  // Note: The actual Maya agent response is handled in the DirectMessages component
  // to better manage the UI state during the response generation
  
  return newMessage;
};

// This function makes global mock conversations accessible for the Maya agent
(window as any).mockConversations = mockConversations;

// Get the Maya agent response
export const getMayaResponse = async (message: string, conversation: Message[]): Promise<Message> => {
  try {
    const { data, error } = await supabase.functions.invoke('maya-agent', {
      body: { 
        message,
        conversation: conversation.slice(-10) // Send the last 10 messages for context
      }
    });
    
    if (error) {
      console.error('Error calling Maya agent:', error);
      throw error;
    }
    
    const mayaResponse: Message = {
      id: uuidv4(),
      senderId: '2', // Maya's ID
      receiverId: '1', // Current user
      content: data?.message || "Sorry, I couldn't generate a response right now.",
      createdAt: new Date().toISOString(),
      isRead: true,
      image: data?.image // May be null if no image
    };
    
    return mayaResponse;
  } catch (error) {
    console.error('Error with Maya agent:', error);
    throw error;
  }
};
