import express from "express";
import { generateAudio, getAudioStatus } from "../controllers/ttsController.js";
import { authenticate } from "../../../middleware/auth.js";

const router = express.Router();

// Protect TTS routes with authentication
router.use(authenticate);

router.get("/unit/:unitId", generateAudio);
router.get("/unit/:unitId/status", getAudioStatus);

export default router;