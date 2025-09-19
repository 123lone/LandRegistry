import express from 'express';
import multer from 'multer';
// Import the new controller functions and remove createProperty
import { 
    prepareMint, 
    executeMint, 
    verifyProperty, 
    listPropertyForSale, 
    getMarketplaceProperties, 
    confirmSale, 
    getMyProperties, 
    getPropertyById 
} from '../controllers/propertyController.js';
import { protect, isVerifier, isVerifiedSeller } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Configure multer (this part is correct)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Ensure this directory exists
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// === NEW ROUTES FOR SIGNATURE WORKFLOW ===

// Step 1: Prepare the hash for the user to sign
router.route('/prepare-mint').post(protect, isVerifier, prepareMint);

// Step 2: Execute the minting with the signature and files
router.route('/execute-mint').post(
  protect,
  isVerifier,
  upload.fields([
    { name: 'motherDeed', maxCount: 1 },
    { name: 'encumbranceCertificate', maxCount: 1 },
  ]),
  executeMint
);


// === OTHER EXISTING ROUTES ===
router.route('/my').get(protect, getMyProperties);
router.route('/marketplace').get(protect, getMarketplaceProperties);
router.route('/verify/:id').put(protect, isVerifier, verifyProperty);
router.route('/list/:id').put(protect, isVerifiedSeller, listPropertyForSale);
router.route('/:id/confirm-sale').post(protect, confirmSale);
router.route('/:id').get(protect, getPropertyById);

export default router;