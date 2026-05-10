import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThan } from 'typeorm';
import { Announcement } from './announcement.entity';
import { CreateAnnouncementDto, UpdateAnnouncementDto } from './dto/announcement.dto';
import { UserRole } from '../auth/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { EmployeesService } from '../employees/employees.service';

@Injectable()
export class AnnouncementsService {
  constructor(
    @InjectRepository(Announcement)
    private readonly repo: Repository<Announcement>,
    private readonly notifications: NotificationsService,
    private readonly employees: EmployeesService,
  ) {}

  findAll(userRole: string) {
    if (userRole === UserRole.ADMIN || userRole === UserRole.HR) {
      return this.repo.find({ order: { createdAt: 'DESC' } });
    }
    return this.repo.find({
      where: { publishedAt: LessThanOrEqual(new Date()) },
      order: { createdAt: 'DESC' },
    });
  }

  findOne(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  async create(dto: CreateAnnouncementDto, authorId: number) {
    const publishedAt = dto.publishedAt ? new Date(dto.publishedAt) : new Date();
    const announcement = await this.repo.save({
      ...dto,
      authorId,
      publishedAt,
    });

    const allEmployees = await this.employees.findAll();
    for (const emp of allEmployees) {
      await this.notifications.sendAnnouncementEmail(
        emp.email,
        dto.title,
        dto.content,
      );
    }

    return announcement;
  }

  async update(id: number, dto: UpdateAnnouncementDto) {
    const announcement = await this.repo.findOne({ where: { id } });
    if (!announcement) throw new NotFoundException('Announcement not found');
    await this.repo.update(id, dto);
    return this.repo.findOne({ where: { id } });
  }

  async remove(id: number) {
    const result = await this.repo.delete(id);
    if (result.affected === 0)
      throw new NotFoundException('Announcement not found');
    return { message: 'Deleted' };
  }

  async getUnreadCount(after: Date) {
    return this.repo.count({ where: { createdAt: MoreThan(after) } });
  }
}
