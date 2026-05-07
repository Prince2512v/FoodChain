import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, InputGroup } from 'react-bootstrap';

const AdjustStockModal = ({ show, onHide, item, onConfirm }) => {
    const [formData, setFormData] = useState({
        price: '',
        soldQuantity: ''
    });

    useEffect(() => {
        if (item) {
            setFormData({
                price: item.price || 0,
                soldQuantity: item.soldQuantity || 0
            });
        }
    }, [item]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm(item.id, {
            price: Number(formData.price),
            soldQuantity: Number(formData.soldQuantity)
        });
    };

    if (!item) return null;

    return (
        <Modal show={show} onHide={onHide} centered className="glass-modal">
            <Modal.Header closeButton className="border-0 pb-0">
                <Modal.Title className="fw-bold">
                    <i className="bi bi-sliders text-warning me-2"></i>
                    Adjust Inventory
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="pt-2">
                <div className="bg-light p-3 rounded-4 mb-4 border border-white shadow-sm">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="text-muted small fw-bold uppercase">Product Entity</span>
                        <span className="text-warning small fw-bold font-monospace">#{item.batchId?.substring(0, 8)}</span>
                    </div>
                    <h5 className="fw-extrabold text-dark m-0">{item.productName}</h5>
                    <div className="mt-2 text-muted small">
                        Current Volume: <span className="text-dark fw-bold">{item.totalQuantity} Units</span>
                    </div>
                </div>
                
                <Form onSubmit={handleSubmit}>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold">Unit Price ($)</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text className="bg-transparent border-end-0 rounded-start-3">$</InputGroup.Text>
                                    <Form.Control 
                                        type="number" 
                                        step="0.01"
                                        placeholder="0.00"
                                        className="glass-input border-start-0"
                                        required
                                        value={formData.price}
                                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                                    />
                                </InputGroup>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold">Units Sold</Form.Label>
                                <Form.Control 
                                    type="number" 
                                    min="0"
                                    max={item.totalQuantity}
                                    placeholder="0"
                                    className="glass-input"
                                    required
                                    value={formData.soldQuantity}
                                    onChange={(e) => setFormData({...formData, soldQuantity: e.target.value})}
                                />
                                <Form.Text className="text-muted" style={{ fontSize: '0.65rem' }}>
                                    Max: {item.totalQuantity} units
                                </Form.Text>
                            </Form.Group>
                        </Col>
                    </Row>

                    <div className="p-3 bg-warning-subtle rounded-4 mb-4 border border-warning-subtle">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <div className="text-muted small fw-bold uppercase">Projected Reserve</div>
                                <div className="fs-4 fw-extrabold text-warning">
                                    {Number(item.totalQuantity) - Number(formData.soldQuantity || 0)} <span className="small fs-6">Units</span>
                                </div>
                            </div>
                            <i className="bi bi-box-seam fs-2 text-warning opacity-50"></i>
                        </div>
                    </div>

                    <div className="d-flex gap-2 mt-2">
                        <Button variant="light" onClick={onHide} className="flex-grow-1 rounded-3">Cancel</Button>
                        <Button variant="warning" type="submit" className="flex-grow-1 rounded-3 fw-bold">Update Inventory</Button>
                    </div>
                </Form>
            </Modal.Body>

            <style>{`
                .glass-modal .modal-content {
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.5);
                    border-radius: 28px;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
                }
                .glass-input {
                    background: rgba(0, 0, 0, 0.03) !important;
                    border: 1px solid rgba(0, 0, 0, 0.05) !important;
                    border-radius: 12px !important;
                    padding: 0.75rem !important;
                }
                .glass-input:focus {
                    background: white !important;
                    border-color: var(--warning) !important;
                    box-shadow: 0 0 0 4px rgba(255, 193, 7, 0.1) !important;
                }
                .input-group-text {
                    background: rgba(0, 0, 0, 0.03);
                    border: 1px solid rgba(0, 0, 0, 0.05);
                    color: #64748b;
                }
            `}</style>
        </Modal>
    );
};

export default AdjustStockModal;
