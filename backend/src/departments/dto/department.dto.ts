import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateDepartmentDto {
  @ApiProperty({
    example: 'Engineering',
    description: 'Unique department name',
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    example: 'Responsible for all software engineering activities',
    description: 'Optional description of the department',
  })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateDepartmentDto {
  @ApiPropertyOptional({ example: 'Product Engineering', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: 'Handles product and engineering roadmap' })
  @IsOptional()
  @IsString()
  description?: string;
}
