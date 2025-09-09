const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PropertyTitle", function () {
  it("mints and sets verification", async function () {
    const [owner, alice] = await ethers.getSigners();
    const PT = await ethers.getContractFactory("PropertyTitle");
    const pt = await PT.deploy();
    await pt.deployed();

    await pt.mintTitle(alice.address, "QmHash123");
    expect(await pt.ownerOf(1)).to.equal(alice.address);
    expect(await pt.documentHashes(1)).to.equal("QmHash123");
    expect(await pt.isVerified(1)).to.equal(false);

    await pt.setVerified(1, true);
    expect(await pt.isVerified(1)).to.equal(true);
  });
});
