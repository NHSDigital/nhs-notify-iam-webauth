import { logger } from '@/src/logger';

test('logger - should produce a logger', () => {
  expect(logger.info).toBeTruthy();
  expect(logger.error).toBeTruthy();
  expect(logger.warn).toBeTruthy();
  expect(logger.debug).toBeTruthy();
});
