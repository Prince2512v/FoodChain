export const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Updated from appsettings.json

export const CONTRACT_ABI = [
    {
        "inputs": [
            { "internalType": "string", "name": "_batchId", "type": "string" },
            { "internalType": "string", "name": "_name", "type": "string" },
            { "internalType": "address", "name": "_farmer", "type": "address" },
            { "internalType": "uint256", "name": "_timestamp", "type": "uint256" },
            { "internalType": "string", "name": "_locationHash", "type": "string" },
            { "internalType": "string", "name": "_productDataHash", "type": "string" }
        ],
        "name": "addProduct",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "string", "name": "_batchId", "type": "string" },
            { "internalType": "string", "name": "_status", "type": "string" }
        ],
        "name": "updateStatus",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "string", "name": "_batchId", "type": "string" }
        ],
        "name": "getProduct",
        "outputs": [
            { "internalType": "string", "name": "batchId", "type": "string" },
            { "internalType": "string", "name": "name", "type": "string" },
            { "internalType": "address", "name": "farmer", "type": "address" },
            { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
            { "internalType": "string", "name": "locationHash", "type": "string" },
            { "internalType": "string", "name": "productDataHash", "type": "string" },
            { "internalType": "string", "name": "status", "type": "string" }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "string", "name": "_batchId", "type": "string" },
            { "internalType": "string", "name": "_status", "type": "string" },
            { "internalType": "string", "name": "_qualityHash", "type": "string" },
            { "internalType": "uint256", "name": "_timestamp", "type": "uint256" }
        ],
        "name": "processProduct",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];
