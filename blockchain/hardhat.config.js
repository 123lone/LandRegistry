require("@nomicfoundation/hardhat-toolbox");
// ...existing code...
module.exports = {
  solidity: "0.8.24",
  networks: {
    ganache: {
      url: "http://127.0.0.1:7545",
      // Replace the 'accounts' array with this object
      accounts: {
        mnemonic:
          "advice despair question tired toy trend below pull drama ice path modify",
        count: 10, // Optional: specifies how many accounts to derive
      },
    },
  },
};
