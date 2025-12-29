import bookmarkRepository from "../repositories/BookmarkRepository.js";
import { NotFoundError } from "../utils/errors.js";

class BookmarkService {
    async getUserBookmarks(userId, page = 1, limit = 20) {
        const bookmarks = await bookmarkRepository.findByUserId(
            userId,
            page,
            limit
        );
        return bookmarks;
    }

    async getBookmarkByBook(userId, bookId) {
        const bookmark = await bookmarkRepository.findByUserAndBook(userId, bookId);
        return bookmark;
    }

    async createBookmark(userId, bookId, unitId, notes = null) {
        const bookmark = await bookmarkRepository.create(
            userId,
            bookId,
            unitId,
            notes
        );
        return bookmark;
    }

    async deleteBookmark(userId, bookId) {
        const bookmark = await bookmarkRepository.delete(userId, bookId);
        if (!bookmark) {
            throw new NotFoundError("Bookmark");
        }
        return bookmark;
    }
}

export default new BookmarkService();