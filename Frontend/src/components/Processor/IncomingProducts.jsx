import React from 'react';
import { Badge } from 'react-bootstrap';

const IncomingProducts = ({ products, onSelect }) => {
    return (
        <div className="animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4 px-3">
                <h5 className="fw-bold mb-0 text-dark">
                    <i className="bi bi-inbox-fill text-primary me-2"></i>
                    Production Pipeline <span className="text-muted small fw-normal ms-2">({products.length} active)</span>
                </h5>
                <button className="btn btn-sm btn-light border rounded-pill px-3">
                    <i className="bi bi-funnel me-1"></i> Filter
                </button>
            </div>

            <div className="table-responsive">
                <table className="quantum-table">
                    <thead>
                        <tr>
                            <th style={{ width: '15%' }}>Batch ID</th>
                            <th style={{ width: '25%' }}>Product Entity</th>
                            <th style={{ width: '25%' }}>Source Node</th>
                            <th style={{ width: '20%' }}>Cargo Volume</th>
                            <th style={{ width: '15%', textAlign: 'right' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.length > 0 ? products.map((product) => (
                            <tr key={product.id}>
                                <td>
                                    <span className="badge-quantum text-primary" style={{ background: 'rgba(99, 102, 241, 0.08)' }}>
                                        #{product.batchId.substring(0, 6)}
                                    </span>
                                </td>
                                <td>
                                    <div className="fw-bold text-dark fs-6">{product.productName}</div>
                                    <div className="text-muted small fw-bold">
                                        <i className="bi bi-tag-fill me-1"></i>
                                        {product.cropType}
                                    </div>
                                </td>
                                <td>
                                    <div className="d-flex align-items-center gap-2">
                                        <div className="p-2 rounded-3 bg-success-subtle text-success">
                                            <i className="bi bi-person-badge"></i>
                                        </div>
                                        <div>
                                            <div className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>{product.farmer?.name || 'Authorized Farmer'}</div>
                                            <div className="text-muted small text-truncate" style={{ maxWidth: '120px' }}>{product.address}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="fw-bold text-dark">{product.quantity} <span className="text-muted small">{product.unit}</span></div>
                                    <div className="text-muted small">
                                        Harvested: {new Date(product.harvestDate).toLocaleDateString()}
                                    </div>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    {product.status === 'Created' && (
                                        <button
                                            className="btn btn-primary btn-sm rounded-pill px-3 fw-bold shadow-sm"
                                            onClick={() => onSelect(product, 'process')}
                                        >
                                            Process Batch <i className="bi bi-arrow-right-short ms-1"></i>
                                        </button>
                                    )}
                                    {product.status === 'Processing' && product.qualityStatus !== 'Passed' && (
                                        <button
                                            className="btn btn-warning btn-sm rounded-pill px-3 fw-bold shadow-sm"
                                            onClick={() => onSelect(product, 'quality')}
                                        >
                                            Quality Check <i className="bi bi-shield-check ms-1"></i>
                                        </button>
                                    )}
                                    {product.status === 'Processing' && product.qualityStatus === 'Passed' && (
                                        <button
                                            className="btn btn-success btn-sm rounded-pill px-3 fw-bold shadow-sm"
                                            onClick={() => onSelect(product, 'package')}
                                        >
                                            Package <i className="bi bi-box-seam ms-1"></i>
                                        </button>
                                    )}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" className="text-center py-5">
                                    <div className="opacity-20 mb-3">
                                        <i className="bi bi-box-seam fs-1"></i>
                                    </div>
                                    <p className="fw-bold text-muted">Awaiting new harvest deliveries...</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default IncomingProducts;

