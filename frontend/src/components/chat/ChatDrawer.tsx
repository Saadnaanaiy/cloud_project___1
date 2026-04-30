import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { X, Send, Search, MessageSquare, ArrowLeft, Reply, Paperclip, File, Play, Download, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Message } from '../../context/ChatContext';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatDrawer: React.FC<ChatDrawerProps> = ({ isOpen, onClose }) => {
  const {
    contacts,
    messages,
    activeContactId,
    setActiveContactId,
    fetchConversation,
    sendMessage,
    markAsRead,
    typingStatus,
    sendTyping
  } = useChat();
  const { user } = useAuth();

  const [inputMessage, setInputMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [replyingToMessage, setReplyingToMessage] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const activeContact = contacts.find(c => c.user.id === activeContactId);

  useEffect(() => {
    if (activeContactId) {
      fetchConversation(activeContactId);
      markAsRead(activeContactId);
    }
  }, [activeContactId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingStatus]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
    if (activeContactId) {
      sendTyping(activeContactId, true);
      
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        sendTyping(activeContactId, false);
      }, 2000);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() && activeContactId) {
      sendMessage(activeContactId, inputMessage.trim(), replyingToMessage?.id);
      setInputMessage('');
      setReplyingToMessage(null);
      sendTyping(activeContactId, false);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeContactId) return;

    setIsUploading(true);
    try {
      const attachment = await uploadFile(file);
      sendMessage(activeContactId, `Sent a file: ${file.name}`, replyingToMessage?.id, attachment);
      setReplyingToMessage(null);
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const renderAttachment = (msg: Message) => {
    if (!msg.attachmentUrl) return null;

    const fullUrl = `${window.location.origin}${msg.attachmentUrl}`;
    
    if (msg.attachmentType?.startsWith('image/')) {
      return (
        <div className="message-attachment image">
          <img src={fullUrl} alt={msg.attachmentName} style={{ maxWidth: '100%', borderRadius: '8px', marginTop: '8px', cursor: 'pointer' }} onClick={() => window.open(fullUrl, '_blank')} />
        </div>
      );
    }
    
    if (msg.attachmentType?.startsWith('audio/')) {
      return (
        <div className="message-attachment audio" style={{ marginTop: '8px' }}>
          <audio controls src={fullUrl} style={{ width: '200px', height: '32px' }} />
        </div>
      );
    }

    return (
      <div className="message-attachment file" style={{ marginTop: '8px', background: 'rgba(0,0,0,0.05)', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <File size={20} />
        <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '12px' }}>
          {msg.attachmentName}
        </div>
        <a href={fullUrl} download={msg.attachmentName} className="btn-icon sm">
          <Download size={14} />
        </a>
      </div>
    );
  };

  const filteredContacts = contacts.filter(c =>
    c.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`chat-drawer-overlay ${isOpen ? 'open' : ''}`}>
      <div className={`chat-drawer ${isOpen ? 'open' : ''}`}>
        
        {/* Contacts List View */}
        <div className="chat-sidebar" style={{ display: activeContactId ? 'none' : 'flex' }}>
          <div className="chat-header">
            <h3>Messages</h3>
            <button onClick={onClose} className="btn-icon"><X size={20} /></button>
          </div>
          
          <div className="chat-search">
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="chat-contacts">
            {filteredContacts.length === 0 ? (
              <div className="no-contacts">
                <MessageSquare size={32} />
                <p>No conversations found.</p>
                <span style={{fontSize:'12px', color:'var(--text-muted)'}}>Start a new chat from the employees page (coming soon) or wait for a message.</span>
              </div>
            ) : (
              filteredContacts.map(contact => (
                <div 
                  key={contact.user.id} 
                  className="chat-contact-item"
                  onClick={() => setActiveContactId(contact.user.id)}
                >
                  <div className="contact-avatar">
                    {contact.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="contact-info">
                    <div className="contact-name-row">
                      <span className="name">{contact.user.name}</span>
                      {contact.lastMessage && (
                        <span className="time">
                          {formatDistanceToNow(new Date(contact.lastMessage.createdAt), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                    <div className="contact-msg-row">
                      {typingStatus[contact.user.id] ? (
                        <span className="msg-preview" style={{ color: 'var(--brand)', fontStyle: 'italic' }}>
                          Typing...
                        </span>
                      ) : (
                        <span className="msg-preview">
                          {contact.lastMessage?.content || 'No messages yet'}
                        </span>
                      )}
                      {contact.unreadCount > 0 && (
                        <span className="unread-badge">{contact.unreadCount}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Active Chat View */}
        {activeContactId && activeContact && (
          <div className="chat-main" style={{ display: 'flex' }}>
            <div className="chat-header active-chat-header">
              <button className="btn-icon" onClick={() => setActiveContactId(null)}>
                <ArrowLeft size={20} />
              </button>
              <div className="active-contact-info">
                <div className="contact-avatar small">
                  {activeContact.user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <span className="name">{activeContact.user.name}</span>
                  <span className="role">{activeContact.user.role}</span>
                </div>
              </div>
              <button onClick={onClose} className="btn-icon" style={{ marginLeft: 'auto' }}><X size={20} /></button>
            </div>

            <div className="chat-messages">
              {messages.map(msg => {
                const isMine = msg.senderId === user?.id;
                return (
                  <div key={msg.id} className={`message-bubble ${isMine ? 'mine' : 'theirs'}`}>
                    {msg.replyTo && (
                      <div className="message-reply-preview">
                        <span className="reply-author">{msg.replyTo.senderId === user?.id ? 'You' : activeContact.user.name}</span>
                        <p className="reply-content">{msg.replyTo.content}</p>
                      </div>
                    )}
                    {msg.attachmentUrl && renderAttachment(msg)}
                    <div className="bubble-content">{msg.content}</div>
                    <div className="bubble-time">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <button className="btn-reply-hover" onClick={() => setReplyingToMessage(msg)}>
                      <Reply size={14} />
                    </button>
                  </div>
                );
              })}
              
              {activeContactId && typingStatus[activeContactId] && (
                <div className="message-bubble theirs typing-indicator-bubble">
                  <div className="bubble-content">
                    <div className="typing-dots">
                      <span>.</span><span>.</span><span>.</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {(user?.role === 'admin' || user?.role === 'hr' || user?.role === 'ADMIN' || user?.role === 'HR') ? (
              <div className="chat-input-wrapper" style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                {replyingToMessage && (
                  <div className="chat-reply-context">
                    <div className="reply-info">
                      <span className="reply-author">Replying to {replyingToMessage.senderId === user?.id ? 'yourself' : activeContact.user.name}</span>
                      <p className="reply-content">{replyingToMessage.content}</p>
                    </div>
                    <button type="button" className="btn-cancel-reply" onClick={() => setReplyingToMessage(null)}>
                      <X size={16} />
                    </button>
                  </div>
                )}
                <form className="chat-input-area" onSubmit={handleSend}>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    style={{ display: 'none' }} 
                    onChange={handleFileUpload}
                    accept="image/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                  />
                  <button 
                    type="button" 
                    className="btn-icon" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? <Loader2 size={18} className="spin" /> : <Paperclip size={18} />}
                  </button>
                  <input 
                    type="text" 
                    placeholder="Type a message..." 
                    value={inputMessage}
                    onChange={handleInputChange}
                  />
                  <button type="submit" className="btn-send" disabled={!inputMessage.trim() || isUploading}>
                    <Send size={18} />
                  </button>
                </form>
              </div>
            ) : (
              <div className="chat-input-area" style={{ justifyContent: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                You only have permission to read messages.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatDrawer;
