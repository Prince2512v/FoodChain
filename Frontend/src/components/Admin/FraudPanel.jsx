import React, { useState, useEffect } from 'react';
import { Table, Badge, Button, Spinner, Alert } from 'react-bootstrap';

const FraudPanel = ({ token }) => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [auditing, setAuditing] = useState(null);

    const fetchAlerts = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5160/api/admin/fraud-alerts', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) setAlerts(await res.json());
        } catch (err) {
            console.error("Fraud fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
    }, [token]);

    const runAudit = async (batchId) => {
        setAuditing(batchId);
        try {
            const res = await fetch(`http://localhost:5160/api/admin/audit/${batchId}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                alert("Audit Complete. Check alerts if anomalies were found.");
                fetchAlerts();
            }
        } catch (err) {
            console.error("Audit error:", err);
        } finally {
            setAuditing(null);
        }
    };

    if (loading) return <Spinner animation="border" size="sm" />;

    return (
        <div className="fraud-panel">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="mb-0 text-danger"><i className="bi bi-shield-exclamation me-2"></i>Suspected Fraudulent Activities</h5>
                <Button variant="outline-danger" size="sm" onClick={fetchAlerts}><i className="bi bi-arrow-clockwise me-1"></i>Refresh Scan</Button>
            </div>

            {alerts.length === 0 ? (
                <Alert variant="success" className="bg-light border-success text-success rounded-4 shadow-sm">
                    <i className="bi bi-check-circle-fill me-2"></i>No fraud alerts detected in the current node cycle.
                </Alert>
            ) : (
                <div className="table-responsive">
                    <Table hover className="align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Timestamp</th>
                                <th>Batch ID</th>
                                <th>Type</th>
                                <th>Severity</th>
                                <th>Description</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {alerts.map((alert) => (
                                <tr key={alert.id}>
                                    <td className="small text-muted">{new Date(alert.timestamp).toLocaleString()}</td>
                                    <td><code className="text-primary fw-bold" style={{ background: '#f8f9fa', padding: '2px 6px', borderRadius: '4px' }}>{alert.batchId}</code></td>
                                    <td><Badge bg="secondary" className="px-3 rounded-pill">{alert.issueType}</Badge></td>
                                    <td>
                                        <Badge bg={alert.severity === 'High' || alert.severity === 'Critical' ? 'danger' : 'warning'} text={alert.severity === 'High' || alert.severity === 'Critical' ? 'white' : 'dark'} className="px-3 rounded-pill">
                                            {alert.severity}
                                        </Badge>
                                    </td>
                                    <td className="small text-dark opacity-75">{alert.description}</td>
                                    <td>
                                        <Button 
                                            variant="outline-info" 
                                            size="sm" 
                                            className="rounded-pill px-3 fw-bold"
                                            onClick={() => runAudit(alert.batchId)}
                                            disabled={auditing === alert.batchId}
                                        >
                                            {auditing === alert.batchId ? 'Auditing...' : 'Deep Audit'}
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            )}
        </div>
    );
};

export default FraudPanel;
