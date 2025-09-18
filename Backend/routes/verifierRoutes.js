import express from 'express';
import { 
  getPendingUsers, 
  updateUserKycStatus, 
  getPendingProperties,
  viewAadhaarDocument,
  getVerifiedUsers 
} from '../controllers/verifierController.js';
import { protect, isVerifier } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Route to get a list of users pending verification
router.get('/pending-users', protect, isVerifier, getPendingUsers);

// Route to get a list of properties pending verification
router.get('/pending-properties', protect, isVerifier, getPendingProperties);
router.get('/verified-users', protect, isVerifier, getVerifiedUsers);
// Route to update a specific user's KYC status
router.put('/users/:id/status', protect, isVerifier, updateUserKycStatus);

// Route to view a specific user's Aadhaar document
router.get('/users/:id/document', protect, isVerifier, viewAadhaarDocument);

export default router;
