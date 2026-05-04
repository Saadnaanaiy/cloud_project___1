import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { EmployeeStatus } from '../employee.entity';

export class CreateEmployeeDto {
  @ApiProperty({ example: 'Jane', description: 'Employee first name' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Employee last name' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'jane.doe@company.com', description: 'Unique email address' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: '+212 6 12 34 56 78', description: 'Phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'Software Engineer', description: 'Job title / position' })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiPropertyOptional({ example: '2024-01-15', description: 'Hire date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  hireDate?: string;

  @ApiPropertyOptional({ example: 5500.00, description: 'Monthly salary in local currency' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  salary?: number;

  @ApiPropertyOptional({
    enum: EmployeeStatus,
    default: EmployeeStatus.ACTIVE,
    description: 'Employment status',
  })
  @IsOptional()
  @IsEnum(EmployeeStatus)
  status?: EmployeeStatus;

  @ApiPropertyOptional({ example: 2, description: 'Department ID to assign the employee to' })
  @IsOptional()
  @IsNumber()
  departmentId?: number;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/avatar.jpg', description: 'Avatar image URL' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
