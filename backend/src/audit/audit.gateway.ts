import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuditLog } from './audit-log.entity';

@WebSocketGateway({
  cors: {
    origin: (origin, callback) => {
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
  path: '/ws/audit/',
})
export class AuditGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(
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

      const role = payload.role?.toLowerCase();
      if (role !== 'admin') {
        client.disconnect();
        return;
      }

      client.data = { userId: payload.sub, role };
    } catch {
      client.disconnect();
    }
  }

  broadcastLog(log: AuditLog) {
    this.server.emit('newAuditLog', log);
  }
}
