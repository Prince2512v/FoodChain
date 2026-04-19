import React, { useState } from 'react';
import { Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import api from '../../services/api';

const PackagingForm = ({ product, onComplete, onCancel }) => {
    const [formData, setFormData] = useState({
        packageType: 'Box',
        weight: '',
        labelInfo: '',
        expiryDate: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post('/processor/packaging', {
                productId: product.id,
                packageType: formData.packageType,
                weight: formData.weight,
                labelInfo: formData.labelInfo,
                expiryDate: formData.expiryDate
            });
            onComplete();
        } catch (err) {
            setError("Failed to save packaging details");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border-0 shadow rounded-4 p-3">
            <Card.Body>
                <div className="mb-4">
                    <h4 className="fw-bold">Final Packaging</h4>
                    <p className="text-muted">Finalizing: <span className="fw-bold text-dark">{product.productName}</span></p>
                </div>

                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Package Type</Form.Label>
                                <Form.Select 
                                    value={formData.packageType}
                                    onChange={(e) => setFormData({...formData, packageType: e.target.value})}
                                >
                                    <option value="Bag">Bag</option>
                                    <option value="Box">Box</option>
                                    <option value="Container">Container</option>
                                    <option value="Sack">Sack</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Total Weight</Form.Label>
                                <Form.Control 
                                    type="text" 
                                    placeholder="e.g. 50kg"
                                    value={formData.weight}
                                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Expiry Date</Form.Label>
                        <Form.Control 
                            type="date" 
                            required
                            value={formData.expiryDate}
                            onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                        />
                    </Form.Group>

                    <Form.Group className="mb-4">
                        <Form.Label className="fw-bold">Label Info</Form.Label>
                        <Form.Control 
                            as="textarea" 
                            rows={2}
                            placeholder="Nutritional info, storage instructions..."
                            value={formData.labelInfo}
                            onChange={(e) => setFormData({...formData, labelInfo: e.target.value})}
                        />
                    </Form.Group>

                    <div className="d-flex gap-2">
                        <Button 
                            variant="info" 
                            type="submit" 
                            disabled={loading}
                            className="flex-grow-1 rounded-pill py-2 fw-bold text-white"
                        >
                            {loading ? "Saving..." : "Finalize & Complete"}
                        </Button>
                        <Button 
                            variant="light" 
                            onClick={onCancel}
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

export default PackagingForm;
