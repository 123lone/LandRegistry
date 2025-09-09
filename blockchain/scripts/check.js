const hre = require("hardhat");

async function main() {
  // --- ROLE SELECTION ---
  const accounts = await hre.ethers.getSigners();
  const lrd = accounts[0];
  const seller = accounts[4];
  const buyer = accounts[7];

  console.log("--- Roles Assigned ---");
  console.log("LRD Address:    ", lrd.address);
  console.log("Seller Address: ", seller.address);
  console.log("Buyer Address:  ", buyer.address);
  console.log("----------------------------------");

  // --- 1. DEPLOYMENT ---
  const PropertyTitle = await hre.ethers.getContractFactory("PropertyTitle");
  const propertyTitle = await PropertyTitle.connect(lrd).deploy();
  await propertyTitle.waitForDeployment();
  console.log(
    `PropertyTitle NFT contract deployed to: ${propertyTitle.target}`
  );

  const Marketplace = await hre.ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.connect(lrd).deploy(
    propertyTitle.target
  );
  await marketplace.waitForDeployment();
  console.log(`Marketplace contract deployed to: ${marketplace.target}`);
  console.log("----------------------------------");

  // --- 2. HASH CALCULATION & MINTING ---
  const officialDocument = "This is the content of the official land document.";
  // FIX 1: Use ethers.js for hashing
  const documentHash = hre.ethers.keccak256(
    hre.ethers.toUtf8Bytes(officialDocument)
  );
  console.log(`Calculated Document Hash: ${documentHash}`);

  let tx = await propertyTitle
    .connect(lrd)
    .mintTitle(seller.address, documentHash);
  // FIX 2: Get the actual tokenId from the transaction receipt
  let receipt = await tx.wait();
  const tokenId = receipt.logs[0].args[2];
  console.log(
    `NFT with Token ID ${tokenId} has been minted to Seller: ${seller.address}`
  );
  console.log("----------------------------------");

  // --- 3. SELLER'S DOCUMENT VERIFICATION ---
  console.log("Seller is attempting to list the property...");
  const sellerUploadedDocument =
    "This is the content of the official land document.";
  const sellerCalculatedHash = hre.ethers.keccak256(
    hre.ethers.toUtf8Bytes(sellerUploadedDocument)
  );
  console.log(`Seller's uploaded document hash: ${sellerCalculatedHash}`);

  // FIX 3: Access the public mapping correctly with the dynamic tokenId
  const onChainHash = await propertyTitle.documentHashes(tokenId);
  console.log(`Official hash from blockchain:   ${onChainHash}`);

  if (sellerCalculatedHash === onChainHash) {
    console.log("✅ Hash verification successful! Seller can proceed.");
  } else {
    console.log("❌ HASH MISMATCH! Seller cannot list this property.");
    return;
  }
  console.log("----------------------------------");

  // --- 4. LISTING ---
  const listingPrice = hre.ethers.parseEther("0.1");
  // FIX 2: Use the correct tokenId
  tx = await propertyTitle.connect(seller).approve(marketplace.target, tokenId);
  await tx.wait();
  console.log("Marketplace has been approved by the Seller.");

  // FIX 2: Use the correct tokenId
  tx = await marketplace.connect(seller).listProperty(tokenId, listingPrice);
  await tx.wait();
  console.log(`Property with Token ID ${tokenId} has been listed for 0.1 ETH.`);
  console.log("----------------------------------");

  // --- 5. BUYING ---
  console.log("Buyer is purchasing the property...");
  const sellerBalanceBefore = await hre.ethers.provider.getBalance(
    seller.address
  );

  // FIX 2: Use the correct tokenId
  tx = await marketplace
    .connect(buyer)
    .buyProperty(tokenId, { value: listingPrice });
  await tx.wait();

  // --- 6. FINAL VERIFICATION ---
  // FIX 2: Use the correct tokenId
  const newOwner = await propertyTitle.ownerOf(tokenId);
  const sellerBalanceAfter = await hre.ethers.provider.getBalance(
    seller.address
  );

  console.log(`\n--- VERIFICATION COMPLETE ---`);
  console.log(`New owner of Token ID ${tokenId} is: ${newOwner}`);
  console.log(`Buyer's address is:         ${buyer.address}`);
  console.log(
    `Seller's balance before: ${hre.ethers.formatEther(
      sellerBalanceBefore
    )} ETH`
  );
  console.log(
    `Seller's balance after:  ${hre.ethers.formatEther(sellerBalanceAfter)} ETH`
  );
  console.log("✅ Transaction was successful!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
