// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract PropertyToken is ERC721, ERC721URIStorage, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    uint256 private _nextTokenId = 1;
    mapping(uint256 => uint256) public tokenToProperty;
    mapping(uint256 => uint256) public propertyToToken;

    event PropertyTokenMinted(
        uint256 indexed tokenId,
        uint256 indexed propertyId,
        address indexed owner
    );

    constructor() ERC721("PropertyToken", "PROP") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    function mintPropertyToken(
        address _to,
        uint256 _propertyId,
        string calldata _tokenURI
    ) external onlyRole(MINTER_ROLE) returns (uint256) {
        require(
            propertyToToken[_propertyId] == 0,
            "Property token already exists"
        );

        uint256 tokenId = _nextTokenId++;
        _safeMint(_to, tokenId);
        _setTokenURI(tokenId, _tokenURI);

        tokenToProperty[tokenId] = _propertyId;
        propertyToToken[_propertyId] = tokenId;

        emit PropertyTokenMinted(tokenId, _propertyId, _to);
        return tokenId;
    }

    function getPropertyId(uint256 _tokenId) external view returns (uint256) {
        return tokenToProperty[_tokenId];
    }

    function getTokenId(uint256 _propertyId) external view returns (uint256) {
        return propertyToToken[_propertyId];
    }

    function _burn(
        uint256 tokenId
    ) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(ERC721, ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
