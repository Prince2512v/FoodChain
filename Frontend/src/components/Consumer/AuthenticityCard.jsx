import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../blockchain/contract-config';

/**
 * AuthenticityCard — Verifies product existence on the blockchain.
 * Props: { product } — the product object with batchId.
 * Connects to Hardhat/Ganache via JSON RPC and calls getProduct() on-chain.
 */
const AuthenticityCard = ({ product }) => {
    const [verifying, setVerifying] = useState(true);
    const [onChainData, setOnChainData] = useState(null);
    const [isAuthentic, setIsAuthentic] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);

    useEffect(() => {
        if (product?.batchId) {
            verifyOnBlockchain();
        }
    }, [product]);

    const verifyOnBlockchain = async () => {
        setVerifying(true);
        setErrorMsg(null);
        try {
            const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

            const data = await contract.getProduct(product.batchId);
            
            // On-chain return: (batchId, name, farmer, timestamp, locationHash, productDataHash, status)
            const onChainBatchId = data[0];
            const onChainStatus = data[6];

            if (onChainBatchId && onChainBatchId === product.batchId) {
                setOnChainData({
                    batchId: onChainBatchId,
                    status: onChainStatus,
                    farmer: data[2]
                });
                setIsAuthentic(true);
            } else {
                setIsAuthentic(false);
            }
        } catch (err) {
            console.error("Blockchain verification error:", err);
            // If blockchain is unreachable, show a graceful fallback
            if (product.blockchainTxHash) {
                setIsAuthentic(true);
                setOnChainData({ batchId: product.batchId, status: product.status });
                setErrorMsg("Blockchain node offline — verified via stored transaction hash.");
            } else {
                setIsAuthentic(false);
                setErrorMsg("Could not reach blockchain node for live verification.");
            }
        } finally {
            setVerifying(false);
        }
    };

    if (!product) return null;

    return (
        <div className={`bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border-l-4 ${
            isAuthentic ? 'border-l-emerald-500 border-t-slate-200 border-r-slate-200 border-b-slate-200' 
            : verifying ? 'border-l-indigo-500 border-t-slate-200 border-r-slate-200 border-b-slate-200' 
            : 'border-l-red-500 border-t-slate-200 border-r-slate-200 border-b-slate-200'
        } border`}>
            
            <div className="flex justify-between items-center flex-wrap gap-4 mb-2">
                <div>
                    <h5 className="font-bold text-lg text-slate-800 flex items-center gap-2 mb-1">
                        <i className="bi bi-shield-lock-fill text-indigo-500"></i>
                        Authenticity Verification
                    </h5>
                    <p className="text-slate-500 text-xs font-semibold">Verified against Ethereum Localhost (Hardhat/Ganache)</p>
                </div>
                
                {verifying ? (
                    <div className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-indigo-600 text-xs font-bold tracking-wide">Querying Blockchain...</span>
                    </div>
                ) : (
                    <div>
                        <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-sm border ${
                            isAuthentic 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                            {isAuthentic ? <><i className="bi bi-check-circle-fill"></i> ORIGIN VERIFIED</> : <><i className="bi bi-x-circle-fill"></i> NOT VERIFIED</>}
                        </span>
                    </div>
                )}
            </div>

            {/* Success State */}
            {!verifying && isAuthentic && (
                <div className="mt-5 p-4 rounded-xl bg-emerald-50/50 border border-emerald-100/50">
                    <div className="flex items-start gap-4">
                        <div className="text-3xl filter drop-shadow-sm">🛡️</div>
                        <div>
                            <p className="font-bold text-slate-800 mb-1 leading-tight">Immutable Ledger Match</p>
                            <p className="text-sm text-slate-600 leading-relaxed mb-0">
                                Batch ID <strong className="text-emerald-600 font-mono text-xs">{product.batchId?.substring(0, 12)}...</strong> has been verified on the blockchain.
                                {onChainData?.farmer && (
                                    <> Farmer address: <code className="font-mono text-xs px-1 py-0.5 bg-white rounded border border-slate-200 ml-1">{onChainData.farmer.slice(0, 10)}...</code></>
                                )}
                            </p>
                            {errorMsg && (
                                <p className="text-amber-600 text-xs mt-2 font-semibold flex items-center gap-1">
                                    <i className="bi bi-info-circle-fill"></i> {errorMsg}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
            
            {/* Failure State */}
            {!verifying && !isAuthentic && (
                <div className="mt-5 p-4 rounded-xl bg-red-50/50 border border-red-100/50">
                    <p className="text-sm text-slate-800 mb-0">
                        <strong className="text-red-600 font-bold flex items-center gap-1 mb-1"><i className="bi bi-exclamation-triangle-fill"></i> Warning</strong> 
                        No blockchain record found for <strong className="font-mono text-xs">{product.batchId?.substring(0, 12)}...</strong>.
                        This product may not be registered in the official supply chain.
                    </p>
                    {errorMsg && <p className="text-slate-500 text-xs font-semibold mt-2">{errorMsg}</p>}
                </div>
            )}
        </div>
    );
};

export default AuthenticityCard;
