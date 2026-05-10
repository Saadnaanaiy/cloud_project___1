import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
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
import { UserRole } from '../auth/user.entity';
import { CurrentUser } from '../auth/user.decorator';
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto, UpdateAnnouncementDto } from './dto/announcement.dto';

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
  getUnreadCount(@Query('after') after?: string) {
    const date = after ? new Date(after) : new Date(0);
    return this.service.getUnreadCount(date);
  }

  @Get()
  @ApiOperation({ summary: 'List all announcements' })
  @ApiOkResponse({ description: 'Array of announcement objects' })
  findAll(@CurrentUser() user: any) {
    return this.service.findAll(user.role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an announcement by ID' })
  @ApiOkResponse({ description: 'Announcement object' })
  @ApiNotFoundResponse({ description: 'Announcement not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.HR)
  @ApiOperation({ summary: 'Create an announcement', description: 'Requires admin or hr role.' })
  @ApiCreatedResponse({ description: 'Announcement created successfully' })
  create(@Body() body: CreateAnnouncementDto, @CurrentUser() user: any) {
    return this.service.create(body, user.id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.HR)
  @ApiOperation({ summary: 'Update an announcement', description: 'Requires admin or hr role.' })
  @ApiOkResponse({ description: 'Updated announcement object' })
  @ApiNotFoundResponse({ description: 'Announcement not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateAnnouncementDto,
  ) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an announcement', description: 'Requires admin role.' })
  @ApiNoContentResponse({ description: 'Announcement deleted' })
  @ApiNotFoundResponse({ description: 'Announcement not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
