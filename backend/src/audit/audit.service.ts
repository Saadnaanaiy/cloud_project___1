import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './audit-log.entity';
import { AuditGateway } from './audit.gateway';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly repo: Repository<AuditLog>,
    private readonly auditGateway: AuditGateway,
  ) {}

  async log(
    userId: number,
    action: string,
    entity?: string,
    details?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const saved = await this.repo.save({
      userId,
      action,
      entity,
      details,
      ipAddress,
      userAgent,
    });
    const logWithUser = await this.repo.findOne({
      where: { id: saved.id },
      relations: ['user'],
    });
    if (logWithUser) {
      this.auditGateway.broadcastLog(logWithUser);
    }
    return saved;
  }

  async getRecentLogs(limit = 20) {
    return this.repo.find({
      relations: ['user'],
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }
}
