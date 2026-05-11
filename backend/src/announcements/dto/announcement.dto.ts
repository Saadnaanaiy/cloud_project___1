import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { AnnouncementPriority } from '../announcement.entity';

export class CreateAnnouncementDto {
  @ApiProperty({ example: 'Office Holiday Schedule', maxLength: 200 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({ example: 'The office will be closed on...' })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiPropertyOptional({
    enum: AnnouncementPriority,
    example: AnnouncementPriority.MEDIUM,
  })
  @IsOptional()
  @IsEnum(AnnouncementPriority)
  priority?: AnnouncementPriority;

  @ApiPropertyOptional({ example: '2026-06-01T09:00:00Z' })
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => (value as string) || undefined)
  @IsDateString()
  publishedAt?: string;
}

export class UpdateAnnouncementDto {
  @ApiPropertyOptional({ example: 'Updated Holiday Schedule', maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({ example: 'Updated content...' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ enum: AnnouncementPriority })
  @IsOptional()
  @IsEnum(AnnouncementPriority)
  priority?: AnnouncementPriority;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => (value as string) || undefined)
  @IsDateString()
  publishedAt?: string;
}
