import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Announcement } from './announcement.entity';
import {
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
} from './dto/announcement.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class AnnouncementsService {
  constructor(
    @InjectRepository(Announcement)
    private readonly repo: Repository<Announcement>,
    private readonly audit: AuditService,
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

      void this.audit.log(
        authorId,
        'CREATE',
        'ANNOUNCEMENT',
        `Created announcement "${dto.title}"`,
      );

      return this.repo
        .createQueryBuilder('a')
        .leftJoinAndSelect('a.author', 'author')
        .where('a.id = :id', { id: announcement.id })
        .getOne();
    } catch {
      throw new InternalServerErrorException('Failed to create announcement');
    }
  }

  async update(id: number, dto: UpdateAnnouncementDto, userId: number) {
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

      void this.audit.log(
        userId,
        'UPDATE',
        'ANNOUNCEMENT',
        `Updated announcement "${announcement.title}"`,
      );

      return this.repo
        .createQueryBuilder('a')
        .leftJoinAndSelect('a.author', 'author')
        .where('a.id = :id', { id })
        .getOne();
    } catch {
      throw new InternalServerErrorException('Failed to update announcement');
    }
  }

  async remove(id: number, userId: number) {
    const announcement = await this.repo.findOne({ where: { id } });
    if (!announcement) throw new NotFoundException('Announcement not found');

    await this.repo.delete(id);
    void this.audit.log(
      userId,
      'DELETE',
      'ANNOUNCEMENT',
      `Deleted announcement "${announcement.title}"`,
    );
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
