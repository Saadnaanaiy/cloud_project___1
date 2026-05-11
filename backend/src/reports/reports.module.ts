import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from '../employees/employee.entity';
import { Attendance } from '../attendance/attendance.entity';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [TypeOrmModule.forFeature([Employee, Attendance]), AuditModule],
  providers: [ReportsService],
  controllers: [ReportsController],
})
export class ReportsModule {}
