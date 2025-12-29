export const up = async (knex) => {
  await knex.schema.createTable('audio_cache', (table) => {
    table.increments('id').primary();
    table.integer('unit_id').notNullable().references('id').inTable('units').onDelete('CASCADE');
    table.string('file_path', 500).notNullable();
    table.bigInteger('file_size');
    table.string('tts_provider', 50);
    table.timestamp('generated_at').defaultTo(knex.fn.now());
    table.unique(['unit_id']);
  });

  await knex.schema.raw('CREATE INDEX idx_audio_cache_unit_id ON audio_cache(unit_id)');
};

export const down = async (knex) => {
  await knex.schema.dropTableIfExists('audio_cache');
};

