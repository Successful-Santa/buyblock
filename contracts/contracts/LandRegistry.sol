// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract LandRegistry is AccessControl, Pausable {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");

    struct PropertyDetails {
        string propertyId;
        address owner;
        uint256 area;
        string location;
        uint256 value;
        bool isVerified;
        uint256 lastUpdated;
        string metadataURI; // IPFS URI for additional property data
    }

    struct TransferHistory {
        address from;
        address to;
        uint256 timestamp;
        uint256 price;
        string documentURI; // IPFS URI for transfer documents
    }

    // Property ID => Property Details
    mapping(string => PropertyDetails) public properties;

    // Property ID => Transfer History Array
    mapping(string => TransferHistory[]) public propertyHistory;

    // Owner => Property IDs
    mapping(address => string[]) public ownerProperties;

    // Property ID => Disputed status
    mapping(string => bool) public disputedProperties;

    event PropertyRegistered(
        string propertyId,
        address owner,
        uint256 timestamp
    );
    event PropertyTransferred(
        string propertyId,
        address from,
        address to,
        uint256 timestamp
    );
    event PropertyVerified(
        string propertyId,
        address verifier,
        uint256 timestamp
    );
    event PropertyDisputed(
        string propertyId,
        address disputedBy,
        uint256 timestamp
    );
    event PropertyValueUpdated(
        string propertyId,
        uint256 newValue,
        uint256 timestamp
    );
    event MetadataUpdated(
        string propertyId,
        string metadataURI,
        uint256 timestamp
    );

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    function registerProperty(
        string memory propertyId,
        uint256 area,
        string memory location,
        uint256 value,
        string memory metadataURI
    ) public whenNotPaused {
        require(
            properties[propertyId].owner == address(0),
            "Property already registered"
        );

        properties[propertyId] = PropertyDetails({
            propertyId: propertyId,
            owner: msg.sender,
            area: area,
            location: location,
            value: value,
            isVerified: false,
            lastUpdated: block.timestamp,
            metadataURI: metadataURI
        });

        ownerProperties[msg.sender].push(propertyId);

        emit PropertyRegistered(propertyId, msg.sender, block.timestamp);
    }

    function transferProperty(
        string memory propertyId,
        address newOwner,
        uint256 price,
        string memory documentURI
    ) public whenNotPaused {
        require(
            properties[propertyId].owner == msg.sender,
            "Not the property owner"
        );
        require(!disputedProperties[propertyId], "Property is disputed");
        require(properties[propertyId].isVerified, "Property not verified");

        address previousOwner = properties[propertyId].owner;
        properties[propertyId].owner = newOwner;
        properties[propertyId].lastUpdated = block.timestamp;

        // Update owner mappings
        removeFromOwnerProperties(previousOwner, propertyId);
        ownerProperties[newOwner].push(propertyId);

        // Record transfer history
        propertyHistory[propertyId].push(
            TransferHistory({
                from: previousOwner,
                to: newOwner,
                timestamp: block.timestamp,
                price: price,
                documentURI: documentURI
            })
        );

        emit PropertyTransferred(
            propertyId,
            previousOwner,
            newOwner,
            block.timestamp
        );
    }

    function verifyProperty(
        string memory propertyId
    ) public whenNotPaused onlyRole(VERIFIER_ROLE) {
        require(
            !properties[propertyId].isVerified,
            "Property already verified"
        );
        properties[propertyId].isVerified = true;
        properties[propertyId].lastUpdated = block.timestamp;
        emit PropertyVerified(propertyId, msg.sender, block.timestamp);
    }

    function updatePropertyValue(
        string memory propertyId,
        uint256 newValue
    ) public whenNotPaused {
        require(
            properties[propertyId].owner == msg.sender ||
                hasRole(ADMIN_ROLE, msg.sender),
            "Not authorized"
        );
        properties[propertyId].value = newValue;
        properties[propertyId].lastUpdated = block.timestamp;
        emit PropertyValueUpdated(propertyId, newValue, block.timestamp);
    }

    function updateMetadata(
        string memory propertyId,
        string memory metadataURI
    ) public whenNotPaused {
        require(
            properties[propertyId].owner == msg.sender ||
                hasRole(ADMIN_ROLE, msg.sender),
            "Not authorized"
        );
        properties[propertyId].metadataURI = metadataURI;
        properties[propertyId].lastUpdated = block.timestamp;
        emit MetadataUpdated(propertyId, metadataURI, block.timestamp);
    }

    function raiseDispute(string memory propertyId) public whenNotPaused {
        require(
            properties[propertyId].owner != address(0),
            "Property doesn't exist"
        );
        require(!disputedProperties[propertyId], "Property already disputed");
        disputedProperties[propertyId] = true;
        emit PropertyDisputed(propertyId, msg.sender, block.timestamp);
    }

    function resolveDispute(
        string memory propertyId
    ) public whenNotPaused onlyRole(ADMIN_ROLE) {
        require(disputedProperties[propertyId], "Property not disputed");
        disputedProperties[propertyId] = false;
    }

    function getPropertyHistory(
        string memory propertyId
    ) public view returns (TransferHistory[] memory) {
        return propertyHistory[propertyId];
    }

    function getOwnerProperties(
        address owner
    ) public view returns (string[] memory) {
        return ownerProperties[owner];
    }

    function removeFromOwnerProperties(
        address owner,
        string memory propertyId
    ) internal {
        string[] storage ownerProps = ownerProperties[owner];
        for (uint i = 0; i < ownerProps.length; i++) {
            if (
                keccak256(bytes(ownerProps[i])) == keccak256(bytes(propertyId))
            ) {
                ownerProps[i] = ownerProps[ownerProps.length - 1];
                ownerProps.pop();
                break;
            }
        }
    }

    function pause() public onlyRole(ADMIN_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(ADMIN_ROLE) {
        _unpause();
    }
}
