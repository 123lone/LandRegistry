const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const kycRoutes = require('./routes/kycRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const verifierRoutes = require('./routes/verifierRoutes');
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
app.use('/api/verifier', verifierRoutes);
// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/properties', propertyRoutes);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));