const fs = require("fs");
const crypto = require("crypto");

/**
 * This function reads a file from a given path and calculates its SHA256 hash.
 * @param {string} filePath - The path to the file.
 * @returns {string} The calculated hash as a hex string.
 */
function getFileHash(filePath) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash("sha256");
    hashSum.update(fileBuffer);
    return "0x" + hashSum.digest("hex");
  } catch (error) {
    console.error(`\n❌ Error: Could not read the file at path: ${filePath}`);
    console.error("Please make sure the file exists and the path is correct.");
    process.exit(1); // Exit the script with an error
  }
}

// --- Main Script Logic ---

// Get the file path from the command line argument (the part after 'node verify.js')
const filePathFromUser = process.argv[2];

// Check if the user provided a file path
if (!filePathFromUser) {
  console.error("❌ Error: Please provide a file path to verify.");
  console.log("Usage: node verify.js <path-to-your-file>");
  process.exit(1);
}

console.log(`Verifying document at path: ${filePathFromUser}`);

// Calculate the hash of the user's provided file
const userFileHash = getFileHash(filePathFromUser);
console.log(`\nCalculated Hash of your file: ${userFileHash}`);

// --- SIMULATION of the Blockchain ---
// In a real app, this hash would be retrieved from your smart contract.
// For this test, we'll simulate the "correct" hash that is stored on the blockchain.
const correctDocumentText =
  "This is the correct and official document for Property ID 123.";
const correctHashOnBlockchain =
  "0x" + crypto.createHash("sha256").update(correctDocumentText).digest("hex");

console.log(`Official Hash stored on Blockchain: ${correctHashOnBlockchain}`);
console.log("------------------------------------------");

// Finally, compare the two hashes
if (userFileHash === correctHashOnBlockchain) {
  console.log("✅ SUCCESS: The document is authentic! The hashes match.");
} else {
  console.log(
    "❌ FAILURE: The document is not authentic. The hashes do NOT match."
  );
}
