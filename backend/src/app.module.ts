import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'node:path';
import { Announcement } from './announcements/announcement.entity';
import { AnnouncementsModule } from './announcements/announcements.module';
import { Attendance } from './attendance/attendance.entity';
import { AttendanceModule } from './attendance/attendance.module';
import { AuthModule } from './auth/auth.module';
import { User } from './auth/user.entity';
import { Department } from './departments/department.entity';
import { DepartmentsModule } from './departments/departments.module';
import { Employee } from './employees/employee.entity';
import { EmployeesModule } from './employees/employees.module';
import { HealthModule } from './health/health.module';
import { Message } from './messages/message.entity';
import { MessagesModule } from './messages/messages.module';
import { ReportsModule } from './reports/reports.module';
import { AuditLog } from './audit/audit-log.entity';
import { AuditModule } from './audit/audit.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const password = config.get<string>('DB_PASSWORD', '');
        return {
          type: 'mysql' as const,
          host: config.get<string>('DB_HOST', 'localhost'),
          port: config.get<number>('DB_PORT', 3306),
          username: config.get<string>('DB_USERNAME', 'root'),
          password,
          database: config.get<string>('DB_NAME', 'employee_db'),
          entities: [
            User,
            Employee,
            Department,
            Attendance,
            Message,
            AuditLog,
            Announcement,
          ],
          synchronize: true, // always sync so new tables (e.g. announcements) are created
          logging: false,
        };
      },
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 30000,
        limit: 100,
      },
    ]),
    AuthModule,
    EmployeesModule,
    DepartmentsModule,
    AttendanceModule,
    ReportsModule,
    HealthModule,
    MessagesModule,
    AuditModule,
    AnnouncementsModule,
  ],
})
export class AppModule {}
