import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './department.entity';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class DepartmentsService implements OnModuleInit {
  constructor(
    @InjectRepository(Department) private readonly repo: Repository<Department>,
    private readonly audit: AuditService,
  ) {}

  async onModuleInit() {
    const count = await this.repo.count();
    if (count === 0) {
      await this.repo.save([
        {
          name: 'Engineering',
          description: 'Software development and infrastructure',
        },
        {
          name: 'Human Resources',
          description: 'Recruitment, payroll and employee relations',
        },
        {
          name: 'Marketing',
          description: 'Brand, campaigns and digital marketing',
        },
        {
          name: 'Finance',
          description: 'Accounting, budgeting and financial planning',
        },
        { name: 'Operations', description: 'Day-to-day business operations' },
        { name: 'Sales', description: 'Client acquisition and revenue growth' },
      ]);
      console.log('✅ Default departments seeded');
    }
  }

  findAll() {
    return this.repo.find();
  }

  findOne(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  async create(data: Partial<Department>, userId: number) {
    const saved = await this.repo.save(data);
    void this.audit.log(
      userId,
      'CREATE',
      'DEPARTMENT',
      `Created department "${saved.name}"`,
    );
    return saved;
  }

  async update(id: number, data: Partial<Department>, userId: number) {
    await this.repo.update(id, data);
    const updated = await this.findOne(id);
    void this.audit.log(
      userId,
      'UPDATE',
      'DEPARTMENT',
      `Updated department "${updated?.name}"`,
    );
    return updated;
  }

  async remove(id: number, userId: number) {
    const dept = await this.findOne(id);
    await this.repo.delete(id);
    void this.audit.log(
      userId,
      'DELETE',
      'DEPARTMENT',
      `Deleted department "${dept?.name}"`,
    );
    return { message: 'Deleted' };
  }
}
