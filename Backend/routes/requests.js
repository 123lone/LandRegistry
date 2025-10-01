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
// app.get('/api/requests/pending-offers/:sellerAddress', async (req, res) => {
//   try {
//     const { sellerAddress } = req.params;
    
//     // Query your database for pending purchase requests
//     const pendingOffers = await PurchaseRequest.find({
//       seller: sellerAddress,
//       status: 'pending' // or whatever status indicates active offers
//     });
    
//     res.json(pendingOffers);
//   } catch (error) {

//     res.status(500).json({ error: 'Failed to fetch pending offers' });
//   }
// });

export default router;
