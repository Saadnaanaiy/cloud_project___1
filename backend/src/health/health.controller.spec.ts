import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { DataSource } from 'typeorm';

describe('HealthController', () => {
  let controller: HealthController;
  let mockDataSource: Partial<DataSource>;

  beforeEach(async () => {
    mockDataSource = {
      query: jest.fn().mockResolvedValue([{ '1': 1 }]),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: DataSource, useValue: mockDataSource }],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  describe('check', () => {
    it('should return status ok with timestamp and uptime', () => {
      const result = controller.check();

      expect(result.status).toBe('ok');
      expect(result.timestamp).toBeDefined();
      expect(result.uptime).toBeGreaterThan(0);
    });

    it('should return a valid ISO timestamp', () => {
      const result = controller.check();
      const date = new Date(result.timestamp);
      expect(date.getTime()).not.toBeNaN();
    });
  });

  describe('ready', () => {
    it('should return status ready when database is connected', async () => {
      const result = await controller.ready();

      expect(result.status).toBe('ready');
      expect(result.checks.database).toBe('connected');
      expect(result.checks.memory).toBeDefined();
    });

    it('should return not_ready when database query fails', async () => {
      mockDataSource.query = jest.fn().mockRejectedValue(new Error('DB error'));

      const result = await controller.ready();

      expect(result.status).toBe('not_ready');
      expect(result.checks.database).toBe('disconnected');
    });
  });

  describe('live', () => {
    it('should return status alive with timestamp', () => {
      const result = controller.live();

      expect(result.status).toBe('alive');
      expect(result.timestamp).toBeDefined();
    });
  });
});
