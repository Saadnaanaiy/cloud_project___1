import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Leave } from './leave.entity';
import { LeavesService } from './leaves.service';
import { LeavesController } from './leaves.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { EmployeesModule } from '../employees/employees.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Leave]),
    NotificationsModule,
    EmployeesModule,
  ],
  providers: [LeavesService],
  controllers: [LeavesController],
  exports: [LeavesService],
})
export class LeavesModule {}
