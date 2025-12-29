import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = [
    "DB_HOST",
    "DB_PORT",
    "DB_NAME",
    "DB_USER",
    "DB_PASSWORD",
    "JWT_SECRET",
];

const optionalEnvVars = {
    PORT: 3001,
    NODE_ENV: "development",
    JWT_EXPIRES_IN: "7d",
    TTS_PROVIDER: "elevenlabs",
    AUDIO_STORAGE_PATH: "./storage/audio",
    STORAGE_TYPE: "local",
    CORS_ORIGIN: "http://localhost:3000",
    LOG_LEVEL: "info",
};

// Validate required environment variables
const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
    console.error(
        "Missing required environment variables:",
        missingVars.join(", ")
    );
    process.exit(1);
}

export const config = {
    server: {
        port: parseInt(process.env.PORT || optionalEnvVars.PORT, 10),
        env: process.env.NODE_ENV || optionalEnvVars.NODE_ENV,
    },
    database: {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT, 10),
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    },
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || optionalEnvVars.JWT_EXPIRES_IN,
    },
    tts: {
        provider: process.env.TTS_PROVIDER || optionalEnvVars.TTS_PROVIDER,
        elevenlabs: {
            apiKey: process.env.ELEVENLABS_API_KEY || "",
        },
        google: {
            apiKey: process.env.GOOGLE_TTS_API_KEY || "",
        },
    },
    storage: {
        type: process.env.STORAGE_TYPE || optionalEnvVars.STORAGE_TYPE,
        audioPath: process.env.AUDIO_STORAGE_PATH || optionalEnvVars.AUDIO_STORAGE_PATH,
    },
    cors: {
        origin: process.env.CORS_ORIGIN || optionalEnvVars.CORS_ORIGIN,
    },
    logging: {
        level: process.env.LOG_LEVEL || optionalEnvVars.LOG_LEVEL,
    },
};