import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  OnModuleInit,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async onModuleInit() {
    await this.seedAdminUser();
  }

  async seedAdminUser() {
    const defaultUsers = [
      {
        name: 'Super Admin',
        email: 'admin@company.com',
        password: 'admin123',
        role: UserRole.ADMIN,
      },
      {
        name: 'HR Manager',
        email: 'hr@company.com',
        password: 'hr123',
        role: UserRole.HR,
      },
      {
        name: 'Department Manager',
        email: 'manager@company.com',
        password: 'manager123',
        role: UserRole.MANAGER,
      },
    ];

    for (const u of defaultUsers) {
      const user = await this.userRepo.findOne({ where: { email: u.email } });
      if (!user) {
        const hashed = await bcrypt.hash(u.password, 10);
        await this.userRepo.save({
          ...u,
          password: hashed,
          isApproved: true,
        });
        console.log(`✅ Default user created: ${u.email}`);
      } else if (!user.isApproved) {
        user.isApproved = true;
        await this.userRepo.save(user);
        console.log(`✅ Default user approved: ${u.email}`);
      }
    }
  }

  async login(dto: LoginDto) {
    // Verify CAPTCHA
    await this.verifyCaptcha(dto.captchaToken);

    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    if (!user.isApproved) {
      throw new UnauthorizedException(
        'Your account is pending approval by an administrator.',
      );
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async register(dto: RegisterDto) {
    // Verify CAPTCHA
    await this.verifyCaptcha(dto.captchaToken);

    const exists = await this.userRepo.findOne({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email already in use');

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.userRepo.save({
      name: dto.name,
      email: dto.email,
      password: hashed,
      role: dto.role ?? UserRole.HR,
      isApproved: false,
    });

    return {
      message:
        'Registration successful. Please wait for an administrator to approve your account.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async getPendingUsers() {
    return this.userRepo.find({
      where: { isApproved: false },
      select: ['id', 'name', 'email', 'role', 'createdAt'],
      order: { createdAt: 'DESC' },
    });
  }

  async approveUser(userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    user.isApproved = true;
    return this.userRepo.save(user);
  }

  async getProfile(userId: number) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: ['id', 'name', 'email', 'role', 'createdAt', 'updatedAt'],
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(
    userId: number,
    data: { name?: string; email?: string; password?: string },
  ) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (data.email && data.email !== user.email) {
      const exists = await this.userRepo.findOne({
        where: { email: data.email },
      });
      if (exists) throw new ConflictException('Email already in use');
      user.email = data.email;
    }
    if (data.name) user.name = data.name;
    if (data.password) user.password = await bcrypt.hash(data.password, 10);

    const saved = await this.userRepo.save(user);
    return {
      id: saved.id,
      name: saved.name,
      email: saved.email,
      role: saved.role,
    };
  }

  private async verifyCaptcha(token: string) {
    const secretKey =
      process.env.TURNSTILE_SECRET_KEY ||
      '1x0000000000000000000000000000000AA';
    const verifyUrl = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

    const captchaRes = await fetch(verifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${secretKey}&response=${token}`,
    });
    const captchaData = await captchaRes.json();
    if (!captchaData.success) {
      throw new BadRequestException('Invalid CAPTCHA token');
    }
  }
}
