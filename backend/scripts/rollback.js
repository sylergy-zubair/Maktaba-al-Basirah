import knex from 'knex';
import { config } from '../src/config/env.js';
import logger from '../src/utils/logger.js';

const db = knex({
  client: 'pg',
  connection: {
    host: config.database.host,
    port: config.database.port,
    database: config.database.database,
    user: config.database.user,
    password: config.database.password,
  },
});

async function rollbackMigrations() {
  try {
    logger.info('Rolling back migrations...');
    
    // Get last batch
    const lastBatch = await db('knex_migrations')
      .max('batch as max_batch')
      .first();
    
    if (!lastBatch || !lastBatch.max_batch) {
      logger.info('No migrations to rollback');
      process.exit(0);
    }

    const batch = lastBatch.max_batch;
    logger.info(`Rolling back batch ${batch}`);

    // Get migrations in last batch
    const migrations = await db('knex_migrations')
      .where('batch', batch)
      .orderBy('id', 'desc');

    // Rollback in reverse order
    const { fileURLToPath } = await import('url');
    const { dirname, join } = await import('path');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    
    for (const migration of migrations) {
      logger.info(`Rolling back: ${migration.name}`);
      const migrationPath = join(__dirname, '../migrations', migration.name);
      const migrationModule = await import(`file://${migrationPath}`);
      if (migrationModule.down) {
        await migrationModule.down(db);
      }
      await db('knex_migrations').where('id', migration.id).delete();
    }

    logger.info('Rollback completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error('Rollback failed:', error);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

rollbackMigrations();

