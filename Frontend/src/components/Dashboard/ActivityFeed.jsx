import React from 'react';
import { Card, Badge, Table } from 'react-bootstrap';

const ActivityFeed = ({ activities }) => (
    <div className="glass-panel p-4 h-100 animate-fade-in overflow-hidden d-flex flex-column">
        <h4 className="fw-bold mb-4 text-dark d-flex align-items-center">
            <i className="bi bi-clock-history me-2 text-primary"></i>
            Blockchain Audit Log
        </h4>
        <div className="activity-timeline flex-grow-1 overflow-auto pe-2" style={{ maxHeight: '450px' }}>
            {activities.length > 0 ? (
                <div className="position-relative ps-4 border-start border-light" style={{ marginLeft: '10px' }}>
                    {activities.map((act, idx) => (
                        <div key={idx} className="mb-4 position-relative">
                            {/* Dot */}
                            <div className="position-absolute" style={{ 
                                left: '-31px', top: '0', width: '12px', height: '12px', 
                                borderRadius: '50%', background: getRoleColor(act.role),
                                border: '3px solid white', boxShadow: `0 0 10px ${getRoleColor(act.role)}40`
                            }}></div>
                            
                            <div className="glass-card p-3 border-0 shadow-sm rounded-4">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <Badge bg={getBadgeColor(act.role)} className="px-2 py-1 rounded-3 small">
                                        {act.role.toUpperCase()}
                                    </Badge>
                                    <span className="text-muted" style={{ fontSize: '0.7rem', fontWeight: 600 }}>
                                        {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div className="fw-bold text-dark mb-1" style={{ fontSize: '0.9rem' }}>{act.action}</div>
                                <div className="d-flex align-items-center text-muted" style={{ fontSize: '0.75rem' }}>
                                    <i className="bi bi-hash me-1"></i>
                                    <span className="font-monospace text-truncate" style={{ maxWidth: '150px' }}>{act.batchId}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-5 text-muted">
                    <i className="bi bi-inbox fs-1 d-block mb-3 opacity-20"></i>
                    <p className="small fw-bold">No recent activity detected</p>
                </div>
            )}
        </div>
        <div className="mt-3 pt-3 border-top border-light text-center">
            <button className="btn btn-link btn-sm text-primary text-decoration-none fw-bold">
                View All Logs <i className="bi bi-arrow-right ms-1"></i>
            </button>
        </div>
    </div>
);

const getRoleColor = (role) => {
    switch (role) {
        case 'Farmer': return '#10b981';
        case 'Processor': return '#6366f1';
        case 'Distributor': return '#0ea5e9';
        case 'Retailer': return '#f59e0b';
        default: return '#64748b';
    }
}

const getBadgeColor = (role) => {
    switch (role) {
        case 'Farmer': return 'success';
        case 'Processor': return 'primary';
        case 'Distributor': return 'info';
        case 'Retailer': return 'warning';
        default: return 'secondary';
    }
}

export default ActivityFeed;

