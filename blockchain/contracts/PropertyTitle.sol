// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract PropertyTitle is ERC721, Ownable, AccessControl {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");

    struct PropertyDetails {
        string surveyNumber;
        string propertyId;      // Unique identifier for the property (off-chain)
        string propertyAddress;
        string district;        // The district where the property is located
        uint256 area;           // Area in square units (e.g., sq ft)
        string ownerName;
        string[] documentHashes; // Array of IPFS hashes for related documents
        bool verified;           // Status indicating if the property details have been officially verified
    }

    mapping(uint256 => PropertyDetails) public propertyDetails;

    event TitleMinted(uint256 indexed tokenId, address indexed owner, string propertyId, string[] documentHashes);
    event TitleVerified(uint256 indexed tokenId, bool verified);
    event VerifierAdded(address indexed account);
    event VerifierRemoved(address indexed account);

    // Constructor: ERC721 name & symbol, Ownable automatically sets msg.sender as owner
    constructor() ERC721("Land Registry Title", "LRT") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
    }

    // Mint a new property title token
    function mintTitle(
        address to,
        string memory surveyNumber,
        string memory propertyId,
        string memory propertyAddress,
        string memory district,
        uint256 area,
        string memory ownerName,
        string[] memory documentHashes
    ) external onlyRole(VERIFIER_ROLE) returns (uint256) {
        _tokenIds.increment();
        uint256 newId = _tokenIds.current();
        _safeMint(to, newId);

        propertyDetails[newId] = PropertyDetails({
            surveyNumber: surveyNumber,
            propertyId: propertyId,
            propertyAddress: propertyAddress,
            district: district,
            area: area,
            ownerName: ownerName,
            documentHashes: documentHashes,
            verified: false
        });

        emit TitleMinted(newId, to, propertyId, documentHashes);
        return newId;
    }

    // Admin can verify property details
    function setVerifiedByAdmin(uint256 tokenId, bool status) external onlyOwner {
        require(_exists(tokenId), "Token does not exist");
        propertyDetails[tokenId].verified = status;
        emit TitleVerified(tokenId, status);
    }

    // Add a verifier role
    function addVerifier(address account) external onlyOwner {
        grantRole(VERIFIER_ROLE, account);
        emit VerifierAdded(account);
    }

    // Remove a verifier role
    function removeVerifier(address account) external onlyOwner {
        revokeRole(VERIFIER_ROLE, account);
        emit VerifierRemoved(account);
    }

    // Check if a property is verified
    function isVerified(uint256 tokenId) external view returns (bool) {
        require(_exists(tokenId), "Token does not exist");
        return propertyDetails[tokenId].verified;
    }

    // Get full property details
    function getPropertyDetails(uint256 tokenId) external view returns (PropertyDetails memory) {
        require(_exists(tokenId), "Token does not exist");
        return propertyDetails[tokenId];
    }

    // Resolve multiple inheritance for supportsInterface
    function supportsInterface(bytes4 interfaceId) 
        public 
        view 
        override(ERC721, AccessControl) 
        returns (bool) 
    {
        return super.supportsInterface(interfaceId);
    }
}
