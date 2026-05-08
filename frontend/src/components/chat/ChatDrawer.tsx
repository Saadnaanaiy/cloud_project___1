import { formatDistanceToNow } from "date-fns"
import {
    ArrowLeft,
    Download,
    File,
    FileArchive,
    FileImage,
    FileSpreadsheet,
    FileText,
    Loader2,
    MessageSquare,
    Paperclip,
    Play,
    Reply,
    Search,
    Send,
    X,
} from "lucide-react"
import React, { useEffect, useRef, useState } from "react"
import { useAuth } from "../../context/AuthContext"
import type { Message } from "../../context/ChatContext"
import { useChat } from "../../context/ChatContext"

interface ChatDrawerProps {
    isOpen: boolean
    onClose: () => void
}

const avatarColors = [
    { bg: "#EEEDFE", color: "#534AB7" },
    { bg: "#E1F5EE", color: "#0F6E56" },
    { bg: "#FBEAF0", color: "#993556" },
    { bg: "#E6F1FB", color: "#185FA5" },
    { bg: "#FAEEDA", color: "#854F0B" },
    { bg: "#EAF3DE", color: "#3B6D11" },
    { bg: "#FAECE7", color: "#993C1D" },
]

const getAvatarColor = (id: string | number) => {
    const index =
        typeof id === "string"
            ? id.split("").reduce((acc, c) => acc + (c.codePointAt(0) ?? 0), 0)
            : id
    return avatarColors[index % avatarColors.length]
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
        uploadFile,
    } = useChat()
    const { user } = useAuth()

    const [inputMessage, setInputMessage] = useState("")
    const [searchQuery, setSearchQuery] = useState("")
    const [replyingToMessage, setReplyingToMessage] = useState<Message | null>(
        null,
    )
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const [isUploading, setIsUploading] = useState(false)

    const activeContact = contacts.find((c) => c.user.id === activeContactId)

    const canSendMessages = Boolean(
        user?.role && ["admin", "hr", "ADMIN", "HR"].includes(user.role),
    )

    useEffect(() => {
        if (activeContactId) {
            fetchConversation(activeContactId)
            markAsRead(activeContactId)
        }
    }, [activeContactId, fetchConversation, markAsRead])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages, typingStatus])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputMessage(e.target.value)
        if (activeContactId) {
            sendTyping(activeContactId, true)
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
            typingTimeoutRef.current = setTimeout(() => {
                sendTyping(activeContactId, false)
            }, 2000)
        }
    }

    const handleSend = (e: React.SyntheticEvent) => {
        e.preventDefault()
        if (inputMessage.trim() && activeContactId) {
            sendMessage(
                activeContactId,
                inputMessage.trim(),
                replyingToMessage?.id,
            )
            setInputMessage("")
            setReplyingToMessage(null)
            sendTyping(activeContactId, false)
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !activeContactId) return

        setIsUploading(true)
        try {
            const attachment = await uploadFile(file)
            sendMessage(activeContactId, "", replyingToMessage?.id, attachment)
            setReplyingToMessage(null)
        } catch (err) {
            console.error("Upload failed", err)
        } finally {
            setIsUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ""
        }
    }

    const getFileIcon = (type: string | undefined) => {
        const mime = type?.toLowerCase() || ""
        if (mime.includes("image"))
            return {
                icon: <FileImage size={22} />,
                color: "#ec4899",
                bg: "rgba(236, 72, 153, 0.1)",
                label: "IMAGE",
            }
        if (mime.includes("pdf"))
            return {
                icon: <FileText size={22} />,
                color: "#ef4444",
                bg: "rgba(239, 68, 68, 0.1)",
                label: "PDF DOCUMENT",
            }
        if (
            mime.includes("excel") ||
            mime.includes("spreadsheet") ||
            mime.includes("csv")
        )
            return {
                icon: <FileSpreadsheet size={22} />,
                color: "#10b981",
                bg: "rgba(16, 185, 129, 0.1)",
                label: "EXCEL SHEET",
            }
        if (
            mime.includes("word") ||
            mime.includes("officedocument.wordprocessingml")
        )
            return {
                icon: <FileText size={22} />,
                color: "#3b82f6",
                bg: "rgba(59, 130, 246, 0.1)",
                label: "WORD DOC",
            }
        if (mime.includes("text/plain"))
            return {
                icon: <FileText size={22} />,
                color: "#6b7280",
                bg: "rgba(107, 114, 128, 0.1)",
                label: "TEXT FILE",
            }
        if (
            mime.includes("zip") ||
            mime.includes("rar") ||
            mime.includes("archive")
        )
            return {
                icon: <FileArchive size={22} />,
                color: "#f59e0b",
                bg: "rgba(245, 158, 11, 0.1)",
                label: "ARCHIVE",
            }
        return {
            icon: <File size={22} />,
            color: "#6b7280",
            bg: "rgba(107, 114, 128, 0.1)",
            label: "FILE",
        }
    }

    const renderAttachment = (msg: Message) => {
        if (!msg.attachmentUrl) return null
        const fullUrl = `/api${msg.attachmentUrl}`

        if (msg.attachmentType?.startsWith("audio/")) {
            return (
                <div
                    className="message-attachment audio"
                    style={{
                        marginTop: "10px",
                        background: "var(--bg-main)",
                        padding: "12px",
                        borderRadius: "12px",
                        border: "1px solid var(--border)",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            marginBottom: "8px",
                        }}
                    >
                        <div
                            style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "50%",
                                background: "var(--brand)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Play size={16} color="white" fill="white" />
                        </div>
                        <span style={{ fontSize: "13px", fontWeight: 600 }}>
                            Audio Message
                        </span>
                    </div>
                    <audio
                        controls
                        src={fullUrl}
                        style={{ width: "100%", height: "36px" }}
                    >
                        <track kind="captions" />
                    </audio>
                </div>
            )
        }

        const fileInfo = getFileIcon(msg.attachmentType)
        return (
            <div
                className="message-attachment file"
                style={{
                    marginTop: "8px",
                    background: "var(--bg-surface)",
                    padding: "12px",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    border: "1px solid var(--border)",
                    boxShadow: "var(--shadow-sm)",
                }}
            >
                <div
                    style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "10px",
                        background: fileInfo.bg,
                        color: fileInfo.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    {fileInfo.icon}
                </div>
                <div style={{ flex: 1, overflow: "hidden" }}>
                    <div
                        style={{
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "var(--text-primary)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {msg.attachmentName}
                    </div>
                    <div
                        style={{
                            fontSize: "11px",
                            color: "var(--text-muted)",
                            fontWeight: 500,
                        }}
                    >
                        {fileInfo.label}
                    </div>
                </div>
                <a
                    href={fullUrl}
                    download={msg.attachmentName}
                    className="btn-icon"
                    style={{
                        background: "var(--bg-main)",
                        border: "1px solid var(--border)",
                    }}
                >
                    <Download size={16} />
                </a>
            </div>
        )
    }

    const filteredContacts = contacts.filter((c) =>
        c.user.name.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    const getMessagePreviewText = (
        isTyping: boolean,
        hasAttachment: boolean,
        lastMsgText: string,
    ) => {
        if (isTyping) return "Typing…"
        if (hasAttachment) return "📎 Attachment"
        return lastMsgText || "No messages yet"
    }

    const getPreviewColor = (
        isTyping: boolean,
        hasUnread: boolean,
    ) => {
        if (isTyping) return "var(--brand, #534AB7)"
        if (hasUnread) return "var(--text-primary)"
        return "var(--text-muted)"
    }

    const getPreviewFontWeight = (
        hasUnread: boolean,
        isTyping: boolean,
    ) => {
        if (hasUnread && !isTyping) return 500
        return 400
    }

    return (
        <div className={`chat-drawer-overlay ${isOpen ? "open" : ""}`}>
            <div className={`chat-drawer ${isOpen ? "open" : ""}`}>
                {/* ── Contacts List View ── */}
                <div
                    className="chat-sidebar"
                    style={{ display: activeContactId ? "none" : "flex" }}
                >
                    {/* Header */}
                    <div className="chat-header">
                        <h3>Messages</h3>
                        <button onClick={onClose} className="btn-icon">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Search */}
                    <div className="chat-search">
                        <Search size={16} />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* ── Redesigned contacts list ── */}
                    <div className="chat-contacts">
                        {filteredContacts.length === 0 ? (
                            <div className="no-contacts">
                                <MessageSquare size={32} />
                                <p>No conversations found.</p>
                                <span
                                    style={{
                                        fontSize: "12px",
                                        color: "var(--text-muted)",
                                    }}
                                >
                                    Start a new chat from the employees page
                                    (coming soon) or wait for a message.
                                </span>
                            </div>
                        ) : (
                            filteredContacts.map((contact) => {
                                const avatarColor = getAvatarColor(
                                    contact.user.id,
                                )
                                const isTyping = Boolean(
                                    typingStatus[contact.user.id],
                                )
                                const lastMsgText =
                                    contact.lastMessage?.content || ""
                                const hasAttachment =
                                    Boolean(!lastMsgText && contact.lastMessage)
                                const timeAgo = contact.lastMessage
                                    ? formatDistanceToNow(
                                          new Date(
                                              contact.lastMessage.createdAt,
                                          ),
                                          { addSuffix: true },
                                      )
                                    : ""

                                return (
                                    <button
                                        type="button"
                                        key={contact.user.id}
                                        onClick={() =>
                                            setActiveContactId(contact.user.id)
                                        }
                                        style={{
                                            width: "100%",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "12px",
                                            padding: "11px 16px",
                                            background: "none",
                                            border: "none",
                                            borderBottom:
                                                "0.5px solid var(--border, rgba(0,0,0,0.08))",
                                            cursor: "pointer",
                                            textAlign: "left",
                                            transition: "background 0.12s",
                                            position: "relative",
                                        }}
                                        onMouseEnter={(e) =>
                                            (e.currentTarget.style.background =
                                                "var(--bg-hover, rgba(0,0,0,0.04))")
                                        }
                                        onMouseLeave={(e) =>
                                            (e.currentTarget.style.background =
                                                "none")
                                        }
                                    >
                                        {/* Avatar */}
                                        <div
                                            style={{
                                                width: "42px",
                                                height: "42px",
                                                borderRadius: "50%",
                                                background: avatarColor.bg,
                                                color: avatarColor.color,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontWeight: 600,
                                                fontSize: "15px",
                                                flexShrink: 0,
                                                position: "relative",
                                            }}
                                        >
                                            {contact.user.name
                                                .charAt(0)
                                                .toUpperCase()}

                                            {/* Unread dot on avatar when badge > 0 */}
                                            {contact.unreadCount > 0 && (
                                                <span
                                                    style={{
                                                        position: "absolute",
                                                        top: "1px",
                                                        right: "1px",
                                                        width: "10px",
                                                        height: "10px",
                                                        borderRadius: "50%",
                                                        background:
                                                            "var(--brand, #534AB7)",
                                                        border: "2px solid var(--bg-surface, #fff)",
                                                    }}
                                                />
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div
                                            style={{
                                                flex: 1,
                                                overflow: "hidden",
                                            }}
                                        >
                                            {/* Row 1: name + time */}
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "baseline",
                                                    justifyContent:
                                                        "space-between",
                                                    marginBottom: "3px",
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        fontSize: "14px",
                                                        fontWeight:
                                                            contact.unreadCount >
                                                            0
                                                                ? 600
                                                                : 500,
                                                        color: "var(--text-primary)",
                                                        whiteSpace: "nowrap",
                                                        overflow: "hidden",
                                                        textOverflow:
                                                            "ellipsis",
                                                        maxWidth: "160px",
                                                    }}
                                                >
                                                    {contact.user.name}
                                                </span>
                                                {timeAgo && (
                                                    <span
                                                        style={{
                                                            fontSize: "11px",
                                                            color:
                                                                contact.unreadCount >
                                                                0
                                                                    ? "var(--brand, #534AB7)"
                                                                    : "var(--text-muted)",
                                                            flexShrink: 0,
                                                            marginLeft: "8px",
                                                            fontWeight:
                                                                contact.unreadCount >
                                                                0
                                                                    ? 500
                                                                    : 400,
                                                        }}
                                                    >
                                                        {timeAgo}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Row 2: preview + unread count */}
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent:
                                                        "space-between",
                                                    gap: "8px",
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        fontSize: "12px",
                                                        color: getPreviewColor(isTyping, contact.unreadCount > 0),
                                                        fontStyle: isTyping
                                                            ? "italic"
                                                            : "normal",
                                                        fontWeight: getPreviewFontWeight(contact.unreadCount > 0, isTyping),
                                                        whiteSpace: "nowrap",
                                                        overflow: "hidden",
                                                        textOverflow:
                                                            "ellipsis",
                                                    }}
                                                >
                                                    {getMessagePreviewText(isTyping, hasAttachment, lastMsgText)}
                                                </span>

                                                {contact.unreadCount > 0 && (
                                                    <span
                                                        style={{
                                                            background:
                                                                "var(--brand, #534AB7)",
                                                            color: "#fff",
                                                            fontSize: "11px",
                                                            fontWeight: 600,
                                                            borderRadius:
                                                                "100px",
                                                            padding: "2px 7px",
                                                            minWidth: "20px",
                                                            textAlign: "center",
                                                            flexShrink: 0,
                                                        }}
                                                    >
                                                        {contact.unreadCount}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Role tag */}
                                            {contact.user.role && (
                                                <span
                                                    style={{
                                                        display: "inline-block",
                                                        marginTop: "4px",
                                                        fontSize: "10px",
                                                        color: avatarColor.color,
                                                        background:
                                                            avatarColor.bg,
                                                        borderRadius: "4px",
                                                        padding: "1px 6px",
                                                        fontWeight: 500,
                                                        textTransform:
                                                            "lowercase",
                                                    }}
                                                >
                                                    {contact.user.role}
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                )
                            })
                        )}
                    </div>
                </div>

                {/* ── Active Chat View (unchanged) ── */}
                {activeContactId && activeContact && (
                    <div className="chat-main" style={{ display: "flex" }}>
                        <div className="chat-header active-chat-header">
                            <button
                                className="btn-icon"
                                onClick={() => setActiveContactId(null)}
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <div className="active-contact-info">
                                <div className="contact-avatar small">
                                    {activeContact.user.name
                                        .charAt(0)
                                        .toUpperCase()}
                                </div>
                                <div>
                                    <span className="name">
                                        {activeContact.user.name}
                                    </span>
                                    <span className="role">
                                        {activeContact.user.role}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="btn-icon"
                                style={{ marginLeft: "auto" }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="chat-messages">
                            {messages.map((msg) => {
                                const isMine = msg.senderId === user?.id
                                return (
                                    <div
                                        key={msg.id}
                                        className={`message-bubble ${isMine ? "mine" : "theirs"}`}
                                    >
                                        {msg.replyTo && (
                                            <div className="message-reply-preview">
                                                <span className="reply-author">
                                                    {msg.replyTo.senderId ===
                                                    user?.id
                                                        ? "You"
                                                        : activeContact.user
                                                              .name}
                                                </span>
                                                <p className="reply-content">
                                                    {msg.replyTo.content}
                                                </p>
                                            </div>
                                        )}
                                        {msg.attachmentUrl &&
                                            renderAttachment(msg)}
                                        {msg.content && (
                                            <div className="bubble-content">
                                                {msg.content}
                                            </div>
                                        )}
                                        <div className="bubble-time">
                                            {new Date(
                                                msg.createdAt,
                                            ).toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </div>
                                        <button
                                            className="btn-reply-hover"
                                            onClick={() =>
                                                setReplyingToMessage(msg)
                                            }
                                        >
                                            <Reply size={14} />
                                        </button>
                                    </div>
                                )
                            })}

                            {Boolean(
                                activeContactId &&
                                typingStatus[activeContactId],
                            ) && (
                                <div className="message-bubble theirs typing-indicator-bubble">
                                    <div className="bubble-content">
                                        <div className="typing-dots">
                                            <span>.</span>
                                            <span>.</span>
                                            <span>.</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {canSendMessages ? (
                            <div
                                className="chat-input-wrapper"
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    width: "100%",
                                }}
                            >
                                {replyingToMessage && (
                                    <div className="chat-reply-context">
                                        <div className="reply-info">
                                            <span className="reply-author">
                                                Replying to{" "}
                                                {replyingToMessage.senderId ===
                                                user?.id
                                                    ? "yourself"
                                                    : activeContact.user.name}
                                            </span>
                                            <p className="reply-content">
                                                {replyingToMessage.content}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            className="btn-cancel-reply"
                                            onClick={() =>
                                                setReplyingToMessage(null)
                                            }
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                )}
                                <form
                                    className="chat-input-area"
                                    onSubmit={handleSend}
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        style={{ display: "none" }}
                                        onChange={handleFileUpload}
                                        accept="image/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                                    />
                                    <button
                                        type="button"
                                        className="btn-icon"
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                        disabled={isUploading}
                                    >
                                        {isUploading ? (
                                            <Loader2
                                                size={18}
                                                className="spin"
                                            />
                                        ) : (
                                            <Paperclip size={18} />
                                        )}
                                    </button>
                                    <input
                                        type="text"
                                        placeholder="Type a message..."
                                        value={inputMessage}
                                        onChange={handleInputChange}
                                    />
                                    <button
                                        type="submit"
                                        className="btn-send"
                                        disabled={
                                            !inputMessage.trim() || isUploading
                                        }
                                    >
                                        <Send size={18} />
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div
                                className="chat-input-area"
                                style={{
                                    justifyContent: "center",
                                    color: "var(--text-muted)",
                                    fontSize: "13px",
                                }}
                            >
                                You only have permission to read messages.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default ChatDrawer
