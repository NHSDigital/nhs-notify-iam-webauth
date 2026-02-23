import { logger } from '@/src/utils/logger';
import { runMigration } from '@/src/migration/migration';

runMigration().catch((error) => {
  logger.error('Migration failed', error);
});
