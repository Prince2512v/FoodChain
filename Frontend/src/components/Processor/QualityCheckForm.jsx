import React, { useState } from 'react';
import { Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import api from '../../services/api';

const QualityCheckForm = ({ product, onComplete, onCancel }) => {
    const [formData, setFormData] = useState({
        grade: 'A',
        moistureLevel: '',
        passed: true,
        remarks: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post('/processor/quality-check', {
                productId: product.id,
                grade: formData.grade,
                moistureLevel: formData.moistureLevel,
                passed: formData.passed,
                remarks: formData.remarks
            });
            onComplete();
        } catch (err) {
            setError("Failed to record quality check");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border-0 shadow rounded-4 p-3">
            <Card.Body>
                <div className="mb-4">
                    <h4 className="fw-bold">Quality Control</h4>
                    <p className="text-muted">Product: <span className="fw-bold text-dark">{product.productName}</span></p>
                </div>

                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Quality Grade</Form.Label>
                                <Form.Select 
                                    value={formData.grade}
                                    onChange={(e) => setFormData({...formData, grade: e.target.value})}
                                >
                                    <option value="A">Grade A (Premium)</option>
                                    <option value="B">Grade B (Standard)</option>
                                    <option value="C">Grade C (Substandard)</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Moisture Level (%)</Form.Label>
                                <Form.Control 
                                    type="number" 
                                    placeholder="0-100"
                                    value={formData.moistureLevel}
                                    onChange={(e) => setFormData({...formData, moistureLevel: e.target.value})}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Result</Form.Label>
                        <div className="d-flex gap-3">
                            <Form.Check 
                                type="radio"
                                label="Passed"
                                name="passed"
                                checked={formData.passed === true}
                                onChange={() => setFormData({...formData, passed: true})}
                            />
                            <Form.Check 
                                type="radio"
                                label="Rejected"
                                name="passed"
                                checked={formData.passed === false}
                                onChange={() => setFormData({...formData, passed: false})}
                                className="text-danger"
                            />
                        </div>
                    </Form.Group>

                    <Form.Group className="mb-4">
                        <Form.Label className="fw-bold">Remarks</Form.Label>
                        <Form.Control 
                            as="textarea" 
                            rows={2}
                            value={formData.remarks}
                            onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                        />
                    </Form.Group>

                    <div className="d-flex gap-2">
                        <Button 
                            variant={formData.passed ? "success" : "danger"} 
                            type="submit" 
                            disabled={loading}
                            className="flex-grow-1 rounded-pill py-2 fw-bold"
                        >
                            {loading ? "Saving..." : "Save Quality Check"}
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

export default QualityCheckForm;
