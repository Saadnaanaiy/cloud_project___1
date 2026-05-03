import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/user.entity';
import { Message } from './message.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messagesRepository: Repository<Message>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async saveMessage(
    senderId: number,
    receiverId: number,
    content: string,
    replyToId?: number,
    attachmentUrl?: string,
    attachmentType?: string,
    attachmentName?: string,
  ): Promise<Message> {
    const message = this.messagesRepository.create({
      senderId,
      receiverId,
      content,
      isRead: false,
      replyToId,
      attachmentUrl,
      attachmentType,
      attachmentName,
    });
    const saved = await this.messagesRepository.save(message);
    if (replyToId) {
      return (
        (await this.messagesRepository.findOne({
          where: { id: saved.id },
          relations: ['replyTo'],
        })) || saved
      );
    }
    return saved;
  }

  async getConversation(userId1: number, userId2: number): Promise<Message[]> {
    return await this.messagesRepository.find({
      where: [
        { senderId: userId1, receiverId: userId2 },
        { senderId: userId2, receiverId: userId1 },
      ],
      relations: ['replyTo'],
      order: { createdAt: 'ASC' },
    });
  }

  private processContactsFromMessages(messages: Message[], userId: number, contactsMap: Map<number, any>) {
    for (const msg of messages) {
      const contactId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      if (!contactsMap.has(contactId)) {
        const contactUser = msg.senderId === userId ? msg.receiver : msg.sender;
        if (contactUser) {
          contactsMap.set(contactId, {
            user: {
              id: contactUser.id,
              name: contactUser.name,
              email: contactUser.email,
              role: contactUser.role,
            },
            lastMessage: msg,
            unreadCount: 0,
          });
        }
      }

      if (msg.receiverId === userId && !msg.isRead) {
        const contactData = contactsMap.get(contactId);
        if (contactData) {
          contactData.unreadCount += 1;
        }
      }
    }
  }

  private async addAllUsersForPrivilegedRoles(role: string | undefined, userId: number, contactsMap: Map<number, any>) {
    const privilegedRoles = ['ADMIN', 'HR', 'admin', 'hr'];
    if (role && privilegedRoles.includes(role)) {
      const allUsers = await this.usersRepository.find();
      for (const u of allUsers) {
        if (u.id !== userId && !contactsMap.has(u.id)) {
          contactsMap.set(u.id, {
            user: {
              id: u.id,
              name: u.name,
              email: u.email,
              role: u.role,
            },
            lastMessage: null,
            unreadCount: 0,
          });
        }
      }
    }
  }

  async getContacts(userId: number, role?: string): Promise<any[]> {
    const messages = await this.messagesRepository.find({
      where: [{ senderId: userId }, { receiverId: userId }],
      relations: ['sender', 'receiver'],
      order: { createdAt: 'DESC' },
    });

    const contactsMap = new Map<number, any>();

    this.processContactsFromMessages(messages, userId, contactsMap);
    await this.addAllUsersForPrivilegedRoles(role, userId, contactsMap);

    return Array.from(contactsMap.values());
  }

  async markAsRead(senderId: number, receiverId: number): Promise<void> {
    // Mark all messages sent by senderId to receiverId as read
    await this.messagesRepository.update(
      { senderId, receiverId, isRead: false },
      { isRead: true },
    );
  }
}
