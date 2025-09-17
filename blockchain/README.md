# Land Registry Blockchain (ERC721 + Marketplace, Pull Payments)


## Setup
npm install


## Compile
npx hardhat compile


## Deploy to Ganache
npx hardhat run scripts/deploy.js --network ganache

## Calculate Hash
node -e "const fs=require('fs'), crypto=require('crypto'); const h=crypto.createHash('sha256'); h.update(fs.readFileSync('OfficialDocument.txt')); console.log('0x'+h.digest('hex'))"
or
node verifyHash.js OfficialDocument.txt


## Run Tests 
npx hardhat console --network ganache
const PropertyTitle = await ethers.getContractAt("PropertyTitle", "0x94d283138148B16fdE647d40cD7cE127c4bc6507");
const Marketplace  = await ethers.getContractAt("Marketplace",  "0x143DAf091E7f5fc9310FaE2059CCEdA6bD1BafC2");

const gov = accounts[0];     // government
const seller = accounts[1];  // seller
const buyer = accounts[2];   // buyer
const accounts = await ethers.getSigners();
await PropertyTitle.connect(gov).mintTitle(seller.address, "0x3f51565a3dbe1bac3da6ae031147ba7e2a7eb2cd25d5ab13b8b6cc6b11fa8514");
await PropertyTitle.documentHashes(1);
await PropertyTitle.ownerOf(1);
await PropertyTitle.connect(gov).setVerified(1, true);
await PropertyTitle.isVerified(1);   // should return true