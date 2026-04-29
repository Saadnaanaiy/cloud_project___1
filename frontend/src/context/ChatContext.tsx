import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import api from '../api/axios';
import { useAuth } from './AuthContext';

export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  isRead: boolean;
  createdAt: string;
  replyToId?: number;
  replyTo?: Message;
}

export interface Contact {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  lastMessage: Message;
  unreadCount: number;
}

interface ChatContextType {
  socket: Socket | null;
  contacts: Contact[];
  unreadTotal: number;
  fetchContacts: () => Promise<void>;
  markAsRead: (contactId: number) => Promise<void>;
  sendMessage: (receiverId: number, content: string, replyToId?: number) => void;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  activeContactId: number | null;
  setActiveContactId: React.Dispatch<React.SetStateAction<number | null>>;
  fetchConversation: (contactId: number) => Promise<void>;
  typingStatus: Record<number, boolean>;
  sendTyping: (receiverId: number, isTyping: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeContactId, setActiveContactId] = useState<number | null>(null);
  const [typingStatus, setTypingStatus] = useState<Record<number, boolean>>({});

  const unreadTotal = contacts.reduce((sum, contact) => sum + contact.unreadCount, 0);

  const fetchContacts = async () => {
    try {
      const res = await api.get('/messages/contacts');
      setContacts(res.data);
    } catch (error) {
      console.error('Failed to fetch contacts', error);
    }
  };

  const fetchConversation = async (contactId: number) => {
    try {
      const res = await api.get(`/messages/history/${contactId}`);
      setMessages(res.data);
    } catch (error) {
      console.error('Failed to fetch conversation', error);
    }
  };

  const markAsRead = async (contactId: number) => {
    try {
      await api.post(`/messages/read/${contactId}`);
      setContacts((prev) =>
        prev.map((c) => (c.user.id === contactId ? { ...c, unreadCount: 0 } : c))
      );
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  const sendMessage = (receiverId: number, content: string, replyToId?: number) => {
    if (socket) {
      socket.emit('sendMessage', { receiverId, content, replyToId });
    }
  };

  const sendTyping = (receiverId: number, isTyping: boolean) => {
    if (socket) {
      socket.emit('typing', { receiverId, isTyping });
    }
  };

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const wsUrl = apiUrl.replace('/api', '');

      const newSocket = io(wsUrl, {
        auth: { token },
      });

      setSocket(newSocket);
      fetchContacts();

      newSocket.on('newMessage', (message: Message) => {
        setActiveContactId((currentActiveId) => {
          if (currentActiveId === message.senderId || currentActiveId === message.receiverId) {
            setMessages((prev) => [...prev, message]);
            if (message.receiverId === user.id && message.senderId === currentActiveId) {
              markAsRead(currentActiveId);
            }
          }
          return currentActiveId;
        });
        fetchContacts();
      });

      newSocket.on(
        'userTyping',
        ({ senderId, isTyping }: { senderId: number; isTyping: boolean }) => {
          setTypingStatus((prev) => ({ ...prev, [senderId]: isTyping }));

          if (isTyping) {
            setTimeout(() => {
              setTypingStatus((prev) => ({ ...prev, [senderId]: false }));
            }, 3000);
          }
        }
      );

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user]);

  return (
    <ChatContext.Provider
      value={{
        socket,
        contacts,
        unreadTotal,
        fetchContacts,
        markAsRead,
        sendMessage,
        messages,
        setMessages,
        activeContactId,
        setActiveContactId,
        fetchConversation,
        typingStatus,
        sendTyping,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
