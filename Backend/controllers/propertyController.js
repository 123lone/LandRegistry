import { ethers } from 'ethers';
import FormData from 'form-data';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import fse from 'fs-extra';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

import User from '../models/userModel.js';
import Property from '../models/propertyModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const propertyTitleABIFile = fs.readFileSync(path.join(__dirname, '../abis/PropertyTitle.json'), 'utf-8');
const PropertyTitleABI = JSON.parse(propertyTitleABIFile);

const marketplaceABIFile = fs.readFileSync(path.join(__dirname, '../abis/MarketPlace.json'), 'utf-8');
const marketplaceABI = JSON.parse(marketplaceABIFile).abi;

// --- Admin Registration Workflow ---
export const preparePropertyRegistration = async (req, res) => {
  const { propertyId } = req.body;
  const tempDir = path.join(__dirname, '../uploads', propertyId);

  try {
    const {
      ownerWalletAddress, ownerName, surveyNumber, propertyAddress, district, area,
    } = req.body;

    if (!ownerWalletAddress || !ownerName || !surveyNumber || !propertyId || !propertyAddress || !district || !area) {
      return res.status(400).json({ success: false, message: 'Missing required property data fields.' });
    }
    if (!ethers.isAddress(ownerWalletAddress)) {
      return res.status(400).json({ success: false, message: 'Invalid owner wallet address format.' });
    }
    if (!req.files || !req.files.motherDeed || !req.files.encumbranceCertificate) {
      return res.status(400).json({ success: false, message: 'Both document files are required.' });
    }

    const existingProperty = await Property.findOne({ propertyId });
    if (existingProperty) {
      return res.status(400).json({ success: false, message: 'A property with this ID already exists.' });
    }
    
    fse.ensureDirSync(tempDir);
    const motherDeedFile = req.files.motherDeed[0];
    const encumbranceCertFile = req.files.encumbranceCertificate[0];
    const newMotherDeedPath = path.join(tempDir, 'motherDeed.pdf');
    const newEncumbrancePath = path.join(tempDir, 'encumbrance.pdf');
    fs.renameSync(motherDeedFile.path, newMotherDeedPath);
    fs.renameSync(encumbranceCertFile.path, newEncumbrancePath);

    let documentHashes;
    try {
      const uploadFile = async (filePath, docType) => {
        const fileStream = fs.createReadStream(filePath);
        const formData = new FormData();
        formData.append('file', fileStream, {
          filename: path.basename(filePath),
          contentType: 'application/pdf',
        });
        formData.append('pinataMetadata', JSON.stringify({
          name: `${propertyId}_${docType}`,
          keyvalues: { propertyId, documentType: docType, verifier: req.user.walletAddress }
        }));
        const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
          method: 'POST',
          headers: {
            'pinata_api_key': process.env.PINATA_API_KEY,
            'pinata_secret_api_key': process.env.PINATA_SECRET_API_KEY,
          },
          body: formData,
        });
        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`Failed to upload ${docType} to IPFS: ${response.statusText} - ${errorBody}`);
        }
        const result = await response.json();
        return result.IpfsHash;
      };
      const motherDeedHash = await uploadFile(newMotherDeedPath, 'mother_deed');
      const encumbranceCertHash = await uploadFile(newEncumbrancePath, 'encumbrance_certificate');
      documentHashes = [motherDeedHash, encumbranceCertHash];
    } finally {
      if (fs.existsSync(tempDir)) {
          fs.rmSync(tempDir, { recursive: true, force: true });
      }
    }
    
    const contractInterface = new ethers.Interface(PropertyTitleABI.abi);
    const encodedFunctionCall = contractInterface.encodeFunctionData('mintTitle', [
      ownerWalletAddress,
      surveyNumber,
      propertyId,
      propertyAddress,
      district,
      parseInt(area),
      ownerName,
      documentHashes
    ]);

    const transactionData = {
      to: process.env.PROPERTYTITLE_ADDRESS,
      data: encodedFunctionCall,
    };

    res.status(200).json({
      success: true,
      message: 'Transaction data prepared. Please sign with your wallet.',
      transactionData,
      propertyData: { 
        ownerWalletAddress, ownerName, surveyNumber, propertyId, propertyAddress, district, area, documentHashes
      }
    });

  } catch (error) {
    console.error('Error preparing property registration:', error);
    if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
    }
    res.status(500).json({ success: false, message: 'Internal server error: ' + error.message });
  }
};

