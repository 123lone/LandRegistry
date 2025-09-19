import { ethers } from 'ethers';
import FormData from 'form-data';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import User from '../models/userModel.js';
import Property from '../models/propertyModel.js';

// --- SETUP ---
// Get __dirname equivalent in ESM for path resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the smart contract ABI
const propertyTitleABIFile = fs.readFileSync(path.join(__dirname, '../abis/PropertyTitle.json'), 'utf-8');
const PropertyTitleABI = JSON.parse(propertyTitleABIFile);

// NOTE: The provider is now initialized within each function that needs it
// to prevent a race condition with loading environment variables on startup.

// --- CONTROLLER FUNCTIONS ---

/**
 * @desc    Step 1: Prepare property data, upload documents to IPFS, and return transaction data for signing.
 * @route   POST /api/properties/prepare
 * @access  Private (Verifier)
 */
export const preparePropertyRegistration = async (req, res) => {
  try {
    const {
      ownerWalletAddress,
      ownerName,
      surveyNumber,
      propertyId,
      propertyAddress,
      area,
      description = '',
    } = req.body;

    // 1. --- VALIDATION ---
    if (!ownerWalletAddress || !ownerName || !surveyNumber || !propertyId || !propertyAddress || !area) {
      return res.status(400).json({ success: false, message: 'Missing required property data fields.' });
    }
    if (!ethers.isAddress(ownerWalletAddress)) {
      return res.status(400).json({ success: false, message: 'Invalid owner wallet address format.' });
    }
    if (!req.files || !req.files.motherDeed || !req.files.encumbranceCertificate) {
      return res.status(400).json({ success: false, message: 'Both Mother Deed and Encumbrance Certificate files are required.' });
    }
    const existingProperty = await Property.findOne({ propertyId });
    if (existingProperty) {
      return res.status(400).json({ success: false, message: 'A property with this ID already exists.' });
    }

    const motherDeedFile = req.files.motherDeed[0];
    const encumbranceCertFile = req.files.encumbranceCertificate[0];
    let documentHashes;

    // 2. --- IPFS UPLOAD ---
    try {
      const uploadFile = async (file, docType) => {
        const formData = new FormData();
        formData.append('file', fs.createReadStream(file.path), {
          filename: file.originalname,
          contentType: file.mimetype,
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

      const motherDeedHash = await uploadFile(motherDeedFile, 'mother_deed');
      const encumbranceCertHash = await uploadFile(encumbranceCertFile, 'encumbrance_certificate');
      documentHashes = [motherDeedHash, encumbranceCertHash];
    } finally {
        // Clean up uploaded files from the server after processing
        fs.unlinkSync(motherDeedFile.path);
        fs.unlinkSync(encumbranceCertFile.path);
    }
    
    // 3. --- PREPARE TRANSACTION DATA ---
    const contractInterface = new ethers.Interface(PropertyTitleABI.abi);
    const encodedFunctionCall = contractInterface.encodeFunctionData('mintTitle', [
      ownerWalletAddress,
      surveyNumber,
      propertyId,
      propertyAddress,
      parseInt(area),
      ownerName,
      description,
      documentHashes
    ]);

    const transactionData = {
      to: process.env.PROPERTYTITLE_ADDRESS,
      data: encodedFunctionCall,
    };

    // 4. --- RETURN DATA TO FRONTEND ---
    res.status(200).json({
      success: true,
      message: 'Transaction data prepared. Please proceed to sign with your wallet.',
      transactionData,
      propertyData: { // Send data back to be used in the finalize step
        ownerWalletAddress, ownerName, surveyNumber, propertyId, propertyAddress, area, description, documentHashes
      }
    });

  } catch (error) {
    console.error('Error preparing property registration:', error);
    // Clean up files in case of an error during processing
    if (req.files) {
        Object.values(req.files).forEach(fileArray => 
            fileArray.forEach(file => {
                if (fs.existsSync(file.path)) fs.unlinkSync(file.path)
            })
        );
    }
    res.status(500).json({ success: false, message: 'Internal server error: ' + error.message });
  }
};

/**
 * @desc    Step 2: Finalize property registration after frontend confirms transaction.
 * @route   POST /api/properties/finalize
 * @access  Private (Verifier)
 */
export const finalizePropertyRegistration = async (req, res) => {
  const { transactionHash, propertyData } = req.body;

  if (!transactionHash || !propertyData) {
    return res.status(400).json({ success: false, message: 'Missing transactionHash or propertyData.' });
  }

  try {
    // Connect to the provider here, ensuring .env is loaded
    const provider = new ethers.JsonRpcProvider(process.env.GANACHE_URL);

    // 1. --- VERIFY TRANSACTION ON BLOCKCHAIN ---
    const receipt = await provider.waitForTransaction(transactionHash);
    if (receipt.status === 0) {
      throw new Error('Blockchain transaction failed. Please check the transaction hash for details.');
    }

    // 2. --- EXTRACT TOKEN ID FROM EVENT LOGS ---
    let tokenId;
    const contractInterface = new ethers.Interface(PropertyTitleABI.abi);
    for (const log of receipt.logs) {
      try {
        const parsedLog = contractInterface.parseLog(log);
        if (parsedLog && parsedLog.name === 'TitleMinted') {
          tokenId = parsedLog.args.tokenId.toString();
          break;
        }
      } catch (e) {
        // This log is not from our contract's ABI, so we can ignore it.
      }
    }

    if (!tokenId) {
      throw new Error('Could not find TitleMinted event in the transaction receipt.');
    }

    // 3. --- SAVE TO DATABASE ---
    const propertyOwner = await User.findOne({ walletAddress: propertyData.ownerWalletAddress });
    if (!propertyOwner) {
      // This is an edge case, as the user should have been verified before this step.
      return res.status(404).json({ success: false, message: 'Property owner could not be found in the database.' });
    }

    const newProperty = new Property({
      tokenId,
      transactionHash,
      surveyNumber: propertyData.surveyNumber,
      propertyId: propertyData.propertyId,
      propertyAddress: propertyData.propertyAddress,
      area: parseInt(propertyData.area),
      ownerWalletAddress: propertyData.ownerWalletAddress,
      ownerName: propertyData.ownerName,
      description: propertyData.description,
      documentHashes: propertyData.documentHashes,
      status: 'pending', // Awaiting final verification after minting
      owner: propertyOwner._id,
      verifier: req.user._id, // The verifier is the currently authenticated user
    });

    await newProperty.save();

    res.status(201).json({
      success: true,
      message: 'Property registration finalized and saved to database successfully!',
      data: { tokenId, propertyId: propertyData.propertyId, transactionHash }
    });

  } catch (error) {
    console.error('Error finalizing property registration:', error);
    res.status(500).json({ success: false, message: 'Internal server error: ' + error.message });
  }
};


// --- OTHER PROPERTY FUNCTIONS ---

export const verifyProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Connect to the provider here, ensuring .env is loaded
    const provider = new ethers.JsonRpcProvider(process.env.GANACHE_URL);

    // This action requires a server-side wallet with authority.
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const contract = new ethers.Contract(process.env.PROPERTYTITLE_ADDRESS, PropertyTitleABI.abi, provider);
    const contractWithSigner = contract.connect(wallet);

    // Update on blockchain
    const tx = await contractWithSigner.setVerified(property.tokenId, true);
    await tx.wait(); // Wait for the transaction to be mined

    // Update in MongoDB
    property.status = 'verified';
    const updatedProperty = await property.save();
    res.json(updatedProperty);
  } catch (error) {
    console.error('Error verifying property:', error);
    res.status(500).json({ message: 'Server error while verifying property.' });
  }
};

export const listPropertyForSale = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }
        if (property.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: 'User not authorized to list this property' });
        }
        if (property.status !== 'verified') {
            return res.status(400).json({ message: 'Only verified properties can be listed for sale.' });
        }

        property.status = 'listed_for_sale';
        const updatedProperty = await property.save();
        res.json(updatedProperty);

    } catch (error) {
        res.status(500).json({ message: 'Server error' });
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

export const confirmSale = async (req, res) => {
    try {
        const { buyerWalletAddress, transactionHash } = req.body;
        if (!buyerWalletAddress || !transactionHash) {
            return res.status(400).json({ message: 'Buyer wallet address and transaction hash are required.' });
        }

        const newOwner = await User.findOne({ walletAddress: buyerWalletAddress });
        if (!newOwner) {
            return res.status(404).json({ message: 'Buyer not found in our database.' });
        }

        const property = await Property.findById(req.params.id);
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        property.status = 'sold';
        property.owner = newOwner._id;
        property.transactionHash = transactionHash;

        const updatedProperty = await property.save();
        res.json({ message: 'Sale confirmed and database updated.', property: updatedProperty });

    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

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

export const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('owner', 'name email');
    if (property) {
      res.json(property);
    } else {
      res.status(404).json({ message: 'Property not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

