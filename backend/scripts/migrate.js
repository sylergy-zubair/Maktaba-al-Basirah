import knex from "knex";
import { config } from "../src/config/env.js";
import { readdir } from "fs/promises";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(
    import.meta.url);
const __dirname = dirname(__filename);

const db = knex({
    client: "pg",
    connection: {
        host: config.database.host,
        port: config.database.port,
        database: config.database.database,
        user: config.database.user,
        password: config.database.password,
    },
});

async function runMigrations() {
    try {
        console.log("Running migrations...");

        // Create migrations table if it doesn't exist
        await db.schema.hasTable("knex_migrations").then(async(exists) => {
            if (!exists) {
                await db.schema.createTable("knex_migrations", (table) => {
                    table.increments("id").primary();
                    table.string("name");
                    table.integer("batch");
                    table.timestamp("migration_time");
                });
            }
        });

        // Read migration files
        const migrationsDir = join(__dirname, "../migrations");
        const files = await readdir(migrationsDir);
        const migrationFiles = files.filter((f) => f.endsWith(".js")).sort();

        // Get already run migrations
        const runMigrations = await db("knex_migrations").select("name");
        const runMigrationNames = new Set(runMigrations.map((m) => m.name));

        for (const file of migrationFiles) {
            // Skip if already run
            if (runMigrationNames.has(file)) {
                console.log(`Skipping already run migration: ${file}`);
                continue;
            }

            console.log(`Running migration: ${file}`);
            try {
                const migration = await
                import (`file://${join(migrationsDir, file)}`);
                if (migration.up) {
                    await migration.up(db);
                    // Record migration
                    await db("knex_migrations").insert({
                        name: file,
                        batch: 1,
                        migration_time: new Date(),
                    });
                    console.log(`✓ Completed: ${file}`);
                }
            } catch (error) {
                // If table already exists, just record the migration
                if (
                    error.code === "42P07" ||
                    error.message.includes("already exists")
                ) {
                    console.log(`⚠ Table already exists, recording migration: ${file}`);
                    await db("knex_migrations").insert({
                        name: file,
                        batch: 1,
                        migration_time: new Date(),
                    });
                } else {
                    throw error;
                }
            }
        }

        console.log("Migrations completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    } finally {
        await db.destroy();
    }
}

runMigrations();