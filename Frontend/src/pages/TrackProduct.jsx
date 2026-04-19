import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Container, Card, Row, Col, Badge } from 'react-bootstrap';
import { QRCodeSVG } from 'qrcode.react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import api from '../services/api';

// ─────────────────────────────────────────────────────────
//  Unified Public Tracking Page
//  Fetches full supply chain journey from Processor -> Distributor
// ─────────────────────────────────────────────────────────

const TrackProduct = () => {
    const [batchId, setBatchId] = useState('');
    const [history, setHistory] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState(null);
    const [scannerActive, setScannerActive] = useState(false);
    
    // Feedback States
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [submittingFeedback, setSubmittingFeedback] = useState(false);
    const [feedbackSent, setFeedbackSent] = useState(false);

    const query = new URLSearchParams(useLocation().search);
    const [integrityData, setIntegrityData] = useState(null);
    const [verifying, setVerifying] = useState(false);

    const verifyIntegrity = async () => {
        if (!history?.product?.batchId) return;
        setVerifying(true);
        try {
            const res = await fetch(`http://localhost:5160/api/supplychain/verify/${encodeURIComponent(history.product.batchId)}`);
            const data = await res.json();
            setIntegrityData(data);
        } catch (err) {
            console.error("Verification error:", err);
        } finally {
            setVerifying(false);
        }
    };

    useEffect(() => {
        const id = query.get('id'); // batchId
        if (id) {
            setBatchId(id);
            fetchFullHistory(id);
        }
    }, []);

    useEffect(() => {
        if (scannerActive) {
            const scanner = new Html5QrcodeScanner('reader', { qrbox: { width: 250, height: 250 }, fps: 5 });
            let isRendered = false;
            
            try {
                scanner.render(
                    (result) => {
                        scanner.clear();
                        setScannerActive(false);
                        try {
                            const url = new URL(result);
                            const id = url.searchParams.get('id');
                            if (id) {
                                setBatchId(id);
                                fetchFullHistory(id);
                            } else {
                                setBatchId(result);
                                fetchFullHistory(result);
                            }
                        } catch {
                            setBatchId(result);
                            fetchFullHistory(result);
                        }
                    },
                    (err) => { /* ignore */ }
                );
                isRendered = true;
            } catch (e) {
                console.error("Scanner error: ", e);
            }

            return () => {
                if (isRendered) {
                    try { scanner.clear(); } catch(e) {}
                }
            };
        }
    }, [scannerActive]);

    const fetchFullHistory = async (bid) => {
        setLoading(true);
        setError(null);
        setFeedbackSent(false);
        try {
            // Use the new comprehensive history endpoint
            const res = await api.get(`/distributor/history/${encodeURIComponent(bid)}`);
            const data = res.data;
            setHistory(data);
        } catch (err) {
            setError('Could not connect to the tracking service.');
        } finally {
            setLoading(false);
        }
    };

    const submitFeedback = async () => {
        setSubmittingFeedback(true);
        try {
            const response = await api.post('/consumer/feedback', { batchId: batchId || history.product.batchId, rating, comment, customerName: customerName || 'Anonymous' });
            if (response.status === 200) {
                setFeedbackSent(true);
                // Refresh history to see new feedback
                fetchFullHistory(batchId || history.product.batchId);
            }
        } catch (err) {
            console.error("Feedback error:", err);
        } finally {
            setSubmittingFeedback(false);
        }
    };

    // Mapping logic for a unified timeline
    const getEvents = (h) => {
        if (!h) return [];
        const events = [];

        if (h.product) {
            events.push({ type: 'origin', title: '🌱 Harvest & Registration', time: h.product.timestamp, data: h.product });
        }
        if (h.processing) {
            events.push({ type: 'process', title: '⚙️ Processing Started', time: h.processing.processingDate, data: h.processing });
        }
        if (h.qualityCheck) {
            events.push({ type: 'quality', title: h.qualityCheck.passed ? '🔬 Quality Passed' : '⚠️ Quality Failed', time: h.qualityCheck.checkDate, data: h.qualityCheck });
        }
        if (h.packaging) {
            events.push({ type: 'package', title: '📦 Packaged & Sealed', time: h.packaging.packagedDate, data: h.packaging });
        }
        if (h.shipment) {
            events.push({ type: 'shipment', title: '🚛 Shipment Accepted', time: h.shipment.createdAt, data: h.shipment });
            if (h.shipment.dispatchDate) {
                events.push({ type: 'dispatch', title: '📤 Dispatched', time: h.shipment.dispatchDate, data: h.shipment });
            }
            if (h.shipment.deliveryDate) {
                events.push({ type: 'delivered', title: '✅ Delivered to Store', time: h.shipment.deliveryDate, data: h.shipment });
            }
        }
        if (h.receipt) {
            events.push({ type: 'receipt', title: h.receipt.conditionStatus === 'Good' ? '🏪 Received at Retail' : '⚠️ Received with Issues', time: h.receipt.receivedDate, data: h.receipt });
        }

        // Location logs
        (h.locationLogs || []).forEach(log => {
            events.push({ type: 'location', title: '📍 Location Transit Update', time: log.timestamp, data: log });
        });

        // Storage logs
        (h.storageConditions || []).forEach(cond => {
            events.push({ type: cond.thresholdBreached ? 'breach' : 'storage', title: '🌡️ Storage Condition Log', time: cond.timestamp, data: cond });
        });

        return events.sort((a, b) => new Date(a.time) - new Date(b.time));
    };

    const timelineEvents = getEvents(history);

    return (
        <div className="track-page bg-light min-vh-100">
            <Navbar />
            
            <Container className="py-5">
                {/* Header Section */}
                <div className="track-header mb-5">
                    <Row className="align-items-center">
                        <Col lg={8}>
                            <Badge bg="primary" className="mb-2 px-3 py-2 rounded-pill shadow-sm">
                                ⛓ BLOCKCHAIN VERIFIED
                            </Badge>
                            <h1 className="display-4 fw-bold text-dark mb-2">Track Your Food</h1>
                            <p className="lead text-muted">Scan the QR or search by BATCH ID to verify product origin and safety.</p>
                            
                            <div className="track-search-box mt-4 bg-white shadow-sm border">
                                <input 
                                    type="text" 
                                    placeholder="Enter Batch ID (e.g. BATCH-123)..." 
                                    value={batchId}
                                    className="text-dark"
                                    onChange={(e) => setBatchId(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && fetchFullHistory(batchId)}
                                />
                                <button onClick={() => fetchFullHistory(batchId)} disabled={loading} className="btn-track me-2">
                                    {loading ? '...' : 'Track'}
                                </button>
                                <button 
                                    onClick={() => setScannerActive(!scannerActive)} 
                                    className="btn-scan"
                                    title="Scan QR Code"
                                >
                                    📷 Scan
                                </button>
                            </div>
                            
                            {scannerActive && (
                                <div className="mt-4 p-3 bg-white rounded-4 shadow-lg text-dark border">
                                    <div id="reader" style={{ width: '100%' }}></div>
                                    <button className="btn btn-sm btn-danger mt-3 w-100 rounded-pill" onClick={() => setScannerActive(false)}>Cancel Scan</button>
                                </div>
                            )}
                        </Col>
                        {history?.product && (
                            <Col lg={4} className="text-center mt-4 mt-lg-0">
                                <div className="qr-container p-4 bg-white rounded-4 shadow-sm border d-inline-block">
                                    <QRCodeSVG value={`${window.location.origin}/track/${history.product.batchId}`} size={160} />
                                    <div className="mt-3 small fw-bold text-dark">CERTIFIED AUTHENTIC</div>
                                </div>
                            </Col>
                        )}
                    </Row>
                </div>

                {error && <div className="alert alert-danger rounded-4 shadow-sm mb-4">{error}</div>}

                {history && (
                    <Row className="g-4">
                        {/* Product Detail Sidebar */}
                        <Col lg={4}>
                            <Card className="product-info-card border-0 shadow-sm rounded-4 overflow-hidden h-100 bg-white">
                                <div className="card-media p-4 text-center bg-primary text-white">
                                    <div className="display-1 mb-2">📦</div>
                                    <h3 className="fw-bold mb-0">{history.product.productName}</h3>
                                    <span className="opacity-75">{history.product.cropType}</span>
                                </div>
                                <Card.Body className="p-4 bg-white text-dark">
                                    <DetailRow label="Batch ID" value={history.product.batchId} highlight />
                                    <DetailRow label="Quantity" value={`${history.product.quantity} ${history.product.unit}`} />
                                    <DetailRow label="Farmer"   value={history.product.farmer?.name} />
                                    <DetailRow label="Location" value={history.product.address} />
                                    <hr className="opacity-25 my-4" />
                                    <div className="text-center py-3 bg-light rounded-4 border">
                                        <div className="small text-muted text-uppercase fw-bold mb-2">Current Integrity</div>
                                        <Badge bg={history.product.isRejected ? 'danger' : 'success'} className="fs-6 px-3 py-2 rounded-pill shadow-sm">
                                            {history.product.status}
                                        </Badge>
                                    </div>

                                    {/* Blockchain Integrity Verification */}
                                    <div className="mt-4 p-3 bg-light rounded-4 border border-info border-opacity-25">
                                        <h6 className="small fw-bold text-info mb-3"><i className="bi bi-shield-lock me-2"></i>Audit Integrity</h6>
                                        <button 
                                            className="btn btn-sm btn-outline-info w-100 rounded-pill mb-2 fw-bold"
                                            onClick={verifyIntegrity}
                                            disabled={verifying}
                                        >
                                            {verifying ? 'Verifying...' : 'Verify DB vs Blockchain'}
                                        </button>
                                        {integrityData && (
                                            <div className={`mt-2 small p-2 rounded text-center fw-bold ${integrityData.isValid ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'}`}>
                                                {integrityData.isValid ? '✅ Data is Authentic' : '⚠️ Tampering Detected!'}
                                            </div>
                                        )}
                                    </div>

                                    {/* Consumer Review Section */}
                                    <div className="mt-4">
                                        <h5 className="fw-bold mb-3 small text-uppercase text-muted">Customer Review</h5>
                                        {feedbackSent ? (
                                            <div className="alert alert-success py-2 small rounded-3 shadow-sm">Thank you for your feedback!</div>
                                        ) : (
                                            <div className="feedback-form small bg-light p-3 rounded-4 border">
                                                <div className="mb-2 d-flex justify-content-between align-items-center">
                                                    <span className="fw-bold text-muted">Rating</span>
                                                    <div className="stars">
                                                        {[1,2,3,4,5].map(s => (
                                                            <span key={s} onClick={() => setRating(s)} style={{ cursor: 'pointer', color: s <= rating ? '#fbbf24' : '#dee2e6' }} className="fs-5">
                                                                ★
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <input 
                                                    type="text" 
                                                    placeholder="Your Name" 
                                                    className="form-control form-control-sm border-light-subtle mb-2" 
                                                    value={customerName}
                                                    onChange={e => setCustomerName(e.target.value)}
                                                />
                                                <textarea 
                                                    className="form-control form-control-sm border-light-subtle mb-3" 
                                                    placeholder="Share your experience..."
                                                    rows={2}
                                                    value={comment}
                                                    onChange={e => setComment(e.target.value)}
                                                ></textarea>
                                                <button 
                                                    className="btn btn-sm btn-primary w-100 rounded-pill shadow-sm fw-bold"
                                                    onClick={submitFeedback}
                                                    disabled={submittingFeedback || !comment}
                                                >
                                                    {submittingFeedback ? 'Wait...' : 'Submit Feedback'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col lg={8}>
                            {/* Feedbacks display */}
                            {history.feedbacks && history.feedbacks.length > 0 && (
                                <div className="mb-4">
                                    <h4 className="fw-bold mb-3 text-dark d-flex align-items-center">
                                        <i className="bi bi-chat-left-text me-3 text-warning"></i>Customer Reviews
                                    </h4>
                                    <div className="row g-3">
                                        {history.feedbacks.map((f, i) => (
                                            <div key={i} className="col-md-6">
                                                <div className="p-3 bg-white rounded-4 border shadow-sm">
                                                    <div className="d-flex justify-content-between mb-2">
                                                        <span className="fw-bold small text-primary">{f.customerName}</span>
                                                        <span className="text-warning small">{'★'.repeat(f.rating)}</span>
                                                    </div>
                                                    <p className="small mb-0 text-muted">{f.comment}</p>
                                                    <div className="text-muted mt-2" style={{ fontSize: '0.7rem' }}>{new Date(f.createdAt).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Full Timeline */}
                            <Card className="timeline-card border-0 shadow-sm rounded-4 bg-white text-dark border">
                                <Card.Body className="p-4 p-md-5">
                                    <h4 className="fw-bold mb-5 d-flex align-items-center">
                                        <i className="bi bi-clock-history me-3 text-primary"></i>Supply Chain Provenance
                                    </h4>

                                    <div className="unified-timeline">
                                        {timelineEvents.map((event, index) => (
                                            <div key={index} className="timeline-node mb-5">
                                                <div className="node-line"></div>
                                                <div className="node-marker shadow-sm"></div>
                                                <div className="node-content bg-light border shadow-sm">
                                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                                        <div>
                                                            <h5 className="fw-bold text-primary mb-1">{event.title}</h5>
                                                            <div className="small text-muted">{new Date(event.time).toLocaleString()}</div>
                                                        </div>
                                                        <EventTag type={event.type} />
                                                    </div>
                                                    <EventDetails type={event.type} data={event.data} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                )}
            </Container>

            <style>{`
                .track-page {
                    font-family: 'Inter', sans-serif;
                }
                .track-header {
                    padding: 4rem 0 2rem;
                }
                .track-search-box {
                    display: flex;
                    max-width: 500px;
                    border-radius: 12px;
                    padding: 5px;
                }
                .track-search-box input {
                    flex: 1;
                    background: transparent;
                    border: none;
                    padding: 12px 20px;
                    outline: none;
                }
                .track-search-box .btn-track {
                    background: #6C63FF;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    padding: 0 25px;
                    font-weight: 600;
                    margin-right: 5px;
                    transition: all 0.2s;
                }
                .track-search-box .btn-track:hover { background: #5b54d6; }
                .track-search-box .btn-scan {
                    background: #10b981;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    padding: 0 15px;
                    font-weight: 600;
                }
                
                .qr-container { border: 1px solid #ebebeb; }
                
                .unified-timeline {
                    position: relative;
                    padding-left: 30px;
                }
                .timeline-node { position: relative; }
                .node-line {
                    position: absolute;
                    left: -24px;
                    top: 25px;
                    bottom: -55px;
                    width: 2px;
                    background: #ebebeb;
                }
                .timeline-node:last-child .node-line { display: none; }
                .node-marker {
                    position: absolute;
                    left: -30px;
                    top: 5px;
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                    background: #6C63FF;
                    border: 3px solid white;
                }
                .node-content {
                    border-radius: 16px;
                    padding: 1.5rem;
                    transition: all 0.3s;
                }
                .node-content:hover {
                    transform: translateX(5px);
                    background: #fff !important;
                }
                
                .detail-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 0.8rem;
                    font-size: 0.9rem;
                }
                .detail-label { color: #888; }
                .detail-value { font-weight: 600; text-align: right; }
                .detail-value.highlight { color: #6C63FF; }
                
                .scale-in { animation: scaleIn 0.3s ease-out; }
                @keyframes scaleIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
};

const DetailRow = ({ label, value, highlight }) => (
    <div className="detail-row">
        <span className="detail-label">{label}</span>
        <span className={`detail-value ${highlight ? 'highlight' : ''}`}>{value || 'N/A'}</span>
    </div>
);

const EventTag = ({ type }) => {
    const config = {
        origin:    { bg: '#6C63FF33', color: '#6C63FF', label: 'Farmer' },
        process:   { bg: '#00A8FF33', color: '#00A8FF', label: 'Processor' },
        quality:   { bg: '#FFB34733', color: '#FFB347', label: 'Quality' },
        package:   { bg: '#00C49A33', color: '#00C49A', label: 'Ready' },
        shipment:  { bg: '#6C63FF33', color: '#6C63FF', label: 'Logistics' },
        location:  { bg: '#a0a8ff15', color: '#a0a8ff', label: 'Transit' },
        storage:   { bg: '#00C49A15', color: '#00C49A', label: 'Conditions' },
        breach:    { bg: '#FF658433', color: '#FF6584', label: 'Alert' },
        delivered: { bg: '#00C49A33', color: '#00C49A', label: 'Retail' },
        receipt:   { bg: '#fbbf2433', color: '#fbbf24', label: 'Received' },
    };
    const c = config[type] || { bg: '#333', color: '#888', label: 'Update' };
    return (
        <Badge style={{ background: c.bg, color: c.color, border: `1px solid ${c.color}44` }} className="rounded-pill px-3">
            {c.label}
        </Badge>
    );
};

const EventDetails = ({ type, data }) => {
    if (type === 'location') return (
        <div className="small mt-2 p-2 rounded bg-white bg-opacity-5">
            📍 {data.latitude.toFixed(5)}, {data.longitude.toFixed(5)} — {data.locationName || 'Transit Point'}
        </div>
    );
    if (type === 'storage' || type === 'breach') return (
        <div className="d-flex gap-3 mt-2">
            <div className="small">🌡️ {data.temperature}°C</div>
            <div className="small">💧 {data.humidity}%</div>
            <div className="small opacity-75">{data.storageType}</div>
        </div>
    );
    if (type === 'shipment') return (
        <div className="small mt-2">Vehicle: <strong>{data.vehicleNumber}</strong> | 👤 {data.driverName}</div>
    );
    return null;
};

export default TrackProduct;
