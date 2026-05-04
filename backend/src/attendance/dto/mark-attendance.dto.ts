import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { AttendanceStatus } from '../attendance.entity';

export class AttendanceRecordDto {
  @ApiProperty({ example: 42, description: 'Employee ID' })
  @IsNumber()
  employeeId: number;

  @ApiProperty({
    enum: AttendanceStatus,
    example: AttendanceStatus.PRESENT,
    description: 'Attendance status for this employee',
  })
  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;

  @ApiPropertyOptional({ example: 'Left early due to medical appointment' })
  @IsOptional()
  @IsString()
  note?: string;
}

export class MarkAttendanceDto {
  @ApiProperty({
    example: '2025-05-04',
    description: 'Date for which attendance is being marked (YYYY-MM-DD)',
  })
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @ApiProperty({
    type: [AttendanceRecordDto],
    description: 'Array of per-employee attendance records',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttendanceRecordDto)
  records: AttendanceRecordDto[];
}
