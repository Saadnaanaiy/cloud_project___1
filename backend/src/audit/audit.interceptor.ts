import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from './audit.service';

@Injectable()
export class LoginAuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const userAgent = request.headers['user-agent'] || 'Unknown';
    const ipAddress = request.headers['x-forwarded-for'] || request.ip || request.connection.remoteAddress;

    return next.handle().pipe(
      tap(async (response) => {
        // If login was successful, the response will contain the user data
        if (response?.user?.id) {
          await this.auditService.log(
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
