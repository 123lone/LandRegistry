import { ethers } from "ethers";
import PropertyTitleABI from "../contracts/PropertyTitle.json";
import MarketplaceABI from "../contracts/Marketplace.json";

// Load addresses from environment variables (.env file in Frontend)
const PROPERTYTITLE_ADDRESS = import.meta.env.VITE_PROPERTYTITLE_ADDRESS;
const MARKETPLACE_ADDRESS = import.meta.env.VITE_MARKETPLACE_ADDRESS;

// Function to get contract instance
export const getContracts = (signerOrProvider) => {
  const propertyTitle = new ethers.Contract(
    PROPERTYTITLE_ADDRESS,
    PropertyTitleABI.abi,
    signerOrProvider
  );

  const marketplace = new ethers.Contract(
    MARKETPLACE_ADDRESS,
    MarketplaceABI.abi,
    signerOrProvider
  );

  return { propertyTitle, marketplace };
};
