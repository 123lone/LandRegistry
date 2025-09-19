// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol"; // Corrected import path

/**
 * @title Marketplace
 * @dev A marketplace for ERC721 PropertyTitle tokens that uses a
 * secure "pull-payment" pattern for seller payouts.
 */
contract Marketplace is ReentrancyGuard {
    // A data structure to hold the details of a listed property
    struct Listing {
        uint256 price;   // Price in Wei
        address seller;  // The original owner who listed the property
        bool active;     // A flag to show if the listing is currently active
    }

    // The address of the PropertyTitle NFT contract
    IERC721 public immutable propertyTitle;

    // A mapping of the Token ID to its Listing details
    mapping(uint256 => Listing) public listings;

    // A mapping to store the pending withdrawal amount for each seller
    mapping(address => uint256) public pendingWithdrawals;

    // Events to announce important actions
    event PropertyListed(uint256 indexed tokenId, address indexed seller, uint256 price);
    event PropertySold(uint256 indexed tokenId, address indexed buyer, address indexed seller, uint256 price);
    event ListingCancelled(uint256 indexed tokenId);
    event Withdrawal(address indexed seller, uint256 amount);

    /**
     * @dev The constructor takes the address of the PropertyTitle NFT contract.
     */
    constructor(address _propertyTitleAddress) {
        require(_propertyTitleAddress != address(0), "Invalid token address");
        propertyTitle = IERC721(_propertyTitleAddress);
    }

    /**
     * @dev Allows a seller to list their property for sale.
     * The seller must be the current owner and must have approved the marketplace first.
     */
    function listProperty(uint256 tokenId, uint256 price) external nonReentrant {
        require(price > 0, "Price must be > 0");
        address owner = propertyTitle.ownerOf(tokenId);
        require(owner == msg.sender, "You are not the token owner");

        require(propertyTitle.getApproved(tokenId) == address(this), "Marketplace not approved");

        listings[tokenId] = Listing(price, msg.sender, true);
        emit PropertyListed(tokenId, msg.sender, price);
    }

    /**
     * @dev Allows a buyer to purchase a listed property.
     */
    function buyProperty(uint256 tokenId) external payable nonReentrant {
        Listing storage listing = listings[tokenId];
        require(listing.active, "This property is not listed for sale");
        require(msg.value == listing.price, "Incorrect price sent");

        address seller = listing.seller;
        require(propertyTitle.ownerOf(tokenId) == seller, "The seller no longer owns this property");

        listing.active = false;
        pendingWithdrawals[seller] += msg.value;
        propertyTitle.safeTransferFrom(seller, msg.sender, tokenId);

        emit PropertySold(tokenId, msg.sender, seller, msg.value);
    }

    /**
     * @dev Allows a seller to cancel their active listing.
     */
    function cancelListing(uint256 tokenId) external nonReentrant {
        Listing storage listing = listings[tokenId];
        require(listing.active, "This property is not listed for sale");
        require(listing.seller == msg.sender, "You are not the seller of this property");
        require(propertyTitle.ownerOf(tokenId) == msg.sender, "You are no longer the owner");

        listing.active = false;
        emit ListingCancelled(tokenId);
    }

    /**
     * @dev Allows a seller to withdraw their accumulated funds from completed sales.
     */
    function withdrawProceeds() external nonReentrant {
        uint256 amount = pendingWithdrawals[msg.sender];
        require(amount > 0, "You have no funds to withdraw");
        
        pendingWithdrawals[msg.sender] = 0;

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Withdrawal failed");

        emit Withdrawal(msg.sender, amount);
    }
}