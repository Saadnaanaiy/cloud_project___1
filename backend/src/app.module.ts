import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { EmployeesModule } from './employees/employees.module';
import { DepartmentsModule } from './departments/departments.module';
import { AttendanceModule } from './attendance/attendance.module';
import { ReportsModule } from './reports/reports.module';
import { User } from './auth/user.entity';
import { Employee } from './employees/employee.entity';
import { Department } from './departments/department.entity';
import { Attendance } from './attendance/attendance.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'employee_db',
      entities: [User, Employee, Department, Attendance],
      synchronize: true,
      logging: false,
    }),
    AuthModule,
    EmployeesModule,
    DepartmentsModule,
    AttendanceModule,
    ReportsModule,
  ],
})
export class AppModule {}
