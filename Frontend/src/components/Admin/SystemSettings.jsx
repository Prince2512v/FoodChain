import React, { useState, useEffect, useContext } from 'react';
import { Card, Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { AuthContext } from '../../context/AuthContext';

const SystemSettings = () => {
    const { token } = useContext(AuthContext);
    const [settings, setSettings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(null);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5160/api/admin/settings', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setSettings(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (setting) => {
        setSaving(setting.key);
        setMessage(null);
        try {
            const res = await fetch('http://localhost:5160/api/admin/settings', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify(setting)
            });
            if (res.ok) {
                setMessage({ type: 'success', text: `Setting '${setting.key}' updated!` });
            }
        } catch (err) {
            setMessage({ type: 'danger', text: 'Failed to update setting.' });
        } finally {
            setSaving(null);
        }
    };

    if (loading) return <div className="text-center py-4"><Spinner size="sm" /></div>;

    return (
        <Card className="glass-card p-4 border-0">
            <h4 className="fw-bold mb-4">⚙️ System Configuration</h4>
            
            {message && <Alert variant={message.type} className="mb-4">{message.text}</Alert>}

            {settings.length === 0 && (
                <div className="text-muted italic mb-3">No settings found. Add defaults below.</div>
            )}

            <div className="settings-list mb-4">
                {settings.map((s, i) => (
                    <Row key={i} className="mb-3 align-items-end g-3 p-3 rounded-4 bg-white bg-opacity-5">
                        <Col md={3}>
                            <Form.Label className="text-muted small fw-bold">KEY</Form.Label>
                            <div className="fw-bold text-info">{s.key}</div>
                        </Col>
                        <Col md={5}>
                            <Form.Label className="text-muted small fw-bold">VALUE</Form.Label>
                            <Form.Control 
                                className="custom-input"
                                value={s.value}
                                onChange={(e) => {
                                    const newSettings = [...settings];
                                    newSettings[i].value = e.target.value;
                                    setSettings(newSettings);
                                }}
                            />
                        </Col>
                        <Col md={4} className="text-end">
                            <Button 
                                variant="primary" 
                                size="sm" 
                                onClick={() => handleUpdate(s)}
                                disabled={saving === s.key}
                            >
                                {saving === s.key ? 'Saving...' : '💾 Update'}
                            </Button>
                        </Col>
                    </Row>
                ))}
            </div>

            <hr className="opacity-10 my-4" />
            
            <h5 className="mb-3">Add / Deploy Config</h5>
            <Row className="g-3 align-items-end">
                <Col md={4}>
                    <Form.Control placeholder="New Key (e.g. CONTRACT_ADDR)" className="custom-input" id="new-key" />
                </Col>
                <Col md={4}>
                    <Form.Control placeholder="Value" className="custom-input" id="new-val" />
                </Col>
                <Col md={4}>
                    <Button variant="outline-primary" onClick={() => {
                        const key = document.getElementById('new-key').value;
                        const val = document.getElementById('new-val').value;
                        if (key && val) {
                            handleUpdate({ key, value: val, description: 'Added manually via dashboard' }).then(() => fetchSettings());
                            document.getElementById('new-key').value = '';
                            document.getElementById('new-val').value = '';
                        }
                    }}>
                        ➕ Add Config
                    </Button>
                </Col>
            </Row>
        </Card>
    );
};

export default SystemSettings;
