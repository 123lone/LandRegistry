import Property from '../models/propertyModel.js';
import User from '../models/userModel.js';
import PinataSDK from '@pinata/sdk';
import Web3 from 'web3';
import { ethers } from 'ethers';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

// --- SETUP ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pinata = new PinataSDK({
    pinataApiKey: process.env.PINATA_API_KEY,
    pinataSecretApiKey: process.env.PINATA_SECRET_API_KEY,
});

let web3;
try {
    const rpcUrl = process.env.RPC_URL || 'http://127.0.0.1:7545';
    console.log('🔗 Connecting to RPC:', rpcUrl);
    web3 = new Web3(rpcUrl);
    
    // Test connection
    web3.eth.getChainId().then(chainId => {
        console.log('✅ Web3 connected to chain:', chainId);
    }).catch(err => {
        console.error('❌ Web3 connection failed:', err.message);
    });
} catch (error) {
    console.error('💥 Failed to initialize Web3:', error);
    throw new Error('Blockchain connection failed');
}

const contractData = JSON.parse(await readFile(join(__dirname, '../abis/PropertyTitle.json'), 'utf8'));
const contractAddress = process.env.PROPERTYTITLE_ADDRESS;

if (!contractAddress) {
    throw new Error("⚠️ PROPERTYTITLE_ADDRESS is not set in .env");
}

const contract = new web3.eth.Contract(contractData.abi, contractAddress);
console.log('✅ Property contract initialized at:', contractAddress);

// --- END SETUP ---

// @desc    Prepare the hash for user signature before minting
// @route   POST /api/properties/prepare-mint
// @access  Private/Verifier
export const prepareMint = async (req, res) => {
    try {
        console.log('🔍 prepareMint called by user:', req.user?.id);
        
        const { ownerWalletAddress, surveyNumber, propertyId, propertyAddress, area, ownerName } = req.body;
        const propertyInput = {
    surveyNumber: surveyNumber.trim(),
    propertyId: propertyId.trim(),
    propertyAddress: propertyAddress.trim(),
    area: Number(area),
    ownerName: ownerName.trim(),
    documentHashes
};


        console.log('📋 Received data:', { ownerWalletAddress, surveyNumber, propertyId, propertyAddress, area, ownerName });

        // Validate required fields
        if (!ownerWalletAddress || !surveyNumber || !propertyId || !propertyAddress || !area || !ownerName) {
            console.log('❌ Missing required fields');
            return res.status(400).json({ 
                success: false,
                message: 'Please provide all required fields.' 
            });
        }

        // Validate wallet address
        if (!web3.utils.isAddress(ownerWalletAddress)) {
            console.log('❌ Invalid wallet address:', ownerWalletAddress);
            return res.status(400).json({ 
                success: false,
                message: 'Invalid wallet address format.' 
            });
        }

        // ✅ FIXED: Create consistent, sorted JSON structure for hashing
        const propertyData = {
            area: parseFloat(area).toString(), // Ensure string for consistent serialization
            ownerName: ownerName.trim(),
            ownerWalletAddress: ownerWalletAddress.trim().toLowerCase(),
            propertyAddress: propertyAddress.trim(),
            propertyId: propertyId.trim(),
            surveyNumber: surveyNumber.trim()
        };

        // Sort keys alphabetically for consistent JSON serialization
        const sortedData = Object.keys(propertyData)
            .sort()
            .reduce((result, key) => {
                result[key] = propertyData[key];
                return result;
            }, {});

        const jsonString = JSON.stringify(sortedData);
        console.log('📝 JSON for hashing:', jsonString);

        // ✅ FIXED: Generate hash using ethers v6 consistently
        const propertyHash = ethers.keccak256(ethers.toUtf8Bytes(jsonString));
        
        console.log('✅ Property hash prepared for signing:', propertyHash);
        console.log('🔗 Hash length:', propertyHash.length);

        res.json({ 
            success: true,
            propertyHash,
            message: 'Property data prepared for signing'
        });

    } catch (error) {
        console.error('💥 Error preparing mint:', {
            message: error.message,
            stack: error.stack,
            userId: req.user?.id
        });
        res.status(500).json({ 
            success: false,
            message: 'Server error while preparing mint: ' + error.message 
        });
    }
};

