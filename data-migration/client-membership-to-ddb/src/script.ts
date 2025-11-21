import { runMigration } from '@/src/migration/migration';
import { logger } from '@/src/utils/logger';

runMigration().catch((error) => {
  logger.error('Migration failed', error);
});
