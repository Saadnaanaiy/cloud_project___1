import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './audit-log.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async log(userId: number, action: string, ipAddress: string, userAgent: string) {
    const auditLog = this.auditLogRepository.create({
      userId,
      action,
      ipAddress,
      userAgent,
    });
    return this.auditLogRepository.save(auditLog);
  }

  async getRecentLogs(limit = 10) {
    return this.auditLogRepository.find({
      relations: ['user'],
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }
}
