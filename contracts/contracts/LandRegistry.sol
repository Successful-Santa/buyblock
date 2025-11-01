// SPDX-License-Identifier: MIT// SPDX-License-Identifier: MIT// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

pragma solidity ^0.8.20;pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

import "@openzeppelin/contracts/utils/Pausable.sol";



contract LandRegistry is AccessControl, Pausable {import "@openzeppelin/contracts/access/AccessControl.sol";import "@openzeppelin/contracts/access/AccessControl.sol";

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");import "@openzeppelin/contracts/utils/Pausable.sol";import "@openzeppelin/contracts/utils/Pausable.sol";



    struct Property {import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

        uint256 id;

        address owner;

        string geoJson;

        uint256 area;contract LandRegistry is AccessControl, Pausable, ReentrancyGuard {contract LandRegistry is AccessControl, Pausable, ReentrancyGuard {

        string location;

        uint256 value;    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

        bool isVerified;

        uint256 registeredAt;    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");

        string ipfsHash;

    }    bytes32 public constant SURVEYOR_ROLE = keccak256("SURVEYOR_ROLE");    bytes32 public constant SURVEYOR_ROLE = keccak256("SURVEYOR_ROLE");



    mapping(uint256 => Property) public properties;

    mapping(address => uint256[]) public ownerProperties;

    uint256 public nextPropertyId = 1;    struct Property {    struct Property {

    uint256 public totalProperties;

        uint256 id;        uint256 id;

    event PropertyRegistered(uint256 indexed propertyId, address indexed owner);

    event PropertyVerified(uint256 indexed propertyId);        address owner;        address owner;



    constructor() {        string geoJson;        string geoJson;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);

        _grantRole(ADMIN_ROLE, msg.sender);        uint256 area; // in square meters        uint256 area; // in square meters

    }

        string location;        string location;

    function registerProperty(

        string calldata _geoJson,        uint256 value; // in wei        uint256 value; // in wei

        uint256 _area,

        string calldata _location,        PropertyStatus status;        PropertyStatus status;

        uint256 _value,

        string calldata _ipfsHash        uint256 registeredAt;        uint256 registeredAt;

    ) external whenNotPaused returns (uint256) {

        uint256 propertyId = nextPropertyId++;        uint256 lastUpdated;        uint256 lastUpdated;



        properties[propertyId] = Property({        string ipfsHash; // IPFS hash for documents        string ipfsHash; // IPFS hash for documents

            id: propertyId,

            owner: msg.sender,        address surveyor;        address surveyor;

            geoJson: _geoJson,

            area: _area,        bool isVerified;        bool isVerified;

            location: _location,

            value: _value,    }    }

            isVerified: false,

            registeredAt: block.timestamp,

            ipfsHash: _ipfsHash

        });    struct TransferRequest {    struct TransferRequest {



        ownerProperties[msg.sender].push(propertyId);        uint256 propertyId;        uint256 propertyId;

        totalProperties++;

        address from;        address from;

        emit PropertyRegistered(propertyId, msg.sender);

        return propertyId;        address to;        address to;

    }

        uint256 price;        uint256 price;

    function verifyProperty(uint256 _propertyId) external onlyRole(VERIFIER_ROLE) {

        require(properties[_propertyId].id != 0, "Property does not exist");        uint256 requestedAt;        uint256 requestedAt;

        properties[_propertyId].isVerified = true;

        emit PropertyVerified(_propertyId);        TransferStatus status;        TransferStatus status;

    }

        string transferDocumentHash;        string transferDocumentHash;

    function getProperty(uint256 _propertyId) external view returns (Property memory) {

        return properties[_propertyId];    }    }

    }



    function getOwnerProperties(address _owner) external view returns (uint256[] memory) {

        return ownerProperties[_owner];    enum PropertyStatus {    enum PropertyStatus {

    }

        Pending,        Pending,

    function pause() external onlyRole(ADMIN_ROLE) {

        _pause();        Registered,        Registered,

    }

        Disputed,        Disputed,

    function unpause() external onlyRole(ADMIN_ROLE) {

        _unpause();        Transferred,        Transferred,

    }

}        Suspended        Suspended

    }    }



    enum TransferStatus {    enum TransferStatus {

        Pending,        Pending,

        Approved,        Approved,

        Rejected,        Rejected,

        Completed        Completed

    }    }



    // State variables    // State variables

    mapping(uint256 => Property) public properties;    mapping(uint256 => Property) public properties;

    mapping(uint256 => TransferRequest[]) public transferRequests;    mapping(uint256 => TransferRequest[]) public transferRequests;

    mapping(address => uint256[]) public ownerProperties;    mapping(address => uint256[]) public ownerProperties;

    mapping(uint256 => bool) public disputedProperties;    mapping(uint256 => bool) public disputedProperties;



    uint256 public nextPropertyId = 1;    uint256 public nextPropertyId = 1;

    uint256 public totalProperties;    uint256 public totalProperties;



    // Events    // Events

    event PropertyRegistered(uint256 indexed propertyId, address indexed owner, string geoJson);    event PropertyRegistered(uint256 indexed propertyId, address indexed owner, string geoJson);

    event PropertyVerified(uint256 indexed propertyId, address indexed verifier);    event PropertyVerified(uint256 indexed propertyId, address indexed verifier);

    event TransferRequested(uint256 indexed propertyId, address indexed from, address indexed to);    event TransferRequested(uint256 indexed propertyId, address indexed from, address indexed to);

    event TransferApproved(uint256 indexed propertyId, address indexed from, address indexed to);    event TransferApproved(uint256 indexed propertyId, address indexed from, address indexed to);

    event PropertyDisputed(uint256 indexed propertyId, address indexed disputedBy);    event PropertyDisputed(uint256 indexed propertyId, address indexed disputedBy);

    event DisputeResolved(uint256 indexed propertyId, bool approved);    event DisputeResolved(uint256 indexed propertyId, bool approved);



    constructor() {    constructor() {

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);

        _grantRole(ADMIN_ROLE, msg.sender);        _grantRole(ADMIN_ROLE, msg.sender);

    }    }



    // Modifiers    // Modifiers

    modifier onlyPropertyOwner(uint256 _propertyId) {    modifier onlyPropertyOwner(uint256 _propertyId) {

        require(properties[_propertyId].owner == msg.sender, "Not property owner");        require(properties[_propertyId].owner == msg.sender, "Not property owner");

        _;        _;

    }    }



    modifier propertyExists(uint256 _propertyId) {    modifier propertyExists(uint256 _propertyId) {

        require(properties[_propertyId].id != 0, "Property does not exist");        require(properties[_propertyId].id != 0, "Property does not exist");

        _;        _;

    }    }



    modifier notDisputed(uint256 _propertyId) {    modifier notDisputed(uint256 _propertyId) {

        require(!disputedProperties[_propertyId], "Property is disputed");        require(!disputedProperties[_propertyId], "Property is disputed");

        _;        _;

    }    }



    // Register a new property    // Register a new property

    function registerProperty(    function registerProperty(

        string calldata _geoJson,        string calldata _geoJson,

        uint256 _area,        uint256 _area,

        string calldata _location,        string calldata _location,

        uint256 _value,        uint256 _value,

        string calldata _ipfsHash        string calldata _ipfsHash

    ) external whenNotPaused returns (uint256) {    ) external whenNotPaused returns (uint256) {

        require(bytes(_geoJson).length > 0, "GeoJSON cannot be empty");        require(bytes(_geoJson).length > 0, "GeoJSON cannot be empty");

        require(_area > 0, "Area must be greater than 0");        require(_area > 0, "Area must be greater than 0");



        uint256 propertyId = nextPropertyId++;        uint256 propertyId = nextPropertyId++;



        properties[propertyId] = Property({        properties[propertyId] = Property({

            id: propertyId,            id: propertyId,

            owner: msg.sender,            owner: msg.sender,

            geoJson: _geoJson,            geoJson: _geoJson,

            area: _area,            area: _area,

            location: _location,            location: _location,

            value: _value,            value: _value,

            status: PropertyStatus.Registered,            status: PropertyStatus.Registered,

            registeredAt: block.timestamp,            registeredAt: block.timestamp,

            lastUpdated: block.timestamp,            lastUpdated: block.timestamp,

            ipfsHash: _ipfsHash,            ipfsHash: _ipfsHash,

            surveyor: address(0),            surveyor: address(0),

            isVerified: false            isVerified: false

        });        });



        ownerProperties[msg.sender].push(propertyId);        ownerProperties[msg.sender].push(propertyId);

        totalProperties++;        totalProperties++;



        emit PropertyRegistered(propertyId, msg.sender, _geoJson);        emit PropertyRegistered(propertyId, msg.sender, _geoJson);

        return propertyId;        return propertyId;

    }    }



    // Verify property (only verifiers)    // Verify property (only verifiers)

    function verifyProperty(uint256 _propertyId) external onlyRole(VERIFIER_ROLE) propertyExists(_propertyId) {    function verifyProperty(uint256 _propertyId) external onlyRole(VERIFIER_ROLE) propertyExists(_propertyId) {

        Property storage property = properties[_propertyId];        Property storage property = properties[_propertyId];

        require(!property.isVerified, "Property already verified");        require(!property.isVerified, "Property already verified");



        property.isVerified = true;        property.isVerified = true;

        property.lastUpdated = block.timestamp;        property.lastUpdated = block.timestamp;



        emit PropertyVerified(_propertyId, msg.sender);        emit PropertyVerified(_propertyId, msg.sender);

    }    }



    // Request property transfer    // Request property transfer

    function requestTransfer(    function requestTransfer(

        uint256 _propertyId,        uint256 _propertyId,

        address _to,        address _to,

        uint256 _price,        uint256 _price,

        string calldata _transferDocumentHash        string calldata _transferDocumentHash

    ) external propertyExists(_propertyId) onlyPropertyOwner(_propertyId) notDisputed(_propertyId) nonReentrant {    ) external propertyExists(_propertyId) onlyPropertyOwner(_propertyId) notDisputed(_propertyId) nonReentrant {

        require(_to != address(0), "Invalid recipient address");        require(_to != address(0), "Invalid recipient address");

        require(_to != msg.sender, "Cannot transfer to self");        require(_to != msg.sender, "Cannot transfer to self");



        Property storage property = properties[_propertyId];        Property storage property = properties[_propertyId];

        require(property.isVerified, "Property must be verified before transfer");        require(property.isVerified, "Property must be verified before transfer");



        TransferRequest memory request = TransferRequest({        TransferRequest memory request = TransferRequest({

            propertyId: _propertyId,            propertyId: _propertyId,

            from: msg.sender,            from: msg.sender,

            to: _to,            to: _to,

            price: _price,            price: _price,

            requestedAt: block.timestamp,            requestedAt: block.timestamp,

            status: TransferStatus.Pending,            status: TransferStatus.Pending,

            transferDocumentHash: _transferDocumentHash            transferDocumentHash: _transferDocumentHash

        });        });



        transferRequests[_propertyId].push(request);        transferRequests[_propertyId].push(request);



        emit TransferRequested(_propertyId, msg.sender, _to);        emit TransferRequested(_propertyId, msg.sender, _to);

    }    }



    // Approve transfer (only admins)    // Approve transfer (only admins)

    function approveTransfer(uint256 _propertyId, uint256 _requestIndex) external onlyRole(ADMIN_ROLE) nonReentrant {    function approveTransfer(uint256 _propertyId, uint256 _requestIndex) external onlyRole(ADMIN_ROLE) nonReentrant {

        require(_requestIndex < transferRequests[_propertyId].length, "Invalid request index");        require(_requestIndex < transferRequests[_propertyId].length, "Invalid request index");



        TransferRequest storage request = transferRequests[_propertyId][_requestIndex];        TransferRequest storage request = transferRequests[_propertyId][_requestIndex];

        require(request.status == TransferStatus.Pending, "Request not pending");        require(request.status == TransferStatus.Pending, "Request not pending");



        Property storage property = properties[_propertyId];        Property storage property = properties[_propertyId];



        // Update property ownership        // Update property ownership

        address previousOwner = property.owner;        address previousOwner = property.owner;

        property.owner = request.to;        property.owner = request.to;

        property.value = request.price;        property.value = request.price;

        property.lastUpdated = block.timestamp;        property.lastUpdated = block.timestamp;

        property.status = PropertyStatus.Transferred;        property.status = PropertyStatus.Transferred;



        // Update owner mappings        // Update owner mappings

        _removePropertyFromOwner(previousOwner, _propertyId);        _removePropertyFromOwner(previousOwner, _propertyId);

        ownerProperties[request.to].push(_propertyId);        ownerProperties[request.to].push(_propertyId);



        request.status = TransferStatus.Completed;        request.status = TransferStatus.Completed;



        emit TransferApproved(_propertyId, previousOwner, request.to);        emit TransferApproved(_propertyId, previousOwner, request.to);

    }    }



    // Dispute property    // Dispute property

    function disputeProperty(uint256 _propertyId, string calldata _reason) external propertyExists(_propertyId) {    function disputeProperty(uint256 _propertyId, string calldata _reason) external propertyExists(_propertyId) {

        require(!disputedProperties[_propertyId], "Property already disputed");        require(!disputedProperties[_propertyId], "Property already disputed");



        disputedProperties[_propertyId] = true;        disputedProperties[_propertyId] = true;

        properties[_propertyId].status = PropertyStatus.Disputed;        properties[_propertyId].status = PropertyStatus.Disputed;

        properties[_propertyId].lastUpdated = block.timestamp;        properties[_propertyId].lastUpdated = block.timestamp;



        emit PropertyDisputed(_propertyId, msg.sender);        emit PropertyDisputed(_propertyId, msg.sender);

    }    }



    // Resolve dispute (only admins)    // Resolve dispute (only admins)

    function resolveDispute(uint256 _propertyId, bool _approved) external onlyRole(ADMIN_ROLE) {    function resolveDispute(uint256 _propertyId, bool _approved) external onlyRole(ADMIN_ROLE) {

        require(disputedProperties[_propertyId], "Property not disputed");        require(disputedProperties[_propertyId], "Property not disputed");



        disputedProperties[_propertyId] = false;        disputedProperties[_propertyId] = false;



        if (_approved) {        if (_approved) {

            properties[_propertyId].status = PropertyStatus.Registered;            properties[_propertyId].status = PropertyStatus.Registered;

        } else {        } else {

            properties[_propertyId].status = PropertyStatus.Suspended;            properties[_propertyId].status = PropertyStatus.Suspended;

        }        }



        properties[_propertyId].lastUpdated = block.timestamp;        properties[_propertyId].lastUpdated = block.timestamp;



        emit DisputeResolved(_propertyId, _approved);        emit DisputeResolved(_propertyId, _approved);

    }    }



    // Update property value    // Update property value

    function updatePropertyValue(uint256 _propertyId, uint256 _newValue)    function updatePropertyValue(uint256 _propertyId, uint256 _newValue)

        external        external

        propertyExists(_propertyId)        propertyExists(_propertyId)

        onlyPropertyOwner(_propertyId)        onlyPropertyOwner(_propertyId)

        notDisputed(_propertyId)        notDisputed(_propertyId)

    {    {

        properties[_propertyId].value = _newValue;        properties[_propertyId].value = _newValue;

        properties[_propertyId].lastUpdated = block.timestamp;        properties[_propertyId].lastUpdated = block.timestamp;

    }    }



    // Get property details    // Get property details

    function getProperty(uint256 _propertyId) external view returns (Property memory) {    function getProperty(uint256 _propertyId) external view returns (Property memory) {

        require(properties[_propertyId].id != 0, "Property does not exist");        require(properties[_propertyId].id != 0, "Property does not exist");

        return properties[_propertyId];        return properties[_propertyId];

    }    }



    // Get owner properties    // Get owner properties

    function getOwnerProperties(address _owner) external view returns (uint256[] memory) {    function getOwnerProperties(address _owner) external view returns (uint256[] memory) {

        return ownerProperties[_owner];        return ownerProperties[_owner];

    }    }



    // Get transfer requests for a property    // Get transfer requests for a property

    function getTransferRequests(uint256 _propertyId) external view returns (TransferRequest[] memory) {    function getTransferRequests(uint256 _propertyId) external view returns (TransferRequest[] memory) {

        return transferRequests[_propertyId];        return transferRequests[_propertyId];

    }    }



    // Internal function to remove property from owner's list    // Internal function to remove property from owner's list

    function _removePropertyFromOwner(address _owner, uint256 _propertyId) internal {    function _removePropertyFromOwner(address _owner, uint256 _propertyId) internal {

        uint256[] storage ownerProps = ownerProperties[_owner];        uint256[] storage ownerProps = ownerProperties[_owner];

        for (uint256 i = 0; i < ownerProps.length; i++) {        for (uint256 i = 0; i < ownerProps.length; i++) {

            if (ownerProps[i] == _propertyId) {            if (ownerProps[i] == _propertyId) {

                ownerProps[i] = ownerProps[ownerProps.length - 1];                ownerProps[i] = ownerProps[ownerProps.length - 1];

                ownerProps.pop();                ownerProps.pop();

                break;                break;

            }            }

        }        }

    }    }



    // Admin functions    // Admin functions

    function pause() external onlyRole(ADMIN_ROLE) {    function pause() external onlyRole(ADMIN_ROLE) {

        _pause();        _pause();

    }    }



    function unpause() external onlyRole(ADMIN_ROLE) {    function unpause() external onlyRole(ADMIN_ROLE) {

        _unpause();        _unpause();

    }    }



    function emergencyWithdraw() external onlyRole(ADMIN_ROLE) {    function emergencyWithdraw() external onlyRole(ADMIN_ROLE) {

        payable(msg.sender).transfer(address(this).balance);        payable(msg.sender).transfer(address(this).balance);

    }    }



    // Fallback function to receive ether    // Fallback function to receive ether

    receive() external payable {}    receive() external payable {}

}}

        uint256 area; // in square meters        bool isVerified;

        string location;        uint256 lastUpdated;

        uint256 value; // in wei        string metadataURI; // IPFS URI for additional property data

        PropertyStatus status;    }

        uint256 registeredAt;

        uint256 lastUpdated;    struct TransferHistory {

        string ipfsHash; // IPFS hash for documents        address from;

        address surveyor;        address to;

        bool isVerified;        uint256 timestamp;

    }        uint256 price;

        string documentURI; // IPFS URI for transfer documents

    struct TransferRequest {    }

        uint256 propertyId;

        address from;    // Property ID => Property Details

        address to;    mapping(string => PropertyDetails) public properties;

        uint256 price;

        uint256 requestedAt;    // Property ID => Transfer History Array

        TransferStatus status;    mapping(string => TransferHistory[]) public propertyHistory;

        string transferDocumentHash;

    }    // Owner => Property IDs

    mapping(address => string[]) public ownerProperties;

    enum PropertyStatus {

        Pending,    // Property ID => Disputed status

        Registered,    mapping(string => bool) public disputedProperties;

        Disputed,

        Transferred,    event PropertyRegistered(

        Suspended        string propertyId,

    }        address owner,

        uint256 timestamp

    enum TransferStatus {    );

        Pending,    event PropertyTransferred(

        Approved,        string propertyId,

        Rejected,        address from,

        Completed        address to,

    }        uint256 timestamp

    );

    // State variables    event PropertyVerified(

    mapping(uint256 => Property) public properties;        string propertyId,

    mapping(uint256 => TransferRequest[]) public transferRequests;        address verifier,

    mapping(address => uint256[]) public ownerProperties;        uint256 timestamp

    mapping(uint256 => bool) public disputedProperties;    );

    event PropertyDisputed(

    uint256 public nextPropertyId = 1;        string propertyId,

    uint256 public totalProperties;        address disputedBy,

        uint256 timestamp

    // Events    );

    event PropertyRegistered(uint256 indexed propertyId, address indexed owner, string geoJson);    event PropertyValueUpdated(

    event PropertyVerified(uint256 indexed propertyId, address indexed verifier);        string propertyId,

    event TransferRequested(uint256 indexed propertyId, address indexed from, address indexed to);        uint256 newValue,

    event TransferApproved(uint256 indexed propertyId, address indexed from, address indexed to);        uint256 timestamp

    event PropertyDisputed(uint256 indexed propertyId, address indexed disputedBy);    );

    event DisputeResolved(uint256 indexed propertyId, bool approved);    event MetadataUpdated(

        string propertyId,

    constructor() {        string metadataURI,

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);        uint256 timestamp

        _grantRole(ADMIN_ROLE, msg.sender);    );

    }

    constructor() {

    // Modifiers        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);

    modifier onlyPropertyOwner(uint256 _propertyId) {        _grantRole(ADMIN_ROLE, msg.sender);

        require(properties[_propertyId].owner == msg.sender, "Not property owner");    }

        _;

    }    function registerProperty(

        string memory propertyId,

    modifier propertyExists(uint256 _propertyId) {        uint256 area,

        require(properties[_propertyId].id != 0, "Property does not exist");        string memory location,

        _;        uint256 value,

    }        string memory metadataURI

    ) public whenNotPaused {

    modifier notDisputed(uint256 _propertyId) {        require(

        require(!disputedProperties[_propertyId], "Property is disputed");            properties[propertyId].owner == address(0),

        _;            "Property already registered"

    }        );



    // Register a new property        properties[propertyId] = PropertyDetails({

    function registerProperty(            propertyId: propertyId,

        string calldata _geoJson,            owner: msg.sender,

        uint256 _area,            area: area,

        string calldata _location,            location: location,

        uint256 _value,            value: value,

        string calldata _ipfsHash            isVerified: false,

    ) external whenNotPaused returns (uint256) {            lastUpdated: block.timestamp,

        require(bytes(_geoJson).length > 0, "GeoJSON cannot be empty");            metadataURI: metadataURI

        require(_area > 0, "Area must be greater than 0");        });



        uint256 propertyId = nextPropertyId++;        ownerProperties[msg.sender].push(propertyId);



        properties[propertyId] = Property({        emit PropertyRegistered(propertyId, msg.sender, block.timestamp);

            id: propertyId,    }

            owner: msg.sender,

            geoJson: _geoJson,    function transferProperty(

            area: _area,        string memory propertyId,

            location: _location,        address newOwner,

            value: _value,        uint256 price,

            status: PropertyStatus.Registered,        string memory documentURI

            registeredAt: block.timestamp,    ) public whenNotPaused {

            lastUpdated: block.timestamp,        require(

            ipfsHash: _ipfsHash,            properties[propertyId].owner == msg.sender,

            surveyor: address(0),            "Not the property owner"

            isVerified: false        );

        });        require(!disputedProperties[propertyId], "Property is disputed");

        require(properties[propertyId].isVerified, "Property not verified");

        ownerProperties[msg.sender].push(propertyId);

        totalProperties++;        address previousOwner = properties[propertyId].owner;

        properties[propertyId].owner = newOwner;

        emit PropertyRegistered(propertyId, msg.sender, _geoJson);        properties[propertyId].lastUpdated = block.timestamp;

        return propertyId;

    }        // Update owner mappings

        removeFromOwnerProperties(previousOwner, propertyId);

    // Verify property (only verifiers)        ownerProperties[newOwner].push(propertyId);

    function verifyProperty(uint256 _propertyId) external onlyRole(VERIFIER_ROLE) propertyExists(_propertyId) {

        Property storage property = properties[_propertyId];        // Record transfer history

        require(!property.isVerified, "Property already verified");        propertyHistory[propertyId].push(

            TransferHistory({

        property.isVerified = true;                from: previousOwner,

        property.lastUpdated = block.timestamp;                to: newOwner,

                timestamp: block.timestamp,

        emit PropertyVerified(_propertyId, msg.sender);                price: price,

    }                documentURI: documentURI

            })

    // Request property transfer        );

    function requestTransfer(

        uint256 _propertyId,        emit PropertyTransferred(

        address _to,            propertyId,

        uint256 _price,            previousOwner,

        string calldata _transferDocumentHash            newOwner,

    ) external propertyExists(_propertyId) onlyPropertyOwner(_propertyId) notDisputed(_propertyId) nonReentrant {            block.timestamp

        require(_to != address(0), "Invalid recipient address");        );

        require(_to != msg.sender, "Cannot transfer to self");    }



        Property storage property = properties[_propertyId];    function verifyProperty(

        require(property.isVerified, "Property must be verified before transfer");        string memory propertyId

    ) public whenNotPaused onlyRole(VERIFIER_ROLE) {

        TransferRequest memory request = TransferRequest({        require(

            propertyId: _propertyId,            !properties[propertyId].isVerified,

            from: msg.sender,            "Property already verified"

            to: _to,        );

            price: _price,        properties[propertyId].isVerified = true;

            requestedAt: block.timestamp,        properties[propertyId].lastUpdated = block.timestamp;

            status: TransferStatus.Pending,        emit PropertyVerified(propertyId, msg.sender, block.timestamp);

            transferDocumentHash: _transferDocumentHash    }

        });

    function updatePropertyValue(

        transferRequests[_propertyId].push(request);        string memory propertyId,

        uint256 newValue

        emit TransferRequested(_propertyId, msg.sender, _to);    ) public whenNotPaused {

    }        require(

            properties[propertyId].owner == msg.sender ||

    // Approve transfer (only admins)                hasRole(ADMIN_ROLE, msg.sender),

    function approveTransfer(uint256 _propertyId, uint256 _requestIndex) external onlyRole(ADMIN_ROLE) nonReentrant {            "Not authorized"

        require(_requestIndex < transferRequests[_propertyId].length, "Invalid request index");        );

        properties[propertyId].value = newValue;

        TransferRequest storage request = transferRequests[_propertyId][_requestIndex];        properties[propertyId].lastUpdated = block.timestamp;

        require(request.status == TransferStatus.Pending, "Request not pending");        emit PropertyValueUpdated(propertyId, newValue, block.timestamp);

    }

        Property storage property = properties[_propertyId];

    function updateMetadata(

        // Update property ownership        string memory propertyId,

        address previousOwner = property.owner;        string memory metadataURI

        property.owner = request.to;    ) public whenNotPaused {

        property.value = request.price;        require(

        property.lastUpdated = block.timestamp;            properties[propertyId].owner == msg.sender ||

        property.status = PropertyStatus.Transferred;                hasRole(ADMIN_ROLE, msg.sender),

            "Not authorized"

        // Update owner mappings        );

        _removePropertyFromOwner(previousOwner, _propertyId);        properties[propertyId].metadataURI = metadataURI;

        ownerProperties[request.to].push(_propertyId);        properties[propertyId].lastUpdated = block.timestamp;

        emit MetadataUpdated(propertyId, metadataURI, block.timestamp);

        request.status = TransferStatus.Completed;    }



        emit TransferApproved(_propertyId, previousOwner, request.to);    function raiseDispute(string memory propertyId) public whenNotPaused {

    }        require(

            properties[propertyId].owner != address(0),

    // Dispute property            "Property doesn't exist"

    function disputeProperty(uint256 _propertyId, string calldata _reason) external propertyExists(_propertyId) {        );

        require(!disputedProperties[_propertyId], "Property already disputed");        require(!disputedProperties[propertyId], "Property already disputed");

        disputedProperties[propertyId] = true;

        disputedProperties[_propertyId] = true;        emit PropertyDisputed(propertyId, msg.sender, block.timestamp);

        properties[_propertyId].status = PropertyStatus.Disputed;    }

        properties[_propertyId].lastUpdated = block.timestamp;

    function resolveDispute(

        emit PropertyDisputed(_propertyId, msg.sender);        string memory propertyId

    }    ) public whenNotPaused onlyRole(ADMIN_ROLE) {

        require(disputedProperties[propertyId], "Property not disputed");

    // Resolve dispute (only admins)        disputedProperties[propertyId] = false;

    function resolveDispute(uint256 _propertyId, bool _approved) external onlyRole(ADMIN_ROLE) {    }

        require(disputedProperties[_propertyId], "Property not disputed");

    function getPropertyHistory(

        disputedProperties[_propertyId] = false;        string memory propertyId

    ) public view returns (TransferHistory[] memory) {

        if (_approved) {        return propertyHistory[propertyId];

            properties[_propertyId].status = PropertyStatus.Registered;    }

        } else {

            properties[_propertyId].status = PropertyStatus.Suspended;    function getOwnerProperties(

        }        address owner

    ) public view returns (string[] memory) {

        properties[_propertyId].lastUpdated = block.timestamp;        return ownerProperties[owner];

    }

        emit DisputeResolved(_propertyId, _approved);

    }    function removeFromOwnerProperties(

        address owner,

    // Update property value        string memory propertyId

    function updatePropertyValue(uint256 _propertyId, uint256 _newValue)    ) internal {

        external        string[] storage ownerProps = ownerProperties[owner];

        propertyExists(_propertyId)        for (uint i = 0; i < ownerProps.length; i++) {

        onlyPropertyOwner(_propertyId)            if (

        notDisputed(_propertyId)                keccak256(bytes(ownerProps[i])) == keccak256(bytes(propertyId))

    {            ) {

        properties[_propertyId].value = _newValue;                ownerProps[i] = ownerProps[ownerProps.length - 1];

        properties[_propertyId].lastUpdated = block.timestamp;                ownerProps.pop();

    }                break;

            }

    // Get property details        }

    function getProperty(uint256 _propertyId) external view returns (Property memory) {    }

        require(properties[_propertyId].id != 0, "Property does not exist");

        return properties[_propertyId];    function pause() public onlyRole(ADMIN_ROLE) {

    }        _pause();

    }

    // Get owner properties

    function getOwnerProperties(address _owner) external view returns (uint256[] memory) {    function unpause() public onlyRole(ADMIN_ROLE) {

        return ownerProperties[_owner];        _unpause();

    }    }

}

    // Get transfer requests for a property
    function getTransferRequests(uint256 _propertyId) external view returns (TransferRequest[] memory) {
        return transferRequests[_propertyId];
    }

    // Internal function to remove property from owner's list
    function _removePropertyFromOwner(address _owner, uint256 _propertyId) internal {
        uint256[] storage ownerProps = ownerProperties[_owner];
        for (uint256 i = 0; i < ownerProps.length; i++) {
            if (ownerProps[i] == _propertyId) {
                ownerProps[i] = ownerProps[ownerProps.length - 1];
                ownerProps.pop();
                break;
            }
        }
    }

    // Admin functions
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    function emergencyWithdraw() external onlyRole(ADMIN_ROLE) {
        payable(msg.sender).transfer(address(this).balance);
    }

    // Fallback function to receive ether
    receive() external payable {}
}</content>
<parameter name="filePath">/home/srihariram/projects/buyblock/contracts/contracts/LandRegistry.sol