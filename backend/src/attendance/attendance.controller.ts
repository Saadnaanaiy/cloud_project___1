import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../auth/user.entity';
import { AttendanceService } from './attendance.service';

@ApiTags('Attendance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly service: AttendanceService) {}

  // ── READ — all authenticated roles ───────────────────────────────────────────
  @Get()
  @ApiQuery({ name: 'date', required: false })
  @ApiQuery({ name: 'employeeId', required: false })
  getAttendance(
    @Query('date') date?: string,
    @Query('employeeId') employeeId?: number,
  ) {
    if (employeeId) return this.service.getByEmployee(+employeeId);
    return this.service.getByDate(
      date || new Date().toISOString().split('T')[0],
    );
  }

  @Get('stats/monthly')
  @ApiQuery({ name: 'year', required: true })
  @ApiQuery({ name: 'month', required: true })
  monthly(@Query('year') year: number, @Query('month') month: number) {
    return this.service.getMonthlyStats(+year, +month);
  }

  @Get('stats/yearly')
  @ApiQuery({ name: 'year', required: true })
  yearly(@Query('year') year: number) {
    return this.service.getYearlyStats(+year);
  }

  // ── MARK — Admin, HR & Manager ───────────────────────────────────────────────
  @Post()
  @Roles(UserRole.ADMIN, UserRole.HR, UserRole.MANAGER)
  mark(@Body() body: { date: string; records: any[] }) {
    return this.service.markAttendance(body.date, body.records);
  }
}
