import Property from '../models/propertyModel.js';
import User from '../models/userModel.js';
import PinataSDK from '@pinata/sdk';
import Web3 from 'web3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from "dotenv";
dotenv.config();

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Pinata
const pinata = new PinataSDK({
  pinataApiKey: process.env.PINATA_API_KEY,
  pinataSecretApiKey: process.env.PINATA_SECRET_API_KEY,
});

// Initialize Web3
const web3 = new Web3('http://127.0.0.1:7545'); // Ganache endpoint
const contractData = JSON.parse(fs.readFileSync(path.join(__dirname, '../abis/PropertyTitle.json')));
const contractAddress = process.env.PROPERTYTITLE_ADDRESS;

if (!contractAddress) {
  throw new Error("⚠️ PROPERTYTITLE_ADDRESS is not set in .env");
}

const contract = new web3.eth.Contract(contractData.abi, contractAddress);

// @desc    Create a new property listing
// @route   POST /api/properties
// @access  Private/Verifier
export const createProperty = async (req, res) => {
  try {
    const {
      ownerWalletAddress,
      ownerName,
      surveyNumber,
      propertyId,
      propertyAddress,
      area,
      description,
    } = req.body;

    const motherDeed = req.files?.motherDeed?.[0];
    const encumbranceCertificate = req.files?.encumbranceCertificate?.[0];

    // Validate required fields
    if (
      !ownerWalletAddress ||
      !ownerName ||
      !surveyNumber ||
      !propertyId ||
      !propertyAddress ||
      !area ||
      !motherDeed ||
      !encumbranceCertificate
    ) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    // Validate file types
    if (motherDeed.mimetype !== 'application/pdf' || encumbranceCertificate.mimetype !== 'application/pdf') {
      return res.status(400).json({ message: 'Only PDF files are allowed.' });
    }

    // Validate wallet address
    if (!web3.utils.isAddress(ownerWalletAddress)) {
      return res.status(400).json({ message: 'Invalid wallet address format.' });
    }

    // Upload files to Pinata
    const uploadFileToPinata = async (file) => {
      const filePath = path.join(__dirname, '../uploads', file.filename);
      const fileStream = fs.createReadStream(filePath);
      const result = await pinata.pinFileToIPFS(fileStream, {
        pinataMetadata: { name: file.originalname },
      });
      fs.unlinkSync(filePath); // Delete file after upload
      return result.IpfsHash;
    };

    const documentHashes = [
      await uploadFileToPinata(motherDeed),
      await uploadFileToPinata(encumbranceCertificate),
    ];

    // Mint NFT on blockchain

    // Load deployer account from .env
    const ownerPrivateKey = process.env.PRIVATE_KEY;
const ownerAccount = web3.eth.accounts.privateKeyToAccount(ownerPrivateKey);
web3.eth.accounts.wallet.add(ownerAccount);
console.log('Owner:', ownerWalletAddress);
console.log('Survey:', surveyNumber);
console.log('PropertyID:', propertyId);
console.log('Area:', area);
console.log('Docs:', documentHashes);

// Call mintTitle using the deployer account
const tx = await contract.methods
  .mintTitle(
    ownerWalletAddress,
    surveyNumber,
    propertyId,
    propertyAddress,
    Number(area),
    ownerName,
    description || '',
    documentHashes
  )
  .send({ from: ownerAccount.address, gas: 3000000 });

console.log("TX Hash:", tx.transactionHash);
console.log("Gas Used:", tx.gasUsed);




    const tokenId = tx.events.TitleMinted.returnValues.tokenId;

    // Save to MongoDB
    const propertyData = {
      tokenId,
      surveyNumber,
      propertyId,
      propertyAddress,
      area: Number(area),
      ownerWalletAddress,
      ownerName,
      description: description || '',
      documentHashes,
      status: 'pending',
      owner: req.user.id, // Verifier assigns owner (could be updated later)
      verifier: req.user.id,
    };

    const property = new Property(propertyData);
    const createdProperty = await property.save();

    res.status(201).json({ message: 'Property registered successfully', property: createdProperty });
  } catch (error) {
    console.error('Error creating property:', error);
    res.status(500).json({ message: 'Server error while creating property.' });
  }
};

