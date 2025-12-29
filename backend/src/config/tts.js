import { config } from "./env.js";

export const ttsConfig = {
    provider: config.tts.provider,
    elevenlabs: {
        apiKey: config.tts.elevenlabs.apiKey,
        baseUrl: "https://api.elevenlabs.io/v1",
        defaultVoiceId: "21m00Tcm4TlvDq8ikWAM", // Arabic voice
        defaultModel: "eleven_multilingual_v2",
    },
    google: {
        apiKey: config.tts.google.apiKey,
        baseUrl: "https://texttospeech.googleapis.com/v1",
        defaultLanguageCode: "ar-XA",
        defaultVoiceName: "ar-XA-Wavenet-A",
    },
};

export default ttsConfig;

