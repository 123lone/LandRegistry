import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import kycRoutes from './routes/kycRoutes.js';
import propertyRoutes from './routes/propertyRoutes.js';
import verifierRoutes from './routes/verifierRoutes.js';
import requestsRoutes from './routes/requests.js';

// ESM doesn’t have __dirname / __filename by default
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Connect to the database
connectDB();

const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:3000', // Your Next.js frontend URL
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/verifier', verifierRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/requests', requestsRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