export const verifyProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Update on blockchain
    const accounts = await web3.eth.getAccounts();
    await contract.methods.setVerified(property.tokenId, true).send({ from: accounts[0], gas: 1000000 });

    // Update in MongoDB
    property.status = 'verified';
    const updatedProperty = await property.save();
    res.json(updatedProperty);
  } catch (error) {
    console.error('Error verifying property:', error);
    res.status(500).json({ message: 'Server error while verifying property.' });
  }
};


// @desc    List a verified property for sale
// @route   PUT /api/properties/list/:id
// @access  Private/Seller
export const listPropertyForSale = async (req, res) => {
    try {
        console.log('--- Listing Property for Sale ---');
        console.log('1. Finding property with ID:', req.params.id);
        const property = await Property.findById(req.params.id);

        if (!property) {
            console.log('Error: Property not found.');
            return res.status(404).json({ message: 'Property not found' });
        }
        console.log('2. Property found:', property.title);

        console.log('3. Checking ownership...');
        if (property.owner.toString() !== req.user.id) {
            console.log('Error: Ownership check failed.');
            return res.status(403).json({ message: 'User not authorized to list this property' });
        }
        console.log('4. Ownership confirmed.');

        console.log('5. Checking property status...');
        if (property.status !== 'verified') {
            console.log('Error: Property is not in verified state.');
            return res.status(400).json({ message: 'Only verified properties can be listed for sale.' });
        }
        console.log('6. Status is verified. Updating to listed_for_sale...');

        property.status = 'listed_for_sale';
        const updatedProperty = await property.save();
        
        console.log('7. Property saved successfully.');
        res.json(updatedProperty);

    } catch (error) {
        console.error('!!! UNEXPECTED CRASH:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all properties listed for sale
// @route   GET /api/properties/marketplace
// @access  Private
export const getMarketplaceProperties = async (req, res) => {
    try {
        const properties = await Property.find({ status: 'listed_for_sale' })
            .populate('owner', 'name email'); // Fetches owner's name and email

        res.json(properties);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Confirm a sale and update the database
// @route   POST /api/properties/:id/confirm-sale
// @access  Private
export const confirmSale = async (req, res) => {
    try {
        console.log('--- Confirming Sale ---');
        const { buyerWalletAddress, transactionHash } = req.body;
        console.log('1. Received buyer wallet:', buyerWalletAddress);

        if (!buyerWalletAddress || !transactionHash) {
            console.log('Error: Missing required fields.');
            return res.status(400).json({ message: 'Buyer wallet address and transaction hash are required.' });
        }

        console.log('2. Finding new owner in database...');
        const newOwner = await User.findOne({ walletAddress: buyerWalletAddress });
        
        if (!newOwner) {
            console.log('Error: Buyer user not found with that wallet address.');
            return res.status(404).json({ message: 'Buyer not found in our database.' });
        }
        console.log('3. Found new owner:', newOwner.email);

        console.log('4. Finding property with ID:', req.params.id);
        const property = await Property.findById(req.params.id);

        if (!property) {
            console.log('Error: Property not found.');
            return res.status(404).json({ message: 'Property not found' });
        }
        console.log('5. Found property:', property.title);

        property.status = 'sold';
        property.owner = newOwner._id;
        property.transactionHash = transactionHash;
        console.log('6. Updating property details...');

        const updatedProperty = await property.save();
        
        console.log('7. Property saved successfully.');
        res.json({ message: 'Sale confirmed and database updated.', property: updatedProperty });

    } catch (error) {
        console.error('!!! UNEXPECTED CRASH:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
// @desc    Get all properties for the logged-in user
// @route   GET /api/properties/my-properties
// @access  Private
export const getMyProperties = async (req, res) => {
  try {
    const properties = await Property.find({ owner: req.user.id })
      .select('-documentHashes')
      .populate('owner', 'name email');
    res.json(properties);
  } catch (error) {
    console.error('Error fetching my properties:', error);
    res.status(500).json({ message: 'Server error while fetching your properties.' });
  }
};

// @desc    Get a single property by ID
// @route   GET /api/properties/:id
// @access  Public (or Private if you want only logged-in users to view)
export const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('owner', 'name email');

    if (property) {
      res.json(property);
    } else {
      res.status(404).json({ message: 'Property not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};