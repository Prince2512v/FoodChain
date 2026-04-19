import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { Card, Container, Row, Col, ListGroup, Badge, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const [products, setProducts] = useState([]);
    const [stats, setStats] = useState({ total: 0, inTransit: 0, pendingQuality: 0, rejected: 0 });
    const navigate = useNavigate();
    const { user } = useAuth();
    const role = user?.role;

    // ── Auto-redirect to role-specific dashboards ──────────────────
    useEffect(() => {
        if (role === 'Farmer')      navigate('/farmer-dashboard',      { replace: true });
        if (role === 'Processor')   navigate('/processor-dashboard',   { replace: true });
        if (role === 'Distributor') navigate('/distributor-dashboard', { replace: true });
        if (role === 'Retailer')    navigate('/retailer-dashboard',    { replace: true });
        if (role === 'Admin')       navigate('/admin-dashboard',       { replace: true });
    }, [role, navigate]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get('/product');
                setProducts(response.data);
                
                // Calculate stats locally for now, or fetch from /admin/stats if Admin
                setStats({
                    total: response.data.length,
                    inTransit: response.data.filter(p => p.currentStage === 'Distributor').length,
                    pendingQuality: response.data.filter(p => p.currentStage === 'Farmer').length,
                    rejected: response.data.filter(p => p.isRejected).length
                });

                if (role === 'Admin') {
                    const statsRes = await api.get('/admin/stats');
                    setStats(statsRes.data);
                }
            } catch (error) {
                console.error('Error fetching dashboard data', error);
            }
        };
        fetchData();
    }, [role]);


    // Role-based filtering
    const filteredProducts = products.filter(p => {
        if (role === 'Farmer') return p.farmerId === parseInt(user?.id || '0');
        if (role === 'Processor') return p.currentStage === 'Farmer' || p.currentStage === 'Processor';
        if (role === 'Distributor') return p.currentStage === 'Processor' || p.currentStage === 'Distributor';
        if (role === 'Retailer') return p.currentStage === 'Distributor' || p.currentStage === 'Retailer';
        return true; // Admin/Others see all
    });

    return (
        <div className="bg-light min-vh-100 pb-5">
            <Navbar />
            <Container className="py-4">
                <header className="mb-5 d-flex justify-content-between align-items-end">
                    <div>
                        <Badge bg="primary" className="mb-2 px-3 py-2 rounded-pill shadow-sm">
                            <i className="bi bi-person-badge me-2"></i>{role} Portal
                        </Badge>
                        <h1 className="fw-bold text-dark display-5">Hello, {user?.name}</h1>
                        <p className="text-muted fs-5">Here's what's happening in your supply chain network.</p>
                    </div>
                    {role === 'Farmer' && (
                        <Button variant="primary" onClick={() => navigate('/add-product')} className="rounded-pill shadow-lg px-4 py-2 fw-bold">
                            <i className="bi bi-plus-lg me-2"></i>New Harvest
                        </Button>
                    )}
                    {role === 'Admin' && (
                        <Button variant="dark" onClick={() => navigate('/admin-dashboard')} className="rounded-pill shadow-sm px-4 py-2">
                            <i className="bi bi-gear-fill me-2"></i>Administration
                        </Button>
                    )}
                </header>

                <Row className="mb-5 g-4">
                    <Col md={3}>
                        <Card className="border-0 shadow-sm rounded-4 bg-primary text-white h-100 p-2">
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h6 className="mb-0 fw-bold">Total Products</h6>
                                    <i className="bi bi-box-seam fs-4 opacity-50"></i>
                                </div>
                                <h2 className="fw-bold mb-0">{stats.totalProducts || stats.total}</h2>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="border-0 shadow-sm rounded-4 h-100 p-2">
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-center mb-3 text-info">
                                    <h6 className="mb-0 fw-bold">In Transit</h6>
                                    <i className="bi bi-truck fs-4"></i>
                                </div>
                                <h2 className="fw-bold mb-0">{stats.activeShipments || stats.inTransit}</h2>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="border-0 shadow-sm rounded-4 h-100 p-2">
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-center mb-3 text-warning">
                                    <h6 className="mb-0 fw-bold">Pending Quality</h6>
                                    <i className="bi bi-shield-shaded fs-4"></i>
                                </div>
                                <h2 className="fw-bold mb-0">{stats.pendingQuality}</h2>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="border-0 shadow-sm rounded-4 h-100 p-2">
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-center mb-3 text-danger">
                                    <h6 className="mb-0 fw-bold">Rejected</h6>
                                    <i className="bi bi-x-octagon fs-4"></i>
                                </div>
                                <h2 className="fw-bold mb-0">{stats.rejected}</h2>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <h4 className="fw-bold mb-4 d-flex align-items-center">
                    <span className="me-2">Your Active Inventory</span>
                    <Badge bg="light" text="dark" className="border rounded-pill fs-6 fw-normal px-3">{filteredProducts.length}</Badge>
                </h4>

                <Row className="g-4">
                    {filteredProducts.length > 0 ? filteredProducts.map((product) => (
                        <Col md={6} lg={4} key={product.id}>
                            <Card className={`h-100 shadow-sm border-0 rounded-4 overflow-hidden card-hover ${product.isRejected ? 'opacity-75' : ''}`}>
                                {product.isRejected && (
                                    <div className="bg-danger text-white text-center py-1 small fw-bold">REJECTED</div>
                                )}
                                <Card.Body className="p-4">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <h5 className="fw-bold mb-0 text-dark-emphasis">{product.productName}</h5>
                                        <Badge bg={product.isRejected ? 'danger' : 'success'} className="rounded-pill px-3 py-2">{product.currentStage}</Badge>
                                    </div>
                                    <ListGroup variant="flush" className="mb-4">
                                        <ListGroup.Item className="px-0 bg-transparent py-2 small border-light d-flex justify-content-between">
                                            <span className="text-muted">ID:</span> <span className="fw-bold">#{product.id}</span>
                                        </ListGroup.Item>
                                        <ListGroup.Item className="px-0 bg-transparent py-2 small border-light d-flex justify-content-between">
                                            <span className="text-muted">Batch:</span> <span className="fw-bold">{product.batchId}</span>
                                        </ListGroup.Item>
                                        <ListGroup.Item className="px-0 bg-transparent py-2 small border-light d-flex justify-content-between">
                                            <span className="text-muted">Origin:</span> <span className="fw-bold text-truncate" style={{ maxWidth: '150px' }}>{product.origin}</span>
                                        </ListGroup.Item>
                                        <ListGroup.Item className="px-0 bg-transparent py-2 small border-light d-flex justify-content-between">
                                            <span className="text-muted">Quality:</span> 
                                            <span className={`fw-bold ${product.qualityStatus === 'Passed' ? 'text-success' : product.qualityStatus === 'Failed' ? 'text-danger' : 'text-warning'}`}>
                                                {product.qualityStatus}
                                            </span>
                                        </ListGroup.Item>
                                    </ListGroup>
                                    <div className="d-grid gap-2">
                                        <Button variant="primary" size="sm" className="rounded-pill py-2 shadow-sm" onClick={() => navigate(`/track?id=${product.id}`)}>
                                            <i className="bi bi-geo-alt-fill me-1"></i>Track History
                                        </Button>
                                        {!product.isRejected && role !== 'Admin' && (
                                            <Button variant="outline-dark" size="sm" className="rounded-pill py-2" onClick={() => navigate(`/update-stage?id=${product.id}`)}>
                                                <i className="bi bi-arrow-right-circle me-1"></i>Update Stage
                                            </Button>
                                        )}
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    )) : (
                        <Col className="text-center py-5">
                            <div className="py-5 bg-white rounded-5 shadow-sm">
                                <i className="bi bi-inbox fs-1 text-muted mb-3 d-block"></i>
                                <h3 className="text-muted">No relevant products found</h3>
                                <p className="text-muted">Your supply chain is currently clear.</p>
                            </div>
                        </Col>
                    )}
                </Row>
            </Container>
        </div>
    );
};

export default Dashboard;
