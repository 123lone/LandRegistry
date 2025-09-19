// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract PropertyTitle is ERC721, Ownable, ReentrancyGuard, Pausable {
    using Strings for uint256;

    uint256 private _tokenIdCounter;

    // Constants
    uint256 public constant MAX_DOCUMENT_HASHES = 10;
    uint256 public constant MIN_AREA = 1;
    uint256 public constant MAX_AREA = 10000000; // 10M sq ft
    uint256 public constant MAX_PROPERTY_ID_LENGTH = 100;
    uint256 public constant MAX_ADDRESS_LENGTH = 200;
    uint256 public constant MAX_NAME_LENGTH = 100;

    struct Property {
        address owner;
        string surveyNumber;
        string propertyId;
        string propertyAddress;
        uint256 area;
        string ownerName;
        string[] documentHashes;
        uint256 createdAt;
        bool isVerified;
        uint256 verifiedAt;
    }

    struct PropertyInput {
        string surveyNumber;
        string propertyId;
        string propertyAddress;
        uint256 area;
        string ownerName;
        string[] documentHashes;
    }

    mapping(uint256 => Property) public properties;
    mapping(string => bool) public propertyIdExists;
    mapping(address => uint256[]) private _ownerToTokens;

    event TitleMinted(
        uint256 indexed tokenId,
        address indexed owner,
        string propertyId,
        string surveyNumber,
        uint256 timestamp
    );

    event PropertyVerified(
        uint256 indexed tokenId,
        bool verified,
        uint256 timestamp
    );

    constructor(address initialOwner) ERC721("PropertyTitle", "PTT") {
        _transferOwnership(initialOwner);
        _tokenIdCounter = 0;
    }

    /** @notice Mint a new property title NFT using a struct input */
    function mintTitle(address to, PropertyInput memory input)
        external
        onlyOwner
        whenNotPaused
        nonReentrant
        returns (uint256)
    {
        require(to != address(0), "Cannot mint to zero address");
        require(input.documentHashes.length >= 2, "At least 2 documents required");
        require(!propertyIdExists[input.propertyId], "Property ID already exists");

        // Validate input
        _validatePropertyInput(input);

        uint256 tokenId = _tokenIdCounter;
        _safeMint(to, tokenId);
        _tokenIdCounter++;

        // Assign property data
        Property storage prop = properties[tokenId];
        prop.owner = to;
        prop.surveyNumber = input.surveyNumber;
        prop.propertyId = input.propertyId;
        prop.propertyAddress = input.propertyAddress;
        prop.area = input.area;
        prop.ownerName = input.ownerName;
        prop.createdAt = block.timestamp;
        prop.isVerified = false;
        prop.verifiedAt = 0;

        for (uint i = 0; i < input.documentHashes.length; i++) {
            prop.documentHashes.push(input.documentHashes[i]);
        }

        // Track property and owner
        propertyIdExists[input.propertyId] = true;
        _ownerToTokens[to].push(tokenId);

        emit TitleMinted(tokenId, to, input.propertyId, input.surveyNumber, block.timestamp);
        return tokenId;
    }

    /** @notice Set verification status */
    function setVerified(uint256 tokenId, bool verified) external onlyOwner {
        require(_exists(tokenId), "Token does not exist");

        Property storage prop = properties[tokenId];
        prop.isVerified = verified;
        prop.verifiedAt = verified ? block.timestamp : 0;

        emit PropertyVerified(tokenId, verified, block.timestamp);
    }

    /** @notice Get property by tokenId */
    function getProperty(uint256 tokenId) external view returns (Property memory) {
        require(_exists(tokenId), "Token does not exist");
        return properties[tokenId];
    }

    /** @notice Get multiple properties */
    function getProperties(uint256[] calldata tokenIds)
        external
        view
        returns (Property[] memory)
    {
        Property[] memory result = new Property[](tokenIds.length);
        for (uint i = 0; i < tokenIds.length; i++) {
            require(_exists(tokenIds[i]), "Token does not exist");
            result[i] = properties[tokenIds[i]];
        }
        return result;
    }

    /** @notice Get all token IDs owned by an address */
    function tokensOfOwner(address owner) external view returns (uint256[] memory) {
        return _ownerToTokens[owner];
    }

    function totalProperties() external view returns (uint256) {
        return _tokenIdCounter;
    }

    function totalVerifiedProperties() external view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < _tokenIdCounter; i++) {
            if (properties[i].isVerified) count++;
        }
        return count;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    /** @dev Internal validation for PropertyInput */
    function _validatePropertyInput(PropertyInput memory input) internal pure {
        require(bytes(input.surveyNumber).length > 0 && bytes(input.surveyNumber).length <= 50, "Invalid survey number");
        require(bytes(input.propertyId).length > 0 && bytes(input.propertyId).length <= MAX_PROPERTY_ID_LENGTH, "Invalid property ID");
        require(bytes(input.propertyAddress).length > 0 && bytes(input.propertyAddress).length <= MAX_ADDRESS_LENGTH, "Invalid property address");
        require(bytes(input.ownerName).length > 0 && bytes(input.ownerName).length <= MAX_NAME_LENGTH, "Invalid owner name");
        require(input.area >= MIN_AREA && input.area <= MAX_AREA, "Area out of range");
        require(input.documentHashes.length >= 2 && input.documentHashes.length <= MAX_DOCUMENT_HASHES, "Invalid document count");
        for (uint i = 0; i < input.documentHashes.length; i++) {
            require(bytes(input.documentHashes[i]).length > 0 && bytes(input.documentHashes[i]).length <= 100, "Invalid document hash");
        }
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
        internal
        whenNotPaused
        override(ERC721)
    {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
