const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Marketplace (Pull Payments)", function () {
  let propertyTitle, marketplace, owner, seller, buyer;

  beforeEach(async function () {
    [owner, seller, buyer] = await ethers.getSigners();
    const PT = await ethers.getContractFactory("PropertyTitle");
    propertyTitle = await PT.deploy();
    await propertyTitle.deployed();

    const MP = await ethers.getContractFactory("Marketplace");
    marketplace = await MP.deploy(propertyTitle.address);
    await marketplace.deployed();

    // mint tokenId 1 to seller
    await propertyTitle.mintTitle(seller.address, "QmHash123");
  });

  it("seller lists, buyer buys, seller withdraws funds", async function () {
    // seller approves marketplace
    await propertyTitle
      .connect(seller)
      .setApprovalForAll(marketplace.address, true);

    const price = ethers.utils.parseEther("1");
    await marketplace.connect(seller).listProperty(1, price);

    // buyer purchases
    await marketplace.connect(buyer).buyProperty(1, { value: price });

    // owner should now be buyer
    expect(await propertyTitle.ownerOf(1)).to.equal(buyer.address);

    // seller has pending withdrawals equal to price
    const pending = await marketplace.pendingWithdrawals(seller.address);
    expect(pending).to.equal(price);

    // seller withdraws
    const balanceBefore = await ethers.provider.getBalance(seller.address);
    const tx = await marketplace.connect(seller).withdrawProceeds();
    const receipt = await tx.wait();
    const balanceAfter = await ethers.provider.getBalance(seller.address);
    expect(balanceAfter).to.be.gt(balanceBefore);
  });
});
