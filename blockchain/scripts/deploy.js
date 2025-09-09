const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with:", deployer.address);

  const PropertyTitle = await hre.ethers.getContractFactory("PropertyTitle");
  const propertyTitle = await PropertyTitle.deploy();
  await propertyTitle.waitForDeployment();
  console.log("PropertyTitle deployed to:", await propertyTitle.getAddress());

  const Marketplace = await hre.ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy(
    await propertyTitle.getAddress()
  );
  await marketplace.waitForDeployment();
  console.log("Marketplace deployed to:", await marketplace.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