// @desc    Execute the mint with signature verification
// @route   POST /api/properties/execute-mint
// @access  Private/Verifier
export const executeMint = async (req, res) => {
    try {
        console.log('🔍 executeMint called by verifier:', req.user?.id);

        const {
            ownerWalletAddress,
            ownerName,
            surveyNumber,
            propertyId,
            propertyAddress,
            area,
            userSignature,
            userAddress,
            propertyHash
        } = req.body;

        const motherDeed = req.files?.motherDeed?.[0];
        const encumbranceCertificate = req.files?.encumbranceCertificate?.[0];

        console.log('📋 Execute mint data:', { 
            ownerWalletAddress, 
            propertyId, 
            userAddress,
            hasFiles: !!motherDeed && !!encumbranceCertificate 
        });

        // Validate required fields
        if (!ownerWalletAddress || !ownerName || !surveyNumber || !propertyId || !propertyAddress || !area) {
            return res.status(400).json({ 
                success: false,
                message: 'Please provide all required property fields.' 
            });
        }

        if (!motherDeed || !encumbranceCertificate) {
            return res.status(400).json({ 
                success: false,
                message: 'Please upload both required documents.' 
            });
        }

        // Validate signature fields
        if (!userSignature || !userAddress || !propertyHash) {
            return res.status(400).json({ 
                success: false,
                message: 'User signature verification data is required.' 
            });
        }

        // Validate file types and sizes
        const maxFileSize = 10 * 1024 * 1024; // 10MB
        if (motherDeed.mimetype !== 'application/pdf' || motherDeed.size > maxFileSize) {
            return res.status(400).json({ 
                success: false,
                message: 'Mother Deed must be a PDF file less than 10MB.' 
            });
        }
        
        if (encumbranceCertificate.mimetype !== 'application/pdf' || encumbranceCertificate.size > maxFileSize) {
            return res.status(400).json({ 
                success: false,
                message: 'Encumbrance Certificate must be a PDF file less than 10MB.' 
            });
        }

        // Validate wallet addresses
        if (!web3.utils.isAddress(ownerWalletAddress)) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid owner wallet address format.' 
            });
        }

        if (!web3.utils.isAddress(userAddress)) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid user wallet address format.' 
            });
        }

        // ✅ STEP 1: Basic address validation
        console.log('🔍 === BASIC VALIDATION ===');
        console.log('📝 Expected owner address:', ownerWalletAddress.toLowerCase());
        console.log('📝 User address from signature:', userAddress.toLowerCase());
        
        if (userAddress.toLowerCase() !== ownerWalletAddress.toLowerCase()) {
            console.log('❌ BASIC ADDRESS MISMATCH');
            return res.status(400).json({ 
                success: false,
                message: `Address mismatch. Expected: ${ownerWalletAddress}, Got: ${userAddress}` 
            });
        }
        console.log('✅ Basic address validation passed');

        // ✅ STEP 2: Signature verification using ethers v6
        try {
            console.log('🔍 === SIGNATURE VERIFICATION ===');
            console.log('📝 Verifying signature for hash:', propertyHash.substring(0, 20) + '...');
            console.log('📝 Signature:', userSignature.substring(0, 20) + '...');

            // ✅ FIXED: Use ethers v6 verifyMessage with getBytes
            const recoveredAddress = ethers.verifyMessage(ethers.getBytes(propertyHash), userSignature);
            
            console.log('✅ Recovered address:', recoveredAddress.toLowerCase());
            console.log('📊 Verification result:');
            console.log(`- Expected: ${ownerWalletAddress.toLowerCase()}`);
            console.log(`- Recovered: ${recoveredAddress.toLowerCase()}`);
            console.log(`- Match: ${recoveredAddress.toLowerCase() === ownerWalletAddress.toLowerCase()}`);

            if (recoveredAddress.toLowerCase() !== ownerWalletAddress.toLowerCase()) {
                console.log('❌ SIGNATURE VERIFICATION FAILED');
                return res.status(400).json({ 
                    success: false,
                    message: `Signature verification failed. Recovered: ${recoveredAddress}, Expected: ${ownerWalletAddress}` 
                });
            }

            console.log('✅ SIGNATURE VERIFICATION PASSED!');
        } catch (signatureError) {
            console.error('💥 Signature verification error:', {
                message: signatureError.message,
                code: signatureError.code,
                propertyHash: propertyHash?.substring(0, 20),
                signature: userSignature?.substring(0, 20)
            });
            
            return res.status(400).json({ 
                success: false,
                message: `Signature verification failed: ${signatureError.message}` 
            });
        }

        // ✅ STEP 3: Data integrity check - recreate hash
        console.log('🔍 === DATA INTEGRITY CHECK ===');
        const currentPropertyData = {
            area: parseFloat(area).toString(),
            ownerName: ownerName.trim(),
            ownerWalletAddress: ownerWalletAddress.trim().toLowerCase(),
            propertyAddress: propertyAddress.trim(),
            propertyId: propertyId.trim(),
            surveyNumber: surveyNumber.trim()
        };

        // Sort keys for consistent serialization
        const sortedCurrentData = Object.keys(currentPropertyData)
            .sort()
            .reduce((result, key) => {
                result[key] = currentPropertyData[key];
                return result;
            }, {});

        const currentJsonString = JSON.stringify(sortedCurrentData);
        const currentHash = ethers.keccak256(ethers.toUtf8Bytes(currentJsonString));
        
        console.log('📊 Hash verification:');
        console.log(`- Current hash: ${currentHash.substring(0, 20)}...`);
        console.log(`- Provided hash: ${propertyHash.substring(0, 20)}...`);
        console.log(`- Match: ${currentHash === propertyHash}`);

        if (currentHash !== propertyHash) {
            console.log('❌ DATA INTEGRITY CHECK FAILED');
            console.log('Current JSON:', currentJsonString);
            console.log('Original JSON length:', jsonString?.length || 'N/A');
            return res.status(400).json({ 
                success: false,
                message: 'Property data has been modified after signing. Please try again.' 
            });
        }

        console.log('✅ DATA INTEGRITY CHECK PASSED');
        console.log('🔓 === ALL VALIDATIONS PASSED ===');

        // ✅ STEP 4: Upload files to IPFS
        console.log('📁 === UPLOADING DOCUMENTS TO IPFS ===');
        
        const uploadFileToPinata = async (file) => {
            try {
                const uploadsDir = path.join(__dirname, '../Uploads');
                
                // Ensure uploads directory exists
                if (!fs.existsSync(uploadsDir)) {
                    fs.mkdirSync(uploadsDir, { recursive: true });
                }
                
                const filePath = path.join(uploadsDir, file.filename);
                const fileStream = fs.createReadStream(filePath);
                
                console.log(`📤 Uploading ${file.originalname}...`);
                
                const result = await pinata.pinFileToIPFS(fileStream, {
                    pinataMetadata: { 
                        name: file.originalname,
                        keyvalues: { type: file.fieldname }
                    },
                });

                // Clean up the temporary file
                fs.unlinkSync(filePath);

                if (!result || !result.IpfsHash) {
                    throw new Error(`Failed to upload ${file.originalname} to Pinata`);
                }

                console.log(`✅ Uploaded ${file.originalname} → ${result.IpfsHash}`);
                return result.IpfsHash;
            } catch (uploadError) {
                console.error('💥 IPFS upload error:', uploadError);
                throw new Error(`Failed to upload ${file.originalname}: ${uploadError.message}`);
            }
        };

        const documentHashes = [
            await uploadFileToPinata(motherDeed),
            await uploadFileToPinata(encumbranceCertificate),
        ];

        console.log('📄 Document hashes:', documentHashes);

        // ✅ STEP 5: Execute blockchain minting
        console.log('⛓️ === EXECUTING BLOCKCHAIN MINT ===');
        
        const ownerPrivateKey = process.env.PRIVATE_KEY;
        if (!ownerPrivateKey) {
            throw new Error("⚠️ PRIVATE_KEY is not set in .env for the server's wallet.");
        }

        const ownerAccount = web3.eth.accounts.privateKeyToAccount(ownerPrivateKey);
        web3.eth.accounts.wallet.add(ownerAccount);

        console.log("🎯 Minting NFT to address:", ownerWalletAddress);
        console.log("📏 Area value:", Number(area));

        // Execute the mint transaction with retry logic
        let tx;
        const maxRetries = 3;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                tx = await contract.methods.mintTitle(
                    ownerWalletAddress,
                    surveyNumber,
                    propertyId,
                    propertyAddress,
                    Number(area),
                    ownerName,
                    documentHashes
                ).send({ 
                    from: ownerAccount.address, 
                    gas: 3000000,
                    gasPrice: web3.utils.toWei('20', 'gwei')
                });
                break; // Success, exit retry loop
            } catch (txError) {
                console.log(`⚠️ Mint attempt ${attempt} failed:`, txError.message);
                if (attempt === maxRetries) throw txError;
                await new Promise(resolve => setTimeout(resolve, 2000 * attempt)); // Exponential backoff
            }
        }

        const tokenId = tx.events.TitleMinted.returnValues.tokenId.toString();
        console.log(`✅ NFT minted successfully! Token ID: ${tokenId}`);
        console.log(`🔗 Transaction hash: ${tx.transactionHash}`);

        // ✅ STEP 6: Save to database
        console.log('💾 === SAVING TO DATABASE ===');
        
        const propertyData = {
            tokenId,
            surveyNumber,
            propertyId,
            propertyAddress,
            area: Number(area),
            ownerWalletAddress,
            ownerName,
            documentHashes,
            status: 'pending',
            verifier: req.user.id,
            owner: null,
            transactionHash: tx.transactionHash,
            userSignature,
            signatureTimestamp: new Date()
        };

        // Find the owner in database
        const user = await User.findOne({ walletAddress: ownerWalletAddress });
        if (user) {
            propertyData.owner = user._id;
            console.log('👤 Owner found in database:', user.name);
        } else {
            console.log('⚠️ Owner not found in database, will be null');
        }

        const property = new Property(propertyData);
        const createdProperty = await property.save();
        
        console.log('✅ Property saved to database:', createdProperty._id);

        res.status(201).json({ 
            success: true,
            message: `Property registered successfully! NFT Token ID: ${tokenId}`, 
            property: {
                id: createdProperty._id,
                tokenId,
                propertyId,
                surveyNumber,
                propertyAddress,
                area: createdProperty.area,
                ownerName,
                status: createdProperty.status,
                transactionHash: tx.transactionHash,
                createdAt: createdProperty.createdAt
            },
            tokenId,
            transactionHash: tx.transactionHash
        });

    } catch (error) {
        console.error('💥 Error executing mint:', {
            message: error.message,
            stack: error.stack,
            userId: req.user?.id,
            timestamp: new Date().toISOString()
        });
        
        // Handle specific blockchain errors
        if (error.message.includes("revert")) {
            const reason = error.message.split("revert ")[1]?.replace(/'/g, '') || 'Unknown reason';
            return res.status(400).json({ 
                success: false,
                message: `Blockchain transaction failed: ${reason}` 
            });
        }
        
        if (error.message.includes("gas")) {
            return res.status(400).json({ 
                success: false,
                message: 'Transaction failed: Insufficient gas. Please try again.' 
            });
        }
        
        if (error.message.includes("nonce")) {
            return res.status(400).json({ 
                success: false,
                message: 'Transaction failed: Invalid nonce. Please refresh and try again.' 
            });
        }
        
        // Generic server error
        res.status(500).json({ 
            success: false,
            message: 'Failed to process property registration. Please try again.' 
        });
    }
};

