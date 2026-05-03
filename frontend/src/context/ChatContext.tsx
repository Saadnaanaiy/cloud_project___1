import React, { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
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
  attachmentUrl?: string;
  attachmentType?: string;
  attachmentName?: string;
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
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  activeContactId: number | null;
  setActiveContactId: React.Dispatch<React.SetStateAction<number | null>>;
  fetchConversation: (contactId: number) => Promise<void>;
  typingStatus: Record<number, boolean>;
  sendTyping: (receiverId: number, isTyping: boolean) => void;
  uploadFile: (file: File) => Promise<{ url: string; name: string; type: string }>;
  sendMessage: (
    receiverId: number,
    content: string,
    replyToId?: number,
    attachment?: { url: string; name: string; type: string }
  ) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeContactId, setActiveContactId] = useState<number | null>(null);
  const [typingStatus, setTypingStatus] = useState<Record<number, boolean>>({});

  const unreadTotal = Array.isArray(contacts) ? contacts.reduce((sum, contact) => sum + contact.unreadCount, 0) : 0;

  const fetchContacts = async () => {
    try {
      const res = await api.get('/messages/contacts');
      setContacts(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Failed to fetch contacts', error);
      setContacts([]);
    }
  };

  const fetchConversation = async (contactId: number) => {
    try {
      const res = await api.get(`/messages/history/${contactId}`);
      setMessages(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Failed to fetch conversation', error);
      setMessages([]);
    }
  };

  const markAsRead = async (contactId: number) => {
    try {
      await api.post(`/messages/read/${contactId}`);
      setContacts((prev) =>
        Array.isArray(prev) ? prev.map((c) => (c.user.id === contactId ? { ...c, unreadCount: 0 } : c)) : []
      );
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  const sendMessage = (
    receiverId: number,
    content: string,
    replyToId?: number,
    attachment?: { url: string; name: string; type: string }
  ) => {
    if (socket) {
      socket.emit('sendMessage', {
        receiverId,
        content,
        replyToId,
        attachmentUrl: attachment?.url,
        attachmentType: attachment?.type,
        attachmentName: attachment?.name,
      });
    }
  };

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/messages/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  };

  const sendTyping = (receiverId: number, isTyping: boolean) => {
    if (socket) {
      socket.emit('typing', { receiverId, isTyping });
    }
  };

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('token');

      // Use globalThis.location.origin to automatically get the correct protocol (https:// or http://)
      // Socket.IO will automatically handle ws:// vs wss://
      const newSocket = io(globalThis.location.origin, {
        auth: { token },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        path: '/socket.io/',
      });

      setSocket(newSocket);
      fetchContacts();

      const handleNewMessage = (message: Message) => {
        setActiveContactId((currentActiveId) => {
          if (currentActiveId === message.senderId || currentActiveId === message.receiverId) {
            setMessages((prev) => Array.isArray(prev) ? [...prev, message] : [message]);
            if (message.receiverId === user.id && message.senderId === currentActiveId) {
              markAsRead(currentActiveId);
            }
          }
          return currentActiveId;
        });
        fetchContacts();
      };

      const handleUserTyping = ({ senderId, isTyping }: { senderId: number; isTyping: boolean }) => {
        setTypingStatus((prev) => ({ ...prev, [senderId]: isTyping }));

        if (isTyping) {
          setTimeout(() => {
            setTypingStatus((prev) => ({ ...prev, [senderId]: false }));
          }, 3000);
        }
      };

      newSocket.on('newMessage', handleNewMessage);
      newSocket.on('userTyping', handleUserTyping);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user]);

  const value = useMemo(() => ({
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
    uploadFile,
  }), [socket, contacts, unreadTotal, messages, activeContactId, typingStatus]);

  return (
    <ChatContext.Provider value={value}>
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
