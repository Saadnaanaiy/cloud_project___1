import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { User, UserRole } from '../auth/user.entity';
import { CurrentUser } from '../auth/user.decorator';
import { AnnouncementsService } from './announcements.service';
import {
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
} from './dto/announcement.dto';

@ApiTags('Announcements')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
@ApiForbiddenResponse({ description: 'Insufficient role permissions' })
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly service: AnnouncementsService) {}

  @Get('unread-count')
  @ApiOperation({ summary: 'Get count of announcements since a date' })
  @ApiOkResponse({ description: 'Number of unread announcements' })
  async getUnreadCount(@Query('after') after?: string) {
    try {
      const date = after ? new Date(after) : new Date(0);
      return await this.service.getUnreadCount(date);
    } catch {
      return 0;
    }
  }

  @Get()
  @ApiOperation({ summary: 'List all announcements' })
  @ApiOkResponse({ description: 'Array of announcement objects' })
  async findAll(@CurrentUser() user: Pick<User, 'role'>) {
    try {
      return await this.service.findAll(user.role);
    } catch {
      return [];
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an announcement by ID' })
  @ApiOkResponse({ description: 'Announcement object' })
  @ApiNotFoundResponse({ description: 'Announcement not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.service.findOne(id);
    } catch {
      throw new InternalServerErrorException('Failed to fetch announcement');
    }
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Create an announcement',
    description: 'Requires admin role.',
  })
  @ApiCreatedResponse({ description: 'Announcement created successfully' })
  async create(
    @Body() body: CreateAnnouncementDto,
    @CurrentUser() user: Pick<User, 'id'>,
  ) {
    try {
      return await this.service.create(body, user.id);
    } catch {
      throw new InternalServerErrorException('Failed to create announcement');
    }
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Update an announcement',
    description: 'Requires admin role.',
  })
  @ApiOkResponse({ description: 'Updated announcement object' })
  @ApiNotFoundResponse({ description: 'Announcement not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateAnnouncementDto,
    @CurrentUser() user: Pick<User, 'id'>,
  ) {
    try {
      return await this.service.update(id, body, user.id);
    } catch {
      throw new InternalServerErrorException('Failed to update announcement');
    }
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete an announcement',
    description: 'Requires admin role.',
  })
  @ApiNoContentResponse({ description: 'Announcement deleted' })
  @ApiNotFoundResponse({ description: 'Announcement not found' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: Pick<User, 'id'>,
  ) {
    try {
      return await this.service.remove(id, user.id);
    } catch {
      throw new InternalServerErrorException('Failed to delete announcement');
    }
  }
}
