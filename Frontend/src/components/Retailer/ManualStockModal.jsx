import React, { useState } from 'react';
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';

const ManualStockModal = ({ show, onHide, onConfirm }) => {
    const [formData, setFormData] = useState({
        productName: '',
        batchId: `MAN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        quantity: '',
        price: '',
        category: 'Produce'
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm({
            ...formData,
            id: Date.now(),
            totalQuantity: Number(formData.quantity),
            remainingQuantity: Number(formData.quantity),
            soldQuantity: 0,
            status: 'In Stock',
            lastUpdated: new Date().toISOString()
        });
        setFormData({
            productName: '',
            batchId: `MAN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
            quantity: '',
            price: '',
            category: 'Produce'
        });
    };

    return (
        <Modal show={show} onHide={onHide} centered className="glass-modal">
            <Modal.Header closeButton className="border-0 pb-0">
                <Modal.Title className="fw-bold">
                    <i className="bi bi-plus-square-dotted text-warning me-2"></i>
                    Manual Stock Intake
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="pt-2">
                <p className="text-muted small mb-4">Add local inventory records for items not traceable on the blockchain network.</p>
                
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold">Commercial Name</Form.Label>
                        <Form.Control 
                            type="text" 
                            placeholder="e.g. Organic Cavendish Bananas"
                            className="glass-input"
                            required
                            value={formData.productName}
                            onChange={(e) => setFormData({...formData, productName: e.target.value})}
                        />
                    </Form.Group>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold">Batch ID (Local)</Form.Label>
                                <Form.Control 
                                    type="text" 
                                    className="glass-input bg-light"
                                    readOnly
                                    value={formData.batchId}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold">Category</Form.Label>
                                <Form.Select 
                                    className="glass-select"
                                    value={formData.category}
                                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                                >
                                    <option>Produce</option>
                                    <option>Dairy</option>
                                    <option>Meat</option>
                                    <option>Grains</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold">Stock Quantity</Form.Label>
                                <Form.Control 
                                    type="number" 
                                    placeholder="0"
                                    className="glass-input"
                                    required
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold">Unit Price ($)</Form.Label>
                                <Form.Control 
                                    type="number" 
                                    step="0.01"
                                    placeholder="0.00"
                                    className="glass-input"
                                    required
                                    value={formData.price}
                                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <div className="d-flex gap-2 mt-4">
                        <Button variant="light" onClick={onHide} className="flex-grow-1 rounded-3">Cancel</Button>
                        <Button variant="warning" type="submit" className="flex-grow-1 rounded-3 fw-bold">Add to Inventory</Button>
                    </div>
                </Form>
            </Modal.Body>

            <style>{`
                .glass-modal .modal-content {
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.5);
                    border-radius: 24px;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
                }
                .glass-input, .glass-select {
                    background: rgba(0, 0, 0, 0.03) !important;
                    border: 1px solid rgba(0, 0, 0, 0.05) !important;
                    border-radius: 12px !important;
                    padding: 0.75rem !important;
                }
                .glass-input:focus, .glass-select:focus {
                    background: white !important;
                    border-color: var(--warning) !important;
                    box-shadow: 0 0 0 4px rgba(255, 193, 7, 0.1) !important;
                }
            `}</style>
        </Modal>
    );
};

export default ManualStockModal;
