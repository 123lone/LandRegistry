import express from 'express';
import { uploadAadhaar } from '../controllers/kycController.js';
import { protect } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';



// routes/kycRoutes.js

import User from '../models/userModel.js';

const router = express.Router();

router.post('/upload', protect, upload.single('aadhaarFile'), uploadAadhaar);

// Return actual KYC status for the logged-in user
router.get('/status', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      verified: user.kycStatus === 'verified',
      status: user.kycStatus || 'not_uploaded',
    });
  } catch (err) {
    console.error('KYC status error:', err);
    res.status(500).json({ message: 'Server error fetching KYC status' });
  }
});

export default router;
