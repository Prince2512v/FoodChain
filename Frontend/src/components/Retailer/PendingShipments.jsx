import React from 'react';
import { Badge } from 'react-bootstrap';

const PendingShipments = ({ shipments, onReceive }) => {
    return (
        <div className="animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4 px-3">
                <h5 className="fw-bold mb-0 text-dark">
                    <i className="bi bi-truck-flatbed text-info me-2"></i>
                    Pending Deliveries <span className="text-muted small fw-normal ms-2">({shipments.length} incoming)</span>
                </h5>
                <p className="text-muted small mb-0 d-none d-md-block">Awaiting terminal verification & blockchain signature</p>
            </div>
            
            <div className="table-responsive">
                <table className="quantum-table">
                    <thead>
                        <tr>
                            <th style={{ width: '15%' }}>Cargo ID</th>
                            <th style={{ width: '25%' }}>Product Entity</th>
                            <th style={{ width: '25%' }}>Logistics Carrier</th>
                            <th style={{ width: '15%' }}>Phase</th>
                            <th style={{ width: '20%', textAlign: 'right' }}>Authorization</th>
                        </tr>
                    </thead>
                    <tbody>
                        {shipments.length > 0 ? shipments.map((s) => (
                            <tr key={s.id}>
                                <td>
                                    <span className="badge-quantum text-info" style={{ background: 'rgba(14, 165, 233, 0.08)' }}>
                                        #{s.product?.batchId?.substring(0, 6)}
                                    </span>
                                </td>
                                <td>
                                    <div className="fw-bold text-dark fs-6">{s.product?.productName}</div>
                                    <div className="small text-muted fw-bold">
                                        <i className="bi bi-archive-fill me-1"></i>
                                        {s.product?.quantity} {s.product?.unit}
                                    </div>
                                </td>
                                <td>
                                    <div className="d-flex align-items-center gap-2">
                                        <div className="p-2 rounded-3 bg-info-subtle text-info">
                                            <i className="bi bi-truck"></i>
                                        </div>
                                        <div>
                                            <div className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>{s.distributorName}</div>
                                            <div className="text-muted small">{new Date(s.deliveryDate).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <Badge bg="info-subtle" className="text-info rounded-pill px-3 py-2 border-0 shadow-none">
                                        {s.status.toUpperCase()}
                                    </Badge>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <button 
                                        className="btn btn-dark btn-sm rounded-pill px-3 fw-bold shadow-sm"
                                        onClick={() => onReceive(s)}
                                    >
                                        Verify & Sign <i className="bi bi-pencil-square ms-1"></i>
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" className="text-center py-5">
                                    <div className="opacity-20 mb-3">
                                        <i className="bi bi-radar fs-1"></i>
                                    </div>
                                    <p className="fw-bold text-muted">No cargo currently detected on approach.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PendingShipments;

