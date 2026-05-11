import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Announcement } from './announcement.entity';
import {
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
} from './dto/announcement.dto';
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

  async findAll(userRole: string) {
    try {
      const qb = this.repo
        .createQueryBuilder('a')
        .leftJoinAndSelect('a.author', 'author')
        .orderBy('a.createdAt', 'DESC');

      if (userRole !== 'admin' && userRole !== 'hr') {
        qb.where('a.publishedAt <= :now', { now: new Date() });
      }

      return await qb.getMany();
    } catch {
      return [];
    }
  }

  async findOne(id: number) {
    try {
      return await this.repo
        .createQueryBuilder('a')
        .leftJoinAndSelect('a.author', 'author')
        .where('a.id = :id', { id })
        .getOne();
    } catch {
      return null;
    }
  }

  async create(dto: CreateAnnouncementDto, authorId: number) {
    try {
      const publishedAt = dto.publishedAt
        ? new Date(dto.publishedAt)
        : new Date();
      const announcement = await this.repo.save({
        title: dto.title,
        content: dto.content,
        priority: dto.priority,
        authorId,
        publishedAt,
      });

      if (this.employees && this.notifications) {
        void this.employees
          .findAll()
          .then((all) => {
            for (const emp of all) {
              void this.notifications!.sendAnnouncementEmail(
                emp.email,
                dto.title,
                dto.content,
              );
            }
          })
          .catch(() => {});
      }

      return this.repo
        .createQueryBuilder('a')
        .leftJoinAndSelect('a.author', 'author')
        .where('a.id = :id', { id: announcement.id })
        .getOne();
    } catch {
      throw new InternalServerErrorException('Failed to create announcement');
    }
  }

  async update(id: number, dto: UpdateAnnouncementDto) {
    const announcement = await this.repo.findOne({ where: { id } });
    if (!announcement) throw new NotFoundException('Announcement not found');

    try {
      const updateData: Record<string, unknown> = {};
      if (dto.title !== undefined) updateData.title = dto.title;
      if (dto.content !== undefined) updateData.content = dto.content;
      if (dto.priority !== undefined) updateData.priority = dto.priority;
      if (dto.publishedAt !== undefined)
        updateData.publishedAt = new Date(dto.publishedAt);

      await this.repo.update(id, updateData);

      return this.repo
        .createQueryBuilder('a')
        .leftJoinAndSelect('a.author', 'author')
        .where('a.id = :id', { id })
        .getOne();
    } catch {
      throw new InternalServerErrorException('Failed to update announcement');
    }
  }

  async remove(id: number) {
    const result = await this.repo.delete(id);
    if (result.affected === 0)
      throw new NotFoundException('Announcement not found');
    return { message: 'Deleted' };
  }

  async getUnreadCount(after: Date) {
    try {
      return await this.repo
        .createQueryBuilder('a')
        .where('a.createdAt > :after', { after })
        .getCount();
    } catch {
      return 0;
    }
  }
}
