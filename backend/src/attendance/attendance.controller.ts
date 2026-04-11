import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Attendance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private service: AttendanceService) {}

  @Get()
  @ApiQuery({ name: 'date', required: false })
  @ApiQuery({ name: 'employeeId', required: false })
  getAttendance(@Query('date') date?: string, @Query('employeeId') employeeId?: number) {
    if (employeeId) return this.service.getByEmployee(+employeeId);
    return this.service.getByDate(date || new Date().toISOString().split('T')[0]);
  }

  @Post()
  mark(@Body() body: { date: string; records: any[] }) {
    return this.service.markAttendance(body.date, body.records);
  }

  @Get('stats/monthly')
  @ApiQuery({ name: 'year', required: true })
  @ApiQuery({ name: 'month', required: true })
  monthly(@Query('year') year: number, @Query('month') month: number) {
    return this.service.getMonthlyStats(+year, +month);
  }
}
