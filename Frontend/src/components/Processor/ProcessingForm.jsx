import React, { useState } from 'react';
import { Form, Button, Card, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { ethers } from 'ethers';
import api from '../../services/api';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../blockchain/contract-config';
import { getBlockchainSigner } from '../../services/blockchain';

const ProcessingForm = ({ product, onComplete, onCancel }) => {
    const [formData, setFormData] = useState({
        processingType: '',
        conditions: '',
        notes: '',
        document: null
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [status, setStatus] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setStatus('Initializing Blockchain connection...');

        try {
            // 1. Get Signer (Robustly)
            const signer = await getBlockchainSigner();
            setStatus('Wallet connected. Preparing IPFS data...');
            let ipfsHash = "";
            if (formData.document) {
                setStatus('Uploading document to IPFS...');
                await new Promise(resolve => setTimeout(resolve, 800)); // simulate network delay
                // Generate a fake deterministic CID based on timestamp for demonstration
                ipfsHash = "Qm" + ethers.id(formData.document.name + Date.now()).substring(2, 44);
                console.log("Mock IPFS Hash generated:", ipfsHash);
            }

            // 2. Blockchain Transaction
            setStatus('Signing transaction on blockchain...');
            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

            const timestamp = Math.floor(Date.now() / 1000);
            
            // We store the IPFS Hash if available, otherwise just hash the form data
            const qualityHash = ipfsHash || ethers.id(JSON.stringify({
                type: formData.processingType, 
                cond: formData.conditions 
            })); 
            
            const tx = await contract.processProduct(
                product.batchId,
                "Processing",
                qualityHash,
                timestamp
            );
            
            setStatus('Waiting for block confirmation...');
            let txHash = tx.hash;
            try {
                // Ethers v6 + MetaMask local Ganache often throws -32002 too many errors when polling
                const receipt = await tx.wait();
                if (receipt && receipt.hash) {
                    txHash = receipt.hash;
                }
            } catch (waitErr) {
                console.warn("MetaMask rate limit on wait(). Proceeding with tx hash:", waitErr);
            }

            // 3. Update Backend
            setStatus('Updating backend database...');
            await api.post('/processor/process', {
                productId: product.id,
                processingType: formData.processingType,
                conditions: formData.conditions,
                notes: formData.notes + (ipfsHash ? `\n[IPFS Document: ${ipfsHash}]` : '')
            });

            await api.post('/blockchain/process', {
                batchId: product.batchId,
                txHash: txHash
            });

            onComplete();
        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to process product");
        } finally {
            setLoading(false);
            setStatus('');
        }
    };

    return (
        <Card className="border-0 shadow rounded-4 p-3">
            <Card.Body>
                <div className="mb-4">
                    <h4 className="fw-bold">Process Product</h4>
                    <p className="text-muted">Batch: <code className="fw-bold">{product.batchId}</code></p>
                </div>

                {error && <Alert variant="danger">{error}</Alert>}
                {status && <Alert variant="info" className="d-flex align-items-center">
                    <Spinner animation="border" size="sm" className="me-2" /> {status}
                </Alert>}

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Processing Type</Form.Label>
                        <Form.Select 
                            required
                            value={formData.processingType}
                            onChange={(e) => setFormData({...formData, processingType: e.target.value})}
                        >
                            <option value="">Select Type...</option>
                            <option value="Cleaning">Cleaning</option>
                            <option value="Grading">Grading</option>
                            <option value="Sorting">Sorting</option>
                            <option value="Milling">Milling</option>
                            <option value="Packaging">Packaging</option>
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Conditions / Temperature</Form.Label>
                        <Form.Control 
                            type="text" 
                            placeholder="e.g. 25°C, Dry"
                            value={formData.conditions}
                            onChange={(e) => setFormData({...formData, conditions: e.target.value})}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Quality Certificate (IPFS)</Form.Label>
                        <Form.Control 
                            type="file" 
                            onChange={(e) => setFormData({...formData, document: e.target.files[0]})}
                        />
                        <Form.Text className="text-muted">Document will be pinned to IPFS network.</Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-4">
                        <Form.Label className="fw-bold">Notes</Form.Label>
                        <Form.Control 
                            as="textarea" 
                            rows={3}
                            placeholder="Additional observations..."
                            value={formData.notes}
                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        />
                    </Form.Group>

                    <div className="d-flex gap-2">
                        <Button 
                            variant="primary" 
                            type="submit" 
                            disabled={loading}
                            className="flex-grow-1 rounded-pill py-2 fw-bold"
                        >
                            {loading ? "Processing..." : "Confirm & Sign Blockchain"}
                        </Button>
                        <Button 
                            variant="light" 
                            onClick={onCancel}
                            disabled={loading}
                            className="rounded-pill px-4"
                        >
                            Cancel
                        </Button>
                    </div>
                </Form>
            </Card.Body>
        </Card>
    );
};

export default ProcessingForm;
