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
    ApiParam,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../auth/user.entity';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/department.dto';
import { DepartmentsService } from './departments.service';

@ApiTags('Departments')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
@ApiForbiddenResponse({ description: 'Insufficient role permissions' })
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('departments')
export class DepartmentsController {
  constructor(private readonly service: DepartmentsService) {}

  // ── READ — all authenticated roles ───────────────────────────────────────────

  @Get()
  @ApiOperation({
    summary: 'List all departments',
    description: 'Returns all departments. Accessible by all authenticated roles.',
  })
  @ApiOkResponse({ description: 'Array of department objects' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a department by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Department ID', example: 1 })
  @ApiOkResponse({ description: 'Department object' })
  @ApiNotFoundResponse({ description: 'Department not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  // ── WRITE / DELETE — Admin only ──────────────────────────────────────────────

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Create a department',
    description: 'Requires **admin** role.',
  })
  @ApiCreatedResponse({ description: 'Department created successfully' })
  create(@Body() body: CreateDepartmentDto) {
    return this.service.create(body);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Update a department',
    description: 'Requires **admin** role.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Department ID to update', example: 1 })
  @ApiOkResponse({ description: 'Updated department object' })
  @ApiNotFoundResponse({ description: 'Department not found' })
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateDepartmentDto) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a department',
    description: 'Permanently removes the department. Requires **admin** role.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Department ID to delete', example: 1 })
  @ApiNoContentResponse({ description: 'Department deleted' })
  @ApiNotFoundResponse({ description: 'Department not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
