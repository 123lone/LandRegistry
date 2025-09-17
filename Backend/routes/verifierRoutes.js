const express = require('express');
const { 
  getPendingUsers, 
  updateUserKycStatus, 
  getPendingProperties ,
  viewAadhaarDocument
} = require('../controllers/verifierController');
const { protect, isVerifier } = require('../middlewares/authMiddleware');

const router = express.Router();

// Route to get a list of users pending verification
router.get('/pending-users', protect, isVerifier, getPendingUsers);

// Route to get a list of properties pending verification
router.get('/pending-properties', protect, isVerifier, getPendingProperties);

// Route to update a specific user's KYC status
router.put('/users/:id/status', protect, isVerifier, updateUserKycStatus);
router.get('/users/:id/document', protect, isVerifier, viewAadhaarDocument);

module.exports = router;
