export const up = async (knex) => {
  await knex.schema.createTable('units', (table) => {
    table.increments('id').primary();
    table.integer('book_id').notNullable().references('id').inTable('books').onDelete('CASCADE');
    table.integer('index').notNullable();
    table.string('heading', 500);
    table.text('text').notNullable();
    table.jsonb('metadata');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.unique(['book_id', 'index']);
  });

  await knex.schema.raw('CREATE INDEX idx_units_book_id ON units(book_id)');
  await knex.schema.raw('CREATE INDEX idx_units_book_index ON units(book_id, index)');
  await knex.schema.raw('CREATE INDEX idx_units_metadata ON units USING GIN(metadata)');
};

export const down = async (knex) => {
  await knex.schema.dropTableIfExists('units');
};

