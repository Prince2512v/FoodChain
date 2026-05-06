import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const NexusSecurityModal = ({ isOpen, onClose, token }) => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            fetchAlerts();
        }
    }, [isOpen]);

    const fetchAlerts = async () => {
        setLoading(true);
        try {
            const res = await api.get('/Admin/fraud-alerts');
            setAlerts(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="nexus-modal-overlay" onClick={onClose}>
            <div className="nexus-modal max-w-5xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="nexus-modal-title m-0">
                        <i className="bi bi-shield-lock text-rose-400 mr-2"></i>
                        Security & Threat Assessment
                    </h2>
                    <button className="nexus-btn nexus-btn-ghost p-1" onClick={onClose}>
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <div className="admin-panel-body p-0 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    <table className="nexus-table">
                        <thead>
                            <tr>
                                <th>Timestamp</th>
                                <th>Batch ID</th>
                                <th>Issue Type</th>
                                <th>Severity</th>
                                <th>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-20">
                                        <div className="admin-spinner mx-auto scale-75"></div>
                                    </td>
                                </tr>
                            ) : alerts.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-20 text-emerald-500">
                                        <i className="bi bi-shield-check mr-2"></i>
                                        All systems secure. No threats detected.
                                    </td>
                                </tr>
                            ) : (
                                alerts.map((alert, idx) => (
                                    <tr key={idx}>
                                        <td className="text-[0.7rem] text-slate-500">
                                            {new Date(alert.timestamp).toLocaleString()}
                                        </td>
                                        <td className="font-mono text-cyan-400 text-xs">{alert.batchId}</td>
                                        <td>
                                            <span className="text-slate-200 font-bold text-xs">{alert.issueType}</span>
                                        </td>
                                        <td>
                                            <span className={`role-badge scale-75 origin-left sev-${alert.severity}`}>
                                                {alert.severity}
                                            </span>
                                        </td>
                                        <td className="text-xs text-slate-400 max-w-xs truncate" title={alert.description}>
                                            {alert.description}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-8 flex justify-end">
                    <button className="nexus-btn nexus-btn-primary px-6" onClick={onClose}>
                        DISMISS TERMINAL
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NexusSecurityModal;