// @desc    Verify a property
// @route   POST /api/properties/:id/verify
// @access  Private/Verifier
export const verifyProperty = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        if (property.status === 'verified') {
            return res.status(400).json({ message: 'Property already verified' });
        }

        const ownerPrivateKey = process.env.PRIVATE_KEY;
        if (!ownerPrivateKey) {
            throw new Error("PRIVATE_KEY not set in .env");
        }
        
        const ownerAccount = web3.eth.accounts.privateKeyToAccount(ownerPrivateKey);

        console.log('🔍 Verifying property:', property.tokenId);
        
        const tx = await contract.methods.setVerified(
            property.tokenId, 
            true
        ).send({ 
            from: ownerAccount.address, 
            gas: 1000000 
        });

        property.status = 'verified';
        property.verifiedAt = new Date();
        property.transactionHash = tx.transactionHash;
        const updatedProperty = await property.save();

        console.log('✅ Property verified:', property._id);
        
        res.json({ 
            success: true,
            message: 'Property verified successfully',
            property: updatedProperty 
        });

    } catch (error) {
        console.error('Error verifying property:', error);
        res.status(500).json({ message: 'Server error while verifying property.' });
    }
};

// @desc    List a property for sale
// @route   POST /api/properties/:id/list
// @access  Private
export const listPropertyForSale = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id).populate('owner', 'name email');

        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }
        
        if (property.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: 'User not authorized to list this property' });
        }
        
        if (property.status !== 'verified') {
            return res.status(400).json({ message: 'Only verified properties can be listed for sale.' });
        }

        if (property.status === 'listed_for_sale') {
            return res.status(400).json({ message: 'Property is already listed for sale.' });
        }

        property.status = 'listed_for_sale';
        property.listedAt = new Date();
        const updatedProperty = await property.save();

        res.json({ 
            success: true,
            message: 'Property listed for sale successfully',
            property: updatedProperty 
        });

    } catch (error) {
        console.error('Error listing property for sale:', error);
        res.status(500).json({ message: 'Server error while listing property.' });
    }
};

