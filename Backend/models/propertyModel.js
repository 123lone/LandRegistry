import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
  tokenId: { type: String, required: true }, // Store NFT token ID
  surveyNumber: { type: String, required: true },
  propertyId: { type: String, required: true },
  propertyAddress: { type: String, required: true },
  area: { type: Number, required: true },
  ownerWalletAddress: { type: String, required: true },
  ownerName: { type: String, required: true },
  description: { type: String, default: '' },
  documentHashes: { type: [String], required: true }, // Array of IPFS hashes
  status: { type: String, default: 'pending', enum: ['pending', 'verified', 'listed_for_sale', 'sold'] },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // MongoDB user reference
  verifier: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Verifier who registered
}, { timestamps: true });

export default mongoose.model('Property', propertySchema);