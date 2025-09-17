import { ethers } from "ethers";

// This function would be inside your React component
const handleFileChange = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // 1. Read the file as an ArrayBuffer (raw binary data)
  const reader = new FileReader();
  reader.onload = async (e) => {
    const fileData = e.target.result;
    const uint8Array = new Uint8Array(fileData);

    // 2. Calculate the keccak256 hash of the file's data
    const fileHash = ethers.keccak256(uint8Array);

    console.log("Calculated Hash of the Uploaded File:", fileHash);
    // Now you have the hash to compare with the one on the blockchain
  };
  reader.readAsArrayBuffer(file);
};

// In your JSX, you would have an input element like this:
<input type="file" onChange={handleFileChange} />;
