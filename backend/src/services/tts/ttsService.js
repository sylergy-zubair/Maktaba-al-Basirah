import { config } from "../../config/env.js";
import { ElevenLabsProvider } from "./ElevenLabsProvider.js";
import { GoogleTTSProvider } from "./GoogleTTSProvider.js";
import audioCacheService from "../audioCache.js";
import { AppError } from "../../utils/errors.js";
import { mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

class TTSService {
    constructor() {
        this.provider = this.createProvider();
        this.ensureStorageDirectory();
    }

    createProvider() {
        const providerName = config.tts.provider.toLowerCase();

        switch (providerName) {
        case "elevenlabs":
            return new ElevenLabsProvider();
        case "google":
            return new GoogleTTSProvider();
        default:
            throw new AppError(`Unknown TTS provider: ${providerName}`, 500);
        }
    }

    async ensureStorageDirectory() {
        const storagePath = config.storage.audioPath;
        if (!existsSync(storagePath)) {
            await mkdir(storagePath, { recursive: true });
        }
    }

    async generateAudio(unitId, text, options = {}) {
        // Check cache first
        const cached = await audioCacheService.getCachedAudio(unitId);
        if (cached) {
            return cached;
        }

        // Generate new audio
        const audioBuffer = await this.provider.generate(text, options);

        // Save to cache
        const filePath = await audioCacheService.saveAudio(unitId, audioBuffer);

        return {
            filePath,
            buffer: audioBuffer,
        };
    }

    async getAudioPath(unitId) {
        const cached = await audioCacheService.getCachedAudio(unitId);
        if (cached) {
            return cached.filePath;
        }
        return null;
    }
}

export default new TTSService();

