import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Leave, LeaveStatus, LeaveType } from './leave.entity';
import { CreateLeaveDto, UpdateLeaveStatusDto } from './dto/leave.dto';
import { UserRole } from '../auth/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { EmployeesService } from '../employees/employees.service';

@Injectable()
export class LeavesService {
  private readonly approverRoles = [UserRole.ADMIN, UserRole.HR, UserRole.MANAGER];

  constructor(
    @InjectRepository(Leave) private readonly repo: Repository<Leave>,
    private readonly notifications: NotificationsService,
    private readonly employees: EmployeesService,
  ) {}

  findAll(userRole: string, employeeId?: number) {
    const where: any = {};
    if (employeeId) where.employeeId = employeeId;
    if (userRole !== UserRole.ADMIN && userRole !== UserRole.HR && employeeId) {
      where.employeeId = employeeId;
    }
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  findOne(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  async create(dto: CreateLeaveDto) {
    const leave = await this.repo.save(dto);
    const employee = await this.employees.findOne(dto.employeeId).catch(() => null);
    if (employee) {
      await this.notifications.sendNewLeaveNotification(
        employee.email,
        `${employee.firstName} ${employee.lastName}`,
        dto.type,
      );
    }
    return leave;
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
    const saved = await this.repo.save(leave);

    const employee = await this.employees.findOne(leave.employeeId).catch(() => null);
    if (employee) {
      await this.notifications.sendLeaveStatusEmail(
        employee.email,
        `${employee.firstName} ${employee.lastName}`,
        leave.type,
        dto.status,
        dto.comment,
      );
    }

    return saved;
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
