
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import http from 'http';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';

import connectDB from './config/database.js';
import { initAdminUser } from './config/initDb.js';
import errorHandler from './middleware/errorHandler.js';
import { initWebSocket } from './services/websocket.js';

import authRoutes from './routes/authRoutes.js';
import loanRoutes from './routes/loanRoutes.js';
import investorRoutes from './routes/investorRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const startServer = async () => {
    // SECURITY: Stricter JWT Secret Validation
    const secret = process.env.JWT_SECRET;
    if (!secret || secret === 'replace_this_with_a_very_long_and_random_secret_string' || secret.length < 32) {
        console.error('\nFATAL ERROR: JWT_SECRET is unconfigured, default, or too weak.');
        console.error('The application requires a strong secret key of at least 32 characters.');
        process.exit(1);
    }

    const app = express();
    app.set('trust proxy', 1);
    
    const server = http.createServer(app);
    initWebSocket(server);
    await connectDB();

    // --- MIDDLEWARE ---
    app.use(helmet()); // Security headers
    app.use(cookieParser(secret)); // Signed cookies
    app.use(express.json({ limit: '10kb' })); // Body parser with size limit
    app.use(mongoSanitize()); // Prevent NoSQL injection
    app.use(hpp()); // Prevent HTTP Parameter Pollution

    // --- RATE LIMITING ---
    const apiLimiter = rateLimit({
        windowMs: 15 * 60 * 1000, 
        max: 300,
        message: 'Too many requests from this IP, please try again after 15 minutes',
        standardHeaders: true,
        legacyHeaders: false,
    });
    app.use('/api', apiLimiter);

    // --- CORS ---
    app.use(cors({
        origin: true, // In production, replace with specific allowed origin
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Requested-With']
    }));

    // --- CSRF PROTECTION ---
    // Custom implementation using Signed Cookies + Header
    app.use((req, res, next) => {
        // 1. Generate CSRF token if not exists
        let csrfToken = req.signedCookies['_csrf'];
        if (!csrfToken) {
            csrfToken = crypto.randomBytes(32).toString('hex');
            res.cookie('_csrf', csrfToken, {
                httpOnly: true,
                signed: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/'
            });
        }

        // 2. Attach token to response for the frontend to read initially or via a special GET
        res.locals.csrfToken = csrfToken;
        
        // 3. Verify token on mutating requests
        const mutatingMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
        if (mutatingMethods.includes(req.method)) {
            const clientToken = req.headers['x-csrf-token'];
            if (!clientToken || clientToken !== csrfToken) {
                return res.status(403).json({ message: 'Invalid or missing CSRF token' });
            }
        }
        next();
    });

    // --- CSRF TOKEN ENDPOINT ---
    app.get('/api/csrf-token', (req, res) => {
        res.json({ csrfToken: res.locals.csrfToken });
    });

    // --- ROUTES ---
    app.use('/api/auth', authRoutes);
    app.use('/api/loans', loanRoutes);
    app.use('/api/investors', investorRoutes);
    app.use('/api/notifications', notificationRoutes);
    app.use('/api/admin', adminRoutes);

    app.use(errorHandler);

    const PORT = process.env.PORT || 3001;
    server.listen(PORT, async () => {
        console.log(`Server running on port ${PORT}`);
        await initAdminUser();
    });
};

startServer();
