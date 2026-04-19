// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title SupplyChain
 * @notice Immutable ledger for Food Supply Chain traceability.
 *         Stores cryptographic hashes of off-chain business records at each lifecycle stage.
 * @dev This contract is intentionally lightweight.
 *      All business logic resides in the ASP.NET Core backend.
 *      This contract only provides tamper-proof hash anchoring and event emission.
 *      Only the deploying address (backend wallet) can call state-changing functions.
 */
contract SupplyChain {

    // ── Access Control ─────────────────────────────────────────────────────
    /// @dev The wallet address that deployed this contract (the backend service wallet)
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    /// @dev Restricts a function so only the owner (backend wallet) can call it
    modifier onlyOwner() {
        require(msg.sender == owner, "SupplyChain: Not authorized. Only the backend wallet can call this.");
        _;
    }

    // ── Data Structures ────────────────────────────────────────────────────
    struct Product {
        string batchId;
        string name;
        address farmer;
        address currentOwner;
        uint256 timestamp;
        string originLocationHash;
        string productDataHash;
        string status;
        uint256[] timestamps;
        string[] transactionHashes; // Stores SHA-256 hashes of the business data/records
    }

    mapping(string => Product) private products;
    string[] private allBatchIds;

    // Events for real-time tracking
    event ProductAdded(string indexed batchId, address indexed owner, string dataHash);
    event ProductProcessed(string indexed batchId, address indexed owner, string status, string dataHash);
    event ShipmentUpdated(string indexed batchId, address indexed owner, string status, string dataHash);
    event ProductReceived(string indexed batchId, address indexed owner, string status, string dataHash);

    /**
     * @notice Initialize a new product batch on the blockchain.
     * @dev Only callable by the owner (backend wallet). Prevents unauthorized product creation.
     */
    function addProduct(
        string memory _batchId, 
        string memory _name, 
        address _farmer, 
        uint256 _timestamp, 
        string memory _locationHash, 
        string memory _productDataHash
    ) public onlyOwner {
        require(bytes(products[_batchId].batchId).length == 0, "Batch ID already exists");

        Product storage newProduct = products[_batchId];
        newProduct.batchId = _batchId;
        newProduct.name = _name;
        newProduct.farmer = _farmer;
        newProduct.currentOwner = msg.sender;
        newProduct.timestamp = _timestamp;
        newProduct.originLocationHash = _locationHash;
        newProduct.productDataHash = _productDataHash;
        newProduct.status = "Created";
        newProduct.timestamps.push(block.timestamp);
        newProduct.transactionHashes.push(_productDataHash);

        allBatchIds.push(_batchId);

        emit ProductAdded(_batchId, msg.sender, _productDataHash);
    }

    /**
     * @notice Shortcut to update product status without extra hashes.
     * @dev Synchronized with contract-config.js ABI.
     */
    function updateStatus(string memory _batchId, string memory _status) public onlyOwner {
        require(bytes(products[_batchId].batchId).length != 0, "Product does not exist");
        products[_batchId].status = _status;
        products[_batchId].currentOwner = msg.sender;
        products[_batchId].timestamps.push(block.timestamp);
    }

    /**
     * @notice Update product status during processing.
     * @dev Updated to match the ABI signature: (batchId, status, qualityHash, timestamp)
     */
    function processProduct(string memory _batchId, string memory _status, string memory _qualityHash, uint256 _timestamp) public onlyOwner {
        require(bytes(products[_batchId].batchId).length != 0, "Product does not exist");
        
        Product storage p = products[_batchId];
        p.status = _status;
        p.currentOwner = msg.sender;
        p.timestamps.push(_timestamp > 0 ? _timestamp : block.timestamp);
        p.transactionHashes.push(_qualityHash);

        emit ProductProcessed(_batchId, msg.sender, _status, _qualityHash);
    }

    /**
     * @notice Record logistics and shipment updates.
     */
    function updateShipment(string memory _batchId, string memory _status, string memory _dataHash) public onlyOwner {
        require(bytes(products[_batchId].batchId).length != 0, "Product does not exist");

        Product storage p = products[_batchId];
        p.status = _status;
        p.currentOwner = msg.sender;
        p.timestamps.push(block.timestamp);
        p.transactionHashes.push(_dataHash);

        emit ShipmentUpdated(_batchId, msg.sender, _status, _dataHash);
    }

    /**
     * @notice Finalize reception of product by retailer.
     */
    function receiveProduct(string memory _batchId, string memory _status, string memory _dataHash) public onlyOwner {
        require(bytes(products[_batchId].batchId).length != 0, "Product does not exist");

        Product storage p = products[_batchId];
        p.status = _status;
        p.currentOwner = msg.sender;
        p.timestamps.push(block.timestamp);
        p.transactionHashes.push(_dataHash);

        emit ProductReceived(_batchId, msg.sender, _status, _dataHash);
    }

    // View Functions

    /**
     * @notice Fetch full product details. Signature matched to contract-config.js.
     */
    function getProduct(string memory _batchId) public view returns (
        string memory batchId,
        string memory name,
        address farmer,
        uint256 timestamp,
        string memory locationHash,
        string memory productDataHash,
        string memory status
    ) {
        Product storage p = products[_batchId];
        return (p.batchId, p.name, p.farmer, p.timestamp, p.originLocationHash, p.productDataHash, p.status);
    }

    // Secondary function for history fetching
    function getProductHistory(string memory _batchId) public view returns (
        uint256[] memory timestamps,
        string[] memory transactionHashes
    ) {
        Product storage p = products[_batchId];
        return (p.timestamps, p.transactionHashes);
    }

    function getAllBatchIds() public view returns (string[] memory) {
        return allBatchIds;
    }
}
