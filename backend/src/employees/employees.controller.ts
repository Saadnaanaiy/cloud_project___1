import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Put,
    Query,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiNoContentResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiTags,
    ApiCreatedResponse,
    ApiForbiddenResponse,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../auth/user.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeesService } from './employees.service';

@ApiTags('Employees')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
@ApiForbiddenResponse({ description: 'Insufficient role permissions' })
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('employees')
export class EmployeesController {
  constructor(private readonly service: EmployeesService) {}

  // ── READ — all authenticated roles ───────────────────────────────────────────

  @Get()
  @ApiOperation({
    summary: 'List all employees',
    description: 'Returns a filtered, pageable list of employees. Accessible by all authenticated roles.',
  })
  @ApiQuery({ name: 'search', required: false, description: 'Search by name, email or position' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status: active | blocked | on_leave | terminated', enum: ['active', 'blocked', 'on_leave', 'terminated'] })
  @ApiQuery({ name: 'departmentId', required: false, description: 'Filter by department ID', type: Number })
  @ApiOkResponse({ description: 'Array of employee objects' })
  findAll(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('departmentId') departmentId?: number,
  ) {
    return this.service.findAll(search, status, departmentId);
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get employee statistics',
    description: 'Returns aggregate counts: total, active, blocked, on_leave, terminated, and breakdown by department.',
  })
  @ApiOkResponse({ description: 'Employee stats object with total, active, blocked, onLeave, and byDepartment array' })
  getStats() {
    return this.service.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single employee by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Employee ID', example: 1 })
  @ApiOkResponse({ description: 'Employee object' })
  @ApiNotFoundResponse({ description: 'Employee not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  // ── WRITE — Admin & HR only ──────────────────────────────────────────────────

  @Post()
  @Roles(UserRole.ADMIN, UserRole.HR)
  @ApiOperation({
    summary: 'Create a new employee',
    description: 'Requires **admin** or **hr** role.',
  })
  @ApiCreatedResponse({ description: 'Employee created successfully' })
  create(@Body() body: CreateEmployeeDto) {
    return this.service.create(body);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.HR)
  @ApiOperation({
    summary: 'Update an employee',
    description: 'Full update. Requires **admin** or **hr** role.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Employee ID to update', example: 1 })
  @ApiOkResponse({ description: 'Updated employee object' })
  @ApiNotFoundResponse({ description: 'Employee not found' })
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateEmployeeDto) {
    return this.service.update(id, body);
  }

  // ── DELETE / BLOCK — Admin only ──────────────────────────────────────────────

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete an employee',
    description: 'Permanently removes the employee record. Requires **admin** role.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Employee ID to delete', example: 1 })
  @ApiNoContentResponse({ description: 'Employee deleted' })
  @ApiNotFoundResponse({ description: 'Employee not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  @Patch(':id/block')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Block an employee',
    description: 'Sets status to `blocked`. Requires **admin** role.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Employee ID to block', example: 1 })
  @ApiOkResponse({ description: 'Employee blocked' })
  block(@Param('id', ParseIntPipe) id: number) {
    return this.service.block(id);
  }

  @Patch(':id/unblock')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Unblock an employee',
    description: 'Sets status back to `active`. Requires **admin** role.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Employee ID to unblock', example: 1 })
  @ApiOkResponse({ description: 'Employee unblocked' })
  unblock(@Param('id', ParseIntPipe) id: number) {
    return this.service.unblock(id);
  }
}
