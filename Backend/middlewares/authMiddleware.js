import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

// Protect routes (check JWT)
export const protect = async (req, res, next) => {
  let token = req.cookies.jwt;

  // Check Authorization header if cookie not present
  if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) return res.status(401).json({ message: "Not authorized, no token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    next();
  } catch (err) {
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};


// Middleware to check if user is a KYC-verified Seller/Owner
export const isVerifiedSeller = (req, res, next) => {
    const isAuthorizedRole = req.user && (req.user.role === 'Seller' || req.user.role === 'Owner');

    if (isAuthorizedRole && req.user.kycStatus === 'verified') {
        next();
    } else {
        res.status(403).json({ message: 'Forbidden: Action requires a KYC-verified Seller or Owner.' });
    }
};

// Middleware to check if user is a Verifier
export const isVerifier = (req, res, next) => {
    if (req.user && req.user.role === 'Verifier') {
        next();
    } else {
        res.status(403).json({ message: 'Forbidden: Verifier access required.' });
    }
};
// In /middlewares/authMiddleware.js
export const isOwner = async (req, res, next) => {
    const property = await Property.findById(req.params.id);

    if (!property) {
        return res.status(404).json({ message: 'Property not found' });
    }

    if (property.owner.toString() !== req.user.id) {
        return res.status(403).json({ message: 'User not authorized for this property' });
    }
    
    // If the checks pass, attach the property to the request and continue
    req.property = property; 
    next();
};