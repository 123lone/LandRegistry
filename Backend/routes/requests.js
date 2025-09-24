import express from 'express';
import { protect, isVerifiedSeller } from '../middlewares/authMiddleware.js';
import {
  getSellerRequests,
  withdrawFunds,
  rejectTrade,
  getSellerSales,
  getPropertyByTokenId
} from '../controllers/requestsController.js';

const router = express.Router();

// All routes require the user to be logged in and a verified seller
router.use(protect, isVerifiedSeller);

// GET all requests for seller
router.get('/seller', getSellerRequests);

// POST withdraw funds for a sold property
router.post('/:id/withdraw', withdrawFunds);  // <-- use withdrawFunds

// POST reject a trade
router.post('/:id/reject', rejectTrade);
router.get('/by-token/:tokenId', getPropertyByTokenId);
router.get('/my-sales', protect, getSellerSales);

export default router;
