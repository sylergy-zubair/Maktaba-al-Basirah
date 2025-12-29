export const up = async(knex) => {
    await knex.schema.createTable("bookmarks", (table) => {
        table.increments("id").primary();
        table
            .integer("user_id")
            .notNullable()
            .references("id")
            .inTable("users")
            .onDelete("CASCADE");
        table
            .integer("book_id")
            .notNullable()
            .references("id")
            .inTable("books")
            .onDelete("CASCADE");
        table
            .integer("unit_id")
            .notNullable()
            .references("id")
            .inTable("units")
            .onDelete("CASCADE");
        table.text("notes");
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.timestamp("updated_at").defaultTo(knex.fn.now());
        table.unique(["user_id", "book_id"]);
    });

    await knex.schema.raw(
        "CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id)"
    );
    await knex.schema.raw(
        "CREATE INDEX idx_bookmarks_book_id ON bookmarks(book_id)"
    );
    await knex.schema.raw(
        "CREATE INDEX idx_bookmarks_user_book ON bookmarks(user_id, book_id)"
    );
};

export const down = async(knex) => {
    await knex.schema.dropTableIfExists("bookmarks");
};