import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { config } from "./config/env.js";
import { requestLogger } from "./middleware/logger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import logger from "./utils/logger.js";

// Import routes
import authRoutes from "./api/v1/routes/auth.js";
import booksRoutes from "./api/v1/routes/books.js";
import bookmarksRoutes from "./api/v1/routes/bookmarks.js";
import ttsRoutes from "./api/v1/routes/tts.js";

const app = express();

// Security middleware - configure Helmet to allow audio responses
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "media-src": ["'self'", "http://localhost:3001"],
        },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// CORS configuration - allow audio resources
app.use(cors({
    origin: config.cors.origin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Type', 'Content-Length', 'Accept-Ranges'],
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
});
app.use("/api/", limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logging
app.use(requestLogger);

// Health check endpoint
app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        service: "shamela-tts-reader-api",
    });
});

// API routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/books", booksRoutes);
app.use("/api/v1/bookmarks", bookmarksRoutes);
app.use("/api/v1/tts", ttsRoutes);

// 404 handler
app.use("/api/v1/*", (req, res) => {
    res.status(404).json({
        success: false,
        error: {
            message: "API endpoint not found",
        },
    });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = config.server.port;
app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT} in ${config.server.env} mode`);
});

export default app;
