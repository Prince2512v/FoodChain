import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Spinner, Alert } from 'react-bootstrap';
import api from '../services/api';
import TraceabilityTimeline from '../components/Consumer/TraceabilityTimeline';
import MapView from '../components/Consumer/MapView';
import AuthenticityCard from '../components/Consumer/AuthenticityCard';
import Navbar from '../components/Navbar';

/**
 * ProductAuthenticityPage — Fallback verification page for /verify/:batchId route.
 * Redirects to the main /track/:batchId page for a unified experience.
 * Kept as a standalone fallback for backward compatibility with old QR codes.
 */
const ProductAuthenticityPage = () => {
    const { batchId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Use the centralized api instance (correct port via env variable)
                const historyRes = await api.get(`/consumer/history/${encodeURIComponent(batchId)}`);
                setData(historyRes.data);
            } catch (err) {
                console.error("Data fetch error:", err);
                setError("Could not retrieve product data. The batch ID may be invalid or the system is offline.");
            } finally {
                setLoading(false);
            }
        };

        if (batchId) fetchData();
    }, [batchId]);

    if (loading) {
        return (
            <div className="bg-main min-vh-100">
                <Navbar />
                <Container className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3 text-muted fw-bold">Connecting to Blockchain Ledger...</p>
                </Container>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-main min-vh-100">
                <Navbar />
                <Container className="py-5">
                    <Alert variant="danger" className="rounded-4 shadow-sm text-center">
                        <i className="bi bi-exclamation-triangle me-2"></i>{error}
                    </Alert>
                    <div className="text-center mt-3">
                        <button className="btn btn-outline-primary rounded-pill px-4" onClick={() => navigate('/track')}>
                            <i className="bi bi-search me-2"></i>Go to Tracker
                        </button>
                    </div>
                </Container>
            </div>
        );
    }

    // Support both PascalCase and camelCase keys
    const product = data?.Product || data?.product;

    return (
        <div className="bg-main min-vh-100">
            <Navbar />
            <Container className="py-4">
                <Row className="mb-4">
                    <Col>
                        <Badge bg="primary" className="mb-2 px-3 py-2 rounded-pill shadow-sm">⛓ BLOCKCHAIN VERIFIED</Badge>
                        <h1 className="display-5 fw-bold text-dark" style={{ letterSpacing: '-1px' }}>Traceability Report</h1>
                        <p className="lead text-muted">Batch ID: <span className="font-monospace text-primary">{batchId}</span></p>
                    </Col>
                </Row>

                <Row className="g-4">
                    <Col lg={8}>
                        {/* Authenticity verification — passes the product object */}
                        <AuthenticityCard product={product} />

                        {/* Full supply chain timeline */}
                        <TraceabilityTimeline history={data} />
                    </Col>

                    <Col lg={4}>
                        {/* Current Status */}
                        <Card className="glass-panel border-0 mb-4 p-4 text-center">
                            <h6 className="text-muted small text-uppercase fw-bold mb-2">Current Status</h6>
                            <h3 className="fw-bold text-primary mb-0">{product?.status || "Unknown"}</h3>
                        </Card>

                        {/* Map */}
                        {product?.locationLat && (
                            <Card className="glass-panel border-0 mb-4 p-4">
                                <h6 className="fw-bold mb-3 text-dark d-flex align-items-center">
                                    <i className="bi bi-geo-alt-fill me-2 text-primary"></i>Geographic Origin
                                </h6>
                                <MapView 
                                    lat={parseFloat(product.locationLat)} 
                                    lng={parseFloat(product.locationLong)}
                                    farmerName={product.farmer?.name}
                                />
                            </Card>
                        )}

                        {/* Product Info */}
                        <Card className="glass-panel border-0 p-4">
                            <h6 className="fw-bold mb-3 text-dark">Product Details</h6>
                            <DetailRow label="Product" value={product?.productName} />
                            <DetailRow label="Crop Type" value={product?.cropType} />
                            <DetailRow label="Quantity" value={`${product?.quantity || 'N/A'} ${product?.unit || ''}`} />
                            <DetailRow label="Farmer" value={product?.farmer?.name} />
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

const DetailRow = ({ label, value }) => (
    <div className="d-flex justify-content-between py-2 border-bottom" style={{ borderColor: 'rgba(0,0,0,0.05) !important' }}>
        <span className="text-muted small">{label}</span>
        <span className="fw-bold small text-dark">{value || 'N/A'}</span>
    </div>
);

export default ProductAuthenticityPage;
