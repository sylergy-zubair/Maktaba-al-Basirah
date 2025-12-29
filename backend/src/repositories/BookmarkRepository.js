import pool from "../config/database.js";

class BookmarkRepository {
    async findByUserId(userId, page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        const result = await pool.query(
            `SELECT b.*, bk.title as book_title, bk.author as book_author
             FROM bookmarks b
             JOIN books bk ON b.book_id = bk.id
             WHERE b.user_id = $1
             ORDER BY b.updated_at DESC
             LIMIT $2 OFFSET $3`, [userId, limit, offset]
        );
        return result.rows;
    }

    async findByUserAndBook(userId, bookId) {
        const result = await pool.query(
            `SELECT b.*, u.index as unit_index, u.heading, u.text
             FROM bookmarks b
             JOIN units u ON b.unit_id = u.id
             WHERE b.user_id = $1 AND b.book_id = $2`, [userId, bookId]
        );
        return result.rows[0] || null;
    }

    async findById(id) {
        const result = await pool.query("SELECT * FROM bookmarks WHERE id = $1", [
            id,
        ]);
        return result.rows[0] || null;
    }

    async create(userId, bookId, unitId, notes = null) {
        const result = await pool.query(
            `INSERT INTO bookmarks (user_id, book_id, unit_id, notes)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (user_id, book_id) 
             DO UPDATE SET unit_id = $3, notes = $4, updated_at = NOW()
             RETURNING *`, [userId, bookId, unitId, notes]
        );
        return result.rows[0];
    }

    async delete(userId, bookId) {
        const result = await pool.query(
            "DELETE FROM bookmarks WHERE user_id = $1 AND book_id = $2 RETURNING *", [userId, bookId]
        );
        return result.rows[0] || null;
    }
}

export default new BookmarkRepository();