const express = require('express');
const { createProperty, verifyProperty, listPropertyForSale, getMarketplaceProperties, confirmSale } = require('../controllers/propertyController');
// Import the new middleware
const { protect, isVerifier, isVerifiedSeller } = require('../middlewares/authMiddleware');

const router = express.Router();

// Add the 'isVerifiedSeller' middleware to this route
router.route('/').post(protect, isVerifiedSeller, createProperty);

router.route('/marketplace').get(protect, getMarketplaceProperties);
router.route('/verify/:id').put(protect, isVerifier, verifyProperty);
router.route('/list/:id').put(protect, listPropertyForSale);
router.route('/:id/confirm-sale').post(protect, confirmSale);

module.exports = router;