export const finalizePropertyRegistration = async (req, res) => {
  const { transactionHash, propertyData } = req.body;

  if (!transactionHash || !propertyData) {
    return res.status(400).json({ success: false, message: 'Missing transactionHash or propertyData.' });
  }

  try {
    const provider = new ethers.JsonRpcProvider(process.env.GANACHE_URL);
    const receipt = await provider.waitForTransaction(transactionHash);
    if (receipt.status === 0) {
      throw new Error('Blockchain transaction failed.');
    }

    let tokenId;
    const contractInterface = new ethers.Interface(PropertyTitleABI.abi);
    for (const log of receipt.logs) {
      try {
        const parsedLog = contractInterface.parseLog(log);
        if (parsedLog && parsedLog.name === 'TitleMinted') {
          tokenId = parsedLog.args.tokenId.toString();
          break;
        }
      } catch (e) { /* Ignore logs from other contracts */ }
    }

    if (!tokenId) {
      throw new Error('Could not find TitleMinted event in the transaction receipt.');
    }

    const propertyOwner = await User.findOne({ walletAddress: propertyData.ownerWalletAddress });
    if (!propertyOwner) {
      return res.status(404).json({ success: false, message: 'Property owner not found.' });
    }

    const newProperty = new Property({
      tokenId,
      transactionHash,
      surveyNumber: propertyData.surveyNumber,
      propertyId: propertyData.propertyId,
      propertyAddress: propertyData.propertyAddress,
      district: propertyData.district,        // ✅ FIXED: Added district
      area: parseInt(propertyData.area),
      ownerWalletAddress: propertyData.ownerWalletAddress,
      ownerName: propertyData.ownerName,
      documentHashes: propertyData.documentHashes,
      status: 'pending',
      owner: propertyOwner._id,
      verifier: req.user._id,
    });

    await newProperty.save();

    res.status(201).json({
      success: true,
      message: 'Property registration finalized and saved to database!',
      data: { tokenId, propertyId: propertyData.propertyId, transactionHash }
    });

  } catch (error) {
    console.error('Error finalizing property registration:', error);
    res.status(500).json({ success: false, message: 'Internal server error: ' + error.message });
  }
};


