import express from 'express';
import { registerUser, loginUser, logoutUser,updateUserWallet,loginWithWallet,getUserByWallet } from '../controllers/authController.js';
import { protect, isVerifier } from '../middlewares/authMiddleware.js';
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.patch('/wallet', protect, updateUserWallet);
router.post("/wallet-login", loginWithWallet);
router.get('/by-wallet/:walletAddress', getUserByWallet);

export default router;
