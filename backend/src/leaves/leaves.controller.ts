import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/user.decorator';
import { LeavesService } from './leaves.service';
import { CreateLeaveDto, UpdateLeaveStatusDto } from './dto/leave.dto';

@ApiTags('Leaves')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
@UseGuards(JwtAuthGuard)
@Controller('leaves')
export class LeavesController {
  constructor(private readonly service: LeavesService) {}

  @Get()
  @ApiOperation({ summary: 'List all leaves' })
  @ApiOkResponse({ description: 'Array of leave objects' })
  findAll(@CurrentUser() user: any, @Query('employeeId') employeeId?: string) {
    return this.service.findAll(user.role, employeeId ? Number(employeeId) : undefined);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a leave by ID' })
  @ApiOkResponse({ description: 'Leave object' })
  @ApiNotFoundResponse({ description: 'Leave not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Get('balance/:employeeId')
  @ApiOperation({ summary: 'Get leave balance for an employee' })
  @ApiOkResponse({ description: 'Leave balance by type' })
  getBalance(@Param('employeeId', ParseIntPipe) employeeId: number) {
    return this.service.getBalance(employeeId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a leave request' })
  @ApiCreatedResponse({ description: 'Leave created successfully' })
  create(@Body() body: CreateLeaveDto) {
    return this.service.create(body);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Approve or reject a leave request' })
  @ApiOkResponse({ description: 'Leave status updated' })
  @ApiNotFoundResponse({ description: 'Leave not found' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateLeaveStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.service.updateStatus(id, body, user.id, user.role);
  }
}
