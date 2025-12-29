import bookService from "../../../services/bookService.js";

export const getBooks = async(req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const filters = {
            author: req.query.author,
            category: req.query.category,
        };

        const result = await bookService.getBooks(page, limit, filters);

        res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const getBookById = async(req, res, next) => {
    try {
        const { id } = req.params;
        const book = await bookService.getBookById(parseInt(id, 10));

        res.json({
            success: true,
            data: book,
        });
    } catch (error) {
        next(error);
    }
};

export const getBookUnits = async(req, res, next) => {
    try {
        const { id } = req.params;
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 50;

        const result = await bookService.getBookUnits(
            parseInt(id, 10),
            page,
            limit
        );

        res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const getUnitById = async(req, res, next) => {
    try {
        const { unitId } = req.params;
        const unit = await bookService.getUnitById(parseInt(unitId, 10));

        res.json({
            success: true,
            data: unit,
        });
    } catch (error) {
        next(error);
    }
};

export const getUnitByBookAndIndex = async(req, res, next) => {
    try {
        const { id } = req.params;
        const index = parseInt(req.query.index, 10);

        if (!index) {
            return res.status(400).json({
                success: false,
                error: { message: "Index parameter is required" },
            });
        }

        const unit = await bookService.getUnitByBookAndIndex(
            parseInt(id, 10),
            index
        );

        res.json({
            success: true,
            data: unit,
        });
    } catch (error) {
        next(error);
    }
};