// @desc    Get all properties listed for sale
// @route   GET /api/properties/marketplace
// @access  Public
export const getMarketplaceProperties = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        const query = { status: 'listed_for_sale' };
        if (search) {
            query.$or = [
                { propertyId: { $regex: search, $options: 'i' } },
                { propertyAddress: { $regex: search, $options: 'i' } },
                { surveyNumber: { $regex: search, $options: 'i' } }
            ];
        }

        const properties = await Property.find(query)
            .populate('owner', 'name email walletAddress')
            .sort({ listedAt: -1 })
            .limit(limitNum)
            .skip((pageNum - 1) * limitNum)
            .select('-documentHashes -userSignature');

        const total = await Property.countDocuments(query);

        res.json({
            success: true,
            properties,
            pagination: {
                current: pageNum,
                pages: Math.ceil(total / limitNum),
                total
            }
        });

    } catch (error) {
        console.error('Error fetching marketplace properties:', error);
        res.status(500).json({ message: 'Server error while fetching marketplace properties.' });
    }
};

// @desc    Confirm sale of a property
// @route   POST /api/properties/:id/confirm-sale
// @access  Private/Verifier
export const confirmSale = async (req, res) => {
    try {
        const { buyerWalletAddress, transactionHash, salePrice } = req.body;
        
        if (!buyerWalletAddress || !transactionHash) {
            return res.status(400).json({ 
                message: 'Buyer wallet address and transaction hash are required.' 
            });
        }

        const newOwner = await User.findOne({ walletAddress: buyerWalletAddress });
        if (!newOwner) {
            return res.status(404).json({ 
                message: 'Buyer not found in our database. Please register first.' 
            });
        }

        const property = await Property.findById(req.params.id).populate('owner', 'name email');
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        if (property.status !== 'listed_for_sale') {
            return res.status(400).json({ 
                message: 'Property is not listed for sale.' 
            });
        }

        // Update property ownership
        property.status = 'sold';
        property.owner = newOwner._id;
        property.ownerWalletAddress = newOwner.walletAddress;
        property.ownerName = newOwner.name;
        property.soldAt = new Date();
        property.saleTransactionHash = transactionHash;
        property.salePrice = salePrice ? parseFloat(salePrice) : 0;
        property.listedAt = null; // Remove from marketplace

        const updatedProperty = await property.save();

        console.log('✅ Property sale confirmed:', property._id);

        res.json({ 
            success: true,
            message: 'Sale confirmed and database updated successfully.',
            property: updatedProperty 
        });

    } catch (error) {
        console.error('Error confirming sale:', error);
        res.status(500).json({ message: 'Server error while confirming sale.' });
    }
};

