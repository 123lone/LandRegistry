const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

exports.protect = async (req, res, next) => {
    let token;
    token = req.cookies.jwt;

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};
// Add this to /middlewares/authMiddleware.js
exports.isVerifiedSeller = (req, res, next) => {
    // This middleware must run AFTER 'protect', so req.user will exist.
    if (req.user && req.user.role === 'Seller' && req.user.kycStatus === 'verified') {
        next(); // User is a verified seller, so we can proceed.
    } else {
        res.status(403).json({ message: 'Forbidden: Only KYC-verified sellers can list properties.' });
    }
};
exports.isVerifier = (req, res, next) => {
    if (req.user && req.user.role === 'Verifier') {
        next();
    } else {
        res.status(403).json({ message: 'Forbidden: Verifier access required.' });
    }
};