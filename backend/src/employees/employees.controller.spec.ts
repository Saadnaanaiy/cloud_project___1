import { Test, TestingModule } from '@nestjs/testing';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';

const mockEmployeesService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  block: jest.fn(),
  unblock: jest.fn(),
  getStats: jest.fn(),
};

describe('EmployeesController', () => {
  let controller: EmployeesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeesController],
      providers: [
        { provide: EmployeesService, useValue: mockEmployeesService },
      ],
    }).compile();

    controller = module.get<EmployeesController>(EmployeesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call service.findAll with correct parameters', () => {
      mockEmployeesService.findAll.mockResolvedValue([]);

      void controller.findAll('John', 'active', 1);

      expect(mockEmployeesService.findAll).toHaveBeenCalledWith(
        'John',
        'active',
        1,
      );
    });

    it('should call service.findAll without parameters', () => {
      mockEmployeesService.findAll.mockResolvedValue([]);

      void controller.findAll();

      expect(mockEmployeesService.findAll).toHaveBeenCalledWith(
        undefined,
        undefined,
        undefined,
      );
    });
  });

  describe('findOne', () => {
    it('should call service.findOne with id', () => {
      mockEmployeesService.findOne.mockResolvedValue({
        id: 1,
        firstName: 'John',
      });

      void controller.findOne(1);

      expect(mockEmployeesService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('getStats', () => {
    it('should call service.getStats', () => {
      mockEmployeesService.getStats.mockResolvedValue({ total: 10, active: 8 });

      void controller.getStats();

      expect(mockEmployeesService.getStats).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should call service.create with employee data', () => {
      const createDto = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@company.com',
        position: 'Developer',
        departmentId: 1,
        salary: 60000,
      };
      mockEmployeesService.create.mockResolvedValue(createDto);

      void controller.create(createDto);

      expect(mockEmployeesService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('should call service.update with id and data', () => {
      const updateDto = { salary: 70000 };
      mockEmployeesService.update.mockResolvedValue({ id: 1, ...updateDto });

      void controller.update(1, updateDto);

      expect(mockEmployeesService.update).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('remove', () => {
    it('should call service.remove with id', () => {
      mockEmployeesService.remove.mockResolvedValue({
        message: 'Employee deleted successfully',
      });

      void controller.remove(1);

      expect(mockEmployeesService.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('block', () => {
    it('should call service.block with id', () => {
      mockEmployeesService.block.mockResolvedValue({
        id: 1,
        status: 'blocked',
      });

      void controller.block(1);

      expect(mockEmployeesService.block).toHaveBeenCalledWith(1);
    });
  });

  describe('unblock', () => {
    it('should call service.unblock with id', () => {
      mockEmployeesService.unblock.mockResolvedValue({
        id: 1,
        status: 'active',
      });

      void controller.unblock(1);

      expect(mockEmployeesService.unblock).toHaveBeenCalledWith(1);
    });
  });
});