// @desc    Get properties owned by the authenticated user
// @route   GET /api/properties/my-properties
// @access  Private
export const getMyProperties = async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        const query = { owner: req.user.id };
        if (status) {
            query.status = status;
        }

        const properties = await Property.find(query)
            .populate('owner', 'name email')
            .sort({ createdAt: -1 })
            .limit(limitNum)
            .skip((pageNum - 1) * limitNum)
            .select('-documentHashes -userSignature');

        const total = await Property.countDocuments(query);

        res.json({
            success: true,
            properties,
            pagination: {
                current: pageNum,
                pages: Math.ceil(total / limitNum),
                total
            }
        });

    } catch (error) {
        console.error('Error fetching my properties:', error);
        res.status(500).json({ message: 'Server error while fetching your properties.' });
    }
};

// @desc    Get a property by ID
// @route   GET /api/properties/:id
// @access  Public
export const getPropertyById = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id)
            .populate('owner', 'name email walletAddress')
            .populate('verifier', 'name email');

        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        // Remove sensitive data for public access
        const safeProperty = {
            ...property.toObject(),
            documentHashes: property.status === 'verified' ? property.documentHashes : undefined,
            userSignature: undefined
        };

        res.json({
            success: true,
            property: safeProperty
        });

    } catch (error) {
        console.error('Error fetching property:', error);
        res.status(500).json({ message: 'Server error while fetching property.' });
    }
};

// @desc    Get all properties (Admin/Verifier only)
// @route   GET /api/properties
// @access  Private/Admin
export const getAllProperties = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, verifier } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        const query = {};
        if (status) query.status = status;
        if (verifier) query.verifier = verifier;

        const properties = await Property.find(query)
            .populate('owner', 'name email walletAddress')
            .populate('verifier', 'name email')
            .sort({ createdAt: -1 })
            .limit(limitNum)
            .skip((pageNum - 1) * limitNum);

        const total = await Property.countDocuments(query);

        res.json({
            success: true,
            properties,
            pagination: {
                current: pageNum,
                pages: Math.ceil(total / limitNum),
                total
            }
        });

    } catch (error) {
        console.error('Error fetching all properties:', error);
        res.status(500).json({ message: 'Server error while fetching properties.' });
    }
};