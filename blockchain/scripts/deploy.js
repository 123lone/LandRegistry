const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // 1. Deploy the PropertyTitle contract
  const PropertyTitle = await hre.ethers.getContractFactory("PropertyTitle");
  const propertyTitle = await PropertyTitle.deploy();
  await propertyTitle.deployed();
  console.log("PropertyTitle deployed to:", propertyTitle.address);

  // 2. Deploy the Marketplace contract
  const Marketplace = await hre.ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy(propertyTitle.address);
  await marketplace.deployed();
  console.log("Marketplace deployed to:", marketplace.address);
}

// Run script
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});