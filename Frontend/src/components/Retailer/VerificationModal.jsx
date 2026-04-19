import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../blockchain/contract-config';

const VerificationModal = ({ shipment, onClose, onConfirm }) => {
    const [blockchainData, setBlockchainData] = useState(null);
    const [verifying, setVerifying] = useState(true);
    const [error, setError] = useState(null);
    const [receiptData, setReceiptData] = useState({
        condition: 'Good',
        remarks: ''
    });

    useEffect(() => {
        verifyOnChain();
    }, [shipment]);

    const verifyOnChain = async () => {
        try {
            setVerifying(true);
            const provider = new ethers.BrowserProvider(window.ethereum);
            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
            
            // Get product data from blockchain
            const data = await contract.getProduct(shipment.product.batchId);
            setBlockchainData({
                batchId: data[0],
                name: data[1],
                farmer: data[2],
                status: data[6]
            });
        } catch (err) {
            console.error('Blockchain verification failed:', err);
            setError('Failed to fetch blockchain data. Ensure MetaMask is connected.');
        } finally {
            setVerifying(false);
        }
    };

    const isAuthentic = blockchainData && blockchainData.status === 'Delivered';

    return (
        <div className="ret-modal-overlay bg-dark bg-opacity-50" style={{ position: 'fixed', inset: 0, backdropFilter: 'blur(4px)', display: 'grid', placeItems: 'center', zIndex: 2000 }}>
            <div className="bg-white shadow-lg border p-4 p-md-5 rounded-4 animate__animated animate__zoomIn" style={{ maxWidth: '600px', width: '90%' }}>
                <h2 style={{ color: '#2d3436', fontWeight: 800, marginBottom: '0.5rem' }}>📦 Product Authentication</h2>
                <p className="text-muted small">Verifying integrity on the Ethereum blockchain...</p>

                <div className="bg-light border rounded-4 p-4 my-4">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <span className="text-muted small fw-bold text-uppercase">Integrity Check</span>
                        {verifying ? (
                            <span className="text-primary fw-bold">
                                <span className="spinner-border spinner-border-sm me-2"></span>Checking Chain...
                            </span>
                        ) : isAuthentic ? (
                            <span className="text-success fw-bold">✅ AUTHENTIC</span>
                        ) : (
                            <span className="text-danger fw-bold">❌ TAMPERED / INVALID</span>
                        )}
                    </div>

                    <div className="d-flex flex-column gap-3">
                        <div className="d-flex justify-content-between border-bottom pb-2">
                            <span className="text-muted">Batch ID (DB)</span>
                            <span className="text-dark font-monospace small">{shipment.product.batchId.substring(0, 15)}...</span>
                        </div>
                        <div className="d-flex justify-content-between border-bottom pb-2">
                            <span className="text-muted">Blockchain Status</span>
                            <span className={isAuthentic ? 'text-success fw-bold' : 'text-warning fw-bold'}>{blockchainData?.status || 'Fetching...'}</span>
                        </div>
                        <div className="d-flex justify-content-between pb-2">
                            <span className="text-muted">Manufacturer</span>
                            <span className="text-dark small font-monospace">{blockchainData?.farmer?.substring(0, 20)}...</span>
                        </div>
                    </div>
                </div>

                {isAuthentic && (
                    <div className="animate__animated animate__fadeIn">
                        <div className="mb-3">
                            <label className="form-label fw-bold">Condition Status</label>
                            <select 
                                className="form-select rounded-pill"
                                value={receiptData.condition}
                                onChange={(e) => setReceiptData({...receiptData, condition: e.target.value})}
                            >
                                <option value="Good">Good Condition</option>
                                <option value="Damaged">Damaged / Defective</option>
                                <option value="Rejected">Reject Shipment</option>
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="form-label fw-bold">Remarks / Notes</label>
                            <textarea 
                                className="form-control rounded-4" 
                                rows="2"
                                placeholder="Add observations about quality..."
                                value={receiptData.remarks}
                                onChange={(e) => setReceiptData({...receiptData, remarks: e.target.value})}
                            ></textarea>
                        </div>

                        <button 
                            className="btn btn-warning w-100 rounded-pill py-3 fw-bold text-dark shadow-sm"
                            onClick={() => onConfirm(receiptData)}
                        >
                            Confirm & Sign Reception
                        </button>
                    </div>
                )}

                <button className="btn btn-light w-100 mt-2 rounded-pill py-2" onClick={onClose}>
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default VerificationModal;
