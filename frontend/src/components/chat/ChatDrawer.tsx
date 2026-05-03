import { formatDistanceToNow } from 'date-fns';
import { ArrowLeft, Download, File, FileArchive, FileImage, FileSpreadsheet, FileText, Loader2, MessageSquare, Paperclip, Play, Reply, Search, Send, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { Message } from '../../context/ChatContext';
import { useChat } from '../../context/ChatContext';

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
    sendTyping,
    uploadFile
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
      sendMessage(activeContactId, '', replyingToMessage?.id, attachment);
      setReplyingToMessage(null);
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const getFileIcon = (type: string | undefined) => {
    const mime = type?.toLowerCase() || '';
    if (mime.includes('image')) return { icon: <FileImage size={22} />, color: '#ec4899', bg: 'rgba(236, 72, 153, 0.1)', label: 'IMAGE' };
    if (mime.includes('pdf')) return { icon: <FileText size={22} />, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', label: 'PDF DOCUMENT' };
    if (mime.includes('excel') || mime.includes('spreadsheet') || mime.includes('csv'))
      return { icon: <FileSpreadsheet size={22} />, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', label: 'EXCEL SHEET' };
    if (mime.includes('word') || mime.includes('officedocument.wordprocessingml'))
      return { icon: <FileText size={22} />, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', label: 'WORD DOC' };
    if (mime.includes('text/plain'))
      return { icon: <FileText size={22} />, color: '#6b7280', bg: 'rgba(107, 114, 128, 0.1)', label: 'TEXT FILE' };
    if (mime.includes('zip') || mime.includes('rar') || mime.includes('archive'))
      return { icon: <FileArchive size={22} />, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', label: 'ARCHIVE' };

    return { icon: <File size={22} />, color: '#6b7280', bg: 'rgba(107, 114, 128, 0.1)', label: 'FILE' };
  };

  const renderAttachment = (msg: Message) => {
    if (!msg.attachmentUrl) return null;

    // Use /api prefix to route through the Nginx proxy to the backend
    const fullUrl = `/api${msg.attachmentUrl}`;


    if (msg.attachmentType?.startsWith('audio/')) {
      return (
        <div className="message-attachment audio" style={{ marginTop: '10px', background: 'var(--bg-main)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Play size={16} color="white" fill="white" />
            </div>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>Audio Message</span>
          </div>
          <audio controls src={fullUrl} style={{ width: '100%', height: '36px' }}>
            <track kind="captions" />
          </audio>
        </div>
      );
    }

    const fileInfo = getFileIcon(msg.attachmentType);

    return (
      <div className="message-attachment file" style={{
        marginTop: '8px',
        background: 'var(--bg-surface)',
        padding: '12px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: fileInfo.bg,
          color: fileInfo.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {fileInfo.icon}
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {msg.attachmentName}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
            {fileInfo.label}
          </div>
        </div>
        <a
          href={fullUrl}
          download={msg.attachmentName}
          className="btn-icon"
          style={{ background: 'var(--bg-main)', border: '1px solid var(--border)' }}
        >
          <Download size={16} />
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
                <button
                  type="button"
                  key={contact.user.id}
                  className="chat-contact-item"
                  onClick={() => setActiveContactId(contact.user.id)}
                  style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
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
                </button>
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
                    {msg.content && <div className="bubble-content">{msg.content}</div>}
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
