import express from "express";
import {
    getBooks,
    getBookById,
    getBookUnits,
    getUnitById,
    getUnitByBookAndIndex,
} from "../controllers/booksController.js";
import { authenticate } from "../../../middleware/auth.js";

const router = express.Router();

// Protect all book routes with authentication
router.use(authenticate);

router.get("/", getBooks);
router.get("/:id", getBookById);
router.get("/:id/units", getBookUnits);
router.get("/:id/unit", getUnitByBookAndIndex);
router.get("/units/:unitId", getUnitById);

export default router;