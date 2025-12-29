import bookmarkService from "../../../services/bookmarkService.js";

export const getUserBookmarks = async(req, res, next) => {
    try {
        const userId = req.user.userId;
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;

        const bookmarks = await bookmarkService.getUserBookmarks(userId, page, limit);

        res.json({
            success: true,
            data: bookmarks,
        });
    } catch (error) {
        next(error);
    }
};

export const getBookmarkByBook = async(req, res, next) => {
    try {
        const userId = req.user.userId;
        const { bookId } = req.params;

        const bookmark = await bookmarkService.getBookmarkByBook(
            userId,
            parseInt(bookId, 10)
        );

        res.json({
            success: true,
            data: bookmark,
        });
    } catch (error) {
        next(error);
    }
};

export const createBookmark = async(req, res, next) => {
    try {
        const userId = req.user.userId;
        const { bookId, unitId, notes } = req.validated;

        const bookmark = await bookmarkService.createBookmark(
            userId,
            parseInt(bookId, 10),
            parseInt(unitId, 10),
            notes
        );

        res.status(201).json({
            success: true,
            data: bookmark,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteBookmark = async(req, res, next) => {
    try {
        const userId = req.user.userId;
        const { bookId } = req.params;

        await bookmarkService.deleteBookmark(userId, parseInt(bookId, 10));

        res.json({
            success: true,
            message: "Bookmark deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};

