import pool from "../config/database.js";

class BookRepository {
    async findAll(page = 1, limit = 10, filters = {}) {
        const offset = (page - 1) * limit;
        let query = "SELECT * FROM books WHERE 1=1";
        const params = [];
        let paramCount = 1;

        if (filters.author) {
            query += ` AND author = $${paramCount}`;
            params.push(filters.author);
            paramCount++;
        }

        if (filters.category) {
            query += ` AND category = $${paramCount}`;
            params.push(filters.category);
            paramCount++;
        }

        query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${
      paramCount + 1
    }`;
        params.push(limit, offset);

        const result = await pool.query(query, params);
        return result.rows;
    }

    async findById(id) {
        const result = await pool.query("SELECT * FROM books WHERE id = $1", [id]);
        return result.rows[0] || null;
    }

    async count(filters = {}) {
        let query = "SELECT COUNT(*) FROM books WHERE 1=1";
        const params = [];
        let paramCount = 1;

        if (filters.author) {
            query += ` AND author = $${paramCount}`;
            params.push(filters.author);
            paramCount++;
        }

        if (filters.category) {
            query += ` AND category = $${paramCount}`;
            params.push(filters.category);
            paramCount++;
        }

        const result = await pool.query(query, params);
        return parseInt(result.rows[0].count, 10);
    }

    async create(bookData) {
        const { title, author, description, category, language } = bookData;
        const result = await pool.query(
            `INSERT INTO books (title, author, description, category, language)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`, [title, author, description, category, language || "ar"]
        );
        return result.rows[0];
    }
}

export default new BookRepository();