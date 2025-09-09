// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title Marketplace
 * @dev A more advanced marketplace for ERC721 PropertyTitle tokens.
 * This version uses the secure "pull-payment" pattern for seller payouts.
 */
contract Marketplace is ReentrancyGuard {
    // A data structure to hold the details of a listed property
    struct Listing {
        uint256 price; // Price in Wei
        address seller; // The original owner who listed the property
        bool active;   // A flag to show if the listing is currently active
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

        // The seller must approve the marketplace to handle their NFT before listing
        require(propertyTitle.getApproved(tokenId) == address(this), "Marketplace not approved");

        listings[tokenId] = Listing(price, msg.sender, true);
        emit PropertyListed(tokenId, msg.sender, price);
    }

    /**
     * @dev Allows a buyer to purchase a listed property.
     * This function uses a pull-payment pattern: it credits the seller's balance
     * and transfers the NFT from the seller to the buyer.
     */
    function buyProperty(uint256 tokenId) external payable nonReentrant {
        Listing storage listing = listings[tokenId];
        require(listing.active, "This property is not listed for sale");
        require(msg.value == listing.price, "Incorrect price sent");

        address seller = listing.seller;
        require(propertyTitle.ownerOf(tokenId) == seller, "The seller no longer owns this property");

        // Deactivate the listing first to prevent re-entrancy attacks
        listing.active = false;

        // Transfer the NFT from the seller to the buyer
        propertyTitle.safeTransferFrom(seller, msg.sender, tokenId);

        // Credit the seller's withdrawal balance instead of sending funds directly
        pendingWithdrawals[seller] += msg.value;

        emit PropertySold(tokenId, msg.sender, seller, msg.value);
    }

    /**
     * @dev Allows a seller to cancel their active listing.
     * Only the original seller who is still the owner can cancel.
     */
    function cancelListing(uint256 tokenId) external nonReentrant {
        Listing storage listing = listings[tokenId];
        require(listing.active, "This property is not listed for sale");
        require(listing.seller == msg.sender, "You are not the seller of this property");
        require(propertyTitle.ownerOf(tokenId) == msg.sender, "You are no longer the owner of this property");

        listing.active = false;
        emit ListingCancelled(tokenId);
    }

    /**
     * @dev Allows a seller to withdraw their accumulated funds from completed sales.
     */
    function withdrawProceeds() external nonReentrant {
        uint256 amount = pendingWithdrawals[msg.sender];
        require(amount > 0, "You have no funds to withdraw");
        
        // Reset the seller's balance to zero BEFORE sending the funds
        pendingWithdrawals[msg.sender] = 0;

        // Send the funds to the seller
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Withdrawal failed");

        emit Withdrawal(msg.sender, amount);
    }
}