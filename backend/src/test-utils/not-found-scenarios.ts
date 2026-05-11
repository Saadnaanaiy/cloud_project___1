import { NotFoundException } from '@nestjs/common';

export function testNotFoundScenarios(
  findOneMock: jest.Mock,
  scenarios: [string, string, () => unknown][],
) {
  describe('notFound scenarios', () => {
    test.each(scenarios)(
      '%s should throw NotFoundException when %s',
      async (_method: string, _desc: string, action: () => unknown) => {
        findOneMock.mockResolvedValue(null);
        await expect(action()).rejects.toThrow(NotFoundException);
      },
    );
  });
}
