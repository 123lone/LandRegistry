const express = require('express');
const { uploadAadhaar } = require('../controllers/kycController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const router = express.Router();

router.post('/upload', protect, upload.single('aadhaarFile'), uploadAadhaar);

module.exports = router;