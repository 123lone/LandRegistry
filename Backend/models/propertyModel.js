const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User", // This creates a link to the User model
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    // --- THIS IS THE CRITICAL FIX ---
    // The tokenId from the blockchain must be stored to link the database record
    // to the specific NFT.
    tokenId: {
      type: String,
      required: true,
      unique: true,
    },
    // --- END OF FIX ---
    documentHashes: {
      type: [String], // An array of strings (for IPFS CIDs)
      required: true,
    },
    status: {
      type: String,
      enum: ["pending_verification", "verified", "listed_for_sale", "sold"],
      default: "pending_verification",
    },
    transactionHash: {
      type: String, // To store the hash of the minting transaction
    },
  },
  { timestamps: true }
);

const Property = mongoose.model("Property", propertySchema);
module.exports = Property;
