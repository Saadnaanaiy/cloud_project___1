import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee, EmployeeStatus } from './employee.entity';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class EmployeesService implements OnModuleInit {
  constructor(
    @InjectRepository(Employee) private readonly repo: Repository<Employee>,
    private readonly audit: AuditService,
  ) {}

  async onModuleInit() {
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const count = await this.repo.count();
    if (count === 0) {
      try {
        const rawDepts: unknown = await this.repo.query(
          'SELECT id FROM departments ORDER BY id ASC LIMIT 6',
        );
        const depts = rawDepts as { id: number }[];
        if (depts && depts.length >= 6) {
          const d1 = depts[0].id;
          const d2 = depts[1].id;
          const d3 = depts[2].id;
          const d4 = depts[3].id;
          const d6 = depts[5].id;

          await this.repo.save([
            {
              firstName: 'Alice',
              lastName: 'Dubois',
              email: 'alice.d@company.com',
              phone: '+212 6 11 22 33 44',
              position: 'CTO',
              departmentId: d1,
              hireDate: '2021-01-15',
              salary: 120000,
              status: EmployeeStatus.ACTIVE,
            },
            {
              firstName: 'Bob',
              lastName: 'Martin',
              email: 'bob.m@company.com',
              phone: '+212 6 22 33 44 55',
              position: 'Senior Developer',
              departmentId: d1,
              hireDate: '2022-03-10',
              salary: 85000,
              status: EmployeeStatus.ACTIVE,
            },
            {
              firstName: 'Chadia',
              lastName: 'Benali',
              email: 'chadia.b@company.com',
              phone: '+212 6 33 44 55 66',
              position: 'HR Manager',
              departmentId: d2,
              hireDate: '2020-06-01',
              salary: 78000,
              status: EmployeeStatus.ACTIVE,
            },
            {
              firstName: 'David',
              lastName: 'Cohen',
              email: 'david.c@company.com',
              phone: '+212 6 44 55 66 77',
              position: 'Marketing Lead',
              departmentId: d3,
              hireDate: '2022-09-20',
              salary: 72000,
              status: EmployeeStatus.ACTIVE,
            },
            {
              firstName: 'Fatima',
              lastName: 'Zahra',
              email: 'fatima.z@company.com',
              phone: '+212 6 55 66 77 88',
              position: 'Financial Analyst',
              departmentId: d4,
              hireDate: '2023-02-01',
              salary: 62000,
              status: EmployeeStatus.ON_LEAVE,
            },
            {
              firstName: 'Grace',
              lastName: 'Kim',
              email: 'grace.k@company.com',
              phone: '+212 6 77 88 99 00',
              position: 'Backend Developer',
              departmentId: d1,
              hireDate: '2023-06-15',
              salary: 65000,
              status: EmployeeStatus.ACTIVE,
            },
            {
              firstName: 'Hassan',
              lastName: 'El Idrissi',
              email: 'hassan.e@company.com',
              phone: '+212 6 88 99 00 11',
              position: 'DevOps Engineer',
              departmentId: d1,
              hireDate: '2022-04-18',
              salary: 72000,
              status: EmployeeStatus.BLOCKED,
            },
            {
              firstName: 'Isabelle',
              lastName: 'Moreau',
              email: 'isabelle.m@company.com',
              phone: '+212 6 99 00 11 22',
              position: 'Recruiter',
              departmentId: d2,
              hireDate: '2023-12-01',
              salary: 50000,
              status: EmployeeStatus.ACTIVE,
            },
            {
              firstName: 'Julien',
              lastName: 'Blanc',
              email: 'julien.b@company.com',
              phone: '+212 6 10 11 22 33',
              position: 'Account Manager',
              departmentId: d6,
              hireDate: '2021-08-22',
              salary: 58000,
              status: EmployeeStatus.ON_LEAVE,
            },
          ]);
          console.log('✅ Sample employees seeded');
        } else {
          console.log(
            '⚠️ Not enough departments seeded yet, skipping employee seed.',
          );
        }
      } catch (err) {
        console.error('❌ Failed to seed employees.', err);
      }
    }
  }

  async findAll(search?: string, status?: string, departmentId?: number) {
    const query = this.repo
      .createQueryBuilder('e')
      .leftJoinAndSelect('e.department', 'department');
    if (search) {
      query.andWhere(
        '(e.firstName LIKE :s OR e.lastName LIKE :s OR e.email LIKE :s OR e.position LIKE :s)',
        { s: `%${search}%` },
      );
    }
    if (status) query.andWhere('e.status = :status', { status });
    if (departmentId)
      query.andWhere('e.departmentId = :departmentId', { departmentId });
    return query.orderBy('e.createdAt', 'DESC').getMany();
  }

  async findOne(id: number) {
    const emp = await this.repo.findOne({ where: { id } });
    if (!emp) throw new NotFoundException('Employee not found');
    return emp;
  }

  async create(data: Partial<Employee>, userId: number) {
    const emp = this.repo.create(data);
    const saved = await this.repo.save(emp);
    void this.audit.log(
      userId,
      'CREATE',
      'EMPLOYEE',
      `Created employee "${saved.firstName} ${saved.lastName}"`,
    );
    return saved;
  }

  async update(id: number, data: Partial<Employee>, userId: number) {
    const emp = await this.findOne(id);
    await this.repo.update(id, data);
    void this.audit.log(
      userId,
      'UPDATE',
      'EMPLOYEE',
      `Updated employee "${emp.firstName} ${emp.lastName}"`,
    );
    return this.findOne(id);
  }

  async remove(id: number, userId: number) {
    const emp = await this.findOne(id);
    await this.repo.delete(id);
    void this.audit.log(
      userId,
      'DELETE',
      'EMPLOYEE',
      `Deleted employee "${emp.firstName} ${emp.lastName}"`,
    );
    return { message: 'Employee deleted successfully' };
  }

  async block(id: number, userId: number) {
    const emp = await this.findOne(id);
    await this.repo.update(id, { status: EmployeeStatus.BLOCKED });
    void this.audit.log(
      userId,
      'BLOCK',
      'EMPLOYEE',
      `Blocked employee "${emp.firstName} ${emp.lastName}"`,
    );
    return this.findOne(id);
  }

  async unblock(id: number, userId: number) {
    const emp = await this.findOne(id);
    await this.repo.update(id, { status: EmployeeStatus.ACTIVE });
    void this.audit.log(
      userId,
      'UNBLOCK',
      'EMPLOYEE',
      `Unblocked employee "${emp.firstName} ${emp.lastName}"`,
    );
    return this.findOne(id);
  }

  async getStats() {
    const total = await this.repo.count();
    const active = await this.repo.count({
      where: { status: EmployeeStatus.ACTIVE },
    });
    const blocked = await this.repo.count({
      where: { status: EmployeeStatus.BLOCKED },
    });
    const onLeave = await this.repo.count({
      where: { status: EmployeeStatus.ON_LEAVE },
    });
    const byDept = await this.repo
      .createQueryBuilder('e')
      .select('d.name', 'department')
      .addSelect('COUNT(e.id)', 'count')
      .leftJoin('e.department', 'd')
      .groupBy('d.name')
      .getRawMany();
    return { total, active, blocked, onLeave, byDepartment: byDept };
  }
}
