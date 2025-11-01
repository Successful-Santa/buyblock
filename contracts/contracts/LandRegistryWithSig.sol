// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

contract LandRegistryWithSig is AccessControl, EIP712 {
    using ECDSA for bytes32;

    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");

    struct Parcel {
        string geoCid;
        bytes32 docHash;
        address owner;
        uint256 registeredAt;
    }

    struct TransferRequest {
        uint256 id;
        uint256 parcelId;
        address from;
        address to;
        uint256 createdAt;
        bool executed;
    }

    Parcel[] private parcels;
    TransferRequest[] private requests;

    // owner => nonce for signed transfers
    mapping(address => uint256) private _nonces;

    event ParcelRegistered(uint256 indexed parcelId, string geoCid, bytes32 docHash, address indexed owner);
    event TransferRequested(uint256 indexed requestId, uint256 indexed parcelId, address indexed from, address to);
    event TransferApproved(uint256 indexed requestId, uint256 indexed parcelId, address indexed from, address to);
    event OwnershipTransferred(uint256 indexed parcelId, address indexed previousOwner, address indexed newOwner);
    event SignedTransferExecuted(uint256 indexed parcelId, address indexed from, address indexed to, uint256 nonce);

    bytes32 private constant _TRANSFER_TYPEHASH = keccak256("Transfer(uint256 parcelId,address to,uint256 nonce,uint256 deadline)");

    constructor(address registrar) EIP712("LandRegistry", "1") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(REGISTRAR_ROLE, registrar);
    }

    modifier onlyRegistrar() {
        require(hasRole(REGISTRAR_ROLE, msg.sender), "Not registrar");
        _;
    }

    function registerParcel(string calldata geoCid, bytes32 docHash, address initialOwner) external onlyRegistrar returns (uint256) {
        parcels.push(Parcel({geoCid: geoCid, docHash: docHash, owner: initialOwner, registeredAt: block.timestamp}));
        uint256 id = parcels.length - 1;
        emit ParcelRegistered(id, geoCid, docHash, initialOwner);
        return id;
    }

    function requestTransfer(uint256 parcelId, address to) external returns (uint256) {
        require(parcelId < parcels.length, "Invalid parcel");
        Parcel storage p = parcels[parcelId];
        require(msg.sender == p.owner, "Not owner");
        uint256 id = requests.length;
        requests.push(TransferRequest({id: id, parcelId: parcelId, from: msg.sender, to: to, createdAt: block.timestamp, executed: false}));
        emit TransferRequested(id, parcelId, msg.sender, to);
        return id;
    }

    function approveTransfer(uint256 requestId) external onlyRegistrar {
        require(requestId < requests.length, "Invalid request");
        TransferRequest storage r = requests[requestId];
        require(!r.executed, "Already executed");
        Parcel storage p = parcels[r.parcelId];
        address prev = p.owner;
        p.owner = r.to;
        r.executed = true;
        emit TransferApproved(requestId, r.parcelId, prev, r.to);
        emit OwnershipTransferred(r.parcelId, prev, r.to);
    }

    function getParcel(uint256 parcelId) external view returns (string memory geoCid, bytes32 docHash, address owner, uint256 registeredAt) {
        require(parcelId < parcels.length, "Invalid parcel");
        Parcel storage p = parcels[parcelId];
        return (p.geoCid, p.docHash, p.owner, p.registeredAt);
    }

    function getNonce(address owner) external view returns (uint256) {
        return _nonces[owner];
    }

    // execute signed transfer — callable only by registrar
    function executeTransferWithSig(uint256 parcelId, address to, uint256 nonce, uint256 deadline, bytes calldata signature) external onlyRegistrar {
        require(block.timestamp <= deadline, "Signature expired");
        require(parcelId < parcels.length, "Invalid parcel");
        Parcel storage p = parcels[parcelId];
        address owner = p.owner;
        require(nonce == _nonces[owner], "Invalid nonce");

        bytes32 structHash = keccak256(abi.encode(_TRANSFER_TYPEHASH, parcelId, to, nonce, deadline));
        bytes32 digest = _hashTypedDataV4(structHash);
        address signer = ECDSA.recover(digest, signature);
        require(signer == owner, "Invalid signature");

        // execute
        p.owner = to;
        _nonces[owner]++;

        emit SignedTransferExecuted(parcelId, owner, to, nonce);
        emit OwnershipTransferred(parcelId, owner, to);
    }

    // Ownership history is kept off-chain by indexer; provide helper that scans requests (not optimal) — simple implementation
    function totalParcels() external view returns (uint256) {
        return parcels.length;
    }

    function totalRequests() external view returns (uint256) {
        return requests.length;
    }
}