// --- User Document Verification Workflow ---
// --- User Document Verification Workflow ---
// --- User Document Verification Workflow ---
export const verifyPropertyDocuments = async (req, res) => {
  const tempDir = path.join(__dirname, '../Uploads', `verify-${Date.now()}`);
  try {
    const { district, surveyNumber } = req.body;
    const files = req.files;
    const requesterAddress = req.body.walletAddress;

    // Log incoming data for debugging
    console.log('Received data:', { district, surveyNumber, files: Object.keys(files || {}) });
    console.log('req.files:', JSON.stringify(files, null, 2));

    // 1. Validate inputs
    if (!district || !surveyNumber) {
      console.log('Missing text fields:', { district, surveyNumber });
      return res.status(400).json({ message: 'District and survey number are required.' });
    }
    if (!files || !files.motherDeed || !files.motherDeed[0] || !files.encumbranceCertificate || !files.encumbranceCertificate[0]) {
      console.log('Missing or invalid files:', files);
      return res.status(400).json({ message: 'Both Mother Deed and Encumbrance Certificate files are required.' });
    }

    // 2. Find the property
    const property = await Property.findOne({ district, surveyNumber });
    console.log('Found property:', property ? property : 'No property found');
    if (!property) {
      return res.status(404).json({ message: 'Property not found with the provided district and survey number.' });
    }

    // 3. Check if already verified
    if (property.status === 'verified') {
      return res.status(400).json({ message: 'This property has already been verified.' });
    }
    if (property.ownerWalletAddress.toLowerCase() !== requesterAddress.toLowerCase()) {
      console.log(property.ownerWalletAddress, requesterAddress );
      
      return res.status(403).json({ message: 'Forbidden: You are not the owner of this property.' });
    }

    // 4. Validate documentHashes
    if (!property.documentHashes || !Array.isArray(property.documentHashes) || property.documentHashes.length < 2) {
      console.log('Invalid documentHashes:', property.documentHashes);
      return res.status(500).json({ message: 'Invalid document hashes in database.' });
    }

    // 5. Save uploaded files temporarily from buffers
    fse.ensureDirSync(tempDir);
    const motherDeedFile = files.motherDeed[0];
    const encumbranceCertFile = files.encumbranceCertificate[0];
    const newMotherDeedPath = path.join(tempDir, 'motherDeed.pdf');
    const newEncumbrancePath = path.join(tempDir, 'encumbrance.pdf');
    
    // Write buffers to temporary files
    fs.writeFileSync(newMotherDeedPath, motherDeedFile.buffer);
    fs.writeFileSync(newEncumbrancePath, encumbranceCertFile.buffer);

    // 6. Upload files to Pinata and get IPFS CIDs
    const uploadFile = async (filePath, docType) => {
      const fileStream = fs.createReadStream(filePath);
      const formData = new FormData();
      formData.append('file', fileStream, {
        filename: path.basename(filePath),
        contentType: 'application/pdf',
      });
      formData.append('pinataMetadata', JSON.stringify({
        name: `${property.propertyId}_${docType}`,
        keyvalues: { propertyId: property.propertyId, documentType: docType, verifier: req.user?.walletAddress || 'unknown' }
      }));
      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'pinata_api_key': process.env.PINATA_API_KEY,
          'pinata_secret_api_key': process.env.PINATA_SECRET_API_KEY,
        },
        body: formData,
      });
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Failed to upload ${docType} to IPFS: ${response.statusText} - ${errorBody}`);
      }
      const result = await response.json();
      return result.IpfsHash;
    };

    let uploadedMotherDeedHash, uploadedEncumbranceCertHash;
    try {
      uploadedMotherDeedHash = await uploadFile(newMotherDeedPath, 'mother_deed');
      uploadedEncumbranceCertHash = await uploadFile(newEncumbrancePath, 'encumbrance_certificate');
    } finally {
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    }

    // Log hashes for debugging
    console.log('Uploaded Mother Deed Hash:', uploadedMotherDeedHash);
    console.log('Uploaded Encumbrance Cert Hash:', uploadedEncumbranceCertHash);
    console.log('Stored Mother Deed Hash:', property.documentHashes[0]);
    console.log('Stored Encumbrance Cert Hash:', property.documentHashes[1]);

    // 7. Compare IPFS CIDs
    if (uploadedMotherDeedHash !== property.documentHashes[0]) {
      return res.status(400).json({ message: 'Verification failed. Mother Deed does not match the official record.' });
    }
    if (uploadedEncumbranceCertHash !== property.documentHashes[1]) {
      return res.status(400).json({ message: 'Verification failed. Encumbrance Certificate does not match the official record.' });
    }

    // 8. Success: Update property status
    property.status = 'verified';
    await property.save();
    console.log('Property verified:', property._id);
    return res.status(200).json({ success: true, message: 'Verification successful! The land is now confirmed.' });
  } catch (error) {
    console.error('Error during document verification:', error);
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    return res.status(500).json({ message: `Internal server error: ${error.message}` });
  }
};
// --- User Property Listing Workflow (The Corrected Functions) ---

/**
 * @desc    Step 1: Prepare the 'approve' transaction for listing a property.
 * @route   POST /api/properties/:id/prepare-listing
 * @access  Private (Owner)
 */
export const prepareListingForSale = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    if (property.owner.toString() !== req.user.id)
      return res.status(403).json({ message: 'User not authorized' });

    const { price } = req.body;
    if (!price || isNaN(price) || Number(price) <= 0)
      return res.status(400).json({ message: 'Valid price is required' });

    const contractInterface = new ethers.Interface(PropertyTitleABI.abi);

    const encodedFunctionCall = contractInterface.encodeFunctionData('approve', [
      process.env.MARKETPLACE_ADDRESS, // Marketplace contract
      property.tokenId,
    ]);

    const transactionData = {
      to: process.env.PROPERTYTITLE_ADDRESS, // NFT contract
      data: encodedFunctionCall,
    };

    res.status(200).json({
      success: true,
      message: 'Approval transaction prepared. Please sign with your wallet.',
      transactionData,
    });
  } catch (error) {
    console.error('Error preparing listing:', error.message);
    res.status(500).json({ message: 'Server error while preparing listing.' });
  }
};

/**
 * @desc    Step 2: Finalize the listing after transaction is confirmed
 * @route   POST /api/properties/:id/finalize-listing
 * @access  Private (Owner)
 */
export const finalizeListingForSale = async (req, res) => {
  try {
    const { approveTxHash, listTxHash, price } = req.body;
    if (!approveTxHash || !listTxHash || !price)
      return res.status(400).json({ message: 'Transaction hashes and price are required' });

    if (isNaN(price) || Number(price) <= 0)
      return res.status(400).json({ message: 'Invalid price' });

    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    if (property.owner.toString() !== req.user.id)
      return res.status(403).json({ message: 'User not authorized' });

    const provider = new ethers.JsonRpcProvider(process.env.GANACHE_URL);

    // Verify approval transaction
    const approveReceipt = await provider.waitForTransaction(approveTxHash);
    if (!approveReceipt || approveReceipt.status === 0)
      throw new Error('Approval transaction failed');

    // Verify listing transaction
    const listReceipt = await provider.waitForTransaction(listTxHash);
    if (!listReceipt || listReceipt.status === 0)
      throw new Error('Listing transaction failed');

    // Update property in DB
    property.status = 'listed_for_sale';
    property.price = Number(price);
    await property.save();

    res.status(200).json({
      success: true,
      message: 'Property successfully listed for sale!',
      data: property,
    });
  } catch (error) {
    console.error('Error finalizing listing:', error.message);
    res.status(500).json({ message: 'Server error while finalizing listing.' });
  }
};




// --- Other Property Getter/Management Functions ---

export const getMyProperties = async (req, res) => {
  try {
    const properties = await Property.find({ owner: req.user.id })
      .select('-documentHashes')
      .populate('owner', 'name email');
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching your properties.' });
  }
};

export const getMarketplaceProperties = async (req, res) => {
    try {
        const properties = await Property.find({ status: 'listed_for_sale' })
            .populate('owner', 'name email');
        res.json(properties);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
export const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('owner', 'name email phone');
    if (property) {
      res.json(property);
    } else {
      res.status(404).json({ message: 'Property not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
export const confirmSale = async (req, res) => {
    console.log('=== confirmSale controller reached ===');
    console.log('Authenticated user:', req.user?._id, req.user?.walletAddress);

    try {
        const { buyerWalletAddress, transactionHash } = req.body;

        if (!buyerWalletAddress || !transactionHash) {
            console.log(buyerWalletAddress, transactionHash);
            return res.status(400).json({ message: 'Buyer wallet and transaction hash are required.' });
        }

        if (!req.user || !req.user.walletAddress) {
            return res.status(401).json({ message: 'User not properly authenticated.' });
        }

        const userWallet = req.user.walletAddress.toLowerCase();
        const buyerWallet = buyerWalletAddress.toLowerCase();
        if (userWallet !== buyerWallet) {
            console.log('Wallet mismatch:', { userWallet, buyerWallet });
            return res.status(403).json({ message: 'Wallet address does not match authenticated user.' });
        }

        // Find the property being sold
        console.log('Looking for property with ID:', req.params.id);
        const property = await Property.findById(req.params.id);
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        console.log('Property found, updating sale info...');

        // Update the existing property with sale info
        property.previousOwner = property.owner; // record old owner
        property.owner = req.user._id; // new owner
        property.status = 'verified';
        property.transactionHash = transactionHash;
        property.soldAt = new Date();

        const updatedProperty = await property.save();

        console.log('Property updated successfully');

        res.json({
            message: 'Sale confirmed and property updated successfully.',
            property: updatedProperty
        });
    } catch (error) {
        console.error('Error in confirmSale:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
