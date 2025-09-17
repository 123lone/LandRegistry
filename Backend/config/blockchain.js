const { ethers } = require("ethers");
const PropertyTitleABI = require("./abis/PropertyTitle.json");
const MarketplaceABI = require("./abis/Marketplace.json");

const provider = new ethers.JsonRpcProvider(process.env.GANACHE_URL);

const propertyTitle = new ethers.Contract(
  process.env.PROPERTYTITLE_ADDRESS,
  PropertyTitleABI.abi,
  provider
);

const marketplace = new ethers.Contract(
  process.env.MARKETPLACE_ADDRESS,
  MarketplaceABI.abi,
  provider
);

module.exports = { provider, propertyTitle, marketplace };
