// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract PropertyTitle is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct PropertyDetails {
        string surveyNumber;
        string propertyId;
        string propertyAddress;
        uint256 area;
        string ownerName;
        string description;
        string[] documentHashes;
        bool verified;
    }

    mapping(uint256 => PropertyDetails) public propertyDetails;

    event TitleMinted(uint256 indexed tokenId, address indexed owner, string[] documentHashes);
    event TitleVerified(uint256 indexed tokenId, bool verified);

    constructor() ERC721("Land Registry Title", "LRT") Ownable() {}

    // Removed onlyOwner
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
            verified: false
        });
        emit TitleMinted(newId, to, documentHashes);
        return newId;
    }

    // Removed onlyOwner
    function setVerified(uint256 tokenId, bool status) external {
        require(_ownerOf(tokenId) != address(0), "Nonexistent token");
        propertyDetails[tokenId].verified = status;
        emit TitleVerified(tokenId, status);
    }

    function isVerified(uint256 tokenId) external view returns (bool) {
        require(_ownerOf(tokenId) != address(0), "Nonexistent token");
        return propertyDetails[tokenId].verified;
    }

    function getPropertyDetails(uint256 tokenId) external view returns (PropertyDetails memory) {
        require(_ownerOf(tokenId) != address(0), "Nonexistent token");
        return propertyDetails[tokenId];
    }
}
