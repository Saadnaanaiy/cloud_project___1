import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
    @Optional() private readonly notifications?: NotificationsService,
    @Optional() private readonly employees?: EmployeesService,
  ) {}

  findAll(userRole: string) {
    if (userRole === UserRole.ADMIN || userRole === UserRole.HR) {
      return this.repo.find({ order: { createdAt: 'DESC' } });
    }
    return this.repo
      .createQueryBuilder('a')
      .where('a.publishedAt <= :now', { now: new Date() })
      .orderBy('a.createdAt', 'DESC')
      .getMany();
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

    if (this.employees && this.notifications) {
      this.employees.findAll().then(all => {
        for (const emp of all) {
          this.notifications!.sendAnnouncementEmail(emp.email, dto.title, dto.content);
        }
      }).catch(() => {});
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
    return this.repo
      .createQueryBuilder('a')
      .where('a.createdAt > :after', { after })
      .getCount();
  }
}
