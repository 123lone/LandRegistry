// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract PropertyTitle is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    mapping(uint256 => string) public documentHashes;
    mapping(uint256 => bool) private _verified;

    event TitleMinted(uint256 indexed tokenId, address indexed owner, string documentHash);
    event TitleVerified(uint256 indexed tokenId, bool verified);

    constructor() ERC721("Land Registry Title", "LRT") Ownable(msg.sender) {}

    function mintTitle(address to, string memory documentHash) external onlyOwner returns (uint256) {
        _tokenIds.increment();
        uint256 newId = _tokenIds.current();
        _safeMint(to, newId);
        documentHashes[newId] = documentHash;
        _verified[newId] = false;
        emit TitleMinted(newId, to, documentHash);
        return newId;
    }

    function setVerified(uint256 tokenId, bool status) external onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Nonexistent token");
        _verified[tokenId] = status;
        emit TitleVerified(tokenId, status);
    }

    function isVerified(uint256 tokenId) external view returns (bool) {
        require(_ownerOf(tokenId) != address(0), "Nonexistent token");
        return _verified[tokenId];
    }
}
