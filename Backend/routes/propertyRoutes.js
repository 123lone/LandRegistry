import express from 'express';
import multer from 'multer';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { 
  preparePropertyRegistration,
  finalizePropertyRegistration,
  verifyPropertyDocuments,
  prepareListingForSale,   // <-- IMPORT THIS
  finalizeListingForSale,  // <-- IMPORT THIS
  getMarketplaceProperties,
  confirmSale,
  getMyProperties,
  getPropertyById,
} from '../controllers/propertyController.js';

import { protect, isVerifier } from '../middlewares/authMiddleware.js';

const router = express.Router();

// --- Multer Configurations ---
const adminUpload = multer({ dest: 'uploads/' });
const userUpload = multer({ storage: multer.memoryStorage() });


// --- Admin/Verifier Routes ---
router.post(
  '/prepare',
  protect,
  isVerifier,
  adminUpload.fields([
    { name: 'motherDeed', maxCount: 1 },
    { name: 'encumbranceCertificate', maxCount: 1 },
  ]),
  preparePropertyRegistration
);

router.post('/finalize', protect, isVerifier, finalizePropertyRegistration);


// --- User and Public Routes ---
router.post(
  '/verify-documents',
  userUpload.fields([
    { name: 'motherDeed', maxCount: 1 },
    { name: 'encumbranceCertificate', maxCount: 1 },
  ]),
  verifyPropertyDocuments
);

// --- CORRECTED: Routes for the secure listing workflow ---
router.post('/:id/prepare-listing', protect, prepareListingForSale);
router.post('/:id/finalize-listing', protect, finalizeListingForSale);

// --- The old '/:id/list-for-sale' route has been removed ---

router.get('/my-properties', protect, getMyProperties);
router.get('/marketplace', getMarketplaceProperties);
router.post('/:id/confirm-sale', protect, confirmSale);
router.get('/:id', getPropertyById);

export default router;