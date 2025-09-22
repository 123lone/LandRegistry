// models/propertyModel.js
import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
  tokenId: { type: String, required: true },
  surveyNumber: { type: String, required: true },
  propertyId: { type: String, required: true },
  propertyAddress: { type: String, required: true },
  area: { type: Number, required: true },
  areaUnit: { type: String, default: 'sq m' },

  price: { type: Number, default: 0 },

  ownerWalletAddress: { type: String, required: true },
  ownerName: { type: String, required: true },
  district: { type: String, default: '' },

  documentHashes: { type: [String], required: true },

  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'verified', 'listed_for_sale', 'sold','pending_seller_verification'],
  },

  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  verifier: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // ✅ New field to track withdrawals
  isWithdrawn: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Property', propertySchema);
