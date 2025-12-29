// Abstract base class for TTS providers
export class TTSProvider {
    async generate(text, options = {}) {
        throw new Error("generate() must be implemented by subclass");
    }

    async validateText(text) {
        if (!text || typeof text !== "string") {
            throw new Error("Text must be a non-empty string");
        }
        if (text.length > 5000) {
            throw new Error("Text length exceeds maximum (5000 characters)");
        }
        return true;
    }
}

