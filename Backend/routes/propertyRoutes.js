const express = require("express");
const multer = require("multer");
const {
  createProperty,
  verifyDocument, // Make sure to import the new function
  verifyProperty,
  listPropertyForSale,
  getMarketplaceProperties,
  confirmSale,
} = require("../controllers/propertyController");
const { protect, isVerifier } = require("../middlewares/authMiddleware");

const router = express.Router();

// Configure multer for in-memory file storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// --- MAIN PROPERTY ROUTES ---

// Route to create a new property. It uses 'protect' to ensure the user is logged in,
// and 'upload.single('document')' to handle the PDF file upload.
router.route("/").post(protect, upload.single("document"), createProperty);

// Route to verify a document. It also uses 'protect' and 'multer'.
router
  .route("/verify-document/:id")
  .post(protect, upload.single("document"), verifyDocument);

// --- OTHER ROUTES ---
router.route("/marketplace").get(protect, getMarketplaceProperties);
router.route("/verify/:id").put(protect, isVerifier, verifyProperty);
router.route("/list/:id").put(protect, listPropertyForSale);
router.route("/:id/confirm-sale").post(protect, confirmSale);

module.exports = router;
