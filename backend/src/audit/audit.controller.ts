import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiForbiddenResponse,
    ApiOkResponse,
    ApiOperation,
    ApiQuery,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../auth/user.entity';

@ApiTags('Audit')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
@ApiForbiddenResponse({ description: 'Requires admin role' })
@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('logs')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get recent audit / security logs',
    description:
      'Returns the most recent login events and security actions. ' +
      'Each entry includes user, action, IP address, user-agent, and timestamp. ' +
      '**Admin only.**',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Maximum number of log entries to return (default: 20)',
    example: 50,
  })
  @ApiOkResponse({
    description: 'Array of audit log entries ordered by timestamp descending',
    schema: {
      example: [
        {
          id: 1,
          action: 'LOGIN',
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0...',
          location: 'Casablanca, MA',
          timestamp: '2025-05-04T11:30:00.000Z',
          user: { id: 1, name: 'Admin User', email: 'admin@company.com' },
        },
      ],
    },
  })
  getRecentLogs(@Query('limit') limit?: number) {
    return this.auditService.getRecentLogs(limit ? +limit : 20);
  }
}
