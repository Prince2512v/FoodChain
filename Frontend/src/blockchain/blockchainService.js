import Web3 from 'web3';

const contractABI = [
    { "inputs": [ { "internalType": "uint256", "name": "_id", "type": "uint256" }, { "internalType": "string", "name": "_name", "type": "string" }, { "internalType": "string", "name": "_origin", "type": "string" } ], "name": "addProduct", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [ { "internalType": "uint256", "name": "_id", "type": "uint256" }, { "internalType": "string", "name": "_stage", "type": "string" } ], "name": "updateStage", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [ { "internalType": "uint256", "name": "_id", "type": "uint256" } ], "name": "getProduct", "outputs": [ 
        { "internalType": "uint256", "name": "id", "type": "uint256" }, 
        { "internalType": "string", "name": "name", "type": "string" }, 
        { "internalType": "string", "name": "origin", "type": "string" }, 
        { "internalType": "string", "name": "currentStage", "type": "string" }, 
        { "internalType": "address", "name": "lastUpdatedBy", "type": "address" }, 
        { "internalType": "uint256", "name": "timestamp", "type": "uint256" } 
    ], "stateMutability": "view", "type": "function" }
];

const contractAddress = '0xfe252f5b0c082adb01d57b79e71413c5390ae974';

export const getWeb3 = async () => {
    if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        return web3;
    } else {
        alert("Please install MetaMask!");
        return null;
    }
};

export const getContract = (web3) => {
    return new web3.eth.Contract(contractABI, contractAddress);
};
