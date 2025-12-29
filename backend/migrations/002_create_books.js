export const up = async (knex) => {
  await knex.schema.createTable('books', (table) => {
    table.increments('id').primary();
    table.string('title', 500).notNullable();
    table.string('author', 255);
    table.text('description');
    table.string('category', 100);
    table.string('language', 10).defaultTo('ar');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  await knex.schema.raw('CREATE INDEX idx_books_author ON books(author)');
  await knex.schema.raw('CREATE INDEX idx_books_category ON books(category)');
};

export const down = async (knex) => {
  await knex.schema.dropTableIfExists('books');
};

