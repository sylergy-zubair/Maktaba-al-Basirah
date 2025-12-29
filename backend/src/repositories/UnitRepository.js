import pool from "../config/database.js";

class UnitRepository {
    async findByBookId(bookId, page = 1, limit = 50) {
        const offset = (page - 1) * limit;
        const result = await pool.query(
            `SELECT * FROM units 
             WHERE book_id = $1 
             ORDER BY index ASC 
             LIMIT $2 OFFSET $3`, [bookId, limit, offset]
        );
        return result.rows;
    }

    async findById(id) {
        const result = await pool.query("SELECT * FROM units WHERE id = $1", [id]);
        return result.rows[0] || null;
    }

    async findByBookIdAndIndex(bookId, index) {
        const result = await pool.query(
            "SELECT * FROM units WHERE book_id = $1 AND index = $2", [bookId, index]
        );
        return result.rows[0] || null;
    }

    async countByBookId(bookId) {
        const result = await pool.query(
            "SELECT COUNT(*) FROM units WHERE book_id = $1", [bookId]
        );
        return parseInt(result.rows[0].count, 10);
    }

    async create(unitData) {
        const { book_id, index, heading, text, metadata } = unitData;
        const result = await pool.query(
            `INSERT INTO units (book_id, index, heading, text, metadata)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`, [book_id, index, heading, text, metadata || null]
        );
        return result.rows[0];
    }

    async createMany(units) {
        if (units.length === 0) return [];

        const values = units
            .map((_, i) => {
                const base = i * 5;
                return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${
          base + 5
        })`;
            })
            .join(", ");

        const params = units.flatMap((unit) => [
            unit.book_id,
            unit.index,
            unit.heading,
            unit.text,
            unit.metadata || null,
        ]);

        const result = await pool.query(
            `INSERT INTO units (book_id, index, heading, text, metadata)
             VALUES ${values}
             RETURNING *`,
            params
        );
        return result.rows;
    }
}

export default new UnitRepository();