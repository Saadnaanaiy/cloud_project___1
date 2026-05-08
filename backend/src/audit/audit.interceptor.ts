import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from './audit.service';

@Injectable()
export class LoginAuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | undefined>;
      ip: string;
    }>();
    const userAgent = request.headers['user-agent'] || 'Unknown';
    const ipAddress = request.ip;

    return next.handle().pipe(
      tap((response: { user?: { id: number } }) => {
        if (response?.user?.id) {
          void this.auditService.log(
            response.user.id,
            'LOGIN',
            String(ipAddress),
            userAgent,
          );
        }
      }),
    );
  }
}
