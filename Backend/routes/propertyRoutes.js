import express from 'express';
import {
  preparePropertyRegistration,
  finalizePropertyRegistration,
  verifyProperty,
  listPropertyForSale,
  getMarketplaceProperties,
  confirmSale,
  getMyProperties,
  getPropertyById,
} from '../controllers/propertyController.js';
import { protect, isVerifier } from '../middlewares/authMiddleware.js';
import multer from 'multer';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// --- Property Registration Routes ---

// @desc    Step 1: Prepare property data and get transaction details for signing
// @route   POST /api/properties/prepare
// @access  Private/Verifier
router.post(
  '/prepare',
  protect,
  isVerifier,
  upload.fields([
    { name: 'motherDeed', maxCount: 1 },
    { name: 'encumbranceCertificate', maxCount: 1 },
  ]),
  preparePropertyRegistration
);

// @desc    Step 2: Finalize registration with transaction hash
// @route   POST /api/properties/finalize
// @access  Private/Verifier
router.post('/finalize', protect, isVerifier, finalizePropertyRegistration);


// --- Other Property Management Routes ---

// @desc    Get all properties for the logged-in user
// @route   GET /api/properties/my-properties
// @access  Private
router.get('/my-properties', protect, getMyProperties);

// @desc    Get all properties listed for sale on the marketplace
// @route   GET /api/properties/marketplace
// @access  Private
router.get('/marketplace', getMarketplaceProperties);

// @desc    Get a single property by its ID
// @route   GET /api/properties/:id
// @access  Public (or Private)
router.get('/:id', getPropertyById);

// @desc    Verify a property (restricted to verifiers)
// @route   PUT /api/properties/verify/:id
// @access  Private/Verifier
router.put('/verify/:id', protect, isVerifier, verifyProperty);

// @desc    List a verified property for sale
// @route   PUT /api/properties/list/:id
// @access  Private/Seller (owner)
router.put('/list/:id', protect, listPropertyForSale);

// @desc    Confirm a sale and update the database
// @route   POST /api/properties/:id/confirm-sale
// @access  Private
router.post('/:id/confirm-sale', protect, confirmSale);

export default router;

