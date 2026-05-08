import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from './messages.service';

@WebSocketGateway({
  cors: {
    origin: (origin, callback) => {
      // Allow requests from the frontend domain (production) or localhost (development)
      const allowedOrigins = [
        'https://empmanager.duckdns.org',
        'http://localhost:5173',
        'http://localhost:3000',
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  },
  path: '/ws/chat/',
})
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  // Map to keep track of connected users: userId -> socketId
  private readonly connectedUsers = new Map<number, string>();

  constructor(
    private readonly messagesService: MessagesService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  handleConnection(client: Socket) {
    try {
      const rawToken: unknown = client.handshake.auth.token;
      const token: string | undefined =
        (rawToken as string | undefined) ||
        client.handshake.headers['authorization']?.split(' ')[1];
      if (!token) {
        client.disconnect();
        return;
      }
      const secret = this.configService.get<string>('JWT_SECRET');
      if (!secret) {
        client.disconnect();
        return;
      }
      const verifiedPayload: unknown = this.jwtService.verify(token, {
        secret,
      });
      const payload = verifiedPayload as { sub: number; role: string };
      const userId = payload.sub;
      client.data = { userId, role: payload.role };

      this.connectedUsers.set(userId, client.id);

      this.server.emit('userStatus', { userId, status: 'online' });
    } catch (error) {
      console.warn('Socket connection failed:', (error as Error)?.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    let disconnectedUserId: number | null = null;
    for (const [userId, socketId] of this.connectedUsers.entries()) {
      if (socketId === client.id) {
        disconnectedUserId = userId;
        this.connectedUsers.delete(userId);
        break;
      }
    }

    if (disconnectedUserId) {
      this.server.emit('userStatus', {
        userId: disconnectedUserId,
        status: 'offline',
      });
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      receiverId: number;
      content: string;
      replyToId?: number;
      attachmentUrl?: string;
      attachmentType?: string;
      attachmentName?: string;
    },
  ) {
    let senderId: number | undefined;
    // Find senderId from socket id
    for (const [userId, socketId] of this.connectedUsers.entries()) {
      if (socketId === client.id) {
        senderId = userId;
        break;
      }
    }

    if (!senderId) return;

    // Restrict sending to admin and hr only
    const role = (client.data as { role: string }).role;
    if (
      role !== 'admin' &&
      role !== 'hr' &&
      role !== 'ADMIN' &&
      role !== 'HR'
    ) {
      return;
    }

    // Save message to DB
    const savedMessage = await this.messagesService.saveMessage(
      senderId,
      payload.receiverId,
      payload.content,
      payload.replyToId,
      payload.attachmentUrl,
      payload.attachmentType,
      payload.attachmentName,
    );

    // Emit back to sender (for confirmation/local update)
    client.emit('newMessage', savedMessage);

    // If receiver is connected, emit to them
    const receiverSocketId = this.connectedUsers.get(payload.receiverId);
    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('newMessage', savedMessage);
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { receiverId: number; isTyping: boolean },
  ) {
    let senderId: number | undefined;
    for (const [userId, socketId] of this.connectedUsers.entries()) {
      if (socketId === client.id) {
        senderId = userId;
        break;
      }
    }
    if (!senderId) return;

    // Restrict typing indicator to admin and hr only
    const role = (client.data as { role: string }).role;
    if (
      role !== 'admin' &&
      role !== 'hr' &&
      role !== 'ADMIN' &&
      role !== 'HR'
    ) {
      return;
    }

    const receiverSocketId = this.connectedUsers.get(payload.receiverId);
    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('userTyping', {
        senderId,
        isTyping: payload.isTyping,
      });
    }
  }
}
