import pool from "../config/database.js";
import { config } from "../config/env.js";
import { writeFile, readFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";

class AudioCacheService {
    constructor() {
        this.storagePath = config.storage.audioPath;
    }

    async getCachedAudio(unitId) {
        // Check database
        const result = await pool.query(
            "SELECT * FROM audio_cache WHERE unit_id = $1",
            [unitId]
        );

        if (result.rows.length === 0) {
            return null;
        }

        const cacheEntry = result.rows[0];

        // Check if file exists
        if (!existsSync(cacheEntry.file_path)) {
            // File missing, remove from cache
            await pool.query("DELETE FROM audio_cache WHERE unit_id = $1", [unitId]);
            return null;
        }

        return {
            filePath: cacheEntry.file_path,
            fileSize: cacheEntry.file_size,
            provider: cacheEntry.tts_provider,
        };
    }

    async saveAudio(unitId, audioBuffer, provider = null) {
        // Ensure storage directory exists
        if (!existsSync(this.storagePath)) {
            await mkdir(this.storagePath, { recursive: true });
        }

        // Generate file path
        const fileName = `unit_${unitId}_${Date.now()}.mp3`;
        const filePath = join(this.storagePath, fileName);

        // Write file
        await writeFile(filePath, audioBuffer);

        // Get file size
        const fileSize = audioBuffer.length;

        // Save to database
        const providerName = provider || config.tts.provider;
        await pool.query(
            `INSERT INTO audio_cache (unit_id, file_path, file_size, tts_provider)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (unit_id) 
             DO UPDATE SET file_path = $2, file_size = $3, tts_provider = $4, generated_at = NOW()`,
            [unitId, filePath, fileSize, providerName]
        );

        return filePath;
    }

    async readAudioFile(filePath) {
        if (!existsSync(filePath)) {
            return null;
        }
        return await readFile(filePath);
    }
}

export default new AudioCacheService();

