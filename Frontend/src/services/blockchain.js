import { ethers } from 'ethers';

/**
 * Robust utility to get a signer from MetaMask, handling common errors 
 * like -32002 (Request already pending).
 */
export const getBlockchainSigner = async () => {
    // 0. Check for Simulation Mode (Demo fallback)
    if (localStorage.getItem('SIMULATION_MODE') === 'true') {
        console.warn("BLOCKCHAIN: Running in Simulation Mode. Using mock signer.");
        return {
            getAddress: async () => "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // Valid Hex (Hardhat Account #1)
            signMessage: async (msg) => `MOCK_TX_${Math.random().toString(36).substr(2, 9)}`,
            sendTransaction: async (tx) => ({ 
                hash: `MOCK_TX_HASH_${Date.now()}`,
                wait: async () => ({ status: 1 })
            }),
            // Compatibility with Ethers v6 standard methods
            provider: {
                waitForTransaction: async () => ({ status: 1 }),
                getTransactionReceipt: async () => ({ status: 1 })
            }
        };
    }

    if (!window.ethereum) {
        throw new Error("MetaMask is not installed. Please install the extension or enable 'Simulator Mode' in the menu to proceed.");
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    
    try {
        // 1. Check if already connected (don't even talk to MetaMask if we have local accounts)
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
            return await provider.getSigner();
        }

        // 2. Try to request connection
        // We use a small timeout check if needed, but standard eth_requestAccounts is okay
        await provider.send("eth_requestAccounts", []);
        return await provider.getSigner();
        
    } catch (error) {
        console.dir(error); // Logs the full error object for debugging in browser console

        // Ethers v6 often wraps the provider error
        const errorCode = error.code ?? error.error?.code ?? error.info?.error?.code;
        const errorMessage = error.message ?? "";

        // Handle "Already pending" error specifically (-32002)
        if (errorCode === -32002 || errorMessage.includes("-32002") || errorMessage.includes("already pending")) {
            throw new Error("BLOCKCHAIN_PENDING: A connection request is already waiting in MetaMask. Please open your MetaMask extension and approve it manually before clicking again.");
        }
        
        // Handle User Rejection (4001)
        if (errorCode === 4001 || errorMessage.includes("user rejected")) {
            throw new Error("Transaction cancelled. You must connect your wallet to authorize this action on the blockchain.");
        }

        throw error;
    }
};
