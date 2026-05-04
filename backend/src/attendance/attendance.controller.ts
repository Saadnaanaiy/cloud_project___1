import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiBody,
    ApiCreatedResponse,
    ApiForbiddenResponse,
    ApiOkResponse,
    ApiOperation,
    ApiQuery,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../auth/user.entity';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { AttendanceService } from './attendance.service';

@ApiTags('Attendance')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
@ApiForbiddenResponse({ description: 'Insufficient role permissions' })
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly service: AttendanceService) {}

  // ── READ — all authenticated roles ───────────────────────────────────────────

  @Get()
  @ApiOperation({
    summary: 'Get attendance records',
    description:
      'Returns attendance records for a specific date or a specific employee. ' +
      'Pass either `date` or `employeeId` (not both).',
  })
  @ApiQuery({
    name: 'date',
    required: false,
    description: 'Date to fetch attendance for (YYYY-MM-DD). Defaults to today.',
    example: '2025-05-04',
  })
  @ApiQuery({
    name: 'employeeId',
    required: false,
    description: 'Fetch all attendance records for a specific employee.',
    type: Number,
    example: 7,
  })
  @ApiOkResponse({ description: 'Array of attendance records' })
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
  @ApiOperation({
    summary: 'Monthly attendance stats',
    description: 'Returns day-by-day attendance counts (present, absent, late) for a given month.',
  })
  @ApiQuery({ name: 'year', required: true, type: Number, example: 2025 })
  @ApiQuery({ name: 'month', required: true, type: Number, example: 5, description: '1–12' })
  @ApiOkResponse({ description: 'Array of daily attendance stat objects' })
  monthly(@Query('year') year: number, @Query('month') month: number) {
    return this.service.getMonthlyStats(+year, +month);
  }

  @Get('stats/yearly')
  @ApiOperation({
    summary: 'Yearly attendance stats',
    description: 'Returns month-by-month attendance totals for a given year (used for charts).',
  })
  @ApiQuery({ name: 'year', required: true, type: Number, example: 2025 })
  @ApiOkResponse({ description: 'Array of monthly attendance stat objects' })
  yearly(@Query('year') year: number) {
    return this.service.getYearlyStats(+year);
  }

  // ── MARK — Admin, HR & Manager ───────────────────────────────────────────────

  @Post()
  @Roles(UserRole.ADMIN, UserRole.HR, UserRole.MANAGER)
  @ApiOperation({
    summary: 'Mark attendance for a day',
    description:
      'Submit attendance records for multiple employees on a specific date. ' +
      'Requires **admin**, **hr**, or **manager** role.',
  })
  @ApiBody({ type: MarkAttendanceDto })
  @ApiCreatedResponse({ description: 'Attendance records saved successfully' })
  mark(@Body() body: MarkAttendanceDto) {
    return this.service.markAttendance(body.date, body.records);
  }
}
