import bookRepository from "../repositories/BookRepository.js";
import unitRepository from "../repositories/UnitRepository.js";
import { NotFoundError } from "../utils/errors.js";

class BookService {
    async getBooks(page = 1, limit = 10, filters = {}) {
        const books = await bookRepository.findAll(page, limit, filters);
        const total = await bookRepository.count(filters);

        return {
            books,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getBookById(id) {
        const book = await bookRepository.findById(id);
        if (!book) {
            throw new NotFoundError("Book");
        }
        return book;
    }

    async getBookUnits(bookId, page = 1, limit = 50) {
        // Verify book exists
        await this.getBookById(bookId);

        const units = await unitRepository.findByBookId(bookId, page, limit);
        const total = await unitRepository.countByBookId(bookId);

        return {
            units,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getUnitById(unitId) {
        const unit = await unitRepository.findById(unitId);
        if (!unit) {
            throw new NotFoundError("Unit");
        }
        return unit;
    }

    async getUnitByBookAndIndex(bookId, index) {
        const unit = await unitRepository.findByBookIdAndIndex(bookId, index);
        if (!unit) {
            throw new NotFoundError("Unit");
        }
        return unit;
    }
}

export default new BookService();