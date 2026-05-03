import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './department.entity';

@Injectable()
export class DepartmentsService implements OnModuleInit {
  constructor(
    @InjectRepository(Department) private readonly repo: Repository<Department>,
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
  create(data: Partial<Department>) {
    return this.repo.save(data);
  }
  async update(id: number, data: Partial<Department>) {
    await this.repo.update(id, data);
    return this.findOne(id);
  }
  async remove(id: number) {
    await this.repo.delete(id);
    return { message: 'Deleted' };
  }
}
