import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Put,
    Request,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiBody,
    ApiCreatedResponse,
    ApiForbiddenResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
    ApiUnauthorizedResponse,
    ApiBadRequestResponse,
} from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { LoginAuditInterceptor } from '../audit/audit.interceptor';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';
import { UserRole } from './user.entity';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(ThrottlerGuard)
  @UseInterceptors(LoginAuditInterceptor)
  @Post('login')
  @ApiOperation({
    summary: 'Login and obtain JWT token',
    description:
      'Authenticates a user with email and password. ' +
      'Returns a signed JWT `access_token` valid for 24h. ' +
      'Rate-limited to prevent brute-force attacks.',
  })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    description: 'Login successful — returns JWT and user info',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 1,
          name: 'Admin User',
          email: 'admin@company.com',
          role: 'admin',
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Invalid credentials or account pending approval' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('register')
  @ApiOperation({
    summary: 'Register a new user account',
    description:
      'Creates a new user account. The account will be **pending** until approved by an admin. ' +
      'An optional Cloudflare Turnstile captcha token can be supplied.',
  })
  @ApiBody({ type: RegisterDto })
  @ApiCreatedResponse({
    description: 'Account created — awaiting admin approval',
    schema: {
      example: { message: 'Account created. Waiting for admin approval.' },
    },
  })
  @ApiBadRequestResponse({ description: 'Email already registered or validation error' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Returns the full profile of the currently authenticated user.',
  })
  @ApiOkResponse({
    description: 'Current user profile',
    schema: {
      example: {
        id: 1,
        name: 'Admin User',
        email: 'admin@company.com',
        role: 'admin',
        approved: true,
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  getProfile(@Request() req) {
    return this.authService.getProfile(req.user.id);
  }

  @Put('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Update current user profile',
    description: 'Updates name, email, or password for the currently authenticated user. All fields are optional.',
  })
  @ApiBody({ type: UpdateProfileDto })
  @ApiOkResponse({ description: 'Updated user profile object' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  async updateProfile(@Request() req, @Body() body: UpdateProfileDto) {
    return this.authService.updateProfile(req.user.id, body);
  }

  @Get('pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'List pending user approvals',
    description: 'Returns all user accounts that have registered but not yet been approved. **Admin only.**',
  })
  @ApiOkResponse({ description: 'Array of pending user objects' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  @ApiForbiddenResponse({ description: 'Requires admin role' })
  getPendingUsers() {
    return this.authService.getPendingUsers();
  }

  @Post('approve/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Approve a pending user',
    description: 'Grants access to a user who registered and is awaiting approval. **Admin only.**',
  })
  @ApiParam({ name: 'id', type: Number, description: 'User ID to approve', example: 5 })
  @ApiOkResponse({ description: 'User approved successfully' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  @ApiForbiddenResponse({ description: 'Requires admin role' })
  approveUser(@Param('id', ParseIntPipe) id: number) {
    return this.authService.approveUser(id);
  }
}
