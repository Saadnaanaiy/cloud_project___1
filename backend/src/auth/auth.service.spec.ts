jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { User, UserRole } from './user.entity';

const mockUser = {
  id: 1,
  name: 'Test User',
  email: 'test@company.com',
  password: '$2b$10$hashedpassword123',
  role: UserRole.ADMIN,
  isApproved: true,
  createdAt: new Date(),
  updatedAt: new Date(),
} as User;

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
};

const mockUserRepo = {
  findOne: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeAll(() => {
    process.env.NODE_ENV = 'development';
    process.env.DISABLE_TURNSTILE = 'true';
  });

  afterAll(() => {
    delete process.env.NODE_ENV;
    delete process.env.DISABLE_TURNSTILE;
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('should return JWT token and user info on successful login', async () => {
      const loginDto = {
        email: 'test@company.com',
        password: 'correctPassword',
        captchaToken: 'valid-captcha-token',
      };

      mockUserRepo.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      globalThis.fetch = jest.fn().mockResolvedValue({
        json: jest.fn().mockResolvedValue({ success: true }),
      });

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('access_token', 'mock-jwt-token');
      expect(result.user).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role,
      });
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'wrong@company.com',
          password: 'pass',
          captchaToken: 'token',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({
          email: 'test@company.com',
          password: 'wrongPass',
          captchaToken: 'token',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user is not approved', async () => {
      mockUserRepo.findOne.mockResolvedValue({
        ...mockUser,
        isApproved: false,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(
        service.login({
          email: 'test@company.com',
          password: 'correctPassword',
          captchaToken: 'token',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw BadRequestException when captcha token is missing', async () => {
      await expect(
        service.login({
          email: 'test@company.com',
          password: 'pass',
          captchaToken: '',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('register', () => {
    it('should create a new unapproved user', async () => {
      const registerDto = {
        name: 'New User',
        email: 'new@company.com',
        password: 'securePassword123',
        role: UserRole.HR,
        captchaToken: 'valid-captcha-token',
      };

      mockUserRepo.findOne.mockResolvedValue(null);
      mockUserRepo.save.mockResolvedValue({
        id: 2,
        ...registerDto,
        isApproved: false,
      });

      globalThis.fetch = jest.fn().mockResolvedValue({
        json: jest.fn().mockResolvedValue({ success: true }),
      });

      const result = await service.register(registerDto);

      expect(mockUserRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          email: registerDto.email,
          isApproved: false,
        }),
      );
      expect(result.message).toContain('administrator');
      expect(result.message).toContain('approve');
    });

    it('should throw ConflictException when email already exists', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);

      await expect(
        service.register({
          name: 'Duplicate',
          email: 'test@company.com',
          password: 'pass',
          role: UserRole.HR,
          captchaToken: 'token',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('getPendingUsers', () => {
    it('should return list of unapproved users', async () => {
      const pendingUsers = [
        { id: 2, name: 'Pending User', email: 'pending@company.com' },
      ];
      mockUserRepo.find.mockResolvedValue(pendingUsers);

      const result = await service.getPendingUsers();

      expect(mockUserRepo.find).toHaveBeenCalledWith({
        where: { isApproved: false },
        select: ['id', 'name', 'email', 'role', 'createdAt'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(pendingUsers);
    });
  });

  describe('approveUser', () => {
    it('should approve an existing user', async () => {
      const userToApprove = { ...mockUser, isApproved: false };
      mockUserRepo.findOne.mockResolvedValue(userToApprove);
      mockUserRepo.save.mockResolvedValue({
        ...userToApprove,
        isApproved: true,
      });

      const result = await service.approveUser(2);

      expect(result.isApproved).toBe(true);
      expect(mockUserRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ isApproved: true }),
      );
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(service.approveUser(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);

      const result = await service.getProfile(1);

      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(service.getProfile(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateProfile', () => {
    it('should update user name', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);
      mockUserRepo.save.mockResolvedValue({
        ...mockUser,
        name: 'Updated Name',
      });

      const result = await service.updateProfile(1, { name: 'Updated Name' });

      expect(result.name).toBe('Updated Name');
    });

    it('should throw ConflictException when new email is already taken', async () => {
      mockUserRepo.findOne.mockResolvedValueOnce(mockUser);
      mockUserRepo.findOne.mockResolvedValueOnce({
        id: 2,
        email: 'new@company.com',
      });

      await expect(
        service.updateProfile(1, { email: 'new@company.com' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(
        service.updateProfile(999, { name: 'New Name' }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
