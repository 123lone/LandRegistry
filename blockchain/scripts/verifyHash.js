const hre = require("hardhat");

async function main() {
  console.log("--- Starting Hash Verification Script ---");

  // --- 1. SETUP ---
  const [lrd, seller] = await hre.ethers.getSigners();

  console.log("\nDeploying the PropertyTitle contract...");
  const PropertyTitle = await hre.ethers.getContractFactory("PropertyTitle");
  const propertyTitle = await PropertyTitle.connect(lrd).deploy();
  await propertyTitle.waitForDeployment();
  console.log(`Contract deployed to: ${propertyTitle.target}`);

  // --- 2. MINTING WITH OFFICIAL HASH ---
  const officialDocumentText =
    "This is the correct and official document for Property ID 123.";
  const officialHash = hre.ethers.keccak256(
    hre.ethers.toUtf8Bytes(officialDocumentText)
  );
  console.log(
    `\nLRD is minting a property for the Seller with the official hash: ${officialHash}`
  );

  // FIX 2: Capture the transaction receipt to get the real tokenId
  const tx = await propertyTitle
    .connect(lrd)
    .mintTitle(seller.address, officialHash);
  const receipt = await tx.wait();
  const tokenId = receipt.logs[0].args[2]; // Get tokenId from the Transfer event
  console.log(
    `NFT with Token ID ${tokenId} has been minted to Seller: ${seller.address}`
  );
  console.log("==============================================");

  // --- 3. VERIFICATION TEST ---
  console.log("\n--- Simulating Seller Document Upload ---");

  // SCENARIO 1: Seller uploads the CORRECT document text
  console.log("\nScenario 1: Seller uploads the CORRECT document...");
  const correctUploadText =
    "This is the correct and official document for Property ID 123.";
  const correctUploadHash = hre.ethers.keccak256(
    hre.ethers.toUtf8Bytes(correctUploadText)
  );
  console.log(`Hash of uploaded document: ${correctUploadHash}`);

  // FIX 1: Call the public mapping directly with the correct tokenId
  const onChainHash = await propertyTitle.documentHashes(tokenId);
  console.log(`Official hash from blockchain: ${onChainHash}`);

  if (correctUploadHash === onChainHash) {
    console.log("✅ SUCCESS: Hashes match! The document is verified.");
  } else {
    console.log("❌ FAILURE: Hashes do not match.");
  }

  // SCENARIO 2: Seller uploads a DIFFERENT document text
  console.log("\nScenario 2: Seller uploads a DIFFERENT document...");
  const wrongUploadText = "This is a FAKE or incorrect document.";
  const wrongUploadHash = hre.ethers.keccak256(
    hre.ethers.toUtf8Bytes(wrongUploadText)
  );
  console.log(`Hash of uploaded document: ${wrongUploadHash}`);

  if (wrongUploadHash === onChainHash) {
    console.log("✅ SUCCESS: Hashes match! (This should not happen)");
  } else {
    console.log(
      "❌ FAILURE: Hashes do not match. The document is correctly identified as not authentic."
    );
  }

  console.log("\n--- Hash Verification Script Complete ---");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
