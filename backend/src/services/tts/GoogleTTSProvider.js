import { TTSProvider } from "./TTSProvider.js";
import { config } from "../../config/env.js";
import { AppError } from "../../utils/errors.js";

export class GoogleTTSProvider extends TTSProvider {
    constructor() {
        super();
        this.apiKey = config.tts.google.apiKey;
        this.baseUrl = "https://texttospeech.googleapis.com/v1/text:synthesize";
    }

    async generate(text, options = {}) {
        await this.validateText(text);

        if (!this.apiKey) {
            throw new AppError("Google TTS API key not configured", 500);
        }

        try {
            const response = await fetch(
                `${this.baseUrl}?key=${this.apiKey}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        input: { text },
                        voice: {
                            languageCode: options.languageCode || "ar-XA",
                            name: options.voiceName || "ar-XA-Wavenet-A",
                            ssmlGender: options.gender || "NEUTRAL",
                        },
                        audioConfig: {
                            audioEncoding: "MP3",
                            speakingRate: options.speakingRate || 1.0,
                            pitch: options.pitch || 0.0,
                        },
                    }),
                }
            );

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new AppError(
                    `Google TTS failed: ${error.error?.message || response.statusText}`,
                    response.status
                );
            }

            const data = await response.json();
            const audioBuffer = Buffer.from(data.audioContent, "base64");
            return audioBuffer;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(`TTS generation failed: ${error.message}`, 500);
        }
    }
}

