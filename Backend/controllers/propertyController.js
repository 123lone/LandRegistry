const Property = require("../models/propertyModel");
const User = require("../models/userModel");
const { ethers } = require("ethers");
const stream = require("stream");
const pinataSDK = require("@pinata/sdk");

// --- Setup ---
const PropertyTitleABI = require("../config/abis/PropertyTitle.json");
const MarketplaceABI = require("../config/abis/Marketplace.json");
const provider = new ethers.JsonRpcProvider(process.env.GANACHE_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const propertyTitle = new ethers.Contract(
  process.env.PROPERTYTITLE_ADDRESS,
  PropertyTitleABI.abi,
  signer
);
const marketplace = new ethers.Contract(
  process.env.MARKETPLACE_ADDRESS,
  MarketplaceABI.abi,
  signer
);
const pinata = new pinataSDK(
  process.env.PINATA_API_KEY,
  process.env.PINATA_SECRET_API_KEY
);

/**
 * @desc    Upload document to Pinata, Create & Mint a property NFT
 * @route   POST /api/properties
 */
exports.createProperty = async (req, res) => {
  const { title, description, location, price } = req.body;
  const file = req.file;

  if (!title || !description || !location || !price || !file) {
    return res.status(400).json({
      message: "Please provide all required fields and the property document.",
    });
  }

  try {
    const readableStreamForFile = stream.Readable.from(file.buffer);
    const options = { pinataMetadata: { name: file.originalname } };
    const pinataResponse = await pinata.pinFileToIPFS(
      readableStreamForFile,
      options
    );

    const ipfsHash = pinataResponse.IpfsHash;
    if (!ipfsHash) {
      throw new Error("Failed to get IPFS hash from Pinata response.");
    }

    const tx = await propertyTitle.mintTitle(req.user.walletAddress, ipfsHash);
    const receipt = await tx.wait();

    // Robustly parse the event logs to find the tokenId
    let tokenId;
    const propertyTitleInterface = new ethers.Interface(PropertyTitleABI.abi);
    const mintEvent = receipt.logs
      .map((log) => {
        try {
          // Attempt to parse the log with our contract's interface
          const parsedLog = propertyTitleInterface.parseLog({
            topics: Array.from(log.topics),
            data: log.data,
          });
          return parsedLog;
        } catch (e) {
          return null; // Ignore logs that don't match our contract's events
        }
      })
      .find((log) => log && log.name === "TitleMinted");

    if (mintEvent) {
      tokenId = mintEvent.args.tokenId.toString();
    } else {
      throw new Error(
        "Could not find the TitleMinted event in the transaction receipt."
      );
    }

    const property = new Property({
      title,
      description,
      location,
      price,
      documentHashes: [ipfsHash],
      tokenId,
      owner: req.user.id,
      status: "pending_verification",
    });

    const createdProperty = await property.save();
    res.status(201).json(createdProperty);
  } catch (error) {
    console.error("Error in createProperty:", error);
    res.status(500).json({ message: "Error processing property." });
  }
};

/**
 * @desc    Verify a document against the official record on the blockchain
 * @route   POST /api/properties/verify-document/:id
 */
exports.verifyDocument = async (req, res) => {
  const propertyId = req.params.id;
  const fileToVerify = req.file;

  if (!fileToVerify || !req.user || !req.user.walletAddress) {
    return res
      .status(400)
      .json({ message: "Missing required information for verification." });
  }
  const userWalletAddress = req.user.walletAddress;

  try {
    const officialProperty = await Property.findById(propertyId);
    if (!officialProperty || !officialProperty.tokenId) {
      return res.status(404).json({
        message: "Property record not found or is missing a tokenId.",
      });
    }

    const officialIpfsHash = officialProperty.documentHashes[0];

    const readableStreamForFile = stream.Readable.from(fileToVerify.buffer);
    const options = {
      pinataMetadata: { name: `Verification for ${fileToVerify.originalname}` },
    };
    const verificationResponse = await pinata.pinFileToIPFS(
      readableStreamForFile,
      options
    );
    const userUploadedHash = verificationResponse.IpfsHash;

    const trueOwnerAddress = await propertyTitle.ownerOf(
      officialProperty.tokenId
    );

    const isHashAuthentic = userUploadedHash === officialIpfsHash;
    const isUserTheOwner =
      userWalletAddress.toLowerCase() === trueOwnerAddress.toLowerCase();

    if (isHashAuthentic && isUserTheOwner) {
      res.status(200).json({
        verified: true,
        message:
          "VERIFIED: The document is authentic and you are the legal owner.",
      });
    } else {
      res.status(400).json({
        verified: false,
        message:
          "NOT VERIFIED: The document is not authentic or you are not the legal owner.",
      });
    }
  } catch (error) {
    console.error("Error during document verification:", error);
    res
      .status(500)
      .json({ message: "An error occurred during the verification process." });
  }
};

// --- All your other functions remain the same ---

exports.verifyProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property)
      return res.status(404).json({ message: "Property not found" });
    const tx = await propertyTitle.setVerified(property.tokenId, true);
    await tx.wait();
    property.status = "verified";
    await property.save();
    res.json({ message: "Property verified successfully", property });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error verifying property" });
  }
};

exports.listPropertyForSale = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property)
      return res.status(404).json({ message: "Property not found" });
    if (property.owner.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to list this property" });
    }
    if (property.status !== "verified") {
      return res
        .status(400)
        .json({ message: "Only verified properties can be listed" });
    }
    const approveTx = await propertyTitle
      .connect(signer)
      .approve(process.env.MARKETPLACE_ADDRESS, property.tokenId);
    await approveTx.wait();
    const listTx = await marketplace.listProperty(
      property.tokenId,
      ethers.parseEther(property.price.toString())
    );
    await listTx.wait();
    property.status = "listed_for_sale";
    await property.save();
    res.json({ message: "Property listed successfully", property });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error listing property" });
  }
};

exports.getMarketplaceProperties = async (req, res) => {
  try {
    const properties = await Property.find({
      status: "listed_for_sale",
    }).populate("owner", "name email");
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.confirmSale = async (req, res) => {
  try {
    const { buyerWalletAddress, transactionHash } = req.body;
    if (!buyerWalletAddress || !transactionHash) {
      return res
        .status(400)
        .json({ message: "Buyer wallet & tx hash required" });
    }
    const newOwner = await User.findOne({ walletAddress: buyerWalletAddress });
    if (!newOwner)
      return res.status(404).json({ message: "Buyer not found in DB" });
    const property = await Property.findById(req.params.id);
    if (!property)
      return res.status(404).json({ message: "Property not found" });
    property.status = "sold";
    property.owner = newOwner._id;
    property.transactionHash = transactionHash;
    const updatedProperty = await property.save();
    res.json({ message: "Sale confirmed", property: updatedProperty });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error confirming sale" });
  }
};
