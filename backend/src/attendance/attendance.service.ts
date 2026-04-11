import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance, AttendanceStatus } from './attendance.entity';

@Injectable()
export class AttendanceService {
  constructor(@InjectRepository(Attendance) private repo: Repository<Attendance>) {}

  async getByDate(date: string) {
    return this.repo.find({ where: { date }, relations: ['employee', 'employee.department'] });
  }

  async getByEmployee(employeeId: number) {
    return this.repo.find({
      where: { employeeId },
      order: { date: 'DESC' },
      take: 30,
    });
  }

  async markAttendance(date: string, records: { employeeId: number; status: AttendanceStatus; note?: string }[]) {
    const results: any[] = [];
    for (const record of records) {
      const existing = await this.repo.findOne({ where: { employeeId: record.employeeId, date } });
      if (existing) {
        await this.repo.update(existing.id, { status: record.status, note: record.note });
        results.push({ ...existing, status: record.status });
      } else {
        const att = this.repo.create({ employeeId: record.employeeId, date, status: record.status, note: record.note });
        results.push(await this.repo.save(att));
      }
    }
    return { saved: results.length, date };
  }

  async getMonthlyStats(year: number, month: number) {
    const pad = (n: number) => String(n).padStart(2, '0');
    const start = `${year}-${pad(month)}-01`;
    const end = `${year}-${pad(month)}-31`;
    const rows = await this.repo
      .createQueryBuilder('a')
      .select('a.date', 'date')
      .addSelect('COUNT(CASE WHEN a.status = "present" THEN 1 END)', 'present')
      .addSelect('COUNT(CASE WHEN a.status = "absent" THEN 1 END)', 'absent')
      .addSelect('COUNT(CASE WHEN a.status = "late" THEN 1 END)', 'late')
      .where('a.date BETWEEN :start AND :end', { start, end })
      .groupBy('a.date')
      .orderBy('a.date', 'ASC')
      .getRawMany();
    return rows;
  }

  async getAllForReport(filters?: { month?: number; year?: number }) {
    const query = this.repo.createQueryBuilder('a')
      .leftJoinAndSelect('a.employee', 'e')
      .leftJoinAndSelect('e.department', 'd');
    if (filters?.month && filters?.year) {
      const pad = (n: number) => String(n).padStart(2, '0');
      const start = `${filters.year}-${pad(filters.month)}-01`;
      const end = `${filters.year}-${pad(filters.month)}-31`;
      query.where('a.date BETWEEN :start AND :end', { start, end });
    }
    return query.orderBy('a.date', 'DESC').getMany();
  }
}
