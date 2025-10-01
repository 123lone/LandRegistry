import Property from '../models/propertyModel.js';
import User from '../models/userModel.js';
import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read Marketplace ABI
const marketplaceABIFile = fs.readFileSync(path.join(__dirname, '../abis/Marketplace.json'), 'utf-8');
const MarketplaceABI = JSON.parse(marketplaceABIFile);

/**
 * @desc    Get all pending seller requests for verification
 * @route   GET /api/requests/seller
 * @access  Private (Seller)
 */
export const getSellerRequests = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
     console.log(`[DEBUG] Logged-in User ID: ${req.user.id}`);

    // ✅ FIXED: Changed 'seller' to 'owner' to match your database schema
    const properties = await Property.find({
      owner: req.user.id,
      status: 'pending_seller_verification'
    }).populate('buyer', 'name email phone'); // Populates the potential buyer's info

    console.log("Fetched pending requests:", properties);

    res.status(200).json({
      success: true,
      data: properties
    });
  } catch (error) {
    console.error('Error fetching seller requests:', error);
    res.status(500).json({ message: 'Server error fetching requests' });
  }
};

/**
 * @desc    Approve a pending sale request
 * @route   POST /api/requests/:id/approve
 * @access  Private (Seller)
 */
export const approveSale = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        // ✅ FIXED: Authorization check now uses 'owner'
        if (property.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to approve this sale' });
        }

        if (property.status !== 'pending_seller_verification') {
            return res.status(400).json({ message: 'Property is not pending verification.' });
        }

        // Note: The frontend should have already called the smart contract's 'approveSale' function.
        // This endpoint finalizes the sale in the database.

        property.status = 'sold';
        property.owner = property.buyer; // Transfer ownership to the buyer
        property.buyer = null; // Clear the temporary buyer field

        await property.save();

        res.status(200).json({
            success: true,
            message: 'Sale approved and database updated successfully.',
            data: property
        });

    } catch (error) {
        console.error('Error approving sale:', error);
        res.status(500).json({ message: 'Server error while approving sale' });
    }
};


/**
 * @desc    Reject a pending sale request
 * @route   POST /api/requests/:id/reject
 * @access  Private (Seller)
 */
export const rejectTrade = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    // ✅ FIXED: Authorization check now uses 'owner'
    if (property.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Note: The frontend should call the smart contract's 'rejectSale' function
    // to refund the buyer from escrow before hitting this endpoint.

    property.status = 'listed_for_sale';
    property.buyer = null; // Clear the potential buyer
    await property.save();

    res.status(200).json({
      success: true,
      message: 'Sale request rejected successfully.',
      data: property
    });

  } catch (error) {
    console.error('Error rejecting trade:', error);
    res.status(500).json({ message: 'Server error while rejecting trade' });
  }
};

/**
 * @desc    Withdraw seller's proceeds from the contract
 * @route   POST /api/requests/withdraw
 * @access  Private (Seller)
 */
export const withdrawFunds = async (req, res) => {
  try {
    if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    // CRITICAL: This uses a server-side wallet for secure blockchain transactions.
    const provider = new ethers.JsonRpcProvider(process.env.YOUR_RPC_URL);
    const signer = new ethers.Wallet(process.env.SERVER_WALLET_PRIVATE_KEY, provider);

    const marketplaceContract = new ethers.Contract(
      process.env.VITE_MARKETPLACE_ADDRESS,
      MarketplaceABI.abi,
      signer
    );

    console.log(`Initiating withdrawal for ${signer.address}...`);
    const tx = await marketplaceContract.withdrawProceeds();
    const receipt = await tx.wait();
    console.log(`Withdrawal successful. TxHash: ${receipt.transactionHash}`);
    
    res.status(200).json({
      success: true,
      message: 'Funds withdrawn successfully',
      txHash: receipt.transactionHash,
    });

  } catch (error) {
    console.error('Error withdrawing funds:', error);
    res.status(500).json({ message: 'Server error during withdrawal' });
  }
};

export const getPropertyByTokenId = async (req, res) => {
  try {
    const { tokenId } = req.params;
    
    if (!tokenId) {
      return res.status(400).json({ message: 'Token ID is required' });
    }

    const property = await Property.findOne({ tokenId })
      .select('title description location price tokenId status createdAt')
      .populate('owner', 'name email');

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.json(property);
  } catch (error) {
    console.error('Error fetching property by token ID:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get seller's sold properties with buyer details
export const getSellerSales = async (req, res) => {
  try {
    const sellerId = req.user._id;
    
    // Find all properties that were owned by this seller and are now sold
    const soldProperties = await Property.find({
      previousOwner: sellerId, // You might need to add this field
      status: 'sold'
    })
    .populate('owner', 'name email phone walletAddress') // Current owner (buyer)
    .select('title description location price tokenId transactionHash soldAt')
    .sort({ soldAt: -1 });

    res.json(soldProperties);
  } catch (error) {
    console.error('Error fetching seller sales:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// In your backend routes
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