import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { Form, Button, Container, Card, Row, Col, Alert, ProgressBar, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../blockchain/contract-config';
import './AddProduct.css';
import { getBlockchainSigner } from '../services/blockchain';

const AddProduct = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    
    // Form States
    const [formData, setFormData] = useState({
        productName: '',
        cropType: '',
        quantity: '',
        unit: 'kg',
        harvestDate: new Date().toISOString().split('T')[0],
        farmingMethod: 'Conventional',
        fertilizerUsed: '',
        notes: '',
        locationLat: '',
        locationLong: '',
        address: '',
        batchId: crypto.randomUUID(),
        imageUrl: ''
    });

    const [imagePreview, setImagePreview] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
                setFormData(prev => ({ ...prev, imageUrl: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        // Auto-capture location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                setFormData(prev => ({
                    ...prev,
                    locationLat: position.coords.latitude.toString(),
                    locationLong: position.coords.longitude.toString()
                }));
            });
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleBlockchainUpload = async () => {
        try {
            setLoading(true);
            setMessage({ text: 'Initializing wallet connection...', type: 'info' });

            const signer = await getBlockchainSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

            setMessage({ text: 'Signing harvest record on Blockchain...', type: 'info' });

            const timestamp = Math.floor(Date.now() / 1000);
            const locationHash = ethers.id(`${formData.locationLat},${formData.locationLong},${formData.address}`);
            const dataHash = ethers.id(JSON.stringify(formData));

            const tx = await contract.addProduct(
                formData.batchId,
                formData.productName,
                await signer.getAddress(),
                timestamp,
                locationHash,
                dataHash
            );
            
            setMessage({ text: 'Transaction sent! Waiting for block confirmation...', type: 'info' });
            try {
                // Wait for receipt but don't hang indefinitely if provider is laggy
                const receipt = await tx.wait();
                return receipt.hash || tx.hash;
            } catch (waitErr) {
                console.warn("MetaMask/Provider rate limit on wait(). Proceeding with tx hash:", waitErr);
                return tx.hash;
            }
        } catch (error) {
            console.error('Blockchain error:', error);
            
            // Handle specific readable errors from our blockchain utility
            let errorMsg = error.message;
            if (errorMsg.includes("BLOCKCHAIN_PENDING")) {
                errorMsg = "A wallet request is already pending. Please check your MetaMask notification window manually.";
            } else if (errorMsg.includes("ActionRejected")) {
                errorMsg = "Blockchain signature was rejected. You must sign the harvest to proceed.";
            }

            setMessage({ text: `Blockchain Error: ${errorMsg}`, type: 'danger' });
            return null;
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });
        
        // 1. Upload to Blockchain first
        const txHash = await handleBlockchainUpload();
        if (!txHash) {
            // handleBlockchainUpload already sets error message and loading=false
            return;
        }

        // 2. Save to Database
        try {
            // Re-set loading because handleBlockchainUpload might have set it to false
            setLoading(true); 
            setMessage({ text: 'Syncing with Database...', type: 'info' });

            const payload = { 
                ...formData, 
                quantity: parseFloat(formData.quantity) || 0, 
                harvestDate: new Date(formData.harvestDate).toISOString(), // Full ISO format
                blockchainTxHash: txHash 
            };
            
            const response = await api.post('/farmer/product', payload);
            setMessage({ text: 'Product successfully registered on Blockchain and Database!', type: 'success' });
            setTimeout(() => navigate('/dashboard'), 2000);
        } catch (error) {
            console.error('Database sync error details:', error);
            const serverMsg = error.response?.data?.message || error.response?.data || error.message;
            setMessage({ 
                text: `Blockchain success, but Database sync failed. Error: ${typeof serverMsg === 'object' ? JSON.stringify(serverMsg) : serverMsg}`, 
                type: 'warning' 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-product-page">
            <Navbar />
            <Container className="add-product-container">
                <div className="add-product-card">
                    
                    {/* Sidebar */}
                    <div className="add-product-sidebar">
                        <h2 className="add-product-title">
                            <i className="bi bi-shield-check"></i>
                            Farmer Portal
                        </h2>
                        
                        <div className={`step-item ${step === 1 ? 'active' : step > 1 ? 'completed' : ''}`}>
                            <div className="step-circle">
                                {step > 1 ? <i className="bi bi-check-lg"></i> : '01'}
                            </div>
                            <span className="step-label">Product Identity</span>
                        </div>
                        <div className={`step-item ${step === 2 ? 'active' : step > 2 ? 'completed' : ''}`}>
                            <div className="step-circle">
                                {step > 2 ? <i className="bi bi-check-lg"></i> : '02'}
                            </div>
                            <span className="step-label">Harvest Details</span>
                        </div>
                        <div className={`step-item ${step === 3 ? 'active' : step > 3 ? 'completed' : ''}`}>
                            <div className="step-circle">
                                {step > 3 ? <i className="bi bi-check-lg"></i> : '03'}
                            </div>
                            <span className="step-label">Chain Submission</span>
                        </div>
                        
                        <div className="progress-container">
                            <div className="progress-text">Onboarding Progress</div>
                            <div className="progress-bar-bg">
                                <div className="progress-bar-fill" style={{ width: `${(step / 3) * 100}%` }}></div>
                            </div>
                            <div className="mt-2 small text-muted fw-bold">Step {step} of 3</div>
                        </div>
                    </div>

                    {/* Form Body */}
                    <div className="add-product-body">
                        {message.text && (
                            <Alert variant={message.type} className="border-0 shadow-sm mb-4 rounded-4 d-flex align-items-center">
                                <i className={`bi ${message.type === 'danger' ? 'bi-exclamation-octagon' : message.type === 'success' ? 'bi-check-circle' : 'bi-info-circle'} me-2 fs-5`}></i>
                                <span className="fw-bold">{message.text}</span>
                            </Alert>
                        )}
                        
                        <Form onSubmit={handleSubmit} className="flex-grow-1 d-flex flex-column">
                            {step === 1 && (
                                <div className="animate-fade-in flex-grow-1">
                                    <div className="form-header">
                                        <h4>Product Specification</h4>
                                        <p className="text-muted fw-medium small">Define the core attributes of your harvest for the blockchain registry.</p>
                                    </div>
                                    <Form.Group className="mb-4">
                                        <Form.Label className="form-label">Network Batch ID</Form.Label>
                                        <Form.Control type="text" value={formData.batchId} readOnly className="glass-input readonly-input" />
                                    </Form.Group>
                                    <Row className="g-4">
                                        <Col md={12}>
                                            <Form.Group>
                                                <Form.Label className="form-label">Commercial Product Name</Form.Label>
                                                <Form.Control name="productName" value={formData.productName} onChange={handleChange} placeholder="e.g., Premium Fuji Apples" required className="glass-input" />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="form-label">Crop Classification</Form.Label>
                                                <Form.Control name="cropType" value={formData.cropType} onChange={handleChange} placeholder="e.g., Pomaceous Fruit" required className="glass-input" />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="form-label">Cargo Volume</Form.Label>
                                                <div className="d-flex">
                                                    <Form.Control type="number" name="quantity" value={formData.quantity} onChange={handleChange} placeholder="0.00" required className="glass-input rounded-end-0" />
                                                    <Form.Select name="unit" value={formData.unit} onChange={handleChange} className="glass-select rounded-start-0 border-start-0 w-auto">
                                                        <option value="kg">kg</option>
                                                        <option value="tons">tons</option>
                                                        <option value="units">units</option>
                                                    </Form.Select>
                                                </div>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <div className="d-flex justify-content-end mt-auto pt-5">
                                        <Button className="btn-glass-primary" onClick={() => setStep(2)}>
                                            Continue <i className="bi bi-chevron-right ms-2"></i>
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="animate-fade-in flex-grow-1">
                                    <div className="form-header">
                                        <h4>Harvest Log & Quality</h4>
                                        <p className="text-muted fw-medium small">Provide temporal and methodological data for supply chain transparency.</p>
                                    </div>
                                    <Row className="g-4">
                                        <Col md={12}>
                                            <Form.Label className="form-label">Digital Proof (Batch Image)</Form.Label>
                                            <div className="crop-image-upload-wrapper">
                                                {imagePreview ? (
                                                    <div className="image-preview-container" onClick={() => document.getElementById('imageUpload').click()}>
                                                        <img src={imagePreview} alt="Crop Preview" className="w-100 h-100 object-fit-cover" />
                                                        <div className="change-image-overlay">
                                                            <i className="bi bi-camera shadow-sm me-2"></i> REPLACE ASSET
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="image-placeholder" onClick={() => document.getElementById('imageUpload').click()}>
                                                        <div className="bg-primary-light p-3 rounded-circle mb-3 text-primary">
                                                            <i className="bi bi-cloud-arrow-up fs-2"></i>
                                                        </div>
                                                        <p className="fw-bold mb-1">Click to Capture / Upload</p>
                                                        <p className="small opacity-70">JPEG, PNG up to 5MB</p>
                                                    </div>
                                                )}
                                                <input type="file" id="imageUpload" hidden accept="image/*" onChange={handleImageChange} />
                                            </div>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="form-label">Harvest Date</Form.Label>
                                                <Form.Control type="date" name="harvestDate" value={formData.harvestDate} onChange={handleChange} required className="glass-input" />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="form-label">Agricultural Method</Form.Label>
                                                <Form.Select name="farmingMethod" value={formData.farmingMethod} onChange={handleChange} className="glass-select">
                                                    <option value="Conventional">Conventional</option>
                                                    <option value="Organic">Organic</option>
                                                    <option value="Hydroponic">Hydroponic</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                        <Col md={12}>
                                            <Form.Group>
                                                <Form.Label className="form-label">Nutrient/Fertilizer Disclosure</Form.Label>
                                                <Form.Control name="fertilizerUsed" value={formData.fertilizerUsed} onChange={handleChange} placeholder="Specify major inputs or list as None" className="glass-input" />
                                            </Form.Group>
                                        </Col>
                                        <Col md={12}>
                                            <Form.Group>
                                                <Form.Label className="form-label">Additional Notes</Form.Label>
                                                <Form.Control as="textarea" rows={2} name="notes" value={formData.notes} onChange={handleChange} className="glass-input" />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <div className="d-flex justify-content-between mt-auto pt-5">
                                        <button type="button" className="btn btn-glass-secondary" onClick={() => setStep(1)}>
                                            <i className="bi bi-chevron-left me-2"></i> PREVIOUS
                                        </button>
                                        <button type="button" className="btn btn-glass-primary" onClick={() => setStep(3)}>
                                            PROCEED <i className="bi bi-chevron-right ms-2"></i>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="animate-fade-in flex-grow-1">
                                    <div className="form-header">
                                        <h4>Origin & Verification</h4>
                                        <p className="text-muted fw-medium small">Geo-tagging and cryptographic signature for immutable provenance.</p>
                                    </div>
                                    <Row className="g-4">
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="form-label">Geo-Latitude</Form.Label>
                                                <Form.Control name="locationLat" value={formData.locationLat} readOnly placeholder="Pending..." className="glass-input readonly-input" />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="form-label">Geo-Longitude</Form.Label>
                                                <Form.Control name="locationLong" value={formData.locationLong} readOnly placeholder="Pending..." className="glass-input readonly-input" />
                                            </Form.Group>
                                        </Col>
                                        <Col md={12}>
                                            <Form.Group>
                                                <Form.Label className="form-label">Physical Farm Address</Form.Label>
                                                <Form.Control name="address" value={formData.address} onChange={handleChange} placeholder="Plot No, Village, District, State" required className="glass-input" />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <div className="blockchain-warning mt-4">
                                        <i className="bi bi-shield-lock-fill"></i>
                                        <div>
                                            <p className="mb-1 fw-bold">Blockchain Governance Notice</p>
                                            <p className="mb-0 small">By proceeding, you will generate an immutable record on the food-chain ledger. A wallet interaction will be required to sign the harvest metadata.</p>
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-between mt-auto pt-5 gap-3">
                                        <button type="button" className="btn btn-glass-secondary px-4" onClick={() => setStep(2)}>
                                            BACK
                                        </button>
                                        <Button type="submit" disabled={loading} className="btn-glass-primary flex-grow-1">
                                            {loading ? (
                                                <><span className="spinner-border spinner-border-sm me-2"></span>BROADCASTING TO NETWORK...</>
                                            ) : (
                                                <><i className="bi bi-vector-pen me-2"></i>SIGN & COMMIT HARVEST</>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </Form>
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default AddProduct;
