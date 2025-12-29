import ttsService from "../../../services/tts/ttsService.js";
import bookService from "../../../services/bookService.js";
import audioCacheService from "../../../services/audioCache.js";
import { NotFoundError } from "../../../utils/errors.js";
import { readFile } from "fs/promises";
import { existsSync } from "fs";

/**
 * Strip HTML tags and decode HTML entities from text
 */
function stripHtml(text) {
    if (!text || typeof text !== "string") {
        return "";
    }
    
    // Remove HTML tags
    let cleaned = text.replace(/<[^>]*>/g, " ");
    
    // Decode common HTML entities
    cleaned = cleaned
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'");
    
    // Decode numeric entities
    cleaned = cleaned.replace(/&#(\d+);/g, (match, dec) => {
        return String.fromCharCode(dec);
    });
    
    // Decode hex entities
    cleaned = cleaned.replace(/&#x([a-f\d]+);/gi, (match, hex) => {
        return String.fromCharCode(parseInt(hex, 16));
    });
    
    // Clean up multiple spaces and newlines
    cleaned = cleaned.replace(/\s+/g, " ").trim();
    
    return cleaned;
}

export const generateAudio = async(req, res, next) => {
    try {
        const { unitId } = req.params;
        const unitIdInt = parseInt(unitId, 10);

        // Get unit to extract text
        const unit = await bookService.getUnitById(unitIdInt);
        if (!unit) {
            throw new NotFoundError("Unit");
        }

        // Strip HTML from text before generating audio
        const cleanText = stripHtml(unit.text);
        
        if (!cleanText || cleanText.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: { message: "Unit text is empty after processing" },
            });
        }

        // Generate or retrieve audio
        const audioData = await ttsService.generateAudio(unitIdInt, cleanText);

        // If audioData has buffer, send it directly (newly generated)
        if (audioData.buffer) {
            res.setHeader("Content-Type", "audio/mpeg");
            res.setHeader("Content-Length", audioData.buffer.length);
            res.setHeader("Cache-Control", "public, max-age=31536000");
            res.setHeader("Accept-Ranges", "bytes");
            return res.send(audioData.buffer);
        }

        // Otherwise read from file (cached)
        if (audioData.filePath && existsSync(audioData.filePath)) {
            const audioBuffer = await readFile(audioData.filePath);
            res.setHeader("Content-Type", "audio/mpeg");
            res.setHeader("Content-Length", audioBuffer.length);
            res.setHeader("Cache-Control", "public, max-age=31536000");
            res.setHeader("Accept-Ranges", "bytes");
            return res.send(audioBuffer);
        }

        // If we only have filePath but file doesn't exist, return error
        if (audioData.filePath) {
            throw new Error(`Audio file not found at: ${audioData.filePath}`);
        }

        throw new Error("Audio generation failed: No audio data returned");
    } catch (error) {
        next(error);
    }
};

export const getAudioStatus = async(req, res, next) => {
    try {
        const { unitId } = req.params;
        const unitIdInt = parseInt(unitId, 10);

        const cached = await audioCacheService.getCachedAudio(unitIdInt);

        if (cached) {
            res.json({
                success: true,
                data: {
                    available: true,
                    filePath: cached.filePath,
                    fileSize: cached.fileSize,
                    provider: cached.provider,
                },
            });
        } else {
            res.json({
                success: true,
                data: {
                    available: false,
                },
            });
        }
    } catch (error) {
        next(error);
    }
};

