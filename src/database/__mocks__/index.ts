import { vi } from 'vitest';

export const mockRepository = {
    find: vi.fn(),
    findOne: vi.fn(),
    save: vi.fn().mockReturnValue(true),
  };

export const getDbConnection = vi.fn().mockResolvedValue({
  query: vi.fn(),
  close: vi.fn(),
  getRepository: vi.fn().mockReturnValue(mockRepository)
});
