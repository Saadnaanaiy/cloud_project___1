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

  describe('getStats', () => {
    it('should call service.getStats', () => {
      mockEmployeesService.getStats.mockResolvedValue({ total: 10, active: 8 });
      void controller.getStats();
      expect(mockEmployeesService.getStats).toHaveBeenCalled();
    });
  });

  const mockUser = { id: 1 };

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
      void controller.create(createDto, mockUser);
      expect(mockEmployeesService.create).toHaveBeenCalledWith(createDto, 1);
    });
  });

  describe('update', () => {
    it('should call service.update with id and data', () => {
      const updateDto = { salary: 70000 };
      mockEmployeesService.update.mockResolvedValue({ id: 1, ...updateDto });
      void controller.update(1, updateDto, mockUser);
      expect(mockEmployeesService.update).toHaveBeenCalledWith(1, updateDto, 1);
    });
  });

  describe('id-based operations', () => {
    test.each([
      [
        'findOne',
        'id',
        () => mockEmployeesService.findOne.mockResolvedValue({ id: 1 }),
        () => controller.findOne(1),
      ],
      [
        'remove',
        'id',
        () => mockEmployeesService.remove.mockResolvedValue({ message: 'ok' }),
        () => controller.remove(1, { id: 1 }),
      ],
      [
        'block',
        'id',
        () =>
          mockEmployeesService.block.mockResolvedValue({
            id: 1,
            status: 'blocked',
          }),
        () => controller.block(1, { id: 1 }),
      ],
      [
        'unblock',
        'id',
        () =>
          mockEmployeesService.unblock.mockResolvedValue({
            id: 1,
            status: 'active',
          }),
        () => controller.unblock(1, { id: 1 }),
      ],
    ])('%s should call service.%s with id', (_method, _desc, setup, action) => {
      setup();
      action();
      expect(
        mockEmployeesService[_method as keyof typeof mockEmployeesService],
      ).toHaveBeenCalledWith(1);
    });
  });
});
