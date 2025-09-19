// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title PropertyTitle
 * @dev An ERC721 token contract for representing unique property titles.
 * A trusted verifier can mint a new title deed (NFT) for a property owner.
 */
contract PropertyTitle is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct PropertyDetails {
        string surveyNumber;
        string propertyId;      // Unique identifier for the property (off-chain)
        string propertyAddress;
        uint256 area;           // Area in square units (e.g., sq ft)
        string ownerName;
        string description;
        string[] documentHashes; // Array of IPFS hashes for related documents
        bool verified;          // Status indicating if the property details have been officially verified
    }

    // Mapping from a token ID to its detailed property information.
    mapping(uint256 => PropertyDetails) public propertyDetails;

    // Events to log key actions on the blockchain
    event TitleMinted(uint256 indexed tokenId, address indexed owner, string propertyId, string[] documentHashes);
    event TitleVerified(uint256 indexed tokenId, bool verified);

    constructor() ERC721("Land Registry Title", "LRT") {}


    /**
     * @dev Mints a new property title NFT and assigns it to an owner.
     * Can be called by any address (e.g., a verified registrar) to create a title for a citizen.
     * @param to The wallet address of the new property owner.
     * @param surveyNumber The official survey number of the land.
     * @param propertyId A unique off-chain identifier for the property.
     * @param propertyAddress The physical address of the property.
     * @param area The total area of the property.
     * @param ownerName The legal name of the property owner.
     * @param description Optional description of the property.
     * @param documentHashes An array of IPFS CIDs for the property documents.
     * @return The ID of the newly minted token.
     */
    function mintTitle(
        address to,
        string memory surveyNumber,
        string memory propertyId,
        string memory propertyAddress,
        uint256 area,
        string memory ownerName,
        string memory description,
        string[] memory documentHashes
    ) external returns (uint256) {
        _tokenIds.increment();
        uint256 newId = _tokenIds.current();
        _safeMint(to, newId);
        
        propertyDetails[newId] = PropertyDetails({
            surveyNumber: surveyNumber,
            propertyId: propertyId,
            propertyAddress: propertyAddress,
            area: area,
            ownerName: ownerName,
            description: description,
            documentHashes: documentHashes,
            verified: false // A separate verification step is required after minting
        });

        emit TitleMinted(newId, to, propertyId, documentHashes);
        return newId;
    }

    /**
     * @dev Sets the verification status of a property.
     * Typically called by an authorized party (e.g., contract owner) after due diligence.
     * @param tokenId The ID of the token to verify.
     * @param status The verification status (true or false).
     */
    function setVerified(uint256 tokenId, bool status) external onlyOwner {
        require(_exists(tokenId), "Token does not exist");
        propertyDetails[tokenId].verified = status;
        emit TitleVerified(tokenId, status);
    }

    /**
     * @dev Checks if a property title is verified.
     * @param tokenId The ID of the token to check.
     * @return A boolean indicating the verification status.
     */
    function isVerified(uint256 tokenId) external view returns (bool) {
        require(_exists(tokenId), "Token does not exist");
        return propertyDetails[tokenId].verified;
    }

    /**
     * @dev Retrieves all details for a specific property title.
     * @param tokenId The ID of the token to query.
     * @return A memory struct containing all property details.
     */
    function getPropertyDetails(uint256 tokenId) external view returns (PropertyDetails memory) {
        require(_exists(tokenId), "Token does not exist");
        return propertyDetails[tokenId];
    }
}