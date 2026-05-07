import React, { useState, useEffect, useContext } from 'react';
import { Row, Col, Badge, Spinner } from 'react-bootstrap';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';

const AvailableShipments = ({ onAccepted }) => {
  const { token } = useContext(AuthContext);
  const [products,  setProducts]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [accepting, setAccepting] = useState(null);
  const [error,     setError]     = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await api.get('/distributor/available-shipments');
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError('Connection failure: Unable to reach logistics node.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (productId, batchId) => {
    setAccepting(productId);
    try {
      const res  = await api.post(`/distributor/accept/${productId}`);
      const data = res.data;

      if (res.status === 200) {
        setProducts(prev => prev.filter(p => p.id !== productId));
        if (onAccepted) {
          onAccepted({
            id:        data.shipmentId,
            productId: productId,
            batchId:   batchId,
            status:    'In Transit'
          });
        }
      }
    } catch {
      setError('Broadcast error: Transaction failed to reach the blockchain.');
    } finally {
      setAccepting(null);
    }
  };

  if (loading) return (
      <div className="text-center py-5">
          <Spinner animation="border" variant="info" className="mb-3" />
          <p className="fw-bold text-muted">Scanning Logistics Network...</p>
      </div>
  );

  return (
    <div className="animate-fade-in">
      {error && (
        <div className="alert alert-danger rounded-4 border-0 shadow-sm mb-4 d-flex align-items-center">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      )}

      {!products.length ? (
        <div className="text-center py-5 glass-panel">
            <i className="bi bi-mailbox fs-1 d-block mb-3 opacity-20"></i>
            <p className="fw-bold text-muted">No cargo currently awaiting dispatch.</p>
            <button className="btn btn-sm btn-outline-info rounded-pill px-4" onClick={fetchProducts}>
                <i className="bi bi-arrow-repeat me-1"></i> Check Again
            </button>
        </div>
      ) : (
        <Row className="g-4">
          {products.map(p => (
            <Col xl={4} md={6} key={p.id}>
                <div className="glass-card p-4 h-100 border-0 shadow-sm glass-card-hover d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                        <span className="badge-quantum text-info" style={{ background: 'rgba(14, 165, 233, 0.08)' }}>
                            #{p.batchId.substring(0, 6)}
                        </span>
                        <Badge bg="info" className="rounded-pill px-3 py-2 border-0 shadow-none">
                            PACKAGED
                        </Badge>
                    </div>

                    <h5 className="fw-bold text-dark mb-4">{p.productName}</h5>
                    
                    <div className="bg-light rounded-4 p-3 mb-4 flex-grow-1">
                        <InfoRow label="Entity" value={p.cropType} icon="bi-tag" />
                        <InfoRow label="Volume" value={`${p.quantity} ${p.unit}`} icon="bi-archive" />
                        <InfoRow label="Source" value={p.farmerName || 'Registered Farmer'} icon="bi-person" />
                        <InfoRow label="Node" value={p.processorName || 'Assembly Plant'} icon="bi-building" />
                    </div>

                    <button
                        className="btn btn-primary w-100 rounded-4 py-3 fw-bold shadow-sm d-flex align-items-center justify-content-center"
                        style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
                        onClick={() => handleAccept(p.id, p.batchId)}
                        disabled={!!accepting}
                    >
                        {accepting === p.id ? (
                            <><Spinner size="sm" className="me-2" /> ACCEPTING...</>
                        ) : (
                            <><i className="bi bi-truck me-2"></i> ACCEPT CARGO</>
                        )}
                    </button>
                </div>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

const InfoRow = ({ label, value, icon }) => (
    <div className="d-flex justify-content-between align-items-center mb-2 px-1">
        <span className="small text-muted fw-bold d-flex align-items-center">
            <i className={`bi ${icon} me-2`}></i>
            {label}
        </span>
        <span className="small fw-bold text-dark text-truncate" style={{ maxWidth: '120px' }}>{value}</span>
    </div>
);

export default AvailableShipments;
