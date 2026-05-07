import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmployeesService } from './employees.service';
import { Employee, EmployeeStatus } from './employee.entity';

const mockEmployee = {
  id: 1,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@company.com',
  phone: '+212 6 11 22 33 44',
  position: 'Developer',
  departmentId: 1,
  hireDate: '2024-01-01',
  salary: 60000,
  status: EmployeeStatus.ACTIVE,
  createdAt: new Date(),
  updatedAt: new Date(),
} as Employee;

describe('EmployeesService', () => {
  let service: EmployeesService;

  const mockRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
    query: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeesService,
        { provide: getRepositoryToken(Employee), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<EmployeesService>(EmployeesService);
  });

  describe('findOne', () => {
    it('should return an employee when found', async () => {
      mockRepo.findOne.mockResolvedValue(mockEmployee);

      const result = await service.findOne(1);

      expect(result).toEqual(mockEmployee);
      expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException when employee not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and save a new employee', async () => {
      const createDto = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@company.com',
        position: 'Designer',
        departmentId: 2,
        salary: 55000,
      };

      mockRepo.create.mockReturnValue({ ...createDto, id: 2 });
      mockRepo.save.mockResolvedValue({ ...createDto, id: 2 });

      const result = await service.create(createDto);

      expect(mockRepo.create).toHaveBeenCalledWith(createDto);
      expect(mockRepo.save).toHaveBeenCalled();
      expect(result).toEqual({ ...createDto, id: 2 });
    });
  });

  describe('update', () => {
    it('should update an existing employee', async () => {
      const updateData = { salary: 70000, position: 'Senior Developer' };
      const updatedEmployee = { ...mockEmployee, ...updateData };

      mockRepo.findOne.mockResolvedValue(mockEmployee);
      mockRepo.update.mockResolvedValue({ affected: 1 });
      mockRepo.findOne
        .mockResolvedValueOnce(mockEmployee)
        .mockResolvedValueOnce(updatedEmployee);

      const result = await service.update(1, updateData);

      expect(mockRepo.update).toHaveBeenCalledWith(1, updateData);
      expect(result).toEqual(updatedEmployee);
    });

    it('should throw NotFoundException when updating non-existent employee', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.update(999, { salary: 50000 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete an existing employee', async () => {
      mockRepo.findOne.mockResolvedValue(mockEmployee);
      mockRepo.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(1);

      expect(mockRepo.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual({ message: 'Employee deleted successfully' });
    });

    it('should throw NotFoundException when deleting non-existent employee', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('block', () => {
    it('should block an existing employee', async () => {
      mockRepo.findOne.mockResolvedValue(mockEmployee);
      mockRepo.update.mockResolvedValue({ affected: 1 });
      mockRepo.findOne.mockResolvedValue({
        ...mockEmployee,
        status: EmployeeStatus.BLOCKED,
      });

      const result = await service.block(1);

      expect(mockRepo.update).toHaveBeenCalledWith(1, {
        status: EmployeeStatus.BLOCKED,
      });
      expect(result.status).toBe(EmployeeStatus.BLOCKED);
    });

    it('should throw NotFoundException when blocking non-existent employee', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.block(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('unblock', () => {
    it('should unblock an existing employee', async () => {
      const blockedEmployee = {
        ...mockEmployee,
        status: EmployeeStatus.BLOCKED,
      };
      mockRepo.findOne.mockResolvedValue(blockedEmployee);
      mockRepo.update.mockResolvedValue({ affected: 1 });
      mockRepo.findOne.mockResolvedValue({
        ...mockEmployee,
        status: EmployeeStatus.ACTIVE,
      });

      const result = await service.unblock(1);

      expect(mockRepo.update).toHaveBeenCalledWith(1, {
        status: EmployeeStatus.ACTIVE,
      });
      expect(result.status).toBe(EmployeeStatus.ACTIVE);
    });
  });

  describe('getStats', () => {
    it('should return employee statistics', async () => {
      mockRepo.count.mockResolvedValueOnce(10);
      mockRepo.count.mockResolvedValueOnce(7);
      mockRepo.count.mockResolvedValueOnce(2);
      mockRepo.count.mockResolvedValueOnce(1);

      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { department: 'IT', count: '4' },
          { department: 'HR', count: '3' },
        ]),
      };
      mockRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getStats();

      expect(result.total).toBe(10);
      expect(result.active).toBe(7);
      expect(result.blocked).toBe(2);
      expect(result.onLeave).toBe(1);
      expect(result.byDepartment).toHaveLength(2);
    });
  });
});
