import { TTSProvider } from "./TTSProvider.js";
import { config } from "../../config/env.js";
import { AppError } from "../../utils/errors.js";

export class ElevenLabsProvider extends TTSProvider {
    constructor() {
        super();
        this.apiKey = config.tts.elevenlabs.apiKey;
        this.baseUrl = "https://api.elevenlabs.io/v1";
    }

    async generate(text, options = {}) {
        await this.validateText(text);

        if (!this.apiKey) {
            throw new AppError("ElevenLabs API key not configured", 500);
        }

        try {
            const voiceId = options.voiceId || "21m00Tcm4TlvDq8ikWAM"; // Default Arabic voice
            const response = await fetch(
                `${this.baseUrl}/text-to-speech/${voiceId}`,
                {
                    method: "POST",
                    headers: {
                        "Accept": "audio/mpeg",
                        "Content-Type": "application/json",
                        "xi-api-key": this.apiKey,
                    },
                    body: JSON.stringify({
                        text,
                        model_id: options.modelId || "eleven_multilingual_v2",
                        voice_settings: {
                            stability: options.stability || 0.5,
                            similarity_boost: options.similarityBoost || 0.75,
                        },
                    }),
                }
            );

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new AppError(
                    `ElevenLabs TTS failed: ${error.message || response.statusText}`,
                    response.status
                );
            }

            const audioBuffer = await response.arrayBuffer();
            return Buffer.from(audioBuffer);
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(`TTS generation failed: ${error.message}`, 500);
        }
    }
}

