import express from "express";
import { authenticate } from "../../../middleware/auth.js";
import { validate } from "../../../middleware/validator.js";
import Joi from "joi";
import {
    getUserBookmarks,
    getBookmarkByBook,
    createBookmark,
    deleteBookmark,
} from "../controllers/bookmarksController.js";

const router = express.Router();

// All bookmark routes require authentication
router.use(authenticate);

const createBookmarkSchema = Joi.object({
    bookId: Joi.number().integer().required(),
    unitId: Joi.number().integer().required(),
    notes: Joi.string().allow(null, "").optional(),
});

router.get("/", getUserBookmarks);
router.get("/book/:bookId", getBookmarkByBook);
router.post("/", validate(createBookmarkSchema), createBookmark);
router.delete("/book/:bookId", deleteBookmark);

export default router;

