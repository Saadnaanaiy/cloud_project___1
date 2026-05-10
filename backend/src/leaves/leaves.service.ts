import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Leave, LeaveStatus, LeaveType } from './leave.entity';
import { CreateLeaveDto, UpdateLeaveStatusDto } from './dto/leave.dto';
import { UserRole } from '../auth/user.entity';

@Injectable()
export class LeavesService {
  private readonly approverRoles = [UserRole.ADMIN, UserRole.HR, UserRole.MANAGER];

  constructor(
    @InjectRepository(Leave) private readonly repo: Repository<Leave>,
  ) {}

  findAll(userRole: string, employeeId?: number) {
    if (userRole === UserRole.ADMIN || userRole === UserRole.HR) {
      const where: any = {};
      if (employeeId) where.employeeId = employeeId;
      return this.repo.find({ where, order: { createdAt: 'DESC' } });
    }
    return this.repo.find({
      where: { employeeId },
      order: { createdAt: 'DESC' },
    });
  }

  findOne(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  create(dto: CreateLeaveDto) {
    return this.repo.save(dto);
  }

  async updateStatus(
    id: number,
    dto: UpdateLeaveStatusDto,
    approverId: number,
    approverRole: string,
  ) {
    const leave = await this.repo.findOne({ where: { id } });
    if (!leave) throw new NotFoundException('Leave not found');

    if (!this.approverRoles.includes(approverRole as UserRole))
      throw new ForbiddenException('Insufficient permissions to approve leave');

    leave.status = dto.status;
    leave.approverComment = dto.comment ?? '';
    leave.approvedById = approverId;
    return this.repo.save(leave);
  }

  async getBalance(employeeId: number) {
    const leaves = await this.repo.find({
      where: { employeeId, status: LeaveStatus.APPROVED },
    });

    const totalByType: Record<string, number> = {
      [LeaveType.ANNUAL]: 0,
      [LeaveType.SICK]: 0,
      [LeaveType.PERSONAL]: 0,
    };

    for (const leave of leaves) {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      const days = Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
      ) + 1;
      totalByType[leave.type] += days;
    }

    return {
      annual: { used: totalByType[LeaveType.ANNUAL], total: 20 },
      sick: { used: totalByType[LeaveType.SICK], total: 10 },
      personal: { used: totalByType[LeaveType.PERSONAL], total: 5 },
    };
  }
}
